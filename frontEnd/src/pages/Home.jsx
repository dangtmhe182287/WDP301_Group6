import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-eyebrow">Thoughtful care, attentive service</p>
          <h1>Book fast and choose flexible services that fit your needs.</h1>
          <p>
            Great care starts with the right service. We help you connect with the right
            staff in just a few steps.
          </p>
          <div className="home-actions">
            <button className="primary-btn" onClick={() => navigate("/appointment")}>
              Book now
            </button>
            <button className="ghost-btn" onClick={() => navigate("/appointment")}>
              View services
            </button>
          </div>
        </div>
        <div className="home-hero-card">
          <h3>Why clients choose us</h3>
          <ul>
            <li>Clear guidance and transparent plans</li>
            <li>Highly skilled staff with flexible schedules</li>
            <li>Wide range of services, easy to bundle</li>
          </ul>
        </div>
      </section>

      <section className="home-quotes">
        <div className="quote-card">
          <p>“Scheduling care is no longer time-consuming.”</p>
          <span>Loyal client</span>
        </div>
        <div className="quote-card">
          <p>“Bundling services helps optimize my schedule.”</p>
          <span>Consultant</span>
        </div>
        <div className="quote-card">
          <p>“Fast booking with clear confirmation.”</p>
          <span>New client</span>
        </div>
      </section>
    </main>
  );
}
