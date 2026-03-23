import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    duration: 0,
    description: "",
  });

  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/services`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load services");
      }

      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setServices(list);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      name: "",
      price: 0,
      duration: 0,
      description: "",
    });
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || "",
      price: service.price || 0,
      duration: service.duration || 0,
      description: service.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const response = await fetch(`${API_BASE}/services/delete/${serviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Failed to delete service");
      }

      await loadServices();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a service name.");
      return;
    }
    if (formData.price <= 0) {
      alert("Price must be greater than 0.");
      return;
    }
    if (formData.duration <= 0) {
      alert("Duration must be greater than 0.");
      return;
    }
    if (!formData.description.trim()) {
      alert("Please enter a description.");
      return;
    }

    try {
      const method = editingService ? "PUT" : "POST";
      const url = editingService
        ? `${API_BASE}/services/update/${editingService._id}`
        : `${API_BASE}/services/create`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save service");
      }

      alert(editingService ? "Updated successfully!" : "Created successfully!");
      setShowModal(false);
      await loadServices();
    } catch (err) {
      alert("Error: " + err.message);
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? (value === "" ? 0 : Number(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  return (
    <div className="services-admin">
      <div className="page-header">
        <h2>Service Management</h2>
        <button className="add-btn" onClick={handleCreate}>
          Add service
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : services.length === 0 ? (
        <p>No services available.</p>
      ) : (
        <div className="table-container">
          <table className="services-table">
            <thead>
              <tr>
                <th>Service name</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service._id}>
                  <td>{service.name}</td>
                  <td>{service.price?.toLocaleString("en-US")} VND</td>
                  <td>{service.duration} min</td>
                  <td>{service.description}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(service)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(service._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingService ? "Edit service" : "Add service"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Service name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price (VND):</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (min):</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
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
        .services-admin {
          padding: 24px;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .page-header h2 {
          margin: 0;
          color: #0b2e5c;
        }

        .add-btn {
          background: #0b2e5c;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .add-btn:hover {
          background: #0a254a;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .services-table {
          width: 100%;
          border-collapse: collapse;
        }

        .services-table th,
        .services-table td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .services-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }

        .services-table tr:hover {
          background: #f9fafb;
        }

        .edit-btn {
          background: #f59e0b;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 8px;
          font-size: 14px;
        }

        .edit-btn:hover {
          background: #d97706;
        }

        .delete-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .delete-btn:hover {
          background: #dc2626;
        }

        .error {
          color: #dc2626;
          background: #fef2f2;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #fecaca;
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
          color: #0b2e5c;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #374151;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
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
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .save-btn:hover {
          background: #0a254a;
        }

        .modal-actions button[type="button"] {
          background: #6b7280;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .modal-actions button[type="button"]:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
}
