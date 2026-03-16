import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        phone: user.phone || ""
      }));
    }
  }, [user]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setMessage("Vui lòng đăng nhập để cập nhật thông tin.");
      return;
    }

    const payload = {
      fullName: form.fullName,
      phone: form.phone
    };
    if (form.password) {
      payload.password = form.password;
    }

    try {
      const response = await axiosInstance.put("/users/me", payload);
      updateUser(response.data.user);
      setMessage("Cập nhật thông tin thành công.");
      setTimeout(() => {
        setMessage("");
      }, 2000); // 3 giây
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Cập nhật thất bại.");
      setTimeout(() => {
        setMessage("");
      }, 2000); // 3 giây

    }
  };

  if (!user) {
    return (
      <main className="settings-page">
        <div className="settings-card">
          <h2>Cài đặt tài khoản</h2>
          <p>Bạn cần đăng nhập để chỉnh sửa thông tin.</p>
          <button className="primary-btn" onClick={() => navigate("/login")}>
            Đăng nhập
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="settings-page">
      <div className="settings-card">
        <h2>Cài đặt tài khoản</h2>
        <form onSubmit={handleSubmit} className="settings-form">
          <label>
            Họ và tên
            <input value={form.fullName} onChange={handleChange("fullName")} />
          </label>
          <label>
            Số điện thoại
            <input value={form.phone} onChange={handleChange("phone")} />
          </label>
          <label>
            Mật khẩu mới
            <input
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              placeholder="Để trống nếu không đổi"
            />
          </label>
          <button type="submit" className="primary-btn">
            Lưu thay đổi
          </button>
        </form>
        {message ? <p className="message">{message}</p> : null}
      </div>
    </main>
  );
}
