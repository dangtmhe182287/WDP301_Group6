import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("vi-VN");

// ─── Dashboard View ──────────────────────────────────────────────────────────

function DashboardView() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/staffs/dashboard")
      .then((res) => setStats(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCount = (status) =>
    stats.find((s) => s._id === status)?.count ?? 0;

  const totalToday = stats.reduce((acc, s) => acc + s.count, 0);

  return (
    <section className="staff-section">
      <h2 className="staff-page-title">Bảng tin</h2>
      <div className="staff-stats">
        <div className="staff-stat-card">
          <div className="staff-stat-icon">📅</div>
          <div>
            <div className="staff-stat-value">
              {loading ? "..." : totalToday}
            </div>
            <div className="staff-stat-label">Tổng lịch hẹn</div>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon">⏳</div>
          <div>
            <div className="staff-stat-value">
              {loading ? "..." : getCount("Pending")}
            </div>
            <div className="staff-stat-label">Chờ xác nhận</div>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon">✅</div>
          <div>
            <div className="staff-stat-value">
              {loading ? "..." : getCount("Completed")}
            </div>
            <div className="staff-stat-label">Hoàn thành</div>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon">❌</div>
          <div>
            <div className="staff-stat-value">
              {loading ? "..." : getCount("Cancelled")}
            </div>
            <div className="staff-stat-label">Đã huỷ</div>
          </div>
        </div>
      </div>

      <div className="staff-table-card">
        <div className="staff-table-card-header">
          <div className="staff-table-card-title">Tổng quan</div>
        </div>
        <p style={{ color: "#64748b", padding: "0 18px 18px", fontSize: 14 }}>
          Chuyển sang tab <strong>Lịch hẹn</strong> để xem và quản lý chi tiết.
        </p>
      </div>
    </section>
  );
}

// ─── Appointments View ───────────────────────────────────────────────────────

function AppointmentsView() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Tất cả");

  const fetchAppointments = () => {
    setLoading(true);
    setError("");
    axiosInstance
      .get("/staffs/appointments")
      .then((res) => setAppointments(Array.isArray(res.data) ? res.data : []))
      .catch((err) =>
        setError(err.response?.data?.message || "Không thể kết nối Server")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const confirmPayment = async (id) => {
    try {
      await axiosInstance.patch(`/appointments/${id}/confirm-payment`);
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, paymentStatus: "Paid" } : a
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xác nhận thanh toán");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.patch(`/staffs/appointments/${id}/status`, { status });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  const filters = ["Tất cả", "Pending", "Scheduled", "Completed", "Cancelled"];

  const filtered =
    filter === "Tất cả"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <section className="staff-section">
      <h2 className="staff-page-title">Lịch hẹn</h2>

      <div className="staff-table-card">
        <div className="staff-table-card-header">
          <div className="staff-table-card-title">Danh sách lịch hẹn</div>
          <div className="staff-filter-wrap">
            {filters.map((f) => (
              <button
                key={f}
                className={`staff-filter-btn${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="staff-state-msg">Đang tải...</div>
        ) : error ? (
          <div className="staff-state-msg error">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="staff-state-msg">Không có lịch hẹn nào.</div>
        ) : (
          <table className="staff-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Dịch vụ</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => {
                const customer = app.customerId || {
                  fullName: app.walkInCustomerName || "Khách vãng lai",
                  phone: "",
                };
                const services = Array.isArray(app.serviceIds)
                  ? app.serviceIds.map((s) => s.name).join(", ")
                  : "Chưa rõ";

                return (
                  <tr key={app._id}>
                    <td>
                      <div className="staff-cell-name">{customer.fullName}</div>
                      <div className="staff-cell-sub">{customer.phone}</div>
                    </td>
                    <td>{services}</td>
                    <td>
                      <div className="staff-time-block">
                        <span className="staff-badge">
                          📅 {formatDate(app.appointmentDate)}
                        </span>
                        <span className="staff-badge">
                          ⏰ {formatTime(app.startTime)} -{" "}
                          {formatTime(app.endTime)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <select
                        className={`staff-status-pill status-${app.status?.toLowerCase()}`}
                        value={app.status}
                        onChange={(e) => updateStatus(app._id, e.target.value)}
                      >
                        {["Pending", "Scheduled", "Completed", "Cancelled"].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    <td>
                      <span
                        className={`staff-pay-pill ${
                          app.paymentStatus === "Paid"
                            ? "pay-paid"
                            : "pay-unpaid"
                        }`}
                      >
                        {app.paymentStatus}
                      </span>
                      {app.paymentStatus === "Unpaid" && (
                        <button
                          className="staff-confirm-btn"
                          onClick={() => confirmPayment(app._id)}
                        >
                          Xác nhận thanh toán
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

// ─── Schedule View ───────────────────────────────────────────────────────────

function ScheduleView() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/staffs/schedule")
      .then((res) => setSchedule(Array.isArray(res.data) ? res.data : []))
      .catch((err) =>
        setError(err.response?.data?.message || "Không thể tải lịch làm việc")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="staff-section">
      <h2 className="staff-page-title">Lịch làm việc</h2>

      <div className="staff-table-card">
        <div className="staff-table-card-header">
          <div className="staff-table-card-title">Lịch của tôi</div>
        </div>

        {loading ? (
          <div className="staff-state-msg">Đang tải...</div>
        ) : error ? (
          <div className="staff-state-msg error">{error}</div>
        ) : schedule.length === 0 ? (
          <div className="staff-state-msg">Chưa có lịch làm việc.</div>
        ) : (
          <table className="staff-table">
            <thead>
              <tr>
                <th>Ngày làm việc</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((s, i) => (
                <tr key={i}>
                  <td>{formatDate(s.workingDate)}</td>
                  <td>{s.startTime}</td>
                  <td>{s.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

// ─── Root Staff Layout ───────────────────────────────────────────────────────

export default function Staff() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Bảng tin", path: "/staff" },
    { label: "Lịch hẹn", path: "/staff/appointments" },
    { label: "Lịch làm việc", path: "/staff/schedule" },
  ];

  const isActive = (path) =>
    path === "/staff"
      ? location.pathname === "/staff"
      : location.pathname.startsWith(path);

  return (
    <div className="staff-layout">
      <aside className="staff-sidebar">
        <div className="staff-logo">Staff</div>
        <nav className="staff-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`staff-nav-item${isActive(item.path) ? " active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="staff-main">
        <header className="staff-header">
          <div className="staff-search-wrap">
            <input type="text" placeholder="Tìm kiếm..." />
            <button className="staff-search-btn">🔍</button>
          </div>
          <div className="staff-header-right">
            <button className="staff-btn-logout" onClick={logout}>
              Đăng xuất
            </button>
            <div className="staff-user-chip">
              {user?.fullName || user?.email || "Staff"}
            </div>
          </div>
        </header>

        <div className="staff-content">
          <Routes>
            <Route index element={<DashboardView />} />
            <Route path="appointments" element={<AppointmentsView />} />
            <Route path="schedule" element={<ScheduleView />} />
            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
        </div>
      </main>

      <style>{`
        .staff-layout {
          display: flex;
          min-height: 100vh;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .staff-sidebar {
          width: 220px;
          background: #0dbaca;
          color: #fff;
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          overflow-y: auto;
        }
        .staff-logo {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 24px;
        }
        .staff-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .staff-nav-item {
          padding: 10px 14px;
          border-radius: 10px;
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
        }
        .staff-nav-item:hover {
          background: rgba(255,255,255,0.1);
        }
        .staff-nav-item.active {
          background: rgba(255,255,255,0.2);
          color: #fff;
        }
        .staff-main {
          flex: 1;
          background: #f4f6f7;
          display: flex;
          flex-direction: column;
        }
        .staff-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          gap: 16px;
        }
        .staff-search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          max-width: 520px;
        }
        .staff-search-wrap input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.1);
          outline: none;
          font-size: 14px;
          background: #fff;
        }
        .staff-search-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: #22d3c5;
          color: #fff;
          cursor: pointer;
          font-size: 16px;
        }
        .staff-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .staff-btn-logout {
          padding: 10px 18px;
          border-radius: 12px;
          border: none;
          background: #22d3c5;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .staff-user-chip {
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(0,0,0,0.06);
          font-size: 14px;
        }
        .staff-content {
          padding: 0 24px 24px;
          flex: 1;
        }
        .staff-section {
          animation: staffFadeIn 0.3s ease;
        }
        .staff-page-title {
          font-size: 22px;
          font-weight: 700;
          color: #0b2e5c;
          margin: 0 0 16px;
        }
        .staff-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .staff-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 4px 18px rgba(0,0,0,0.06);
        }
        .staff-stat-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: #22d3c5;
          display: grid;
          place-items: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .staff-stat-value {
          font-size: 26px;
          font-weight: 700;
          color: #0b2e5c;
          margin-bottom: 4px;
        }
        .staff-stat-label {
          color: rgba(0,0,0,0.55);
          font-size: 13px;
        }
        .staff-table-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.06);
          overflow: hidden;
        }
        .staff-table-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px 14px;
          border-bottom: 1px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 10px;
        }
        .staff-table-card-title {
          font-size: 18px;
          font-weight: 700;
          color: #0b2e5c;
        }
        .staff-filter-wrap {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .staff-filter-btn {
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.12);
          background: #fff;
          color: #64748b;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }
        .staff-filter-btn.active {
          background: #22d3c5;
          color: #fff;
          border-color: #22d3c5;
        }
        .staff-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .staff-table th,
        .staff-table td {
          padding: 14px 20px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }
        .staff-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
          font-size: 13px;
        }
        .staff-table tr:last-child td { border-bottom: none; }
        .staff-table tr:hover td { background: #f8fafc; }
        .staff-cell-name { font-weight: 600; color: #334155; }
        .staff-cell-sub { font-size: 12px; color: #64748b; margin-top: 3px; }
        .staff-time-block { display: flex; flex-direction: column; gap: 4px; }
        .staff-badge {
          display: inline-block;
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #334155;
          font-weight: 500;
        }
        .staff-status-pill {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          outline: none;
        }
        .status-pending { background: #fef3c7; color: #d97706; }
        .status-scheduled { background: #e0f2fe; color: #0284c7; }
        .status-completed { background: #dcfce7; color: #166534; }
        .status-cancelled { background: #fee2e2; color: #dc2626; }
        .staff-pay-pill {
          display: inline-flex;
          align-items: center;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .pay-paid { background: #dcfce7; color: #166534; }
        .pay-unpaid { background: #fef3c7; color: #d97706; }
        .staff-confirm-btn {
          display: block;
          margin-top: 6px;
          padding: 6px 12px;
          border-radius: 10px;
          border: none;
          background: #22d3c5;
          color: #fff;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        }
        .staff-state-msg {
          padding: 40px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        .staff-state-msg.error { color: #ef4444; }
        @keyframes staffFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}