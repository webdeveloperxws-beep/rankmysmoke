import { useEffect, useRef } from "react";

const BookingAppointment = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scriptId = "leadconnector-form-embed";
    let observer = null;
    let addedScript = null;

    const loadBookingScript = () => {
      if (document.getElementById(scriptId)) return;

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://link.msgsndr.com/js/form_embed.js";
      script.type = "text/javascript";
      script.async = true;

      document.body.appendChild(script);
      addedScript = script;
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            loadBookingScript();
            observer.disconnect();
          }
        },
        {
          rootMargin: "1800px 0px",
          threshold: 0,
        },
      );

      observer.observe(section);
    } else {
      loadBookingScript();
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }

      if (addedScript) {
        addedScript.remove();
      }
    };
  }, []);

  return (
    <section id="booking-appointment" ref={sectionRef}>
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <iframe
              src="https://api.leadconnectorhq.com/widget/booking/sFY8UT6QKa4xDYlrtGqR"
              title="Book an Appointment"
              allow="payment"
              loading="lazy"
              style={{
                width: "100%",
                minHeight: "800px",
                border: "none",
                overflow: "hidden",
              }}
              scrolling="no"
              id="sFY8UT6QKa4xDYlrtGqR"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingAppointment;
