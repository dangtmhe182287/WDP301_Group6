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
    imgUrl: "",
  });

  const [message, setMessage] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [staffInfo, setStaffInfo] = useState(null);
  const API_BASE = import.meta.env.VITE_SERVER_API || "http://localhost:3000";

  const resolveAvatar = (value) => {
    if (!value) return anonymousAvatar;
    if (value.startsWith("http")) return value;
    return `${API_BASE}${value}`;
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        password: "",
        imgUrl: user.imgUrl || "",
      });
      setAvatarPreview(resolveAvatar(user.imgUrl));
    }
  }, [user]);

  useEffect(() => {
    const loadStaffInfo = async () => {
      if (!user || user.role !== "staff") {
        setStaffInfo(null);
        return;
      }
      try {
        const response = await axiosInstance.get("/staffs");
        const matched = Array.isArray(response.data)
          ? response.data.find((staff) => staff._id === user._id)
          : null;
        setStaffInfo(matched || null);
        console.log("Matched:", matched);
        console.log("Response:", response.data);
        console.log("User:", user._id);
        
      } catch (error) {
        setStaffInfo(null);
      }
    };

    loadStaffInfo();
  }, [user]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
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
      phone: form.phone,
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
      setIsEditing(false);
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

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        password: "",
        imgUrl: user.imgUrl || "",
      });
      setAvatarPreview(resolveAvatar(user.imgUrl));
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <main className="settings-page">
        <div className="settings-card">
          <h2>Hồ sơ cá nhân</h2>
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
        <h2>Hồ sơ cá nhân</h2>
        <div className="settings-avatar">
          <img src={avatarPreview || anonymousAvatar} alt="avatar" />
        </div>
        <form onSubmit={handleSubmit} className="settings-form">
          <label>
            Họ và tên
            <input value={form.fullName} onChange={handleChange("fullName")} disabled={!isEditing} />
          </label>
          
          <label>
            Số điện thoại
            <input value={form.phone} onChange={handleChange("phone")} disabled={!isEditing} />
          </label>

          {user.role === "staff" && staffInfo ? (
            <div className="staff-profile">
              <div>
                <strong>Chuyên môn:</strong>{" "}
                {Array.isArray(staffInfo.speciality) && staffInfo.speciality.length
                  ? staffInfo.speciality.join(", ")
                  : "Chưa cập nhật"}
              </div>
              <div>
                <strong>Đánh giá:</strong>{" "}
                {staffInfo.rating !== undefined ? staffInfo.rating : "Chưa có"}
              </div>
            </div>
          ) : null}
          {isEditing ? (
            <>
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
                Mật khẩu mới
                <input
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="Để trống nếu không đổi"
                />
              </label>
            </>
          ) : null}
          {isEditing ? (
            <div className="settings-actions">
              <button type="submit" className="primary-btn">
                Lưu thay đổi
              </button>
              <button type="button" className="ghost-btn" onClick={handleCancelEdit}>
                Hủy
              </button>
            </div>
          ) : (
            <button type="button" className="primary-btn" onClick={handleStartEdit}>
              Chỉnh sửa thông tin
            </button>
          )}
        </form>
        {message ? <p className="message">{message}</p> : null}
      </div>
    </main>
  );
}
