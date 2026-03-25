import React from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import Stylists from "./Stylists";
import Services from "./Services";
import StaffRequests from "./StaffRequests";
import Analytics from "./Analytics";
import Members from "./Members";
import AdminAppointments from "./AdminAppointments";
import Placeholder from "./Placeholder";
import AdminSettings from "./AdminSettings";
import AdminFeedback from "./AdminFeedback";

function DashboardView() {
  const [stats, setStats] = React.useState({
    totalCustomers: 0,
    totalStaff: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalRevenue: 0,
  });

  React.useEffect(() => {
    fetch("http://localhost:3000/users/admin/dashboard-stats")
      .then((res) => res.json())
      .then((data) => {
        if (!data.message) setStats(data);
      })
      .catch(console.error);
  }, []);

  return (
    <section className="dashboard">
      <h2 className="dashboard-title">Dashboard</h2>
      <div className="stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-label">Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✂️</div>
          <div>
            <div className="stat-value">{stats.totalStaff}</div>
            <div className="stat-label">Staff</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div>
            <div className="stat-value">{stats.pendingAppointments}</div>
            <div className="stat-label">Pending appointments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div>
            <div className="stat-value">
              {stats.totalRevenue ? stats.totalRevenue.toLocaleString("en-US") : "0"} VND
            </div>
            <div className="stat-label">Estimated revenue</div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title">Detailed Management</div>
        </div>
        <p style={{ color: "#64748b", marginTop: "10px" }}>
          Please switch to the <strong>Appointments</strong> or <strong>Analytics</strong>{" "}
          tab in the left menu to view and manage details.
        </p>
      </div>
    </section>
  );
}

export default function Admin() {
  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <div className="admin-logo">Admin</div>
        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-item">
            Dashboard
          </Link>
          <Link to="/admin/staff" className="admin-nav-item">
            Staff
          </Link>
          <Link to="/admin/services" className="admin-nav-item">
            Services
          </Link>
          <Link to="/admin/staff-requests" className="admin-nav-item">
            Staff Requests
          </Link>
          <Link to="/admin/appointments" className="admin-nav-item">
            Appointments
          </Link>
          <Link to="/admin/members" className="admin-nav-item">
            Members
          </Link>
          <Link to="/admin/feedback" className="admin-nav-item">
            Feedback
          </Link>
          <Link to="/admin/analytics" className="admin-nav-item">
            Analytics
          </Link>
          <Link to="/admin/settings" className="admin-nav-item">
            Website Settings
          </Link>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header" style={{ justifyContent: "flex-end" }}>
          <div className="admin-actions">
            <button
              className="btn-primary"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
            >
              Log out
            </button>
            <div className="admin-user">admin</div>
          </div>
        </header>

        <Routes>
          <Route index element={<DashboardView />} />
          <Route path="staff" element={<Stylists />} />
          <Route path="services" element={<Services />} />
          <Route path="staff-requests" element={<StaffRequests />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="members" element={<Members />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </main>

      <style>{`
        .admin {
          display: flex;
          min-height: 100vh;
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          background: #f8fafc;
        }

        .admin-sidebar {
          width: 260px;
          background: #0f172a;
          color: #fff;
          display: flex;
          flex-direction: column;
          padding: 24px 20px;
          overflow-y: auto;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.05);
          z-index: 10;
        }

        .admin-logo {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 32px;
          color: #22d3c5;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .admin-logo::before {
          content: "✂️";
          font-size: 20px;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .admin-nav-item {
          padding: 12px 16px;
          border-radius: 12px;
          color: #94a3b8;
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-nav-item:hover {
          background: rgba(34, 211, 197, 0.1);
          color: #22d3c5;
          transform: translateX(4px);
        }

        .admin-main {
          flex: 1;
          background: #f8fafc;
          padding: 32px 40px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .admin-header {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .admin-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .btn-primary {
          padding: 10px 20px;
          border-radius: 12px;
          border: none;
          background: #22d3c5;
          color: #0f172a;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(34, 211, 197, 0.2);
        }

        .btn-primary:hover {
          background: #1ebdb0;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(34, 211, 197, 0.3);
        }

        .admin-user {
          padding: 10px 16px;
          border-radius: 12px;
          background: #ffffff;
          font-weight: 600;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .dashboard-title {
          margin: 0 0 24px;
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
          border-color: #22d3c5;
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(34, 211, 197, 0.2), rgba(34, 211, 197, 0.05));
          display: grid;
          place-items: center;
          color: #22d3c5;
          font-size: 28px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 4px;
          color: #0f172a;
          letter-spacing: -1px;
        }

        .stat-label {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
          border: 1px solid #f1f5f9;
        }

        .table-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .table-card-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
        }

        .table-card-actions button {
          margin-left: 10px;
        }

        .btn-secondary {
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #0f172a;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .table th,
        .table td {
          padding: 16px 12px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .table th {
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: #f1f5f9;
          color: #64748b;
          cursor: pointer;
          margin-right: 8px;
          transition: all 0.2s ease;
        }

        .btn-icon:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .btn-icon:last-child {
          margin-right: 0;
        }

        .admin-settings {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .admin-settings-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
          border: 1px solid #f1f5f9;
          max-width: 480px;
          display: grid;
          gap: 16px;
        }

        .admin-settings-card label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
        }

        .admin-settings-card input {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 15px;
          transition: border-color 0.2s;
        }

        .admin-settings-card input:focus {
          outline: none;
          border-color: #22d3c5;
          box-shadow: 0 0 0 3px rgba(34, 211, 197, 0.1);
        }

        @media (max-width: 900px) {
          .admin {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
            flex-direction: row;
            align-items: center;
            padding: 16px 20px;
            overflow-x: auto;
            border-bottom: 1px solid #1e293b;
          }
          
          .admin-logo {
            margin-bottom: 0;
            margin-right: 32px;
          }

          .admin-nav {
            flex-direction: row;
            gap: 12px;
          }

          .admin-main {
            padding: 24px 20px;
          }
          
          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
