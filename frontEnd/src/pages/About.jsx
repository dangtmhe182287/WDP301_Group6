export default function About() {
  const mapsUrl =
    import.meta.env.VITE_GOOGLE_MAPS_URL ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4496041817933!2d106.69765!3d10.7763897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM1LjAiTiAxMDbCsDQxJzUxLjUiRQ!5e0!3m2!1svi!2svn!4v1234567890";

  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="container about-hero-inner">
          <h1>About Us</h1>
          <p className="about-subtitle">
            Elysina — where every visit becomes a complete care experience.
          </p>
        </div>
      </section>

      <section className="about-summary container">
        <div className="about-summary-text">
          <h2>Our Story</h2>
          <p>
            Elysina Salon was founded with a simple mission: to deliver high-quality hair
            care in a modern, friendly, and professional space.
          </p>
          <p>
            Our stylists are rigorously trained and stay up to date on the latest trends so
            every guest gets a look that fits them best. Whether you are here for a classic
            cut or a full transformation, we are ready to take great care of you.
          </p>
          <p>
            With a convenient online booking system, you can choose your services, stylist,
            and time in just a few minutes — no waiting and no phone calls.
          </p>
        </div>
        <div className="about-summary-highlights">
          <div className="about-highlight-card">
            <div className="about-highlight-icon">✂️</div>
            <div className="about-highlight-value">10+</div>
            <div className="about-highlight-label">Professional stylists</div>
          </div>
          <div className="about-highlight-card">
            <div className="about-highlight-icon">🗓</div>
            <div className="about-highlight-value">500+</div>
            <div className="about-highlight-label">Appointments per month</div>
          </div>
          <div className="about-highlight-card">
            <div className="about-highlight-icon">⭐</div>
            <div className="about-highlight-value">4.8</div>
            <div className="about-highlight-label">Average rating</div>
          </div>
        </div>
      </section>

      <section className="about-hours-section">
        <div className="container about-hours-inner">
          <h2>Opening Hours</h2>
          <div className="about-hours-grid">
            <div className="about-hours-row">
              <span>Monday — Friday</span>
              <span>08:00 — 21:00</span>
            </div>
            <div className="about-hours-row">
              <span>Saturday</span>
              <span>08:00 — 21:00</span>
            </div>
            <div className="about-hours-row">
              <span>Sunday</span>
              <span>09:00 — 18:00</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-testimonials container">
        <div className="about-hours-inner">
          <h2>What Clients Say</h2>
        </div>
        <div className="about-testimonials-grid">
          <div className="about-testimonial-card">
            <div className="about-stars">★★★★★</div>
            <p>
              "Clean space, very attentive stylist. I booked online for the first time and
              loved the result. I will definitely be back!"
            </p>
            <div className="about-reviewer">
              <div className="about-reviewer-avatar">NA</div>
              <div>
                <div className="about-reviewer-name">Anh Nguyen</div>
                <div className="about-reviewer-date">March 2026</div>
              </div>
            </div>
          </div>
          <div className="about-testimonial-card">
            <div className="about-stars">★★★★★</div>
            <p>
              "Fast booking, on time, and the stylist really understood what I wanted.
              First-time highlights turned out better than expected. Highly recommended!"
            </p>
            <div className="about-reviewer">
              <div className="about-reviewer-avatar">TM</div>
              <div>
                <div className="about-reviewer-name">Minh Tran</div>
                <div className="about-reviewer-date">February 2026</div>
              </div>
            </div>
          </div>
          <div className="about-testimonial-card">
            <div className="about-stars">★★★★☆</div>
            <p>
              "Great service and fair prices. I love being able to choose a stylist based on
              specialty. Next time I will try a keratin treatment."
            </p>
            <div className="about-reviewer">
              <div className="about-reviewer-avatar">LH</div>
              <div>
                <div className="about-reviewer-name">Hoa Le</div>
                <div className="about-reviewer-date">January 2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-location container">
        <div className="about-location-info">
          <h2>Address & Contact</h2>
          <div className="about-contact-item">
            <span className="about-contact-icon">📍</span>
            <span>123 Nguyen Hue Street, District 1, Ho Chi Minh City</span>
          </div>
          <div className="about-contact-item">
            <span className="about-contact-icon">📞</span>
            <span>0901 234 567</span>
          </div>
          <div className="about-contact-item">
            <span className="about-contact-icon">✉️</span>
            <span>ElysinaCut@gmail.com</span>
          </div>
          <div className="about-contact-item">
            <span className="about-contact-icon">🕐</span>
            <span>Open daily — 08:00 to 21:00</span>
          </div>
        </div>
        <div className="about-map-wrap">
          <iframe
            title="Elysina Salon Location"
            src={mapsUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <style>{`
        .about-page {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .about-hero {
          background: #020d1b;
          color: #fff;
          padding: 80px 24px;
          text-align: center;
        }

        .about-hero h1 {
          font-size: 42px;
          font-weight: 700;
          margin: 0 0 16px;
        }

        .about-subtitle {
          font-size: 18px;
          color: #94a3b8;
          margin: 0;
        }

        .about-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          padding: 80px 24px;
          align-items: start;
        }

        .about-summary-text h2 {
          font-size: 28px;
          font-weight: 700;
          color: #0b2e5c;
          margin: 0 0 20px;
        }

        .about-summary-text p {
          color: #475569;
          line-height: 1.8;
          margin: 0 0 16px;
          font-size: 15px;
        }

        .about-summary-highlights {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .about-highlight-card {
          background: #fff;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .about-highlight-icon {
          font-size: 28px;
          width: 54px;
          height: 54px;
          background: #22d3c5;
          border-radius: 14px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .about-highlight-value {
          font-size: 26px;
          font-weight: 700;
          color: #0b2e5c;
        }

        .about-highlight-label {
          font-size: 13px;
          color: #64748b;
          margin-top: 2px;
        }

        .about-hours-section {
          background: #f4f6f7;
          padding: 80px 24px;
        }

        .about-hours-inner h2 {
          font-size: 28px;
          font-weight: 700;
          color: #0b2e5c;
          margin: 0 0 32px;
        }

        .about-hours-grid {
          display: flex;
          flex-direction: column;
          gap: 0;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.06);
          overflow: hidden;
          max-width: 520px;
        }

        .about-hours-row {
          display: flex;
          justify-content: space-between;
          padding: 16px 24px;
          font-size: 15px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }

        .about-hours-row:last-child {
          border-bottom: none;
        }

        .about-hours-row span:last-child {
          font-weight: 600;
          color: #22d3c5;
        }

        .about-location {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          padding: 80px 24px;
          align-items: start;
        }

        .about-location-info h2 {
          font-size: 28px;
          font-weight: 700;
          color: #0b2e5c;
          margin: 0 0 28px;
        }

        .about-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 20px;
          font-size: 15px;
          color: #475569;
          line-height: 1.6;
        }

        .about-contact-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .about-map-wrap {
          height: 380px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(0,0,0,0.08);
        }

        .about-testimonials {
          padding: 80px 24px;
        }

        .about-testimonials h2 {
          font-size: 28px;
          font-weight: 700;
          color: #0b2e5c;
          margin: 0 0 32px;
        }

        .about-testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .about-testimonial-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .about-stars {
          color: #22d3c5;
          font-size: 18px;
          letter-spacing: 2px;
        }

        .about-testimonial-card p {
          color: #475569;
          font-size: 14px;
          line-height: 1.8;
          margin: 0;
          flex: 1;
        }

        .about-reviewer {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }

        .about-reviewer-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #22d3c5;
          color: #fff;
          display: grid;
          place-items: center;
          font-size: 13px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .about-reviewer-name {
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }

        .about-reviewer-date {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 2px;
        }

        @media (max-width: 768px) {
          .about-summary,
          .about-location {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 48px 16px;
          }

          .about-testimonials-grid {
            grid-template-columns: 1fr;
          }

          .about-testimonials {
            padding: 48px 16px;
          }

          .about-hero h1 { font-size: 28px; }
          .about-hero { padding: 56px 16px; }
          .about-hours-section { padding: 48px 16px; }
        }
      `}</style>
    </main>
  );
}
