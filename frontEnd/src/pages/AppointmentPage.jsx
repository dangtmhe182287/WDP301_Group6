import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axiosInstance from "../utils/axiosInstance"
import { toast } from "sonner"

const API_BASE = "http://localhost:3000"
const MAX_SERVICE_PER_APPOINTMENT = 5
const MAX_TOTAL_DURATION = 270
const MAX_DAYS_AHEAD = 15
const DEFAULT_CLOSE_MINUTE = 19 * 60

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const toLocalDate = (value) => {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()
const getCurrentMinuteOfDay = () => {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const getWeekStart = (date) => {
  const dayIndex = (date.getDay() + 6) % 7
  return addDays(date, -dayIndex)
}

const getToday = () => formatDate(startOfDay(new Date()))

const toMinuteLabel = (minute) => {
  if (typeof minute === "string") return minute
  const h = String(Math.floor(minute / 60)).padStart(2, "0")
  const m = String(minute % 60).padStart(2, "0")
  return `${h}:${m}`
}

function AppointmentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [staffs, setStaffs] = useState([])
  const [loadingStaffs, setLoadingStaffs] = useState(true)
  const [selectedServiceIds, setSelectedServiceIds] = useState([])
  const [selectedStaffId, setSelectedStaffId] = useState("")
  const [anyStaffId, setAnyStaffId] = useState("")
  const [slotStaffMap, setSlotStaffMap] = useState({})
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedStart, setSelectedStart] = useState(null)
  const [step, setStep] = useState(1)
  const [note, setNote] = useState("")
  const [checkingLimit, setCheckingLimit] = useState(false)

  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(String(service._id))),
    [services, selectedServiceIds],
  )

  const totalDuration = useMemo(
    () => selectedServices.reduce((total, service) => total + (service.duration || 0), 0),
    [selectedServices],
  )
  const totalPrice = useMemo(
    () => selectedServices.reduce((total, service) => total + (service.price || 0), 0),
    [selectedServices],
  )

  const selectedDateObject = useMemo(() => toLocalDate(selectedDate), [selectedDate])
  const formatDateShort = (value) => {
    if (!value) return "";
    const date = toLocalDate(value);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const weekStart = useMemo(() => getWeekStart(selectedDateObject), [selectedDateObject])
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  )
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(selectedDateObject),
    [selectedDateObject],
  )
  const todayDate = useMemo(() => startOfDay(new Date()), [])
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const minLeadStart = useMemo(() => {
    if (!selectedDateObject) return null
    if (!isSameDay(selectedDateObject, new Date())) return null
    return getCurrentMinuteOfDay() + 60
  }, [selectedDateObject])

  const selectedStaffName = useMemo(() => {
    if (!selectedStaffId) return "Not selected"
    if (selectedStaffId === "ANY") {
      if (anyStaffId) {
        return (
          staffs.find((staff) => staff._id === anyStaffId)?.fullName ||
          "Any staff"
        )
      }
      return "Any staff"
    }
    return staffs.find((staff) => staff._id === selectedStaffId)?.fullName || selectedStaffId
  }, [selectedStaffId, anyStaffId, staffs])

  const getStaffInfo = (staff) => staff?.staff || staff || {}

  const getStaffDisplay = (staff) => staff?.fullName || staff?.email || "Staff"

  const getStaffSpeciality = (staffInfo) => {
    if (Array.isArray(staffInfo?.speciality) && staffInfo.speciality.length) {
      return staffInfo.speciality.join(", ")
    }
    return staffInfo?.staffSpecialty || staffInfo?.speciality || ""
  }
  const getStaffAvatar = (staff, staffInfo) =>
    staffInfo?.avatar || staff?.avatar || staff?.image || ""

  const toggleService = (serviceId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : prev.length >= MAX_SERVICE_PER_APPOINTMENT
          ? (toast.error(`Maximum ${MAX_SERVICE_PER_APPOINTMENT} services per booking.`), prev)
          : [...prev, serviceId],
    )
  }

  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true)
      try {
        const response = await fetch(`${API_BASE}/services`)
        if (!response.ok) {
          throw new Error("Unable to load services")
        }
        const data = await response.json()
        const list = Array.isArray(data) ? data : []
        setServices(list)
      } catch (error) {
        toast.error(`Unable to load services: ${error.message}`)
      } finally {
        setLoadingServices(false)
      }
    }

    loadServices()
  }, [])

  useEffect(() => {
    const loadStaffs = async () => {
      setLoadingStaffs(true)
      try {
        const response = await fetch(`${API_BASE}/staffs`)
        if (!response.ok) {
          throw new Error("Unable to load staff list")
        }
        const data = await response.json()
        setStaffs(Array.isArray(data) ? data : [])
      } catch (error) {
        toast.error(`Unable to load staff: ${error.message}`)
      } finally {
        setLoadingStaffs(false)
      }
    }

    loadStaffs()
  }, [])

  useEffect(() => {
    const loadAvailability = async () => {
      if (step !== 2 || !selectedStaffId || selectedServiceIds.length === 0 || !selectedDate) {
        setSlots([])
        return
      }

      setLoadingSlots(true)
      setSelectedStart(null)
      setAnyStaffId("")
      try {
        if (selectedStaffId === "ANY") {
          const staffIds = staffs.map((s) => s._id).filter(Boolean)
          if (staffIds.length === 0) {
            setSlots([])
            setSlotStaffMap({})
            return
          }

          const responses = await Promise.all(
            staffIds.map(async (staffId) => {
              const params = new URLSearchParams({
                staffId,
                appointmentDate: selectedDate,
              })
              if (selectedServiceIds.length === 1) {
                params.set("serviceId", selectedServiceIds[0])
              } else {
                params.set("serviceIds", selectedServiceIds.join(","))
              }
              const res = await fetch(`${API_BASE}/appointments/availability?${params.toString()}`)
              const data = await res.json()
              if (!res.ok) {
                throw new Error(data?.error || data?.message || "Unable to load available slots")
              }
              return { staffId, slots: data.slots || [] }
            }),
          )

          const baseSlots = responses[0]?.slots || []
          const combined = baseSlots.map((slot) => {
            let available = false
            let staffId = null
            for (const entry of responses) {
              const match = entry.slots.find((s) => s.startMinute === slot.startMinute)
              if (match?.available) {
                available = true
                staffId = entry.staffId
                break
              }
            }
            return { ...slot, available, staffId }
          })

          setSlots(combined)
          setSlotStaffMap(
            Object.fromEntries(combined.map((s) => [s.startMinute, s.staffId])),
          )
        } else {
          const params = new URLSearchParams({
            staffId: selectedStaffId,
            appointmentDate: selectedDate,
          })
          if (selectedServiceIds.length === 1) {
            params.set("serviceId", selectedServiceIds[0])
          } else {
            params.set("serviceIds", selectedServiceIds.join(","))
          }

          const response = await fetch(`${API_BASE}/appointments/availability?${params.toString()}`)
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data?.error || data?.message || "Unable to load available slots")
          }

          setSlots(data.slots || [])
          setSlotStaffMap({})
        }
      } catch (error) {
        toast.error(error.message)
        setSlots([])
        setSlotStaffMap({})
      } finally {
        setLoadingSlots(false)
      }
    }

    loadAvailability()
  }, [selectedDate, selectedServiceIds, selectedStaffId, step, staffs])

  const handleBook = async () => {
    if (!user) {
      toast.error("Please log in to book an appointment.")
      return
    }
    if (selectedServiceIds.length === 0 || !selectedStaffId || selectedStart === null) {
      toast.error("Please select services, staff, and a start time.")
      return
    }
    if (selectedStaffId === "ANY" && !anyStaffId) {
      toast.error("Please pick a time slot to assign a staff member.")
      return
    }
    if (selectedServiceIds.length > MAX_SERVICE_PER_APPOINTMENT) {
      toast.error(`Maximum ${MAX_SERVICE_PER_APPOINTMENT} services per booking.`)
      return
    }
    if (totalDuration > MAX_TOTAL_DURATION) {
      toast.error(`Total duration must be <= ${MAX_TOTAL_DURATION} minutes.`)
      return
    }
    if (checkingLimit) return
    const limitOk = await checkBookingLimit()
    if (!limitOk) return
    const latestAllowed = addDays(startOfDay(new Date()), MAX_DAYS_AHEAD)
    if (toLocalDate(selectedDate) > latestAllowed) {
      toast.error(`You can only book within ${MAX_DAYS_AHEAD} days from today.`)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/appointments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user._id || user.id,
          name: user.fullName || user.email || "Customer",
          staffId: selectedStaffId === "ANY" ? anyStaffId : selectedStaffId,
          serviceIds: selectedServiceIds,
          note,
          bookingChannel: "online",
          createdByRole: "customer",
          appointmentDate: selectedDate,
          startTime: toMinuteLabel(selectedStart),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Booking failed")
      }

      toast.success(
        `Booked: ${toMinuteLabel(data.startTime)} - ${toMinuteLabel(
          data.endTime,
        )} (${totalDuration} minutes).`,
      )

      const params = new URLSearchParams({
        staffId: selectedStaffId,
        appointmentDate: selectedDate,
      })
      if (selectedServiceIds.length === 1) {
        params.set("serviceId", selectedServiceIds[0])
      } else {
        params.set("serviceIds", selectedServiceIds.join(","))
      }
      const refresh = await fetch(`${API_BASE}/appointments/availability?${params.toString()}`)
      const refreshedData = await refresh.json()
      setSlots(refreshedData.slots || [])
      setSelectedStart(null)
      navigate("/my-bookings")
    } catch (error) {
      toast.error(error.message)
    }
  }

  const checkBookingLimit = async () => {
    if (!user) {
      toast.error("Please log in to book an appointment.")
      return false
    }
    setCheckingLimit(true)
    try {
      const response = await axiosInstance.get("/appointments/my")
      if (response.status === 204) return true
      const list = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.appointments)
          ? response.data.appointments
          : []
      const blockedCount = list.filter((booking) => {
        if (booking?.status === "Cancelled") return false
        return booking?.paymentStatus === "Unpaid" || booking?.status === "Scheduled"
      }).length
      if (blockedCount >= 2) {
        toast.error("You already have 2 unpaid or scheduled appointments. You cannot book more.")
        return false
      }
      return true
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 204) {
        return true
      }
      toast.error("Unable to check your current booking. Please try again.")
      return false
    } finally {
      setCheckingLimit(false)
    }
  }

  const handleGoStep2 = async () => {
    if (totalDuration > MAX_TOTAL_DURATION) {
      toast.error(`Total duration must be <= ${MAX_TOTAL_DURATION} minutes.`)
      return
    }
    const limitOk = await checkBookingLimit()
    if (!limitOk) return
    setStep(2)
  }

  return (
    <main className="appointment-page">
      <div className="appointment-shell">
        <section className="appointment-panel">
          <div className="appointment-header">
            <h1>Book an Appointment</h1>
            <p>Select services first, then choose a barber, date, and time.</p>
            <p className={user?._id ? "muted" : "login-required"}>
              {user?._id ? "" : "You need to log in to book an appointment."}
            </p>
          </div>
          <div className="appointment-steps" aria-label="Booking steps">
            <span className={`step-item ${step === 1 ? "active" : ""}`}>Services</span>
            <span className="step-sep"></span>
            <span className={`step-item ${step === 2 ? "active" : ""}`}>Barber & time</span>
            <span className="step-sep"></span>
            <span className={`step-item ${step === 3 ? "active" : ""}`}>Confirm</span>
          </div>

          {step === 1 ? (
            <div className="appointment-block">
              <h2>1. Select services</h2>
              {loadingServices ? <p className="muted">Loading services...</p> : null}
              <div className="service-grid">
                {services.map((service) => {
                  const id = String(service._id)
                  const isSelected = selectedServiceIds.includes(id)
                  return (
                    <button
                      key={service._id}
                      type="button"
                      className={`service-card ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleService(id)}
                    >
                      <div className="service-title">
                        <span>{service.name}</span>
                        <span className="service-check">{isSelected ? "Selected" : "Select"}</span>
                      </div>
                      <div className="service-meta">{service.duration} min</div>
                      {service.description ? (
                        <div className="service-description line-clamp-2">
                          {service.description}
                        </div>
                      ) : null}
                      <div className="service-price">
                        {(service.price || 0).toLocaleString("en-US")} VND
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="appointment-block">
              <div className="schedule-header">
                <h2>2. Select barber & time</h2>



                <button type="button" className="ghost-btn back-btn" onClick={() => setStep(1)}>
                  Back
                </button>
              </div>
              <div className="staff-column">
                <div className="staff-section horizontal">
                  {loadingStaffs ? <p className="muted">Loading barbers...</p> : null}
                  {!loadingStaffs && staffs.length === 0 ? (
                    <p className="muted">No matching barbers yet.</p>
                  ) : null}

                <div className="staff-grid horizontal" role="list">
                  <button
                    type="button"
                    className={`staff-card ${selectedStaffId === "ANY" ? "selected" : ""}`}
                    onClick={() => setSelectedStaffId("ANY")}
                    role="listitem"
                  >
                    <div className="staff-avatar">
                      <span className="staff-initials">⭐</span>
                    </div>
                    <div className="staff-info">
                      <div className="staff-name">Any staff</div>
                      <div className="staff-speciality muted">We will assign the first available</div>
                      <div className="staff-meta">
                        <span>Auto selection</span>
                      </div>
                    </div>
                    <div className="staff-action">
                      <span className="staff-select">
                        {selectedStaffId === "ANY" ? "Selected" : "Select"}
                      </span>
                    </div>
                  </button>
                    {staffs.map((staff) => {
                      const staffInfo = getStaffInfo(staff)
                      const staffName = getStaffDisplay(staff)
                      const staffSpeciality = getStaffSpeciality(staffInfo)
                      const staffExperience =
                        staffInfo?.experienceYears ?? staffInfo?.staffExperienceYears ?? null
                      const staffRating = staffInfo?.rating ?? staff?.rating ?? null
                      const isSelected = selectedStaffId === staff._id
                      const avatarUrl = getStaffAvatar(staff, staffInfo)
                      const initials = staffName
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((word) => word[0]?.toUpperCase())
                        .join("")

                      return (
                        <button
                          key={staff._id}
                          type="button"
                          className={`staff-card ${isSelected ? "selected" : ""}`}
                          onClick={() => setSelectedStaffId(staff._id)}
                          role="listitem"
                        >
                          <div className="staff-avatar">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={staffName} />
                            ) : (
                              <span className="staff-initials">{initials || "S"}</span>
                            )}
                          </div>

                          <div className="staff-info">
                            <div className="staff-name">{staffName}</div>
                            {staffSpeciality ? (
                              <div className="staff-speciality">{staffSpeciality}</div>
                            ) : (
                              <div className="staff-speciality muted">
                                Specialty not updated
                              </div>
                            )}
                            <div className="staff-meta">

                              <span>
                                {staffRating !== null
                                  ? `Rating ${staffRating}⭐`
                                  : "No ratings yet"}
                              </span>
                            </div>
                          </div>

                          <div className="staff-action">
                            <span className="staff-select">
                              {isSelected ? "Selected" : "Select"}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="appointment-date-picker">
                <div className="date-picker-header">
                  <div className="date-picker-label">{monthLabel}</div>
                  <div className="date-picker-actions">
                    <button
                      type="button"
                      className="date-nav"
                      aria-label="Previous week"
                      onClick={() => setSelectedDate(formatDate(addDays(selectedDateObject, -7)))}
                    >
                      &#8249;
                    </button>
                    <button
                      type="button"
                      className="date-nav"
                      aria-label="Next week"
                      onClick={() => setSelectedDate(formatDate(addDays(selectedDateObject, 7)))}
                    >
                      &#8250;
                    </button>
                  </div>
                </div>

                <div className="date-strip">
                  {weekDates.map((date) => {
                    const value = formatDate(date)
                    const isSelected = value === selectedDate
                    const isPast = date < todayDate
                    const isToday = isSameDay(date, new Date())
                    const isOutOfHours =
                      isToday && getCurrentMinuteOfDay() + 60 >= DEFAULT_CLOSE_MINUTE
                    return (
                      <button
                        key={value}
                        type="button"
                        className={`date-chip ${isSelected ? "selected" : ""}`}
                        disabled={isPast || isOutOfHours}
                        onClick={() => setSelectedDate(value)}
                      >
                        <span className="date-number">{date.getDate()}</span>
                        <span className="date-weekday">{weekdayLabels[date.getDay()]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="time-staff-grid">
                <div className="time-column">
                  {loadingSlots ? <p className="muted">Loading slots...</p> : null}
                  {!selectedStaffId ? (
                    <p className="muted">Select a barber to see available times.</p>
                  ) : null}
                  {slots.length === 0 ? null : (
                    (() => {
                      const slotStates = slots.map((slot) => {
                        const isBeforeLead =
                          minLeadStart !== null && slot.startMinute < minLeadStart
                        const isDisabled = !slot.available || isBeforeLead
                        return { slot, isDisabled }
                      })
                      const hasAvailable = slotStates.some((item) => !item.isDisabled)
                      if (!hasAvailable) {
                        return (
                          <p className="muted">
                            This barber has no available slots for this day. Please choose another date.
                          </p>
                        )
                      }
                      return (
                        <div className="slot-grid">
                          {slotStates.map(({ slot, isDisabled }) => (
                            <button
                              key={slot.startMinute}
                              type="button"
                              disabled={isDisabled}
                              className={`slot-btn ${selectedStart === slot.startMinute ? "selected" : ""}`}
                              onClick={() => {
                                setSelectedStart(slot.startMinute)
                                if (selectedStaffId === "ANY") {
                                  setAnyStaffId(slot.staffId || "")
                                }
                              }}
                            >
                              {toMinuteLabel(slot.startMinute)}
                            </button>
                          ))}
                        </div>
                      )
                    })()
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="appointment-block">
              <div className="review-header">
                <h2>3. Review & confirm</h2>
                <button type="button" className="ghost-btn back-btn" onClick={() => setStep(2)}>
                  Back
                </button>
              </div>

              <div className="review-card">
                <h3>Cancellation policy</h3>
                <p>
                  Please cancel at least <strong>6 hours</strong> before your appointment.
                </p>
              </div>
              <div className="review-note">
                <h3>Notes or requests</h3>
                <div className="note-input">
                  <input
                    type="text"
                    placeholder="Anything you'd like us to know?"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                  <button type="button" className="ghost-btn add-note">
                    Add
                  </button>
                </div>
              </div>
              <div className="review-actions">

                
              </div>
            </div>
          ) : null}

        </section>

        <aside className="appointment-summary">
          <h3>Appointment Summary</h3>
          <div className="summary-section">
            <span>Selected services</span>
            {selectedServices.length === 0 ? (
              <p className="muted">No services selected</p>
            ) : (
              <ul>
                {selectedServices.map((service) => (
                  <li key={service._id} className="summary-service">
                    <span>
                      {service.name} ({service.duration} min)
                    </span>
                    <strong>{(service.price || 0).toLocaleString("en-US")} VND</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="summary-section">
            <span>Total duration</span>
            <strong>{totalDuration} min</strong>
          </div>
          <div className="summary-section">
            <span>Barber</span>
            <strong>{selectedStaffName}</strong>
          </div>
          <div className="summary-section">
            <span>Date</span>
            <strong>{selectedDate ? formatDateShort(selectedDate) : "Not selected"}</strong>
          </div>
          <div className="summary-section">
            <span>Start time</span>
            <strong>{selectedStart !== null ? toMinuteLabel(selectedStart) : "Not selected"}</strong>
          </div>
          <div className="summary-section total">
            <span>Total price</span>
            <strong>{totalPrice.toLocaleString("en-US")} VND</strong>
          </div>
          {step === 3 ? (
            <button
              type="button"
              className="primary-btn ghost"
              onClick={handleBook}
              disabled={selectedServiceIds.length === 0 || !selectedStaffId || selectedStart === null}
            >
              Confirm booking
            </button>
          ) : step === 2 ? (
            <button
              type="button"
              className="primary-btn ghost"
              onClick={() => setStep(3)}
              disabled={selectedServiceIds.length === 0 || !selectedStaffId || selectedStart === null}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="primary-btn ghost"
              onClick={handleGoStep2}
              disabled={selectedServiceIds.length === 0 || checkingLimit}
            >
              Continue
            </button>
          )}
        </aside>
      </div>
    </main>
  )
}

export default AppointmentPage
