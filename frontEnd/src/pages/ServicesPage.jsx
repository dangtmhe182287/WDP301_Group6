import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

export default function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/services")
      .then((res) => {
        const data = res.data;
        setServices(Array.isArray(data) ? data : data?.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to load services"))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price) => price?.toLocaleString("en-US") + " VND";

  return (
    <main className="services-page">
      <section className="services-hero">
        <div className="container">
          <h1>Our Services</h1>
          <p>Explore professional hair care services at Elysina Salon</p>
        </div>
      </section>

      <section className="services-content container">
        {loading ? (
          <p className="services-state">Loading services...</p>
        ) : error ? (
          <p className="services-state error">{error}</p>
        ) : services.length === 0 ? (
          <p className="services-state">No services available.</p>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <div key={service._id} className="service-card">
                <div className="service-card-body">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
                <div className="service-card-footer">
                  <div className="service-meta">
                    <span className="service-price">{formatPrice(service.price)}</span>
                    <span className="service-duration">⏱ {service.duration} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .services-page {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .services-hero {
          background: #020d1b;
          color: #fff;
          padding: 72px 24px;
          text-align: center;
        }

        .services-hero h1 {
          font-size: 38px;
          font-weight: 700;
          margin: 0 0 12px;
        }

        .services-hero p {
          font-size: 16px;
          color: #94a3b8;
          margin: 0;
        }

        .services-content {
          padding: 64px 24px;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .service-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.2s;
        }

        .service-card:hover {
          transform: translateY(-4px);
        }

        .service-card-body {
          padding: 24px 24px 16px;
          flex: 1;
        }

        .service-card-body h3 {
          font-size: 17px;
          font-weight: 700;
          color: #0b2e5c;
          margin: 0 0 10px;
        }

        .service-card-body p {
          font-size: 14px;
          color: #64748b;
          line-height: 1.7;
          margin: 0;
        }

        .service-card-footer {
          padding: 16px 24px 24px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .service-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .service-price {
          font-size: 16px;
          font-weight: 700;
          color: #22d3c5;
        }

        .service-duration {
          font-size: 13px;
          color: #94a3b8;
        }

        .service-book-btn {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: none;
          background: #22d3c5;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .service-book-btn:hover {
          background: #0dbaca;
        }

        .services-state {
          text-align: center;
          color: #64748b;
          padding: 60px 0;
          font-size: 15px;
        }

        .services-state.error {
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .services-hero h1 { font-size: 26px; }
          .services-hero { padding: 48px 16px; }
          .services-content { padding: 40px 16px; }
        }
      `}</style>
    </main>
  );
}
