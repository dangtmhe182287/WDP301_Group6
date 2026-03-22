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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHours = async () => {
      try {
        const response = await axiosInstance.get("/settings/business-hours");
        if (response.data?.openMinute !== undefined) {
          setOpenTime(toTimeValue(response.data.openMinute));
          setCloseTime(toTimeValue(response.data.closeMinute));
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
        <label>
          Opening time
          <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
        </label>
        <label>
          Closing time
          <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
        </label>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </button>
        {message ? <p className="message">{message}</p> : null}
      </div>
    </section>
  );
}
