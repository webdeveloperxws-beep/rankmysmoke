import { useEffect } from "react";

const BookingAppointment = () => {
  useEffect(() => {
    const scriptId = "leadconnector-form-embed";

    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://link.msgsndr.com/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <section id="booking-appointment">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <iframe
              src="https://api.leadconnectorhq.com/widget/booking/sFY8UT6QKa4xDYlrtGqR"
              title="Book an Appointment"
              allow="payment"
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
