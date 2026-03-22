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
      setMessage("Please log in to update your profile.");
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
      setMessage("Profile updated.");
      setForm((prev) => ({ ...prev, password: "" }));
      setIsEditing(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Update failed.");
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
      setMessage("Avatar updated.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Upload failed.");
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
          <h2>Profile</h2>
          <p>Please log in to edit your profile.</p>
          <button className="primary-btn" onClick={() => navigate("/login")}>
            Log in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="settings-page">
      <div className="settings-card">
        <h2>Profile</h2>
        <div className="settings-avatar">
          <img src={avatarPreview || anonymousAvatar} alt="avatar" />
        </div>
        <form onSubmit={handleSubmit} className="settings-form">
          <label>
            Full name
            <input value={form.fullName} onChange={handleChange("fullName")} disabled={!isEditing} />
          </label>

          <label>
            Phone
            <input value={form.phone} onChange={handleChange("phone")} disabled={!isEditing} />
          </label>

          {user.role === "staff" && staffInfo ? (
            <div className="staff-profile">
              <div>
                <strong>Specialty:</strong>{" "}
                {Array.isArray(staffInfo.speciality) && staffInfo.speciality.length
                  ? staffInfo.speciality.join(", ")
                  : "Not updated"}
              </div>
              <div>
                <strong>Rating:</strong> {staffInfo.rating !== undefined ? staffInfo.rating : "No ratings"}
              </div>
            </div>
          ) : null}
          {isEditing ? (
            <>
              <label>
                Avatar URL
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
                Upload image
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
                New password
                <input
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="Leave blank to keep current password"
                />
              </label>
            </>
          ) : null}
          {isEditing ? (
            <div className="settings-actions">
              <button type="submit" className="primary-btn">
                Save changes
              </button>
              <button type="button" className="ghost-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" className="primary-btn" onClick={handleStartEdit}>
              Edit profile
            </button>
          )}
        </form>
        {message ? <p className="message">{message}</p> : null}
      </div>
    </main>
  );
}
