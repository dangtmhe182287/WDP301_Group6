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
  const [editServiceStaffSelections, setEditServiceStaffSelections] = useState({});
  const [editDate, setEditDate] = useState("");
  const [editSlots, setEditSlots] = useState([]);
  const [editStart, setEditStart] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [loadingEditSlots, setLoadingEditSlots] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState(null);

  const formatTime = (minute) => {
    if (typeof minute === "string") return minute;
    const h = String(Math.floor(minute / 60)).padStart(2, "0");
    const m = String(minute % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  const parseTimeToMinutes = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      if (/^\d+$/.test(value)) return Number(value);
      const match = value.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        const hours = Number(match[1]);
        const minutes = Number(match[2]);
        return hours * 60 + minutes;
      }
    }
    return 0;
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
      NoShow: "No Show",
    }),
    [],
  );

  const getStaffServiceIds = (staff) => {
    const staffInfo = staff?.staff || staff || {};
    return Array.isArray(staffInfo.serviceIds)
      ? staffInfo.serviceIds.map((svc) => String(svc?._id || svc)).filter(Boolean)
      : [];
  };

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
    const startMinutes = parseTimeToMinutes(booking.startTime);
    date.setMinutes(date.getMinutes() + startMinutes);
    return date;
  };

  const getAppointmentEnd = (booking) => {
    const date = new Date(booking.appointmentDate);
    date.setHours(0, 0, 0, 0);
    const endMinutes = parseTimeToMinutes(booking.endTime);
    date.setMinutes(date.getMinutes() + endMinutes);
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
    if (["Cancelled", "Completed", "NoShow"].includes(booking.status)) return false;
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

  const editServiceStaffOptions = useMemo(() => {
    const map = new Map();
    if (editServiceIds.length === 0) return map;
    editServiceIds.forEach((serviceId) => {
      const options = staffs.filter((staff) =>
        getStaffServiceIds(staff).includes(String(serviceId))
      );
      map.set(String(serviceId), options);
    });
    return map;
  }, [editServiceIds, staffs]);

  const editCommonStaffIds = useMemo(() => {
    if (editServiceIds.length === 0) return [];
    const sets = editServiceIds.map((serviceId) => {
      const options = editServiceStaffOptions.get(String(serviceId)) || [];
      return new Set(options.map((staff) => String(staff._id)));
    });
    if (sets.some((set) => set.size === 0)) return [];
    const [first, ...rest] = sets;
    return Array.from(first).filter((id) => rest.every((set) => set.has(id)));
  }, [editServiceIds, editServiceStaffOptions]);

  const editIsMultiStaff = editServiceIds.length > 0 && editCommonStaffIds.length === 0;

  const editAllStaffSelected = useMemo(() => {
    if (!editIsMultiStaff) return true;
    return editServiceIds.every((id) => editServiceStaffSelections[String(id)]);
  }, [editIsMultiStaff, editServiceIds, editServiceStaffSelections]);

  const handleOpenEdit = (booking) => {
    const assignments = Array.isArray(booking?.serviceStaffAssignments)
      ? booking.serviceStaffAssignments
      : [];
    const orderedServiceIds = assignments
      .slice()
      .sort((a, b) => (a.startMinute || 0) - (b.startMinute || 0))
      .map((item) => String(item?.serviceId))
      .filter(Boolean);
    const fallbackServiceIds = Array.isArray(booking?.serviceIds)
      ? booking.serviceIds.map((service) => String(service?._id || service)).filter(Boolean)
      : [];
    const serviceIds = orderedServiceIds.length
      ? [
          ...orderedServiceIds,
          ...fallbackServiceIds.filter((id) => !orderedServiceIds.includes(id)),
        ]
      : fallbackServiceIds;
    const staffId =
      assignments.length > 0 ? "" : booking?.staffId?._id || booking?.staffId || "";
    const nextSelections = {};
    assignments.forEach((item) => {
      if (item?.serviceId && item?.staffId) {
        nextSelections[String(item.serviceId)] = String(item.staffId?._id || item.staffId);
      }
    });
    const dateValue = formatDateInput(booking?.appointmentDate);
    setEditingBookingId(booking._id);
    setEditStaffId(staffId);
    setEditServiceIds(serviceIds);
    setEditServiceStaffSelections(nextSelections);
    setEditDate(dateValue);
    setEditStart(parseTimeToMinutes(booking?.startTime));
    setEditNote(booking?.note || "");
    setEditSnapshot({
      staffId,
      date: dateValue,
      start: parseTimeToMinutes(booking?.startTime),
      staffAssignments: assignments,
      serviceIds,
    });
  };

  const handleCloseEdit = () => {
    setEditingBookingId(null);
    setEditServiceIds([]);
    setEditStaffId("");
    setEditServiceStaffSelections({});
    setEditDate("");
    setEditSlots([]);
    setEditStart(null);
    setEditNote("");
    setSavingEdit(false);
    setLoadingEditSlots(false);
    setEditSnapshot(null);
  };

  useEffect(() => {
    setEditServiceStaffSelections((prev) => {
      const next = {};
      editServiceIds.forEach((id) => {
        if (prev[String(id)]) {
          next[String(id)] = prev[String(id)];
        }
      });
      return next;
    });
  }, [editServiceIds]);

  useEffect(() => {
    if (!editIsMultiStaff) return;
    setEditServiceStaffSelections((prev) => {
      const next = { ...prev };
      editServiceIds.forEach((serviceId) => {
        const key = String(serviceId);
        if (next[key]) return;
        const options = editServiceStaffOptions.get(key) || [];
        if (options.length > 0) {
          next[key] = String(options[0]._id);
        }
      });
      return next;
    });
  }, [editIsMultiStaff, editServiceIds, editServiceStaffOptions]);

  useEffect(() => {
    if (!editingBookingId) return;
    if (editIsMultiStaff) {
      if (editStaffId) {
        setEditStaffId("");
      }
      return;
    }
    if (!editStaffId && editCommonStaffIds.length === 1) {
      setEditStaffId(editCommonStaffIds[0]);
    }
  }, [editingBookingId, editIsMultiStaff, editStaffId, editCommonStaffIds]);

  useEffect(() => {
    const loadEditSlots = async () => {
      if (!editingBookingId || editServiceIds.length === 0 || !editDate) {
        setEditSlots([]);
        return;
      }
      if (editIsMultiStaff && !editAllStaffSelected) {
        setEditSlots([]);
        return;
      }
      if (!editIsMultiStaff && !editStaffId) {
        setEditSlots([]);
        return;
      }
      setLoadingEditSlots(true);
      try {
        const params = {
          appointmentDate: editDate,
          excludeAppointmentId: editingBookingId,
        };
        if (editIsMultiStaff) {
          params.serviceIds = editServiceIds.join(",");
          params.staffAssignments = JSON.stringify(
            editServiceIds.map((serviceId) => ({
              serviceId,
              staffId: editServiceStaffSelections[String(serviceId)],
            })),
          );
        } else {
          params.staffId = editStaffId;
          if (editServiceIds.length === 1) {
            params.serviceId = editServiceIds[0];
          } else {
            params.serviceIds = editServiceIds.join(",");
          }
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
  }, [
    editingBookingId,
    editStaffId,
    editServiceIds,
    editDate,
    editIsMultiStaff,
    editAllStaffSelected,
    editServiceStaffSelections,
  ]);

  const handleSaveEdit = async () => {
    if (!editingBookingId) return;
    if (editServiceIds.length === 0 || !editDate || editStart === null) {
      toast.error("Please select services, date, and a start time.");
      return;
    }
    if (editIsMultiStaff && !editAllStaffSelected) {
      toast.error("Please select staff for every service.");
      return;
    }
    if (!editIsMultiStaff && !editStaffId) {
      toast.error("Please select staff.");
      return;
    }
    if (savingEdit) return;
    setSavingEdit(true);
    try {
      const payload = {
        serviceIds: editServiceIds,
        appointmentDate: editDate,
        startTime: formatTime(editStart),
        note: editNote,
      };
      if (editIsMultiStaff) {
        payload.staffAssignments = editServiceIds.map((serviceId) => ({
          serviceId,
          staffId: editServiceStaffSelections[String(serviceId)],
        }));
      } else {
        payload.staffId = editStaffId;
      }
      await axiosInstance.patch(`/appointments/${editingBookingId}/reschedule`, payload);
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
    booking?.status === "NoShow" ||
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

  const getStaffNameById = (staffRef) => {
    if (!staffRef) return "Staff";
    if (typeof staffRef === "object") {
      return staffRef.fullName || staffRef.email || "Staff";
    }
    const staff = staffs.find((item) => String(item._id) === String(staffRef));
    return staff?.fullName || staff?.email || "Staff";
  };

  const getServiceNameById = (booking, serviceId) => {
    const snapshot = Array.isArray(booking?.serviceSnapshots)
      ? booking.serviceSnapshots.find((item) => String(item?.serviceId || item?._id) === String(serviceId))
      : null;
    if (snapshot?.name) return snapshot.name;
    const service = Array.isArray(booking?.serviceIds)
      ? booking.serviceIds.find((item) => String(item?._id || item) === String(serviceId))
      : null;
    return service?.name || "Service";
  };

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
            const assignments = Array.isArray(booking?.serviceStaffAssignments)
              ? booking.serviceStaffAssignments
              : [];
            const assignmentStaffNames = Array.from(
              new Set(assignments.map((item) => getStaffNameById(item.staffId)))
            );
            const staffName =
              assignments.length > 0
                ? assignmentStaffNames.length === 1
                  ? assignmentStaffNames[0]
                  : `Multiple staff: ${assignmentStaffNames.join(", ")}`
                : booking?.staffId?.fullName || booking?.staffId?.email || "No staff info";
            const servicesName = Array.isArray(booking.serviceSnapshots) && booking.serviceSnapshots.length > 0
              ? booking.serviceSnapshots.map((service) => service?.name).filter(Boolean)
              : Array.isArray(booking.serviceIds)
                ? booking.serviceIds.map((service) => service?.name).filter(Boolean)
                : [];
              
            const totalPrice = Array.isArray(booking.serviceSnapshots) && booking.serviceSnapshots.length > 0
              ? booking.serviceSnapshots.reduce((total, service) => total + (service?.price || 0), 0)
              : Array.isArray(booking.serviceIds)
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
                  {assignments.length > 0 ? (
                    <div className="booking-schedule">
                      {assignments
                        .slice()
                        .sort((a, b) => (a.startMinute || 0) - (b.startMinute || 0))
                        .map((item, index) => (
                          
                          <div key={`${item.serviceId}-${index}`} className="booking-schedule-item">
                            <span className="booking-schedule-service">
                              {getServiceNameById(booking, item.serviceId)}
                            </span>
                            <span className="booking-schedule-staff">
                              {getStaffNameById(item.staffId)}
                            </span>
                            <span className="booking-schedule-time">
                              {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : null}
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
                      {!editIsMultiStaff ? (
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
                      ) : null}
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

                    {editIsMultiStaff ? (
                      <div className="booking-edit-assignments">
                        <div className="booking-edit-title">Assign staff for each service</div>
                        {editServiceIds.map((serviceId) => {
                          const service = services.find(
                            (item) => String(item._id) === String(serviceId)
                          );
                          const options =
                            editServiceStaffOptions.get(String(serviceId)) || [];
                          return (
                            <label key={serviceId} className="booking-edit-row">
                              <span>
                                {service?.name || "Service"}{" "}
                                {service?.duration ? `(${service.duration} min)` : ""}
                              </span>
                              <select
                                value={editServiceStaffSelections[String(serviceId)] || ""}
                                onChange={(event) =>
                                  setEditServiceStaffSelections((prev) => ({
                                    ...prev,
                                    [String(serviceId)]: event.target.value,
                                  }))
                                }
                              >
                                <option value="">Select staff</option>
                                {options.map((staff) => (
                                  <option key={staff._id} value={staff._id}>
                                    {staff?.fullName || staff?.email || "Staff"}
                                  </option>
                                ))}
                              </select>
                            </label>
                          );
                        })}
                      </div>
                    ) : null}

                    <div>
                      <div className="booking-edit-title">Time</div>
                      {loadingEditSlots ? <p className="muted">Loading slots...</p> : null}
                      {editIsMultiStaff && !editAllStaffSelected ? (
                        <p className="muted">Select staff for each service to see available times.</p>
                      ) : null}
                      {!loadingEditSlots && editSlots.length === 0 ? (
                        <p className="muted">No slots available for this selection.</p>
                      ) : null}
                      {editSlots.length > 0 ? (
                        <div className="slot-grid">
                          {editSlots.map((slot) => {
                            const isOriginalSlot =
                              editSnapshot &&
                              editSnapshot.start === slot.startMinute &&
                              (editIsMultiStaff || editSnapshot.staffId === editStaffId) &&
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
