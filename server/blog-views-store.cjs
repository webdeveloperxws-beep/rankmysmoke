"use strict";

/**
 * Durable blog view storage.
 * Preference order:
 * 1) MySQL when DATABASE_URL or DB_* env vars are set (Hostinger Node DB)
 * 2) JSON file outside the deploy tree (HOME/private or BLOG_VIEWS_FILE)
 *
 * Never writes totals into the application deployment directory by default.
 */

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;
const MYSQL_DEDUPE_HOURS = 24;

function resolveFilePath() {
  if (process.env.BLOG_VIEWS_FILE) {
    return path.resolve(process.env.BLOG_VIEWS_FILE);
  }
  // Hostinger-friendly path outside public_html / deploy ZIP contents.
  return path.join(os.homedir(), "private", "rankmysmoke-blog-views.json");
}

function parseDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    if (!/^mysql:$/i.test(parsed.protocol) && !/^mysql2:$/i.test(parsed.protocol)) {
      return null;
    }
    return {
      host: parsed.hostname || "127.0.0.1",
      port: Number(parsed.port) || 3306,
      user: decodeURIComponent(parsed.username || ""),
      password: decodeURIComponent(parsed.password || ""),
      database: decodeURIComponent((parsed.pathname || "").replace(/^\//, "")),
    };
  } catch {
    return null;
  }
}

function getMysqlConfig() {
  if (process.env.DATABASE_URL) {
    const fromUrl = parseDatabaseUrl(process.env.DATABASE_URL);
    if (fromUrl?.database && fromUrl.user) return fromUrl;
  }
  if (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER) {
    return {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME,
    };
  }
  return null;
}

function emptyFileStore() {
  return { updatedAt: null, views: {}, recent: {} };
}

function readFileStore(filePath) {
  try {
    if (!fs.existsSync(filePath)) return emptyFileStore();
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!raw || typeof raw !== "object") return emptyFileStore();
    return {
      updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
      views:
        raw.views && typeof raw.views === "object" && !Array.isArray(raw.views)
          ? raw.views
          : {},
      recent:
        raw.recent && typeof raw.recent === "object" && !Array.isArray(raw.recent)
          ? raw.recent
          : {},
    };
  } catch (error) {
    console.error(
      "RMSS blog views: unable to read file store",
      error.message || error,
    );
    throw error;
  }
}

function writeFileStore(filePath, store) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = filePath + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tmp, filePath);
}

function pruneRecent(recent, now) {
  const next = {};
  for (const [key, ts] of Object.entries(recent || {})) {
    const n = Number(ts) || 0;
    if (now - n < DEDUPE_WINDOW_MS) next[key] = n;
  }
  return next;
}

function createFileBackend(filePath) {
  return {
    kind: "file",
    path: filePath,
    async ready() {
      // Ensure parent directory exists; file may be created on first write.
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      return true;
    },
    async recordView(slug, visitorHash) {
      const store = readFileStore(filePath);
      const now = Date.now();
      store.recent = pruneRecent(store.recent, now);
      const dedupeKey = `${visitorHash}|${slug}`;
      const last = Number(store.recent[dedupeKey]) || 0;
      if (now - last < DEDUPE_WINDOW_MS) {
        return { counted: false, views: Number(store.views[slug]) || 0 };
      }
      store.recent[dedupeKey] = now;
      store.views[slug] = (Number(store.views[slug]) || 0) + 1;
      store.updatedAt = new Date(now).toISOString();
      writeFileStore(filePath, store);
      return { counted: true, views: store.views[slug] };
    },
    async getTrending(limit) {
      const store = readFileStore(filePath);
      return Object.entries(store.views || {})
        .map(([slug, count]) => ({ slug, views: Number(count) || 0 }))
        .filter((row) => row.views > 0)
        .sort((a, b) => b.views - a.views || a.slug.localeCompare(b.slug))
        .slice(0, limit)
        .map(({ slug }) => ({ slug }));
    },
  };
}

function createMysqlBackend(config) {
  let pool = null;
  let readyPromise = null;

  async function getPool() {
    if (pool) return pool;
    // Lazy require so local/dev without mysql2 still loads when unused.
    const mysql = require("mysql2/promise");
    pool = mysql.createPool({
      host: config.host === "localhost" ? "127.0.0.1" : config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 4,
      enableKeepAlive: true,
      timezone: "Z",
    });
    return pool;
  }

  async function ensureSchema() {
    const db = await getPool();
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_article_views (
        slug VARCHAR(120) NOT NULL,
        view_count INT UNSIGNED NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (slug),
        KEY idx_blog_views_count (view_count)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_view_dedupe (
        visitor_hash CHAR(64) NOT NULL,
        slug VARCHAR(120) NOT NULL,
        last_viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (visitor_hash, slug),
        KEY idx_blog_dedupe_seen (last_viewed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  return {
    kind: "mysql",
    path: `${config.host}:${config.port}/${config.database}`,
    async ready() {
      if (!readyPromise) {
        readyPromise = (async () => {
          await ensureSchema();
          return true;
        })().catch((error) => {
          readyPromise = null;
          throw error;
        });
      }
      return readyPromise;
    },
    async recordView(slug, visitorHash) {
      const db = await getPool();
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        const [existing] = await conn.query(
          `SELECT UNIX_TIMESTAMP(last_viewed_at) AS last_ts
           FROM blog_view_dedupe
           WHERE visitor_hash = ? AND slug = ?
           FOR UPDATE`,
          [visitorHash, slug],
        );
        const lastTs = existing[0] ? Number(existing[0].last_ts) * 1000 : 0;
        const now = Date.now();
        if (lastTs && now - lastTs < DEDUPE_WINDOW_MS) {
          await conn.rollback();
          const [rows] = await db.query(
            `SELECT view_count FROM blog_article_views WHERE slug = ? LIMIT 1`,
            [slug],
          );
          return {
            counted: false,
            views: rows[0] ? Number(rows[0].view_count) || 0 : 0,
          };
        }

        await conn.query(
          `INSERT INTO blog_view_dedupe (visitor_hash, slug, last_viewed_at)
           VALUES (?, ?, UTC_TIMESTAMP())
           ON DUPLICATE KEY UPDATE last_viewed_at = UTC_TIMESTAMP()`,
          [visitorHash, slug],
        );
        await conn.query(
          `INSERT INTO blog_article_views (slug, view_count, updated_at)
           VALUES (?, 1, UTC_TIMESTAMP())
           ON DUPLICATE KEY UPDATE
             view_count = view_count + 1,
             updated_at = UTC_TIMESTAMP()`,
          [slug],
        );
        const [rows] = await conn.query(
          `SELECT view_count FROM blog_article_views WHERE slug = ? LIMIT 1`,
          [slug],
        );
        await conn.commit();

        // Best-effort cleanup of old dedupe rows (keeps table small).
        conn
          .query(
            `DELETE FROM blog_view_dedupe
             WHERE last_viewed_at < (UTC_TIMESTAMP() - INTERVAL ? HOUR)
             LIMIT 500`,
            [MYSQL_DEDUPE_HOURS],
          )
          .catch(() => {});

        return {
          counted: true,
          views: rows[0] ? Number(rows[0].view_count) || 0 : 1,
        };
      } catch (error) {
        try {
          await conn.rollback();
        } catch {
          /* ignore */
        }
        throw error;
      } finally {
        conn.release();
      }
    },
    async getTrending(limit) {
      const db = await getPool();
      const [rows] = await db.query(
        `SELECT slug
         FROM blog_article_views
         WHERE view_count > 0
         ORDER BY view_count DESC, slug ASC
         LIMIT ?`,
        [limit],
      );
      return (rows || []).map((row) => ({ slug: String(row.slug) }));
    },
  };
}

function loadPublishedSlugs(projectRoot) {
  const candidates = [
    path.join(projectRoot, "data", "blog-published-slugs.json"),
    path.join(projectRoot, "server", "blog-published-slugs.json"),
  ];
  for (const file of candidates) {
    try {
      if (!fs.existsSync(file)) continue;
      const raw = JSON.parse(fs.readFileSync(file, "utf8"));
      const list = Array.isArray(raw) ? raw : raw?.slugs;
      if (!Array.isArray(list)) continue;
      return new Set(
        list.filter((s) => typeof s === "string" && s.length > 0 && s.length <= 120),
      );
    } catch (error) {
      console.error(
        "RMSS blog views: unable to read published slugs",
        error.message || error,
      );
    }
  }
  return new Set();
}

function createBlogViewsStore(projectRoot) {
  const mysqlConfig = getMysqlConfig();
  const filePath = resolveFilePath();
  const backend = mysqlConfig
    ? createMysqlBackend(mysqlConfig)
    : createFileBackend(filePath);

  let unavailable = false;
  let initPromise = null;

  async function ensureReady() {
    if (unavailable) return false;
    if (!initPromise) {
      initPromise = backend
        .ready()
        .then(() => true)
        .catch((error) => {
          unavailable = true;
          console.error(
            "RMSS blog views: storage unavailable (" +
              backend.kind +
              ")",
            error.message || error,
          );
          return false;
        });
    }
    return initPromise;
  }

  return {
    kind: backend.kind,
    location: backend.path,
    loadPublishedSlugs: () => loadPublishedSlugs(projectRoot),
    async isAvailable() {
      return ensureReady();
    },
    async recordView(slug, visitorHash) {
      const ok = await ensureReady();
      if (!ok) return { ok: false, counted: false, unavailable: true };
      try {
        const result = await backend.recordView(slug, visitorHash);
        return { ok: true, counted: result.counted, unavailable: false };
      } catch (error) {
        console.error(
          "RMSS blog views: record failed",
          error.message || error,
        );
        unavailable = true;
        return { ok: false, counted: false, unavailable: true };
      }
    },
    async getTrending(limit) {
      const ok = await ensureReady();
      if (!ok) {
        return { ok: false, source: "unavailable", articles: [] };
      }
      try {
        const articles = await backend.getTrending(limit);
        if (!articles.length) {
          return { ok: true, source: "empty", articles: [] };
        }
        return { ok: true, source: "views", articles };
      } catch (error) {
        console.error(
          "RMSS blog views: trending failed",
          error.message || error,
        );
        unavailable = true;
        return { ok: false, source: "unavailable", articles: [] };
      }
    },
    hashVisitor(ip, userAgent) {
      const salt = process.env.BLOG_VIEWS_HASH_SALT || "rmss-blog-views";
      return crypto
        .createHash("sha256")
        .update(`${salt}|${ip || "unknown"}|${userAgent || ""}`)
        .digest("hex");
    },
  };
}

module.exports = {
  createBlogViewsStore,
  DEDUPE_WINDOW_MS,
  resolveFilePath,
  getMysqlConfig,
};
