import { useEffect, useMemo, useState } from 'react'
import { useAuth } from "../context/AuthContext";

const API_BASE = 'http://localhost:3000'

const getToday = () => new Date().toISOString().split('T')[0]

const toMinuteLabel = (minute) => {
  const h = String(Math.floor(minute / 60)).padStart(2, '0')
  const m = String(minute % 60).padStart(2, '0')
  return `${h}:${m}`
}

function AppointmentPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [staffs, setStaffs] = useState([])
  const [loadingStaffs, setLoadingStaffs] = useState(true)
  const [selectedServiceIds, setSelectedServiceIds] = useState([])
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedStart, setSelectedStart] = useState(null)
  const [message, setMessage] = useState('')

  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(String(service._id))),
    [services, selectedServiceIds],
  )

  const totalDuration = useMemo(
    () => selectedServices.reduce((total, service) => total + (service.duration || 0), 0),
    [selectedServices],
  )

  const toggleService = (serviceId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true)
      try {
        const response = await fetch(`${API_BASE}/services`)
        if (!response.ok) {
          throw new Error('Không tải được danh sách dịch vụ')
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
          throw new Error('Không tải được danh sách staff')
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
          params.set('serviceId', selectedServiceIds[0])
        } else {
          params.set('serviceIds', selectedServiceIds.join(','))
        }

        const response = await fetch(`${API_BASE}/appointments/availability?${params.toString()}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || data?.message || 'Không tải được slot trống')
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
      setMessage('Vui lòng đăng nhập để đặt lịch.')
      return
    }
    if (selectedServiceIds.length === 0 || !selectedStaffId || selectedStart === null) {
      setMessage('Vui lòng chọn đủ dịch vụ, staff và giờ bắt đầu.')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/appointments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user._id || user.id,
          walkInCustomerName: user.fullName || user.email || 'Customer',
          staffId: selectedStaffId,
          serviceIds: selectedServiceIds,
          bookingChannel: 'online',
          createdByRole: 'customer',
          appointmentDate: selectedDate,
          startTime: selectedStart,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Đặt lịch thất bại')
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
        params.set('serviceId', selectedServiceIds[0])
      } else {
        params.set('serviceIds', selectedServiceIds.join(','))
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
    <>
    
    <main className="appointment-page">
      <div className="appointment-shell">
        <section className="appointment-panel">
          <div className="appointment-header">
            <h1>Đặt Appointment</h1>
            <p>Chọn dịch vụ trước, sau đó chọn staff, ngày và giờ phù hợp.</p>
            <p className={user?._id ? "muted" : "login-required"}>
              {user?._id ? `` : 'Bạn cần đăng nhập để đặt lịch.'}
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
                    className={`service-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleService(id)}
                  >
                    <div className="service-title">
                      <span>{service.name}</span>
                      <span className="service-check">{isSelected ? 'Đã chọn' : 'Chọn'}</span>
                    </div>
                    <div className="service-meta">{service.duration} phút</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="appointment-block">
            <h2>2. Thông tin đặt lịch</h2>
            <div className="form-grid">
              <label>
                Ngày
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                />
              </label>

              <label>
                Staff
                <select value={selectedStaffId} onChange={(event) => setSelectedStaffId(event.target.value)}>
                  <option value="">-- Chọn staff --</option>
                  {loadingStaffs ? <option value="">Đang tải staff...</option> : null}
                  {staffs.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.fullName || staff.email || 'Staff'}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="appointment-block">
            <h2>3. Chọn khung giờ (15 phút)</h2>
            {loadingSlots ? <p className="muted">Đang tải slot...</p> : null}
            <div className="slot-grid">
              {slots.map((slot) => (
                <button
                  key={slot.startMinute}
                  type="button"
                  disabled={!slot.available}
                  className={`slot-btn ${selectedStart === slot.startMinute ? 'selected' : ''}`}
                  onClick={() => setSelectedStart(slot.startMinute)}
                >
                  {toMinuteLabel(slot.startMinute)}
                </button>
              ))}
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
            <span>Staff</span>
            <strong>
              {selectedStaffId
                ? staffs.find((staff) => staff._id === selectedStaffId)?.fullName || selectedStaffId
                : 'Chưa chọn'}
            </strong>
          </div>
          <div className="summary-section">
            <span>Ngày</span>
            <strong>{selectedDate || 'Chưa chọn'}</strong>
          </div>
          <div className="summary-section">
            <span>Giờ bắt đầu</span>
            <strong>{selectedStart !== null ? toMinuteLabel(selectedStart) : 'Chưa chọn'}</strong>
          </div>
          <button type="button" className="primary-btn ghost" onClick={handleBook}>
            Đặt lịch ngay
          </button>
        </aside>
      </div>
    </main>
    
    </>
    
  )
}

export default AppointmentPage
