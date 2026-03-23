import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

export default function Stylists() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    staffSpecialty: "",
    staffExperienceYears: 0,
    rating: 0,
    speciality: [],
    experienceYears: 0,
    certificate: { name: "", organization: "", certificateId: "", image: "" },
    portfolio: [],
    schedule: [],
  });

  const loadStaffs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/staffs`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load stylists");
      }

      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setStaffs(list);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffs();
  }, []);

  const handleCreate = () => {
    setEditingStaff(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      staffSpecialty: "",
      staffExperienceYears: 0,
      rating: 0,
      speciality: [],
      experienceYears: 0,
      certificate: { name: "", organization: "", certificateId: "", image: "" },
      portfolio: [],
      schedule: [],
    });
    setShowModal(true);
  };

  const handleEdit = (staff) => {
    const staffInfo = staff.staff || staff;

    setEditingStaff(staff);
    setFormData({
      fullName: staff.fullName || "",
      email: staff.email || "",
      phone: staff.phone || "",
      staffSpecialty: staffInfo.staffSpecialty || "",
      staffExperienceYears: staffInfo.staffExperienceYears || 0,
      rating: staffInfo.rating || 0,
      speciality: Array.isArray(staffInfo.speciality) ? staffInfo.speciality : [],
      experienceYears: staffInfo.experienceYears || staffInfo.staffExperienceYears || 0,
      certificate: staffInfo.certificate || { name: "", organization: "", certificateId: "", image: "" },
      portfolio: Array.isArray(staffInfo.portfolio) ? staffInfo.portfolio : [],
      schedule: Array.isArray(staffInfo.schedule) ? staffInfo.schedule : [],
    });
    setShowModal(true);
  };

  const handleDelete = async (staffId) => {
    if (!confirm("Are you sure you want to delete this stylist?")) return;

    try {
      const response = await fetch(`${API_BASE}/staffs/${staffId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Failed to delete stylist");
      }

      await loadStaffs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting form with data:", formData);
    console.log("Editing staff:", editingStaff);

    try {
      const method = editingStaff ? "PUT" : "POST";
      const url = editingStaff ? `${API_BASE}/staffs/${editingStaff._id}` : `${API_BASE}/staffs`;

      console.log("Making request:", method, url);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      alert(editingStaff ? "Updated successfully!" : "Stylist created successfully!");
      setShowModal(false);
      await loadStaffs();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error: " + err.message);
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "speciality") {
      setFormData((prev) => ({ ...prev, speciality: value.split(",").map((s) => s.trim()) }));
    } else if (name.startsWith("certificate.")) {
      const certField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        certificate: { ...prev.certificate, [certField]: value },
      }));
    } else {
      const processedValue = type === "number" ? (value === "" ? 0 : Number(value)) : value;
      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    }
  };

  return (
    <main className="stylists-page">
      <div className="page-header">
        <h1>Stylists</h1>
        <div>
          <button className="add-btn" onClick={handleCreate}>
            Add stylist
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : staffs.length === 0 ? (
        <p>No stylists available.</p>
      ) : (
        <div className="staff-table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Full name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Specialty</th>
                <th>Experience</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((staff) => {
                // Backend now returns { fullName, email, phone, role, staff: { ...staffFields } }
                const user = staff.userId
                  ? staff.userId
                  : {
                      fullName: staff.fullName,
                      email: staff.email,
                      phone: staff.phone,
                      role: staff.role,
                      imgUrl: staff.imgUrl,
                    };

                const staffInfo = staff.staff || staff;

                const speciality =
                  (Array.isArray(staffInfo.speciality) &&
                    staffInfo.speciality.length &&
                    staffInfo.speciality.join(", ")) ||
                  staffInfo.staffSpecialty ||
                  user.speciality ||
                  "-";

                const experience = staffInfo.experienceYears ?? staffInfo.staffExperienceYears ?? "-";

                return (
                  <tr key={staff._id}>
                    <td>
                      <img
                        src={
                          user.imgUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.fullName || "Staff",
                          )}&background=random`
                        }
                        alt="avatar"
                        style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                      />
                    </td>
                    <td>{user.fullName || "No name"}</td>
                    <td>{user.email || "-"}</td>
                    <td>{user.phone || "-"}</td>
                    <td>{speciality}</td>
                    <td>{experience === "-" ? "-" : `${experience} years`}</td>
                    <td>{staffInfo.rating ?? "-"}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(staff)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(staff._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingStaff ? "Edit stylist" : "Add stylist"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full name:</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Specialty:</label>
                <input
                  type="text"
                  name="staffSpecialty"
                  value={formData.staffSpecialty}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Experience (years):</label>
                <input
                  type="number"
                  name="staffExperienceYears"
                  value={formData.staffExperienceYears}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Rating:</label>
                <input type="number" step="0.1" name="rating" value={formData.rating} readOnly disabled />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .stylists-page {
          padding: 24px;
          width: 100%;
          max-width: none;
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .add-btn {
          background: #0b2e5c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          margin-right: 16px;
        }

        .add-btn:hover {
          background: #0a254a;
        }

        .staff-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
        }

        .staff-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .staff-table th,
        .staff-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .staff-table th {
          background: rgba(11, 46, 92, 0.08);
          font-weight: 700;
        }

        .staff-table tr:hover {
          background: rgba(11, 46, 92, 0.06);
        }

        .edit-btn {
          background: #f59e0b;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 8px;
        }

        .edit-btn:hover {
          background: #d97706;
        }

        .delete-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        }

        .delete-btn:hover {
          background: #dc2626;
        }

        .secondary-link {
          text-decoration: none;
          color: #4b5563;
          font-size: 14px;
        }

        .secondary-link:hover {
          color: #0b2e5c;
          text-decoration: underline;
        }

        .error {
          color: #d32f2f;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          padding: 24px;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal h2 {
          margin-top: 0;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .save-btn {
          background: #0b2e5c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn:hover {
          background: #0a254a;
        }

        .modal-actions button[type="button"] {
          background: #6b7280;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }

        .modal-actions button[type="button"]:hover {
          background: #4b5563;
        }
      `}</style>
    </main>
  );
}
