import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const toTimeValue = (minute) => {
  const h = String(Math.floor(minute / 60)).padStart(2, "0");
  const m = String(minute % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const toMinuteValue = (value) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};

export default function AdminSettings() {
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("19:00");
  const [minLeadMinutes, setMinLeadMinutes] = useState(60);
  const [maxDaysAhead, setMaxDaysAhead] = useState(15);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHours = async () => {
      try {
        const response = await axiosInstance.get("/settings/business-hours");
        if (response.data?.openMinute !== undefined) {
          setOpenTime(toTimeValue(response.data.openMinute));
          setCloseTime(toTimeValue(response.data.closeMinute));
          if (response.data.minLeadMinutes !== undefined) {
            setMinLeadMinutes(response.data.minLeadMinutes);
          }
          if (response.data.maxDaysAhead !== undefined) {
            setMaxDaysAhead(response.data.maxDaysAhead);
          }
        }
      } catch (error) {
        setMessage("Unable to load business hours.");
      }
    };

    loadHours();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      await axiosInstance.put("/settings/business-hours", {
        openMinute: toMinuteValue(openTime),
        closeMinute: toMinuteValue(closeTime),
        minLeadMinutes: Number(minLeadMinutes),
        maxDaysAhead: Number(maxDaysAhead),
      });
      setMessage("Business hours updated.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-settings">
      <h2>Business Hours</h2>
      <div className="admin-settings-card">
        <div className="admin-settings-grid">
          <label className="admin-settings-field">
            Opening time
            <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
          </label>
          <label className="admin-settings-field">
            Closing time
            <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
          </label>
          <label className="admin-settings-field">
            Minimum lead time (minutes)
            <input
              type="number"
              min="0"
              max="1440"
              value={minLeadMinutes}
              onChange={(e) => setMinLeadMinutes(e.target.value)}
            />
            <span className="admin-settings-help">
              Example: 60 means if it’s 06:00, the earliest booking is 07:00.
            </span>
          </label>
          <label className="admin-settings-field">
            Max days ahead
            <input
              type="number"
              min="1"
              max="365"
              value={maxDaysAhead}
              onChange={(e) => setMaxDaysAhead(e.target.value)}
            />
          </label>
        </div>
        <div className="admin-settings-actions">
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </button>
          {message ? <p className="message">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}
