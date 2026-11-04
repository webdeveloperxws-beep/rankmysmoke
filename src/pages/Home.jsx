import Hero from "../components/Hero";
import Stand from "../components/Stand";
import Services from "../components/Services";
import Audit from "../components/Audit";
import Book from "../components/Book";
import Faq from "../components/Faq";
import Pricing from "../components/Pricing";
import Client from "../components/Client";
import Contact from "../components/Contact";
import BookingAppointment from "../components/BookingAppointment.jsx";

function Home() {
  return (
    <>
      <main>
        <Hero />
        <Stand />
        <Services />
        <Audit />
        <Book />
        <Faq />
        <Pricing />
        <Client />
        <Contact />
        <BookingAppointment />
      </main>
    </>
  );
}

export default Home;
