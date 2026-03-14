import { useEffect, useMemo, useState } from 'react'
const API_BASE = 'http://localhost:3000'

const DEFAULT_STAFFS = [
  { id: 'staff-1', name: 'Staff 1' },
  { id: 'staff-2', name: 'Staff 2' },
  { id: 'staff-3', name: 'Staff 3' },
]

const getToday = () => new Date().toISOString().split('T')[0]

const toMinuteLabel = (minute) => {
  const h = String(Math.floor(minute / 60)).padStart(2, '0')
  const m = String(minute % 60).padStart(2, '0')
  return `${h}:${m}`
}

function AppointmentPage() {
  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [selectedServiceIds, setSelectedServiceIds] = useState([])
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedStart, setSelectedStart] = useState(null)
  const [message, setMessage] = useState('')
  const [customerName, setCustomerName] = useState('')

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
        console.log('Fetch services response:', response);
        if (!response.ok) {
          throw new Error('Không tải được danh sách dịch vụ')
        }
        const data = await response.json()
        setServices(Array.isArray(data) ? data : [])
      } catch (error) {
        setMessage(`Can't load services: ${error.message}`);
      } finally {
        setLoadingServices(false)
      }
    }

    loadServices()
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
    if (selectedServiceIds.length === 0 || !selectedStaffId || selectedStart === null) {
      setMessage('Vui lòng chọn đủ dịch vụ, staff và giờ bắt đầu.')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/appointments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walkInCustomerName: customerName || 'Walk-in Customer',
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
                Tên khách
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Nhập tên khách"
                />
              </label>

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
                  {DEFAULT_STAFFS.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
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
                ? DEFAULT_STAFFS.find((staff) => staff.id === selectedStaffId)?.name || selectedStaffId
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
