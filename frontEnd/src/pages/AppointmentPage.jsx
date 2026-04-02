import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axiosInstance from "../utils/axiosInstance"
import { toast } from "sonner"

const API_BASE = "http://localhost:3000"
const MAX_SERVICE_PER_APPOINTMENT = 5
const MAX_TOTAL_DURATION = 270
const DEFAULT_MAX_DAYS_AHEAD = 15
const DEFAULT_CLOSE_MINUTE = 19 * 60
const DEFAULT_MIN_LEAD_MINUTES = 60
const DEFAULT_MAX_UNPAID_APPOINTMENTS = 2

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

const parseTimeToMinutes = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    if (/^\d+$/.test(value)) return Number(value)
    const match = value.match(/^(\d{1,2}):(\d{2})$/)
    if (match) {
      const hours = Number(match[1])
      const minutes = Number(match[2])
      return hours * 60 + minutes
    }
  }
  return 0
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
  const [serviceStaffSelections, setServiceStaffSelections] = useState({})
  const [slotStaffMap, setSlotStaffMap] = useState({})
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedStart, setSelectedStart] = useState(null)
  const [step, setStep] = useState(1)
  const [note, setNote] = useState("")
  const [checkingLimit, setCheckingLimit] = useState(false)
  const [maxDaysAhead, setMaxDaysAhead] = useState(DEFAULT_MAX_DAYS_AHEAD)
  const [minLeadMinutes, setMinLeadMinutes] = useState(DEFAULT_MIN_LEAD_MINUTES)
  const [maxUnpaidAppointments, setMaxUnpaidAppointments] = useState(DEFAULT_MAX_UNPAID_APPOINTMENTS)
  const [closeMinute, setCloseMinute] = useState(DEFAULT_CLOSE_MINUTE)
  const [myAppointments, setMyAppointments] = useState([])
  const [slotOrderMap, setSlotOrderMap] = useState({})
  const [selectedServiceOrder, setSelectedServiceOrder] = useState([])

  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(String(service._id))),
    [services, selectedServiceIds],
  )
  const displayServiceOrder = useMemo(
    () => (selectedServiceOrder.length > 0 ? selectedServiceOrder : selectedServiceIds),
    [selectedServiceOrder, selectedServiceIds],
  )
  const orderedSelectedServices = useMemo(
    () =>
      displayServiceOrder
        .map((id) => services.find((service) => String(service._id) === String(id)))
        .filter(Boolean),
    [services, displayServiceOrder],
  )

  const getServiceCategoryName = (service) =>
    service?.categoryId?.name || service?.category?.name || service?.category || "Other"

  const featuredServices = useMemo(
    () => services.filter((service) => service?.isFeatured),
    [services],
  )

  const servicesByCategory = useMemo(() => {
    const map = new Map()
    services.forEach((service) => {
      const categoryName = getServiceCategoryName(service)
      if (!map.has(categoryName)) {
        map.set(categoryName, [])
      }
      map.get(categoryName).push(service)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [services])

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
    return getCurrentMinuteOfDay() + minLeadMinutes
  }, [selectedDateObject, minLeadMinutes])

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

  const getStaffServiceIds = (staff) => {
    const staffInfo = staff?.staff || staff || {}
    return Array.isArray(staffInfo.serviceIds)
      ? staffInfo.serviceIds.map((svc) => String(svc?._id || svc)).filter(Boolean)
      : []
  }

  const eligibleStaffs = useMemo(() => {
    if (selectedServiceIds.length === 0) return staffs
    return staffs.filter((staff) => {
      const staffServiceIds = getStaffServiceIds(staff)
      return selectedServiceIds.every((id) => staffServiceIds.includes(String(id)))
    })
  }, [staffs, selectedServiceIds])

  const serviceStaffOptions = useMemo(() => {
    const map = new Map()
    if (selectedServiceIds.length === 0) return map
    selectedServiceIds.forEach((serviceId) => {
      const options = staffs.filter((staff) =>
        getStaffServiceIds(staff).includes(String(serviceId))
      )
      map.set(String(serviceId), options)
    })
    return map
  }, [selectedServiceIds, staffs])

  const commonStaffIds = useMemo(() => {
    if (selectedServiceIds.length === 0) return []
    const sets = selectedServiceIds.map((serviceId) => {
      const options = serviceStaffOptions.get(String(serviceId)) || []
      return new Set(options.map((staff) => String(staff._id)))
    })
    if (sets.some((set) => set.size === 0)) return []
    const [first, ...rest] = sets
    return Array.from(first).filter((id) => rest.every((set) => set.has(id)))
  }, [selectedServiceIds, serviceStaffOptions])

  const isMultiStaff = selectedServiceIds.length > 0 && commonStaffIds.length === 0
  const autoStaffId = commonStaffIds.length === 1 ? commonStaffIds[0] : ""

  const allServiceStaffSelected = useMemo(() => {
    if (!isMultiStaff) return true
    return selectedServiceIds.every((id) => serviceStaffSelections[String(id)])
  }, [isMultiStaff, selectedServiceIds, serviceStaffSelections])

  const selectedStaffName = useMemo(() => {
    if (isMultiStaff) return "Multiple staff"
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
  }, [selectedStaffId, anyStaffId, staffs, isMultiStaff])

  useEffect(() => {
    if (selectedServiceIds.length === 0) return
    if (isMultiStaff) return
    if (selectedStaffId && selectedStaffId !== "ANY") {
      const stillEligible = eligibleStaffs.some((staff) => staff._id === selectedStaffId)
      if (!stillEligible) {
        setSelectedStaffId("")
        setAnyStaffId("")
      }
    }
    if (selectedStaffId === "ANY" && eligibleStaffs.length === 0) {
      setSelectedStaffId("")
      setAnyStaffId("")
    }
  }, [eligibleStaffs, selectedServiceIds, selectedStaffId, isMultiStaff])

  useEffect(() => {
    if (isMultiStaff) {
      if (selectedStaffId !== "MULTI") {
        setSelectedStaffId("MULTI")
      }
      setAnyStaffId("")
      return
    }
    if (selectedStaffId === "MULTI") {
      setSelectedStaffId("")
    }
    if (autoStaffId) {
      setSelectedStaffId(autoStaffId)
      setAnyStaffId("")
    }
  }, [isMultiStaff, autoStaffId, selectedStaffId])

  const toggleService = (serviceId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : prev.length >= MAX_SERVICE_PER_APPOINTMENT
          ? (toast.error(`Maximum ${MAX_SERVICE_PER_APPOINTMENT} services per booking.`), prev)
          : [...prev, serviceId],
    )
  }

  const moveService = (serviceId, direction) => {
    const baseOrder = selectedServiceOrder.length > 0 ? selectedServiceOrder : selectedServiceIds
    const index = baseOrder.indexOf(serviceId)
    if (index === -1) return
    const nextIndex = direction === "up" ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= baseOrder.length) return
    const next = [...baseOrder]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    setSelectedServiceOrder(next)
  }

  useEffect(() => {
    setServiceStaffSelections((prev) => {
      const next = {}
      selectedServiceIds.forEach((id) => {
        if (prev[String(id)]) {
          next[String(id)] = prev[String(id)]
        }
      })
      return next
    })
    setSelectedServiceOrder([])
  }, [selectedServiceIds])

  useEffect(() => {
    if (!isMultiStaff) return
    setServiceStaffSelections((prev) => {
      const next = { ...prev }
      selectedServiceIds.forEach((serviceId) => {
        const key = String(serviceId)
        if (next[key]) return
        const options = serviceStaffOptions.get(key) || []
        if (options.length > 0) {
          next[key] = String(options[0]._id)
        }
      })
      return next
    })
  }, [isMultiStaff, selectedServiceIds, serviceStaffOptions])

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
    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_BASE}/settings/business-hours`)
        if (!response.ok) return
        const data = await response.json()
        if (data?.maxDaysAhead !== undefined) {
          setMaxDaysAhead(data.maxDaysAhead)
        }
        if (data?.minLeadMinutes !== undefined) {
          setMinLeadMinutes(data.minLeadMinutes)
        }
        if (data?.closeMinute !== undefined) {
          setCloseMinute(data.closeMinute)
        }
        if (data?.maxUnpaidAppointments !== undefined) {
          setMaxUnpaidAppointments(data.maxUnpaidAppointments)
        }
      } catch (error) {
        // keep defaults if settings cannot be loaded
      }
    }

    loadSettings()
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

  const fetchMyAppointments = async () => {
    if (!user) return []
    try {
      const response = await axiosInstance.get("/appointments/my")
      const list = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.appointments)
          ? response.data.appointments
          : []
      setMyAppointments(list)
      return list
    } catch (error) {
      setMyAppointments([])
      return []
    }
  }

  useEffect(() => {
    if (step !== 2) return
    fetchMyAppointments()
  }, [user, step])

  useEffect(() => {
    const loadAvailability = async () => {
      if (step !== 2 || selectedServiceIds.length === 0 || !selectedDate) {
        setSlots([])
        return
      }

      setLoadingSlots(true)
      setSelectedStart(null)
      setAnyStaffId("")
      try {
        const freshAppointments = user ? await fetchMyAppointments() : myAppointments
        if (isMultiStaff) {
          if (!allServiceStaffSelected) {
            setSlots([])
            setSlotStaffMap({})
            setSlotOrderMap({})
            return
          }
          const buildAssignments = (order) =>
            order.map((serviceId) => ({
              serviceId,
              staffId: serviceStaffSelections[String(serviceId)],
            }))

          const fetchSlotsForOrder = async (order) => {
            const params = new URLSearchParams({
              appointmentDate: selectedDate,
              serviceIds: order.join(","),
              staffAssignments: JSON.stringify(buildAssignments(order)),
            })
            const response = await fetch(`${API_BASE}/appointments/availability?${params.toString()}`)
            const data = await response.json()
            if (!response.ok) {
              throw new Error(data?.error || data?.message || "Unable to load available slots")
            }
            return data.slots || []
          }

          const baseOrder = [...selectedServiceIds]
          const altOrder = [...selectedServiceIds].reverse()
          const orders = [baseOrder]
          if (altOrder.join(",") !== baseOrder.join(",")) {
            orders.push(altOrder)
          }

          const results = await Promise.all(orders.map(fetchSlotsForOrder))
          const merged = new Map()
          const orderMap = {}
          results.forEach((slotsForOrder, index) => {
            const order = orders[index]
            slotsForOrder.forEach((slot) => {
              const existing = merged.get(slot.startMinute)
              if (!existing) {
                merged.set(slot.startMinute, slot)
                if (slot.available) orderMap[slot.startMinute] = order
                return
              }
              if (!existing.available && slot.available) {
                merged.set(slot.startMinute, slot)
                orderMap[slot.startMinute] = order
              }
            })
          })

          const combined = Array.from(merged.values()).sort((a, b) => a.startMinute - b.startMinute)
          setSlots(blockSlotsByCustomer(combined, freshAppointments))
          setSlotStaffMap({})
          setSlotOrderMap(orderMap)
        } else if (!selectedStaffId) {
          setSlots([])
          setSlotStaffMap({})
          setSlotOrderMap({})
          return
        } else if (selectedStaffId === "ANY") {
          const staffIds = eligibleStaffs.map((s) => s._id).filter(Boolean)
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

          setSlots(blockSlotsByCustomer(combined, freshAppointments))
          setSlotStaffMap(
            Object.fromEntries(combined.map((s) => [s.startMinute, s.staffId])),
          )
          setSlotOrderMap({})
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

          setSlots(blockSlotsByCustomer(data.slots || [], freshAppointments))
          setSlotStaffMap({})
          setSlotOrderMap({})
        }
      } catch (error) {
        toast.error(error.message)
        setSlots([])
        setSlotStaffMap({})
        setSlotOrderMap({})
      } finally {
        setLoadingSlots(false)
      }
    }

    loadAvailability()
  }, [
    selectedDate,
    selectedServiceIds,
    selectedStaffId,
    step,
    staffs,
    eligibleStaffs,
    isMultiStaff,
    allServiceStaffSelected,
    serviceStaffSelections,
  ])

  const handleBook = async () => {
    if (!user) {
      toast.error("Please log in to book an appointment.")
      return
    }
    if (selectedServiceIds.length === 0 || selectedStart === null || (!isMultiStaff && !selectedStaffId)) {
      toast.error("Please select services, staff, and a start time.")
      return
    }
    if (!isMultiStaff && selectedStaffId === "ANY" && !anyStaffId) {
      toast.error("Please pick a time slot to assign a staff member.")
      return
    }
    if (isMultiStaff && !allServiceStaffSelected) {
      toast.error("Please select staff for every service.")
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
    const latestAllowed = addDays(startOfDay(new Date()), maxDaysAhead)
    if (toLocalDate(selectedDate) > latestAllowed) {
      toast.error(`You can only book within ${maxDaysAhead} days from today.`)
      return
    }

    try {
      const orderForBooking =
        isMultiStaff && selectedServiceOrder.length > 0
          ? selectedServiceOrder
          : selectedServiceIds
      const staffAssignments = isMultiStaff
        ? orderForBooking.map((serviceId) => ({
            serviceId,
            staffId: serviceStaffSelections[String(serviceId)],
          }))
        : null
      const response = await fetch(`${API_BASE}/appointments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user._id || user.id,
          name: user.fullName || user.email || "Customer",
          staffId: isMultiStaff
            ? undefined
            : selectedStaffId === "ANY"
              ? anyStaffId
              : selectedStaffId,
          staffAssignments: staffAssignments || undefined,
          serviceIds: orderForBooking,
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

      if (!isMultiStaff) {
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
      }
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
        if (booking?.status === "Cancelled" || booking?.status === "NoShow") return false
        return booking?.paymentStatus === "Unpaid" || booking?.status === "Scheduled"
      }).length
      if (blockedCount >= maxUnpaidAppointments) {
        toast.error(
          `You already have ${maxUnpaidAppointments} unpaid or scheduled appointments. You cannot book more.`,
        )
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

  const checkCustomerTimeConflict = async () => {
    if (!user || selectedStart === null || selectedServiceIds.length === 0) return false
    try {
      const response = await axiosInstance.get("/appointments/my")
      const list = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.appointments)
          ? response.data.appointments
          : []
      const selectedDateKey = formatDate(toLocalDate(selectedDate))
      const selectedStartMinutes = selectedStart
      const selectedEndMinutes = selectedStart + totalDuration
      return list.some((booking) => {
        if (!booking) return false
        if (booking.status === "Cancelled" || booking.status === "NoShow") return false
        const bookingDateKey = formatDate(new Date(booking.appointmentDate))
        if (bookingDateKey !== selectedDateKey) return false
        const bookingStart = parseTimeToMinutes(booking.startTime)
        const bookingEnd = parseTimeToMinutes(booking.endTime)
        return Math.max(selectedStartMinutes, bookingStart) < Math.min(selectedEndMinutes, bookingEnd)
      })
    } catch (error) {
      return false
    }
  }

  const hasCustomerOverlap = (dateValue, startMinute, endMinute, appointmentsList = myAppointments) => {
    if (!Array.isArray(appointmentsList) || appointmentsList.length === 0) return false
    const dateKey = formatDate(toLocalDate(dateValue))
    return appointmentsList.some((booking) => {
      if (!booking) return false
      if (booking.status === "Cancelled" || booking.status === "NoShow") return false
      const bookingDateKey = formatDate(new Date(booking.appointmentDate))
      if (bookingDateKey !== dateKey) return false
      const bookingStart = parseTimeToMinutes(booking.startTime)
      const bookingEnd = parseTimeToMinutes(booking.endTime)
      return Math.max(startMinute, bookingStart) < Math.min(endMinute, bookingEnd)
    })
  }

  const blockSlotsByCustomer = (slotList, appointmentsList = myAppointments) =>
    (slotList || []).map((slot) => {
      const blocked = hasCustomerOverlap(selectedDate, slot.startMinute, slot.endMinute, appointmentsList)
      return blocked ? { ...slot, available: false, blockedByCustomer: true } : slot
    })

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

              {featuredServices.length > 0 ? (
                <div className="mb-4">
                  <h3 className="h-[30px] text-lg font-semibold text-slate-700">Featured</h3>
                  <div className="service-grid">
                    {featuredServices.map((service) => {
                      const id = String(service._id)
                      const isSelected = selectedServiceIds.includes(id)
                      return (
                        <button
                          key={`featured-${service._id}`}
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

              {servicesByCategory.map(([categoryName, categoryServices]) => (
                <div key={categoryName} className="mb-4">
                  <h3 className="h-[30px] text-lg font-semibold text-slate-700">{categoryName}</h3>
                  <div className="service-grid">
                    {categoryServices.map((service) => {
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
              ))}
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
                  {!loadingStaffs && isMultiStaff ? (
                    <div className="service-staff-assignments">
                      <div className="staff-section-header">
                        <h3>Assign staff for each service</h3>
                        <span className="muted">Required</span>
                      </div>
                      {orderedSelectedServices.map((service) => {
                        const id = String(service._id)
                        const options = serviceStaffOptions.get(id) || []
                        const index = displayServiceOrder.indexOf(id)
                        const isFirst = index === 0
                        const isLast = index === displayServiceOrder.length - 1
                        return (
                          <div key={id} className="service-staff-row">
                            <div className="service-staff-info">
                              <div className="staff-name">{service.name}</div>
                              <div className="staff-speciality muted">
                                {service.duration} min
                              </div>
                            </div>
                            <div className="service-staff-order">
                              <button
                                type="button"
                                className="ghost-btn order-btn"
                                disabled={isFirst}
                                onClick={() => moveService(id, "up")}
                              >
                                Up
                              </button>
                              <button
                                type="button"
                                className="ghost-btn order-btn"
                                disabled={isLast}
                                onClick={() => moveService(id, "down")}
                              >
                                Down
                              </button>
                            </div>
                            <select
                              className="service-staff-select"
                              value={serviceStaffSelections[id] || ""}
                              onChange={(event) =>
                                setServiceStaffSelections((prev) => ({
                                  ...prev,
                                  [id]: event.target.value,
                                }))
                              }
                            >
                              <option value="">Select staff</option>
                              {options.map((staff) => (
                                <option key={staff._id} value={staff._id}>
                                  {getStaffDisplay(staff)}
                                </option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <>
                      {!loadingStaffs && eligibleStaffs.length === 0 ? (
                        <p className="muted">No matching barbers yet.</p>
                      ) : null}

                      <div className="staff-grid horizontal" role="list">
                        {eligibleStaffs.length > 1 ? (
                          <button
                            type="button"
                            className={`staff-card ${selectedStaffId === "ANY" ? "selected" : ""}`}
                            onClick={() => setSelectedStaffId("ANY")}
                            role="listitem"
                          >
                            <div className="staff-avatar">
                              <span className="staff-initials">*</span>
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
                        ) : null}
                        {eligibleStaffs.map((staff) => {
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
                    </>
                  )}
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
                      isToday && getCurrentMinuteOfDay() + minLeadMinutes >= closeMinute
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
                  {!isMultiStaff && !selectedStaffId ? (
                    <p className="muted">Select a barber to see available times.</p>
                  ) : null}
                  {isMultiStaff && !allServiceStaffSelected ? (
                    <p className="muted">Select staff for each service to see available times.</p>
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
                                if (isMultiStaff) {
                                  const order = slotOrderMap[slot.startMinute]
                                  const nextOrder = order || selectedServiceIds
                                  setSelectedServiceOrder(nextOrder)
                                }
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
              disabled={
                selectedServiceIds.length === 0 ||
                (!isMultiStaff && !selectedStaffId) ||
                selectedStart === null ||
                !allServiceStaffSelected
              }
            >
              Confirm booking
            </button>
          ) : step === 2 ? (
            <button
              type="button"
              className="primary-btn ghost"
              onClick={async () => {
                const conflict = await checkCustomerTimeConflict()
                if (conflict) {
                  toast.error("You already have an appointment at this time.")
                  return
                }
                setStep(3)
              }}
              disabled={
                selectedServiceIds.length === 0 ||
                (!isMultiStaff && !selectedStaffId) ||
                selectedStart === null ||
                !allServiceStaffSelected
              }
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

