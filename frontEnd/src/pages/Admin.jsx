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
          <Link to="/admin/gallery" className="admin-nav-item">
            Gallery
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
        <header className="admin-header">
          <div className="admin-search">
            <input type="text" placeholder="Search..." />
            <button>🔍</button>
          </div>
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
          <Route path="gallery" element={<Placeholder title="Gallery" />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </main>

      <style>{`
        .admin {
          display: flex;
          min-height: 100vh;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }

        .admin-sidebar {
          width: 220px;
          background: #0dbacaff;
          color: #fff;
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          overflow-y: auto;
        }

        .admin-logo {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .admin-nav-item {
          padding: 10px 14px;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-weight: 500;
        }

        .admin-nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .admin-main {
          flex: 1;
          background: #f4f6f7;
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .admin-search {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          max-width: 520px;
        }

        .admin-search input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          outline: none;
        }

        .admin-search button {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: #22d3c5;
          color: #fff;
          cursor: pointer;
        }

        .admin-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-primary {
          padding: 10px 18px;
          border-radius: 12px;
          border: none;
          background: #22d3c5;
          color: #fff;
          cursor: pointer;
        }

        .admin-user {
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.08);
        }

        .dashboard-title {
          margin: 0 0 16px;
          font-size: 22px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
        }

        .stat-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: #22d3c5;
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 22px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          color: rgba(0, 0, 0, 0.65);
        }

        .table-card {
          background: #fff;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
        }

        .table-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .table-card-title {
          font-size: 18px;
          font-weight: 700;
        }

        .table-card-actions button {
          margin-left: 10px;
        }

        .btn-secondary {
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: white;
          cursor: pointer;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .table th,
        .table td {
          padding: 12px 10px;
          text-align: left;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .table th {
          font-weight: 600;
          color: rgba(0, 0, 0, 0.7);
        }

        .btn-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: none;
          background: rgba(0, 0, 0, 0.05);
          cursor: pointer;
          margin-right: 6px;
        }

        .btn-icon:last-child {
          margin-right: 0;
        }

        .admin-settings {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-settings-card {
          background: #fff;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
          max-width: 420px;
          display: grid;
          gap: 12px;
        }

        .admin-settings-card label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.7);
        }

        .admin-settings-card input {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.12);
        }

        @media (max-width: 900px) {
          .admin {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
            flex-direction: row;
            align-items: center;
            padding: 14px;
            overflow-x: auto;
          }

          .admin-nav {
            flex-direction: row;
            gap: 10px;
          }

          .admin-main {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
