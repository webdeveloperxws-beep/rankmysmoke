import clientImg1 from "../assets/images/client-img1.webp";
import clientImg2 from "../assets/images/client-img2.webp";
import clientImg3 from "../assets/images/client-img3.webp";
import clientImg7 from "../assets/images/client-img4.webp";
import clientImg8 from "../assets/images/client-img5.webp";

import clientImg4 from "../assets/images/client-img-sm1.webp";
import clientImg5 from "../assets/images/client-img-sm2.webp";
import clientImg6 from "../assets/images/client-img-sm3.webp";
import clientImg9 from "../assets/images/client-img-sm4.webp";
import clientImg10 from "../assets/images/client-img-sm5.webp";

const clients = [
  {
    name: "Alex Morgan",
    role: "Verified Client",
    quote:
      "“Rank My Smoke Store gave our website a complete upgrade. The new design looks more professional, works better on mobile, and makes it easier for customers to explore our products. The entire process was organized, and the team kept us informed from start to finish.”",
    image: clientImg1,
    logoImage: clientImg4,
    color: "#93EAFF",
  },
  {
    name: "Taylor Brooks",
    role: "Verified Client",
    quote:
      "“We had tried improving our SEO before but never had a clear strategy. Their team identified the problems, explained the priorities, and created a structured plan around our business. We now understand what is being worked on and why it matters.”",
    image: clientImg2,
    logoImage: clientImg5,
    color: "#FFB8D2",
  },
  {
    name: "Jamie Parker",
    role: "Verified Client",
    quote:
      "“Our new ecommerce website feels like a major improvement. Products and categories are better organized, the mobile experience is cleaner, and customers can navigate the store more easily. The backend is also much more manageable for our team.”",
    image: clientImg8,
    logoImage: clientImg10,
    color: "#FFF592",
  },
  {
    name: "Sophia Lauran",
    role: "Verified Client",
    quote:
      "“Our previous website was difficult to manage and no longer represented our business properly. Rank My Smoke Store created a cleaner, more organized website that is easier for our team to update and easier for customers to use.”",
    image: clientImg3,
    logoImage: clientImg6,
    color: "#FFF9BD",
  },
  {
    name: "Avery Collins",
    role: "Verified Client",
    quote:
      "“The reporting is clear and easy to understand. Instead of receiving confusing numbers, we get practical updates on rankings, website activity, completed work, and upcoming priorities. Their transparency gives us confidence in the strategy.”",
    image: clientImg7,
    logoImage: clientImg9,
    color: "#16A2C8",
  },
];

const speed = 10000;

const ClientCard = ({ client }) => {
  return (
    <div className="client-marquee-item">
      <div className="client-slide">
        <div className="client-photo">
          <img src={client.image} alt={client.name} draggable="false" />
        </div>

        <div
          className="client-content"
          style={{ backgroundColor: client.color }}
        >
          <div className="client-content-top">
            <div className="client-meta">
              <h3>{client.name}</h3>
              <p>{client.role}</p>
            </div>

            <div className="client-logo">
              <img
                src={client.logoImage}
                alt={`${client.name} logo`}
                draggable="false"
              />
            </div>
          </div>

          <p className="client-quote">{client.quote}</p>
        </div>
      </div>
    </div>
  );
};

const Client = () => {
  const marqueeDuration = `${(clients.length * speed) / 1000}s`;

  return (
    <section id="client">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <h2 className="title">What Our Client Says</h2>
          </div>
        </div>
      </div>

      <div className="our-client-slider">
        <div
          className="client-marquee-track"
          style={{
            "--marquee-duration": marqueeDuration,
          }}
        >
          <div className="client-marquee-group">
            {clients.map((client, index) => (
              <ClientCard
                key={`first-${client.name}-${index}`}
                client={client}
              />
            ))}
          </div>

          <div className="client-marquee-group" aria-hidden="true">
            {clients.map((client, index) => (
              <ClientCard
                key={`second-${client.name}-${index}`}
                client={client}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Client;
