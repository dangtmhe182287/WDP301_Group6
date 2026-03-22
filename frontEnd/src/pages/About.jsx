import { useEffect, useState } from "react";

export default function About() {
  const mapsUrl =
    "https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d3723.5300149456275!2d105.81031958316727!3d21.051483251409245!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjHCsDAyJzU3LjMiTiAxMDXCsDQ5JzI3LjQiRQ!5e0!3m2!1sen!2sjp!4v1774200893041!5m2!1sen!2sjp";

  const API_BASE = import.meta.env.VITE_SERVER_API || "http://localhost:3000";
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/rates/recent?limit=3`)
      .then((res) => res.json())
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch(() => setTestimonials([]));
  }, []);

  const formatMonthYear = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(date);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  };

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

      {/* ── Summary + Hours ── */}
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
            Với hệ thống đặt lịch trực tuyến tiện lợi, bạn có thể chọn dịch vụ, thợ
            cắt và thời gian phù hợp chỉ trong vài phút.
          </p>
        </div>

        <div className="about-summary-right">
          <h2>Giờ mở cửa</h2>
          <div className="about-hours-grid">
            <div className="about-hours-row">
              <span>Thứ Hai — Chủ Nhật</span>
              <span>08:00 — 19:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {testimonials.length > 0 && (
        <section className="about-testimonials container">
          <h2>Khách hàng nói gì về chúng tôi</h2>
          <div className="about-testimonials-grid">
            {testimonials.map((item) => (
              <div key={item._id} className="about-testimonial-card">
                <div className="about-stars">★★★★★</div>
                <p>"{item.comment}"</p>
                <div className="about-reviewer">
                  <div className="about-reviewer-avatar">{getInitials(item.customerName)}</div>
                  <div>
                    <div className="about-reviewer-name">{item.customerName}</div>
                    <div className="about-reviewer-date">{formatMonthYear(item.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
            <span>Mở cửa hàng ngày — 08:00 đến 19:00</span>
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
        .about-summary-right h2 {
          font-size: 28px;
          font-weight: 700;
          color: #0b2e5c;
          margin: 0 0 20px;
        }
        .about-hours-grid {
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.06);
          overflow: hidden;
        }
        .about-hours-row {
          display: flex;
          justify-content: space-between;
          padding: 16px 24px;
          font-size: 15px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }
        .about-hours-row:last-child { border-bottom: none; }
        .about-hours-row span:last-child {
          font-weight: 600;
          color: #22d3c5;
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
        .about-location {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          padding: 80px 24px;
          align-items: start;
          background: #f4f6f7;
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
        @media (max-width: 768px) {
          .about-summary,
          .about-location {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 48px 16px;
          }
          .about-testimonials-grid { grid-template-columns: 1fr; }
          .about-testimonials { padding: 48px 16px; }
          .about-hero h1 { font-size: 28px; }
          .about-hero { padding: 56px 16px; }
        }
      `}</style>
    </main>
  );
}
