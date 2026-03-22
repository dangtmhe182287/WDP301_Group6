export default function About() {
  const mapsUrl =
    import.meta.env.VITE_GOOGLE_MAPS_URL ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4496041817933!2d106.69765!3d10.7763897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM1LjAiTiAxMDbCsDQxJzUxLjUiRQ!5e0!3m2!1svi!2svn!4v1234567890";

  return (
    <main className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="container about-hero-inner">
          <h1>Về chúng tôi</h1>
          <p className="about-subtitle">
            Elysina — nơi mỗi lần ghé thăm là một trải nghiệm chăm sóc trọn vẹn.
          </p>
        </div>
      </section>

      {/* ── Summary ── */}
      <section className="about-summary container">
        <div className="about-summary-text">
          <h2>Câu chuyện của chúng tôi</h2>
          <p>
            Elysina Salon được thành lập với một sứ mệnh đơn giản — mang đến dịch vụ
            chăm sóc tóc chất lượng cao trong một không gian hiện đại, thân thiện và
            chuyên nghiệp.
          </p>
          <p>
            Đội ngũ thợ cắt của chúng tôi được đào tạo bài bản, luôn cập nhật các xu
            hướng mới nhất để mang lại phong cách phù hợp nhất cho từng khách hàng.
            Dù bạn đến để cắt tóc đơn giản hay thực hiện một bộ tóc hoàn toàn mới,
            chúng tôi đều sẵn sàng phục vụ tận tâm.
          </p>
          <p>
            Với hệ thống đặt lịch trực tuyến tiện lợi, bạn có thể chọn dịch vụ, thợ
            cắt và thời gian phù hợp chỉ trong vài phút — không cần chờ đợi, không
            cần gọi điện.
          </p>
        </div>
        <div className="about-summary-highlights">
          <div className="about-highlight-card">
            <div className="about-highlight-icon">✂️</div>
            <div className="about-highlight-value">10+</div>
            <div className="about-highlight-label">Thợ cắt chuyên nghiệp</div>
          </div>
          <div className="about-highlight-card">
            <div className="about-highlight-icon">📅</div>
            <div className="about-highlight-value">500+</div>
            <div className="about-highlight-label">Lịch hẹn mỗi tháng</div>
          </div>
          <div className="about-highlight-card">
            <div className="about-highlight-icon">⭐</div>
            <div className="about-highlight-value">4.8</div>
            <div className="about-highlight-label">Đánh giá trung bình</div>
          </div>
        </div>
      </section>

      {/* ── Opening Hours ── */}
      <section className="about-hours-section">
        <div className="container about-hours-inner">
          <h2>Giờ mở cửa</h2>
          <div className="about-hours-grid">
            <div className="about-hours-row">
              <span>Thứ Hai — Thứ Sáu</span>
              <span>08:00 — 21:00</span>
            </div>
            <div className="about-hours-row">
              <span>Thứ Bảy</span>
              <span>08:00 — 21:00</span>
            </div>
            <div className="about-hours-row">
              <span>Chủ Nhật</span>
              <span>09:00 — 18:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="about-testimonials container">
        <div className="about-hours-inner">
          <h2>Khách hàng nói gì về chúng tôi</h2>
        </div>
        <div className="about-testimonials-grid">
          <div className="about-testimonial-card">
            <div className="about-stars">★★★★★</div>
            <p>"Không gian sạch sẽ, thợ cắt rất tận tâm. Mình đã đặt lịch online lần đầu và rất hài lòng với kết quả. Chắc chắn sẽ quay lại!"</p>
            <div className="about-reviewer">
              <div className="about-reviewer-avatar">NA</div>
              <div>
                <div className="about-reviewer-name">Nguyễn Thị Anh</div>
                <div className="about-reviewer-date">Tháng 3, 2026</div>
              </div>
            </div>
          </div>
          <div className="about-testimonial-card">
            <div className="about-stars">★★★★★</div>
            <p>"Đặt lịch nhanh, đúng giờ, thợ cắt hiểu ý khách. Mình làm highlight lần đầu mà ra màu đẹp hơn mong đợi. Rất recommend!"</p>
            <div className="about-reviewer">
              <div className="about-reviewer-avatar">TM</div>
              <div>
                <div className="about-reviewer-name">Trần Văn Minh</div>
                <div className="about-reviewer-date">Tháng 2, 2026</div>
              </div>
            </div>
          </div>
          <div className="about-testimonial-card">
            <div className="about-stars">★★★★☆</div>
            <p>"Dịch vụ tốt, giá cả hợp lý. Mình thích là có thể chọn thợ cắt theo chuyên môn. Lần sau mình sẽ thử keratin treatment."</p>
            <div className="about-reviewer">
              <div className="about-reviewer-avatar">LH</div>
              <div>
                <div className="about-reviewer-name">Lê Thị Hoa</div>
                <div className="about-reviewer-date">Tháng 1, 2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Location + Contact ── */}
      <section className="about-location container">
        <div className="about-location-info">
          <h2>Địa chỉ & Liên hệ</h2>
          <div className="about-contact-item">
            <span className="about-contact-icon">📍</span>
            <span>123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
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
            <span>Mở cửa hàng ngày — 08:00 đến 21:00</span>
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