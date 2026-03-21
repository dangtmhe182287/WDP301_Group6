import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../context/AuthContext"

const API_BASE = "http://localhost:3000"
const MAX_SERVICE_PER_APPOINTMENT = 5
const MAX_TOTAL_DURATION = 200
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
  const [step, setStep] = useState(1)
  const [note, setNote] = useState("")

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
        const list = Array.isArray(data) ? data : []
        setServices(list)
        if (list.length > 0 && selectedServiceIds.length === 0) {
          setSelectedServiceIds([String(list[0]._id)])
        }
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
      if (step !== 2 || !selectedStaffId || selectedServiceIds.length === 0 || !selectedDate) {
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
  }, [selectedDate, selectedServiceIds, selectedStaffId, step])

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
          note,
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
            <h1>Đặt Lịch hẹn</h1>
            <p>Chọn dịch vụ trước, sau đó chọn barber, ngày và giờ phù hợp.</p>
            <p className={user?._id ? "muted" : "login-required"}>
              {user?._id ? "" : "Bạn cần đăng nhập để đặt lịch."}
            </p>
          </div>
          <div className="appointment-steps" aria-label="Các bước đặt lịch">
            <span className={`step-item ${step === 1 ? "active" : ""}`}>Dịch vụ</span>
            <span className="step-sep">›</span>
            <span className={`step-item ${step === 2 ? "active" : ""}`}>Barber & thời gian</span>
            <span className="step-sep">›</span>
            <span className={`step-item ${step === 3 ? "active" : ""}`}>Xác nhận</span>
          </div>

          {step === 1 ? (
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
                      {service.description ? (
                        <div className="service-description line-clamp-2">
                          {service.description}
                        </div>
                      ) : null}
                      <div className="service-price">
                        {(service.price || 0).toLocaleString("vi-VN")} VND
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
                <h2>2. Chọn barber & thời gian</h2>


                
                <button type="button" className="ghost-btn back-btn" onClick={() => setStep(1)}>
                  Quay lại dịch vụ
                </button>
              </div>
              <div className="staff-column">
                <div className="staff-section horizontal">
                  {loadingStaffs ? <p className="muted">Đang tải barber...</p> : null}
                  {!loadingStaffs && staffs.length === 0 ? (
                    <p className="muted">Chưa có barber phù hợp.</p>
                  ) : null}

                  <div className="staff-grid horizontal" role="list">
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
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="appointment-block">
              <h2>3. Xem lại và xác nhận</h2>
              <div className="review-card">
                <h3>Chính sách hủy</h3>
                <p>
                  Vui lòng hủy ít nhất <strong>6 giờ</strong> trước cuộc hẹn.
                </p>
              </div>
              <div className="review-note">
                <h3>Nhận xét hoặc yêu cầu</h3>
                <div className="note-input">
                  <input
                    type="text"
                    placeholder="Bạn có điều gì muốn chúng tôi biết không?"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                  <button type="button" className="ghost-btn add-note">
                    Thêm
                  </button>
                </div>
              </div>
              <div className="review-actions">
                <button type="button" className="ghost-btn back-btn" onClick={() => setStep(2)}>
                  Quay lại
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleBook}
                  disabled={
                    selectedServiceIds.length === 0 || !selectedStaffId || selectedStart === null
                  }
                >
                  Xác nhận đặt lịch
                </button>
              </div>
            </div>
          ) : null}

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
                  <li key={service._id} className="summary-service">
                    <span>
                      {service.name} ({service.duration} phút)
                    </span>
                    <strong>{(service.price || 0).toLocaleString("vi-VN")} VND</strong>
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
            <strong>{selectedDate ? formatDateShort(selectedDate) : "Chưa chọn"}</strong>
          </div>
          <div className="summary-section">
            <span>Giờ bắt đầu</span>
            <strong>{selectedStart !== null ? toMinuteLabel(selectedStart) : "Chưa chọn"}</strong>
          </div>
          <div className="summary-section total">
            <span>Tổng tiền</span>
            <strong>{totalPrice.toLocaleString("vi-VN")} VND</strong>
          </div>
          {step === 3 ? (
            <button
              type="button"
              className="primary-btn ghost"
              onClick={handleBook}
              disabled={selectedServiceIds.length === 0 || !selectedStaffId || selectedStart === null}
            >
              Xác nhận đặt lịch
            </button>
          ) : step === 2 ? (
            <button
              type="button"
              className="primary-btn ghost"
              onClick={() => setStep(3)}
              disabled={selectedServiceIds.length === 0 || !selectedStaffId || selectedStart === null}
            >
              Tiếp tục
            </button>
          ) : (
            <button
              type="button"
              className="primary-btn ghost"
              onClick={() => setStep(2)}
              disabled={selectedServiceIds.length === 0}
            >
              Tiếp tục
            </button>
          )}
        </aside>
      </div>
    </main>
  )
}

export default AppointmentPage
