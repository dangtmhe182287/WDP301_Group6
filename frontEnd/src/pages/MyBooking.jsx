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
  const [commentByAppointment, setCommentByAppointment] = useState({});
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
    return new Intl.DateTimeFormat("en-GB").format(date);
  };

  const bookingStatusLabel = useMemo(
    () => ({
      Scheduled: "Scheduled",
      Pending: "Pending",
      Completed: "Completed",
      Cancelled: "Cancelled",
    }),
    [],
  );

  const paymentStatusLabel = useMemo(
    () => ({
      Paid: "Paid",
      Unpaid: "Unpaid",
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
      toast.success("Appointment cancelled.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to cancel appointment.");
    }
  };

  const handleSubmitRating = async (booking, ratingValue) => {
    if (ratingValue < 1 || ratingValue > 5) {
      toast.error("Please select a rating from 1 to 5.");
      return;
    }
    setSubmittingRatingId(booking._id);
    try {
      const comment = (commentByAppointment[booking._id] || "").trim();
      await axiosInstance.post(`/rates/staff/${booking.staffId?._id || booking.staffId}`, {
        appointmentId: booking._id,
        rating: ratingValue,
        comment: comment || undefined,
      });
      const response = await axiosInstance.get(`/rates/appointment/${booking._id}`);
      setRateByAppointment((prev) => ({ ...prev, [booking._id]: response.data }));
      setCommentByAppointment((prev) => ({ ...prev, [booking._id]: "" }));
      toast.success("Rating submitted.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit rating.");
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
          <h2>Appointments</h2>
          <p>Please log in to view your appointments.</p>
          <button className="primary-btn" onClick={() => navigate("/login")}>
            Log in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="settings-page">
      <div className="settings-card booking-card">
        <div className="booking-header">
          <h2>Appointments</h2>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setShowHistory((prev) => !prev)}
          >
            {showHistory ? "Back" : "History"}
          </button>
        </div>
        {loadingBookings ? <p className="muted">Loading bookings...</p> : null}
        {!loadingBookings && visibleBookings.length === 0 ? (
          <p className="muted">
            {showHistory
              ? "No cancelled or completed bookings yet."
              : "No active bookings."}
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
                    <div className="booking-price">{totalPrice.toLocaleString("en-US")} VND</div>
                  ) : null}
                  {booking.note ? <div className="booking-note">Note: {booking.note}</div> : null}
                  {canRate(booking) ? (
                    <div className="booking-rating">
                      {rated ? (
                        <>
                          <div className="star-row">{renderStars(5, null, rated.rating)}</div>
                          {rated.comment ? (
                            <div className="booking-note">Comment: {rated.comment}</div>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <div className="star-row">
                            {renderStars(5, (value) => handleSubmitRating(booking, value), 0)}
                            {submittingRatingId === booking._id ? (
                              <span className="muted">Submitting...</span>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            className="booking-comment"
                            placeholder="Comment (optional)"
                            value={commentByAppointment[booking._id] || ""}
                            onChange={(e) =>
                              setCommentByAppointment((prev) => ({
                                ...prev,
                                [booking._id]: e.target.value,
                              }))
                            }
                            disabled={submittingRatingId === booking._id}
                          />
                        </>
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
                      Cancel
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
