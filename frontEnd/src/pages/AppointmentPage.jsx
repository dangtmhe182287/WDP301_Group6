import { useEffect, useMemo, useState } from 'react'
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

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
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedStart, setSelectedStart] = useState(null)
  const [message, setMessage] = useState('')
  const [customerName, setCustomerName] = useState('')

  const selectedService = useMemo(
    () => services.find((service) => String(service._id) === selectedServiceId),
    [services, selectedServiceId],
  )

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
        setMessage(error.message)
      } finally {
        setLoadingServices(false)
      }
    }

    loadServices()
  }, [])

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedStaffId || !selectedServiceId || !selectedDate) {
        setSlots([])
        return
      }

      setLoadingSlots(true)
      setSelectedStart(null)
      try {
        const params = new URLSearchParams({
          staffId: selectedStaffId,
          appointmentDate: selectedDate,
          serviceId: selectedServiceId,
        })

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
  }, [selectedDate, selectedServiceId, selectedStaffId])

  const handleBook = async () => {
    if (!selectedServiceId || !selectedStaffId || selectedStart === null) {
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
          serviceId: selectedServiceId,
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
        `Đặt lịch thành công: ${toMinuteLabel(data.startTime)} - ${toMinuteLabel(data.endTime)} (${selectedService?.duration || 0} phút).`,
      )

      const params = new URLSearchParams({
        staffId: selectedStaffId,
        appointmentDate: selectedDate,
        serviceId: selectedServiceId,
      })
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
      <section className="card" style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
        <h1>Đặt Appointment</h1>
        

        <div className="form-grid">
          <label>
            Tên khách
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          </label>

          <label>
            Ngày
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </label>

          <label>
            Dịch vụ
            <select
              value={selectedServiceId}
              onChange={(event) => setSelectedServiceId(event.target.value)}
              disabled={loadingServices}
            >
              <option value="">-- Chọn dịch vụ --</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} ({service.duration} phút)
                </option>
              ))}
            </select>
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

        <h2>Khung giờ (15 phút)</h2>
        {loadingSlots ? <p>Đang tải slot...</p> : null}
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

        <button type="button" className="book-btn" onClick={handleBook}>
          Xác nhận đặt lịch
        </button>

        {message ? <p className="message">{message}</p> : null}
      </section>
    </main>
    
    </>
    
  )
}

export default AppointmentPage