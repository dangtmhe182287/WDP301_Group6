import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";

export default function MyBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const formatTime = (minute) => {
    const h = String(Math.floor(minute / 60)).padStart(2, "0");
    const m = String(minute % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
  };

  const bookingStatusLabel = useMemo(
    () => ({
      Scheduled: "Chưa hoàn thành",
      Pending: "Chờ xác nhận",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
    }),
    [],
  );

  const paymentStatusLabel = useMemo(
    () => ({
      Paid: "Đã thanh toán",
      Unpaid: "Chưa thanh toán",
    }),
    [],
  );

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) return;
      setLoadingBookings(true);
      try {
        const response = await axiosInstance.get("/appointments/my");
        setBookings(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    loadBookings();
  }, [user]);

  if (!user) {
    return (
      <main className="settings-page">
        <div className="settings-card">
          <h2>My Booking</h2>
          <p>Bạn cần đăng nhập để xem lịch đặt.</p>
          <button className="primary-btn" onClick={() => navigate("/login")}>
            Đăng nhập
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="settings-page">
      <div className="settings-card booking-card">
        <h2>My Booking</h2>
        {loadingBookings ? <p className="muted">Đang tải lịch đã đặt...</p> : null}
        {!loadingBookings && bookings.length === 0 ? (
          <p className="muted">Bạn chưa có lịch đặt nào.</p>
        ) : null}
        <div className="booking-list">
          {bookings.map((booking) => {
            const staffName = booking?.staffId?.fullName || booking?.staffId?.email || "Staff";
            const services = Array.isArray(booking.serviceIds)
              ? booking.serviceIds.map((service) => service?.name).filter(Boolean)
              : [];
            return (
              <div key={booking._id} className="booking-item">
                <div className="booking-main">
                  <div className="booking-title">{staffName}</div>
                  <div className="booking-meta">
                    <span>{formatDate(booking.appointmentDate)}</span>
                    <span>
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </span>
                  </div>
                  {services.length ? (
                    <div className="booking-services">{services.join(", ")}</div>
                  ) : null}
                </div>
                <div className="booking-tags">
                  <span className={`booking-tag status-${booking.status}`}>
                    {bookingStatusLabel[booking.status] || booking.status}
                  </span>
                  <span className={`booking-tag payment-${booking.paymentStatus}`}>
                    {paymentStatusLabel[booking.paymentStatus] || booking.paymentStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
