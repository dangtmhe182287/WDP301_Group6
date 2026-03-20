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
        setMessage("Không tải được giờ làm.");
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
      setMessage("Cập nhật giờ làm thành công.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-settings">
      <h2>Giờ làm việc</h2>
      <div className="admin-settings-card">
        <label>
          Giờ mở cửa
          <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
        </label>
        <label>
          Giờ đóng cửa
          <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
        </label>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        {message ? <p className="message">{message}</p> : null}
      </div>
    </section>
  );
}
