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
  const [services, setServices] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingStaffs, setLoadingStaffs] = useState(false);
  const [rateByAppointment, setRateByAppointment] = useState({});
  const [commentByAppointment, setCommentByAppointment] = useState({});
  const [submittingRatingId, setSubmittingRatingId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editServiceIds, setEditServiceIds] = useState([]);
  const [editStaffId, setEditStaffId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editSlots, setEditSlots] = useState([]);
  const [editStart, setEditStart] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [loadingEditSlots, setLoadingEditSlots] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState(null);

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

  const formatDateInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const toMinuteLabel = (minute) => {
    const h = String(Math.floor(minute / 60)).padStart(2, "0");
    const m = String(minute % 60).padStart(2, "0");
    return `${h}:${m}`;
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

  const refreshBookings = async () => {
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

  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true);
      try {
        const response = await axiosInstance.get("/services");
        setServices(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    const loadStaffs = async () => {
      setLoadingStaffs(true);
      try {
        const response = await axiosInstance.get("/staffs");
        setStaffs(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setStaffs([]);
      } finally {
        setLoadingStaffs(false);
      }
    };

    loadServices();
    loadStaffs();
  }, []);

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

  const canReschedule = (booking) => canCancel(booking);

  const handleCancel = async (bookingId) => {
    try {
      const confirmed = window.confirm(
        "Bạn có chắc muốn hủy lịch này không? Thao tác này không thể hoàn tác.",
      );
      if (!confirmed) return;
      await axiosInstance.post(`/appointments/${bookingId}/cancel`);
      await refreshBookings();
      toast.success("Appointment cancelled.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to cancel appointment.");
    }
  };

  const toggleEditService = (serviceId) => {
    setEditServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const handleOpenEdit = (booking) => {
    const staffId = booking?.staffId?._id || booking?.staffId || "";
    const serviceIds = Array.isArray(booking?.serviceIds)
      ? booking.serviceIds.map((service) => String(service?._id || service)).filter(Boolean)
      : [];
    const dateValue = formatDateInput(booking?.appointmentDate);
    setEditingBookingId(booking._id);
    setEditStaffId(staffId);
    setEditServiceIds(serviceIds);
    setEditDate(dateValue);
    setEditStart(booking?.startTime ?? null);
    setEditNote(booking?.note || "");
    setEditSnapshot({
      staffId,
      date: dateValue,
      start: booking?.startTime ?? null,
      serviceIds,
    });
  };

  const handleCloseEdit = () => {
    setEditingBookingId(null);
    setEditServiceIds([]);
    setEditStaffId("");
    setEditDate("");
    setEditSlots([]);
    setEditStart(null);
    setEditNote("");
    setSavingEdit(false);
    setLoadingEditSlots(false);
    setEditSnapshot(null);
  };

  useEffect(() => {
    const loadEditSlots = async () => {
      if (!editingBookingId || !editStaffId || editServiceIds.length === 0 || !editDate) {
        setEditSlots([]);
        return;
      }
      setLoadingEditSlots(true);
      try {
        const params = {
          staffId: editStaffId,
          appointmentDate: editDate,
        };
        if (editServiceIds.length === 1) {
          params.serviceId = editServiceIds[0];
        } else {
          params.serviceIds = editServiceIds.join(",");
        }
        const response = await axiosInstance.get("/appointments/availability", { params });
        const data = response.data || {};
        setEditSlots(Array.isArray(data.slots) ? data.slots : []);
      } catch (error) {
        setEditSlots([]);
      } finally {
        setLoadingEditSlots(false);
      }
    };

    loadEditSlots();
  }, [editingBookingId, editStaffId, editServiceIds, editDate]);

  const handleSaveEdit = async () => {
    if (!editingBookingId) return;
    if (!editStaffId || editServiceIds.length === 0 || !editDate || editStart === null) {
      toast.error("Please select services, staff, date, and a start time.");
      return;
    }
    if (savingEdit) return;
    setSavingEdit(true);
    try {
      await axiosInstance.patch(`/appointments/${editingBookingId}/reschedule`, {
        staffId: editStaffId,
        serviceIds: editServiceIds,
        appointmentDate: editDate,
        startTime: editStart,
        note: editNote,
      });
      toast.success("Appointment updated.");
      await refreshBookings();
      handleCloseEdit();
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to update appointment.");
    } finally {
      setSavingEdit(false);
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

  const isCompletedHistory = (booking) =>
    booking?.status === "Completed" && booking?.paymentStatus === "Paid";

  const isCancelledHistory = (booking) => booking?.status === "Cancelled";

  const getSortedBookings = (list, direction = "desc") =>
    [...list].sort((a, b) => {
      const aTime = getAppointmentStart(a)?.getTime?.() || 0;
      const bTime = getAppointmentStart(b)?.getTime?.() || 0;
      return direction === "asc" ? aTime - bTime : bTime - aTime;
    });

  const visibleBookings = useMemo(() => {
    let filtered = showHistory
      ? bookings.filter(isHistoryBooking)
      : bookings.filter(isActiveBooking);
    if (showHistory) {
      if (historyFilter === "completed") {
        filtered = filtered.filter(isCompletedHistory);
      } else if (historyFilter === "cancelled") {
        filtered = filtered.filter(isCancelledHistory);
      }
    }
    return getSortedBookings(filtered, showHistory ? "desc" : "asc");
  }, [bookings, showHistory, historyFilter]);

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
        {showHistory ? (
          <div className="booking-filters">
            <button
              type="button"
              className={`booking-filter-btn${historyFilter === "all" ? " active" : ""}`}
              onClick={() => setHistoryFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`booking-filter-btn${historyFilter === "completed" ? " active" : ""}`}
              onClick={() => setHistoryFilter("completed")}
            >
              Completed
            </button>
            <button
              type="button"
              className={`booking-filter-btn${historyFilter === "cancelled" ? " active" : ""}`}
              onClick={() => setHistoryFilter("cancelled")}
            >
              Cancelled
            </button>
          </div>
        ) : null}
        {loadingBookings ? <p className="muted">Loading bookings...</p> : null}
        {!loadingBookings && visibleBookings.length === 0 ? (
          <p className="muted">
            {showHistory
              ? "No booking found."
              : "No active bookings."}
          </p>
        ) : null}
        <div className="booking-list">
          {visibleBookings.map((booking) => {
            const staffName = booking?.staffId?.fullName || booking?.staffId?.email || "No staff info";
            const servicesName = Array.isArray(booking.serviceIds)
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
                    <div className="booking-services">{servicesName.join(", ")}</div>
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
                  {canReschedule(booking) ? (
                    <button
                      type="button"
                      className="booking-reschedule"
                      onClick={() =>
                        editingBookingId === booking._id
                          ? handleCloseEdit()
                          : handleOpenEdit(booking)
                      }
                    >
                      {editingBookingId === booking._id ? "Close" : "Reschedule"}
                    </button>
                  ) : null}
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
                {editingBookingId === booking._id ? (
                  <div className="booking-edit">
                    <div className="booking-edit-grid">
                      <label>
                        Staff
                        <select
                          value={editStaffId}
                          onChange={(event) => setEditStaffId(event.target.value)}
                        >
                          <option value="">Select staff</option>
                          {loadingStaffs ? (
                            <option value="" disabled>
                              Loading staff...
                            </option>
                          ) : null}
                          {staffs.map((staff) => {
                            const name = staff?.fullName || staff?.email || "Staff";
                            return (
                              <option key={staff._id} value={staff._id}>
                                {name}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                      <label>
                        Date
                        <input
                          type="date"
                          value={editDate}
                          onChange={(event) => setEditDate(event.target.value)}
                        />
                      </label>
                      <label>
                        Note
                        <input
                          type="text"
                          value={editNote}
                          onChange={(event) => setEditNote(event.target.value)}
                          placeholder="Optional note"
                        />
                      </label>
                    </div>

                    <div>
                      <div className="booking-edit-title">Services</div>
                      {loadingServices ? (
                        <p className="muted">Loading services...</p>
                      ) : null}
                      <div className="booking-service-list">
                        {services.map((service) => {
                          
                          const id = String(service._id);
                          const isSelected = editServiceIds.includes(id);
                          return (
                            <label key={service._id} className="booking-service-option">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleEditService(id)}
                              />
                              <span>
                                {service.name} ({service.duration} min)
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="booking-edit-title">Time</div>
                      {loadingEditSlots ? <p className="muted">Loading slots...</p> : null}
                      {!loadingEditSlots && editSlots.length === 0 ? (
                        <p className="muted">No slots available for this selection.</p>
                      ) : null}
                      {editSlots.length > 0 ? (
                        <div className="slot-grid">
                          {editSlots.map((slot) => {
                            const isOriginalSlot =
                              editSnapshot &&
                              editSnapshot.start === slot.startMinute &&
                              editSnapshot.staffId === editStaffId &&
                              editSnapshot.date === editDate;
                            const isDisabled = !slot.available && !isOriginalSlot;
                            return (
                              <button
                                key={slot.startMinute}
                                type="button"
                                disabled={isDisabled}
                                className={`slot-btn ${editStart === slot.startMinute ? "selected" : ""}`}
                                onClick={() => setEditStart(slot.startMinute)}
                              >
                                {toMinuteLabel(slot.startMinute)}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>

                    <div className="booking-edit-actions">
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={handleCloseEdit}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={handleSaveEdit}
                        disabled={savingEdit}
                      >
                        {savingEdit ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
