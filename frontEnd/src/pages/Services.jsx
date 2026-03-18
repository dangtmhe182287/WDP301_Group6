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
    description: ""
  });

  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/services`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Không tải được danh sách dịch vụ");
      }

      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setServices(list);
    } catch (err) {
      setError(err.message || "Lỗi khi tải dữ liệu");
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
      description: ""
    });
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || "",
      price: service.price || 0,
      duration: service.duration || 0,
      description: service.description || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (!confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;

    try {
      const response = await fetch(`${API_BASE}/services/delete/${serviceId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Lỗi khi xóa dịch vụ");
      }

      await loadServices(); // Reload list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên dịch vụ!");
      return;
    }
    if (formData.price <= 0) {
      alert("Giá phải lớn hơn 0!");
      return;
    }
    if (formData.duration <= 0) {
      alert("Thời gian phải lớn hơn 0!");
      return;
    }
    if (!formData.description.trim()) {
      alert("Vui lòng nhập mô tả!");
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Lỗi khi lưu dịch vụ");
      }

      alert(editingService ? "Cập nhật thành công!" : "Thêm dịch vụ thành công!");
      setShowModal(false);
      await loadServices(); // Reload list
    } catch (err) {
      alert("Lỗi: " + err.message);
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    // Convert number inputs to numbers
    const processedValue = type === "number" ? (value === "" ? 0 : Number(value)) : value;
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  return (
    <div className="services-admin">
      <div className="page-header">
        <h2>Quản lý dịch vụ</h2>
        <button className="add-btn" onClick={handleCreate}>Thêm dịch vụ</button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : services.length === 0 ? (
        <p>Chưa có dịch vụ nào.</p>
      ) : (
        <div className="table-container">
          <table className="services-table">
            <thead>
              <tr>
                <th>Tên dịch vụ</th>
                <th>Giá</th>
                <th>Thời gian</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service._id}>
                  <td>{service.name}</td>
                  <td>{service.price?.toLocaleString('vi-VN')} VND</td>
                  <td>{service.duration} phút</td>
                  <td>{service.description}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(service)}>Sửa</button>
                    <button className="delete-btn" onClick={() => handleDelete(service._id)}>Xóa</button>
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
            <h2>{editingService ? "Sửa dịch vụ" : "Thêm dịch vụ"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên dịch vụ:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Giá (VND):</label>
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
                <label>Thời gian (phút):</label>
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
                <label>Mô tả:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">Lưu</button>
                <button type="button" onClick={() => setShowModal(false)}>Hủy</button>
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