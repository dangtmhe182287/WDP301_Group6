import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/services/feedbacks`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load feedbacks");
      }

      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="admin-feedback">
      <div className="page-header">
        <h2>Customer Feedback</h2>
        <p className="subtitle">Review ratings and comments left by your customers</p>
      </div>

      {loading ? (
        <div className="loading">Loading feedback...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : feedbacks.length === 0 ? (
        <div className="empty">No feedback has been received yet.</div>
      ) : (
        <div className="table-container">
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Staff</th>
                <th>Services</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => {
                const dateStr = new Date(fb.createdAt || Date.now()).toLocaleDateString("en-GB");

                return (
                  <tr key={fb._id}>
                    <td>
                      <strong>{fb.customerName}</strong>
                      {fb.customerPhone && <div className="sub-text">{fb.customerPhone}</div>}
                    </td>
                    <td>
                      <span className="staff-name">{fb.staffName}</span>
                    </td>
                    <td>
                      <div className="service-list">{fb.serviceName}</div>
                    </td>
                    <td>
                      <div className="stars">{"⭐".repeat(fb.rating)}</div>
                    </td>
                    <td>
                      <div className="comment-box">
                        {fb.comment || <span className="no-comment">No comment</span>}
                      </div>
                    </td>
                    <td>
                      <span className="date-badge">📅 {dateStr}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .admin-feedback {
          padding: 24px;
          animation: fadeIn 0.4s ease;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h2 {
          color: #0b2e5c;
          margin: 0 0 8px 0;
          font-size: 24px;
        }

        .subtitle {
          color: #64748b;
          font-size: 15px;
          margin: 0;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .feedback-table {
          width: 100%;
          border-collapse: collapse;
        }

        .feedback-table th,
        .feedback-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          text-align: left;
          vertical-align: top;
        }

        .feedback-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
          font-size: 14px;
        }

        .feedback-table tr:hover {
          background: #f8fafc;
        }

        .sub-text {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }

        .staff-name {
          font-weight: 500;
          color: #334155;
        }

        .service-list {
          font-size: 14px;
          color: #475569;
          max-width: 250px;
          line-height: 1.5;
        }
        
        .stars {
          font-size: 14px;
          letter-spacing: 2px;
        }

        .comment-box {
          font-size: 14px;
          color: #334155;
          max-width: 300px;
          line-height: 1.5;
        }

        .no-comment {
          font-style: italic;
          color: #94a3b8;
        }

        .date-badge {
          display: inline-block;
          font-size: 13px;
          padding: 4px 8px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #334155;
          font-weight: 500;
        }

        .loading, .error, .empty {
          padding: 40px;
          text-align: center;
          background: white;
          border-radius: 12px;
          color: #64748b;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .error { color: #ef4444; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
