import { useEffect, useState } from "react";

import multiImg from "../assets/images/multi_img.webp";

const Stand = () => {
  const searchText = "Vape shop near me";

  const [typedText, setTypedText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    let typingTimer;
    let deletingTimer;
    let restartTimer;
    let initialTimer;

    let index = 0;

    const startTyping = () => {
      setTypedText("");
      setShowSuggestions(false);
      index = 0;

      const type = () => {
        if (index < searchText.length) {
          index += 1;

          setTypedText(searchText.slice(0, index));

          if (index === searchText.length) {
            setShowSuggestions(true);

            deletingTimer = setTimeout(startDeleting, 3200);
          } else {
            typingTimer = setTimeout(type, 95);
          }
        }
      };

      type();
    };

    const startDeleting = () => {
 
      setShowSuggestions(false);

      const remove = () => {
        if (index > 0) {
          index -= 1;

          setTypedText(searchText.slice(0, index));

          deletingTimer = setTimeout(remove, 45);
        } else {
          restartTimer = setTimeout(startTyping, 900);
        }
      };

      remove();
    };

    initialTimer = setTimeout(startTyping, 700);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(typingTimer);
      clearTimeout(deletingTimer);
      clearTimeout(restartTimer);
    };
  }, []);

  return (
    <section id="stand">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="step-box">
              <img
                src={multiImg}
                alt="Collage of vape shop interiors, retail displays, and people"
                className="img-fluid"
                loading="lazy"
                decoding="async"
              />

              <p>40+ Stores Built</p>
            </div>
          </div>
        </div>

        <div className="row align-items-center justify-content-center stand-main-row">
          <div className="col-lg-6 col-md-6">
            <div className="step-left-box">
              <p className="txt-bar">STAND OUT IN YOUR LOCAL MARKET</p>

              <h2 className="title">
                Same ZIP Code. Why Are <span>Customers Finding Your </span>
                Competitor First?
              </h2>

              <p className="txt">
                An outdated website or poor Google visibility can send your next
                customer straight to a competitor. We combine{" "}
                <b>website development with SEO</b> to help customers find you
                and make buying easier. Google Business Profile, branding,
                social media, and reputation management together strengthen your
                online presence.
                <br />
                <br />
                Stand out locally, turn more searches into store visits and
                online sales, and give customers reasons to return.
              </p>
            </div>
          </div>

          <div className="col-lg-6 col-md-6">
            <div className="animte_imgs">
              <div className="search-animation-area">
              
                <div
                  className={`google-search-box ${
                    typedText ? "search-active" : ""
                  }`}
                >
                
                  <div className="google-logo">
                    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fill="#FFC107"
                        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.23 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                      />

                      <path
                        fill="#FF3D00"
                        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.344 4.337-17.694 10.691z"
                      />

                      <path
                        fill="#4CAF50"
                        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.209 0-9.625-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                      />

                      <path
                        fill="#1976D2"
                        d="M43.611 20.083H42V20H24v8h11.303a12.039 12.039 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                      />
                    </svg>
                  </div>

                  <div className="search-input-wrap">
                    <span className="typed-search-text">{typedText}</span>

                    <span className="typing-cursor"></span>
                  </div>

                
                  <div className="microphone-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 14.5C13.933 14.5 15.5 12.933 15.5 11V5.5C15.5 3.567 13.933 2 12 2C10.067 2 8.5 3.567 8.5 5.5V11C8.5 12.933 10.067 14.5 12 14.5Z"
                        fill="#202124"
                      />

                      <path
                        d="M18.5 11C18.5 14.59 15.59 17.5 12 17.5C8.41 17.5 5.5 14.59 5.5 11H7.5C7.5 13.485 9.515 15.5 12 15.5C14.485 15.5 16.5 13.485 16.5 11H18.5Z"
                        fill="#202124"
                      />

                      <path d="M11 17H13V22H11V17Z" fill="#202124" />

                      <path d="M8 21H16V23H8V21Z" fill="#202124" />
                    </svg>
                  </div>
                </div>

                <div
                  className={`search-suggestion-box ${
                    showSuggestions ? "show" : ""
                  }`}
                >
                  <div className="suggestion-row suggestion-row-1">
                    <span className="suggestion-label">[Your]</span>

                    <span className="suggestion-value">Vapes</span>
                  </div>

                  <div className="suggestion-row suggestion-row-2">
                    <span className="suggestion-label">[Your]</span>

                    <span className="suggestion-value">Nicotine pouches</span>
                  </div>

                  <div className="suggestion-row suggestion-row-3">
                    <span className="suggestion-label">[Your]</span>

                    <span className="suggestion-value">Vapes huston texas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stand;
