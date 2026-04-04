import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_BASE = "http://localhost:3000";

export default function Members() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/users/admin/customers-stats`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load members");
      }

      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

 const handleToggleBan = (id, currentStatus) => {
  toast(`Do you want to ${currentStatus ? "unban" : "ban"} this user?`, {
    action: {
      label: "Accept",
      onClick: async () => {
        try {
          const response = await fetch(
            `${API_BASE}/users/admin/customers/${id}/ban`,
            {
              method: "PUT",
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to update status");
          }

          toast.success(
            `${currentStatus ? "Unban" : "Ban"} user successfully!`
          );

          loadMembers();
        } catch (err) {
          toast.error(err.message);
        }
      },
    },
    cancel: {
      label: "Reject",
    },
  });
};

  useEffect(() => {
    loadMembers();
  }, []);

  return (
    <div className="members-admin">
      <div className="page-header">
        <h2>Member Management</h2>
        <p className="subtitle">Customer list and booking history stats</p>
      </div>

      {loading ? (
        <div className="loading">Loading members...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : customers.length === 0 ? (
        <div className="empty">No customers have registered yet.</div>
      ) : (
        <div className="table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>Full name</th>
                <th>Contact</th>
                <th>Total bookings</th>
                <th>No Show</th>
                <th>No Show rate</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const total = customer.totalBookings || 0;
                const noShow = customer.noShowBookings || 0;
                let noShowRate = 0;

                if (total > 0) {
                  noShowRate = Math.round((noShow / total) * 100);
                }

                return (
                  <tr key={customer._id}>
                    <td>
                      <strong>{customer.fullName || "No name"}</strong>
                    </td>
                    <td>
                      <div className="contact-info">
                        <span>📧 {customer.email || "-"}</span>
                        <span>📞 {customer.phone || "-"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="stat-pill booking-pill">{total} bookings</span>
                    </td>
                    <td>
                      <span className={noShow > 0 ? "stat-pill cancel-pill" : "stat-pill zero-pill"}>
                        {noShow} No Show
                      </span>
                    </td>
                    <td>
                      <div className="rate-text">
                        <span
                          className={`rate-percent ${
                            noShowRate > 30 ? "high-rate" : noShowRate > 0 ? "medium-rate" : "good-rate"
                          }`}
                        >
                          {noShowRate}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={customer.isBanned ? "stat-pill cancel-pill" : "stat-pill booking-pill"}>
                        {customer.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleBan(customer._id, customer.isBanned)}
                        className={`action-btn ${customer.isBanned ? "unban-btn" : "ban-btn"}`}
                      >
                        {customer.isBanned ? "Unban" : "Ban"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .members-admin {
          padding: 24px;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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
          margin: 0;
          font-size: 15px;
        }

        .loading, .error, .empty {
          padding: 40px;
          text-align: center;
          background: white;
          border-radius: 12px;
          color: #64748b;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .error {
          color: #ef4444;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .members-table {
          width: 100%;
          border-collapse: collapse;
        }

        .members-table th,
        .members-table td {
          padding: 16px 20px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: middle;
        }

        .members-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
          font-size: 14px;
        }

        .members-table tr:hover {
          background: #f8fafc;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
          color: #475569;
        }

        .stat-pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        .booking-pill {
          background: #e0f2fe;
          color: #0369a1;
        }

        .cancel-pill {
          background: #fee2e2;
          color: #be123c;
        }

        .zero-pill {
          background: #f1f5f9;
          color: #64748b;
        }

        .rate-text {
          font-weight: 600;
        }

        .high-rate {
          color: #e11d48;
        }

        .medium-rate {
          color: #d97706;
        }

        .good-rate {
          color: #059669;
        }

        .action-btn {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .ban-btn {
          background: #fee2e2;
          color: #be123c;
        }

        .ban-btn:hover {
          background: #fecdd3;
        }

        .unban-btn {
          background: #e0f2fe;
          color: #0369a1;
        }

        .unban-btn:hover {
          background: #bae6fd;
        }
      `}</style>
    </div>
  );
}

