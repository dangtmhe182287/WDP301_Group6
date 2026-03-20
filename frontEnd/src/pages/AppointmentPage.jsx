import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../context/AuthContext"

const API_BASE = "http://localhost:3000"
const MAX_SERVICE_PER_APPOINTMENT = 5
const MAX_TOTAL_DURATION = 150
const MAX_DAYS_AHEAD = 15

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
  const h = String(Math.floor(minute / 60)).padStart(2, "0")
  const m = String(minute % 60).padStart(2, "0")
  return `${h}:${m}`
}

function AppointmentPage() {
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [staffs, setStaffs] = useState([])
  const [loadingStaffs, setLoadingStaffs] = useState(true)
  const [selectedServiceIds, setSelectedServiceIds] = useState([])
  const [selectedStaffId, setSelectedStaffId] = useState("")
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedStart, setSelectedStart] = useState(null)
  const [message, setMessage] = useState("")

  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(String(service._id))),
    [services, selectedServiceIds],
  )

  const totalDuration = useMemo(
    () => selectedServices.reduce((total, service) => total + (service.duration || 0), 0),
    [selectedServices],
  )

  const selectedDateObject = useMemo(() => toLocalDate(selectedDate), [selectedDate])
  const weekStart = useMemo(() => getWeekStart(selectedDateObject), [selectedDateObject])
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  )
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(selectedDateObject),
    [selectedDateObject],
  )
  const todayDate = useMemo(() => startOfDay(new Date()), [])
  const weekdayLabels = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"]

  const getStaffInfo = (staff) => staff?.staff || staff || {}

  const getStaffDisplay = (staff) => staff?.fullName || staff?.email || "Staff"

  const getStaffSpeciality = (staffInfo) => {
    if (Array.isArray(staffInfo?.speciality) && staffInfo.speciality.length) {
      return staffInfo.speciality.join(", ")
    }
    return staffInfo?.staffSpecialty || staffInfo?.speciality || ""
  }
  useEffect(() => {
  if (message) {
    const timer = setTimeout(() => {
      setMessage(null);
    }, 2000); // 2 giây

    return () => clearTimeout(timer);
  }
}, [message]);

  const getStaffAvatar = (staff, staffInfo) =>
    staffInfo?.avatar || staff?.avatar || staff?.image || ""

  const toggleService = (serviceId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : prev.length >= MAX_SERVICE_PER_APPOINTMENT
          ? (setMessage(`Tối đa ${MAX_SERVICE_PER_APPOINTMENT} dịch vụ mỗi lần đặt.`), prev)
          : [...prev, serviceId],
    )
  }

  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true)
      try {
        const response = await fetch(`${API_BASE}/services`)
        if (!response.ok) {
          throw new Error("Không tải được danh sách dịch vụ")
        }
        const data = await response.json()
        setServices(Array.isArray(data) ? data : [])
      } catch (error) {
        setMessage(`Không tải được dịch vụ: ${error.message}`)
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
          throw new Error("Không tải được danh sách staff")
        }
        const data = await response.json()
        setStaffs(Array.isArray(data) ? data : [])
      } catch (error) {
        setMessage(`Không tải được staff: ${error.message}`)
      } finally {
        setLoadingStaffs(false)
      }
    }

    loadStaffs()
  }, [])

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedStaffId || selectedServiceIds.length === 0 || !selectedDate) {
        setSlots([])
        return
      }

      setLoadingSlots(true)
      setSelectedStart(null)
      try {
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
          throw new Error(data?.error || data?.message || "Không tải được slot trống")
        }

        setSlots(data.slots || [])
      } catch (error) {
        setMessage(error.message)
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    loadAvailability()
  }, [selectedDate, selectedServiceIds, selectedStaffId])

  const handleBook = async () => {
    if (!user) {
      setMessage("Vui lòng đăng nhập để đặt lịch.")
      return
    }
    if (selectedServiceIds.length === 0 || !selectedStaffId || selectedStart === null) {
      setMessage("Vui lòng chọn đủ dịch vụ, staff và giờ bắt đầu.")
      return
    }
    if (selectedServiceIds.length > MAX_SERVICE_PER_APPOINTMENT) {
      setMessage(`Tối đa ${MAX_SERVICE_PER_APPOINTMENT} dịch vụ mỗi lần đặt.`)
      return
    }
    if (totalDuration > MAX_TOTAL_DURATION) {
      setMessage(`Tổng thời lượng phải <= ${MAX_TOTAL_DURATION} phút.`)
      return
    }
    const latestAllowed = addDays(startOfDay(new Date()), MAX_DAYS_AHEAD)
    if (toLocalDate(selectedDate) > latestAllowed) {
      setMessage(`Không được đặt quá ${MAX_DAYS_AHEAD} ngày từ hôm nay.`)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/appointments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user._id || user.id,
          walkInCustomerName: user.fullName || user.email || "Customer",
          staffId: selectedStaffId,
          serviceIds: selectedServiceIds,
          bookingChannel: "online",
          createdByRole: "customer",
          appointmentDate: selectedDate,
          startTime: selectedStart,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Đặt lịch thất bại")
      }

      setMessage(
        `Đặt lịch thành công: ${toMinuteLabel(data.startTime)} - ${toMinuteLabel(
          data.endTime,
        )} (${totalDuration} phút).`,
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
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <main className="appointment-page">
      <div className="appointment-shell">
        <section className="appointment-panel">
          <div className="appointment-header">
            <h1>Đặt Appointment</h1>
            <p>Chọn dịch vụ trước, sau đó chọn barber, ngày và giờ phù hợp.</p>
            <p className={user?._id ? "muted" : "login-required"}>
              {user?._id ? "" : "Bạn cần đăng nhập để đặt lịch."}
            </p>
          </div>

          <div className="appointment-block">
            <h2>1. Chọn dịch vụ</h2>
            {loadingServices ? <p className="muted">Đang tải dịch vụ...</p> : null}
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
                      <span className="service-check">{isSelected ? "Đã chọn" : "Chọn"}</span>
                    </div>
                    <div className="service-meta">{service.duration} phút</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="appointment-block">
            <h2>2. Chọn ngày & giờ</h2>
            <div className="appointment-date-picker">
              <div className="date-picker-header">
                <div className="date-picker-label">{monthLabel}</div>
                <div className="date-picker-actions">
                  <button
                    type="button"
                    className="date-nav"
                    aria-label="Tuần trước"
                    onClick={() => setSelectedDate(formatDate(addDays(selectedDateObject, -7)))}
                  >
                    &#8249;
                  </button>
                  <button
                    type="button"
                    className="date-nav"
                    aria-label="Tuần sau"
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
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`date-chip ${isSelected ? "selected" : ""}`}
                      disabled={isPast}
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
                {loadingSlots ? <p className="muted">Đang tải slot...</p> : null}
                {!selectedStaffId ? (
                  <p className="muted">Chọn barber trước để hiển thị giờ.</p>
                ) : null}
                <div className="slot-grid">
                  {slots.map((slot) => (
                    <button
                      key={slot.startMinute}
                      type="button"
                      disabled={!slot.available}
                      className={`slot-btn ${selectedStart === slot.startMinute ? "selected" : ""}`}
                      onClick={() => setSelectedStart(slot.startMinute)}
                    >
                      {toMinuteLabel(slot.startMinute)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="staff-column">
                <div className="staff-section vertical">
                  

                  {loadingStaffs ? <p className="muted">Đang tải barber...</p> : null}
                  {!loadingStaffs && staffs.length === 0 ? (
                    <p className="muted">Chưa có barber phù hợp.</p>
                  ) : null}

                  <div className="staff-grid vertical" role="list">
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
                                Chưa cập nhật chuyên môn
                              </div>
                            )}
                            <div className="staff-meta">
                              <span>
                                {staffExperience !== null
                                  ? `${staffExperience} năm kinh nghiệm`
                                  : "Kinh nghiệm đang cập nhật"}
                              </span>
                              <span>
                                {staffRating !== null
                                  ? `Đánh giá ${staffRating}`
                                  : "Chưa có đánh giá"}
                              </span>
                            </div>
                          </div>

                          <div className="staff-action">
                            <span className="staff-select">
                              {isSelected ? "Đã chọn" : "Chọn"}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button type="button" className="primary-btn" onClick={handleBook}>
            Xác nhận đặt lịch
          </button>

          {message ? <p className="message">{message}</p> : null}
        </section>

        <aside className="appointment-summary">
          <h3>Appointment Summary</h3>
          <div className="summary-section">
            <span>Dịch vụ đã chọn</span>
            {selectedServices.length === 0 ? (
              <p className="muted">Chưa chọn dịch vụ</p>
            ) : (
              <ul>
                {selectedServices.map((service) => (
                  <li key={service._id}>
                    {service.name} ({service.duration} phút)
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="summary-section">
            <span>Tổng thời lượng</span>
            <strong>{totalDuration} phút</strong>
          </div>
          <div className="summary-section">
            <span>Baber</span>
            <strong>
              {selectedStaffId
                ? staffs.find((staff) => staff._id === selectedStaffId)?.fullName || selectedStaffId
                : "Chưa chọn"}
            </strong>
          </div>
          <div className="summary-section">
            <span>Ngày</span>
            <strong>{selectedDate || "Chưa chọn"}</strong>
          </div>
          <div className="summary-section">
            <span>Giờ bắt đầu</span>
            <strong>{selectedStart !== null ? toMinuteLabel(selectedStart) : "Chưa chọn"}</strong>
          </div>
          <button type="button" className="primary-btn ghost" onClick={handleBook}>
            Đặt lịch ngay
          </button>
        </aside>
      </div>
    </main>
  )
}

export default AppointmentPage
