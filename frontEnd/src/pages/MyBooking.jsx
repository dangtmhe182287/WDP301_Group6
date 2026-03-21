import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "sonner";

export default function MyBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [rateByAppointment, setRateByAppointment] = useState({});
  const [submittingRatingId, setSubmittingRatingId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const formatTime = (minute) => {
    const h = String(Math.floor(minute / 60)).padStart(2, "0");
    const m = String(minute % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN").format(date);
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

  useEffect(() => {
    const loadRates = async () => {
      if (!bookings.length) return;
      const entries = await Promise.all(
        bookings.map(async (booking) => {
          try {
            const response = await axiosInstance.get(`/rates/appointment/${booking._id}`);
            return [booking._id, response.data];
          } catch (error) {
            return [booking._id, null];
          }
        }),
      );
      setRateByAppointment(Object.fromEntries(entries));
    };

    loadRates();
  }, [bookings]);

  const getAppointmentStart = (booking) => {
    const date = new Date(booking.appointmentDate);
    date.setHours(0, 0, 0, 0);
    date.setMinutes(date.getMinutes() + booking.startTime);
    return date;
  };

  const getAppointmentEnd = (booking) => {
    const date = new Date(booking.appointmentDate);
    date.setHours(0, 0, 0, 0);
    date.setMinutes(date.getMinutes() + booking.endTime);
    return date;
  };

  const canRate = (booking) => {
    if (!booking) return false;
    if (booking.status === "Cancelled") return false;
    if (booking.status === "Completed") return true;
    if (booking.status === "Scheduled") return false;
    return new Date() >= getAppointmentEnd(booking);
  };

  const canCancel = (booking) => {
    if (!booking) return false;
    if (["Cancelled", "Completed"].includes(booking.status)) return false;
    const start = getAppointmentStart(booking);
    if (Number.isNaN(start.getTime())) return true;
    return new Date() < start;
  };

  const handleCancel = async (bookingId) => {
    try {
      await axiosInstance.post(`/appointments/${bookingId}/cancel`);
      const response = await axiosInstance.get("/appointments/my");
      setBookings(Array.isArray(response.data) ? response.data : []);
      toast.success("Đã hủy lịch thành công.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Không thể hủy lịch.");
    }
  };

  const handleSubmitRating = async (booking, ratingValue) => {
    if (ratingValue < 1 || ratingValue > 5) {
      toast.error("Vui lòng chọn đánh giá từ 1 đến 5.");
      return;
    }
    setSubmittingRatingId(booking._id);
    try {
      await axiosInstance.post(`/rates/staff/${booking.staffId?._id || booking.staffId}`, {
        appointmentId: booking._id,
        rating: ratingValue,
      });
      const response = await axiosInstance.get(`/rates/appointment/${booking._id}`);
      setRateByAppointment((prev) => ({ ...prev, [booking._id]: response.data }));
      toast.success("Đã gửi đánh giá.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gửi đánh giá thất bại.");
    } finally {
      setSubmittingRatingId(null);
    }
  };

  const renderStars = (value, onSelect, filledValue = value) =>
    [1, 2, 3, 4, 5].map((star) => {
      const isDisabled = !onSelect || submittingRatingId;
      return (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= filledValue ? "filled" : ""}`}
          onClick={onSelect ? () => onSelect(star) : undefined}
          disabled={isDisabled}
        >
          ★
        </button>
      );
    });

  const isHistoryBooking = (booking) =>
    booking?.status === "Cancelled" ||
    (booking?.status === "Completed" && booking?.paymentStatus === "Paid");

  const isActiveBooking = (booking) =>
    booking?.status === "Scheduled" ||
    (booking?.status === "Completed" && booking?.paymentStatus === "Unpaid");

  const getSortedBookings = (list, direction = "desc") =>
    [...list].sort((a, b) => {
      const aTime = getAppointmentStart(a)?.getTime?.() || 0;
      const bTime = getAppointmentStart(b)?.getTime?.() || 0;
      return direction === "asc" ? aTime - bTime : bTime - aTime;
    });

  const visibleBookings = useMemo(() => {
    const filtered = showHistory
      ? bookings.filter(isHistoryBooking)
      : bookings.filter(isActiveBooking);
    return getSortedBookings(filtered, showHistory ? "desc" : "asc");
  }, [bookings, showHistory]);

  if (!user) {
    return (
      <main className="settings-page">
        <div className="settings-card">
          <h2>Lịch hẹn</h2>
          <p>Bạn cần đăng nhập để xem lịch hẹn.</p>
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
        <div className="booking-header">
          <h2>Lịch hẹn</h2>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setShowHistory((prev) => !prev)}
          >
            {showHistory ? "Quay lại" : "Lịch sử"}
          </button>
        </div>
        {loadingBookings ? <p className="muted">Đang tải lịch đã đặt...</p> : null}
        {!loadingBookings && visibleBookings.length === 0 ? (
          <p className="muted">
            {showHistory
              ? "Chưa có lịch đã hủy hoặc đã hoàn thành."
              : "Không có lịch đang chờ xử lý."}
          </p>
        ) : null}
        <div className="booking-list">
          {visibleBookings.map((booking) => {
            const staffName = booking?.staffId?.fullName || booking?.staffId?.email || "Staff";
            const services = Array.isArray(booking.serviceIds)
              ? booking.serviceIds.map((service) => service?.name).filter(Boolean)
              : [];
            const totalPrice = Array.isArray(booking.serviceIds)
              ? booking.serviceIds.reduce((total, service) => total + (service?.price || 0), 0)
              : 0;
            const rated = rateByAppointment[booking._id];
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
                  {totalPrice > 0 ? (
                    <div className="booking-price">{totalPrice.toLocaleString("vi-VN")} VND</div>
                  ) : null}
                  {booking.note ? <div className="booking-note">Ghi chú: {booking.note}</div> : null}
                  {canRate(booking) ? (
                    <div className="booking-rating">
                      {rated ? (
                        <div className="star-row">{renderStars(5, null, rated.rating)}</div>
                      ) : (
                        <div className="star-row">
                          {renderStars(5, (value) => handleSubmitRating(booking, value), 0)}
                          {submittingRatingId === booking._id ? (
                            <span className="muted">Đang gửi...</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                <div className="booking-tags">
                  <span className={`booking-tag status-${booking.status}`}>
                    {bookingStatusLabel[booking.status] || booking.status}
                  </span>
                  <span className={`booking-tag payment-${booking.paymentStatus}`}>
                    {paymentStatusLabel[booking.paymentStatus] || booking.paymentStatus}
                  </span>
                  {canCancel(booking) ? (
                    <button
                      type="button"
                      className="booking-cancel"
                      onClick={() => handleCancel(booking._id)}
                    >
                      Hủy lịch
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
