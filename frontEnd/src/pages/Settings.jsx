import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import anonymousAvatar from "../assets/anomyous.jpg";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
    imgUrl: ""
  });

  
  const [message, setMessage] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const API_BASE = import.meta.env.VITE_SERVER_API || "http://localhost:3000";

  const resolveAvatar = (value) => {
    if (!value) return anonymousAvatar;
    if (value.startsWith("http")) return value;
    return `${API_BASE}${value}`;
  };

useEffect(() => {
  if (message) {
    const timer = setTimeout(() => {
      setMessage(null);
    }, 2000); // 2 giây

    return () => clearTimeout(timer);
  }
}, [message]);
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        phone: user.phone || "",
        imgUrl: user.imgUrl || ""
      }));
      setAvatarPreview(resolveAvatar(user.imgUrl));
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
    if (form.imgUrl) {
      payload.imgUrl = form.imgUrl;
    }

    try {
      const response = await axiosInstance.put("/users/me", payload);
      updateUser(response.data.user);
      setAvatarPreview(resolveAvatar(response.data.user?.imgUrl));
      setMessage("Cập nhật thông tin thành công.");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Cập nhật thất bại.");
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const response = await axiosInstance.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(response.data.user);
      setAvatarPreview(resolveAvatar(response.data.user?.imgUrl));
      setForm((prev) => ({ ...prev, imgUrl: response.data.user?.imgUrl || "" }));
      setMessage("Cập nhật ảnh đại diện thành công.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Tải ảnh thất bại.");
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
        <div className="settings-avatar">
          <img src={avatarPreview || anonymousAvatar} alt="avatar" />
        </div>
        <form onSubmit={handleSubmit} className="settings-form">
          <label>
            Họ và tên
            <input value={form.fullName} onChange={handleChange("fullName")} />
          </label>
          <label>
            Link ảnh đại diện
            <input
              value={form.imgUrl}
              onChange={(event) => {
                const value = event.target.value;
                setForm((prev) => ({ ...prev, imgUrl: value }));
                setAvatarPreview(resolveAvatar(value));
              }}
              placeholder="https://..."
            />
          </label>
          <label>
            Tải ảnh lên
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                handleAvatarUpload(file);
              }}
            />
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
