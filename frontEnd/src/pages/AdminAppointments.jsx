import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/appointments/all`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load appointments");
      }

      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  return (
    <div className="admin-appointments">
      <div className="page-header">
        <h2>Appointment Management</h2>
        <p className="subtitle">View and track all appointments across the system</p>
      </div>

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="empty">There are no appointments at the moment.</div>
      ) : (
        <div className="table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Staff</th>
                <th>Services</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => {
                const customer = app.customerId || {
                  fullName: app.customerName || "Walk-in",
                  phone: "",
                };
                const staff = app.staffId || { fullName: "Unknown" };
                const services = Array.isArray(app.serviceIds) ? app.serviceIds : [];

                let sName = services.map((s) => s.name).join(", ");
                if (!sName) sName = "N/A";

                const dateStr = new Date(app.appointmentDate).toLocaleDateString("en-GB");
                const timeStr = `${formatTime(app.startTime)} - ${formatTime(app.endTime)}`;

                return (
                  <tr key={app._id}>
                    <td>
                      <strong>{customer.fullName}</strong>
                      <div className="sub-text">{customer.phone}</div>
                    </td>
                    <td>
                      <span className="staff-name">{staff.fullName}</span>
                    </td>
                    <td>
                      <div className="service-list">{sName}</div>
                    </td>
                    <td>
                      <div className="time-block">
                        <span className="date-badge">📅 {dateStr}</span>
                        <span className="time-badge">⏰ {timeStr}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill status-${app.status?.toLowerCase() || "pending"}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .admin-appointments {
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

        .appointments-table {
          width: 100%;
          border-collapse: collapse;
        }

        .appointments-table th,
        .appointments-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          text-align: left;
          vertical-align: top;
        }

        .appointments-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
          font-size: 14px;
        }

        .appointments-table tr:hover {
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

        .time-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .date-badge, .time-badge {
          display: inline-block;
          font-size: 13px;
          padding: 4px 8px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #334155;
          font-weight: 500;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-scheduled { background: #e0f2fe; color: #0284c7; }
        .status-completed { background: #dcfce3; color: #166534; }
        .status-cancelled { background: #fee2e2; color: #dc2626; }

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
