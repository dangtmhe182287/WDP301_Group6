import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

export default function StaffRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/staff-request/getRequests`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load requests");
      }

      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const openModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setAdminNote("");
    setShowModal(true);
  };

  const handleProcessRequest = async (e) => {
    e.preventDefault();

    try {
      const endpoint =
        actionType === "approve"
          ? `${API_BASE}/staff-request/approveRequest/${selectedRequest._id}`
          : `${API_BASE}/staff-request/rejectRequest/${selectedRequest._id}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminNote }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Error processing the request");
      }

      alert(`Request ${actionType === "approve" ? "approved" : "rejected"} successfully!`);
      setShowModal(false);
      await loadRequests();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="staff-requests-admin">
      <div className="page-header">
        <h2>Staff Application Requests</h2>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : requests.length === 0 ? (
        <p>No application requests.</p>
      ) : (
        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Specialty</th>
                <th>Certificate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const user = req.userId || {};
                const specialityText = Array.isArray(req.speciality) ? req.speciality.join(", ") : req.speciality;
                const certificate = req.certificate || {};

                return (
                  <tr key={req._id}>
                    <td>
                      <strong>{user.fullName || "No name"}</strong>
                      <br />
                      <span className="text-secondary">{user.email || "No email"}</span>
                      <br />
                      <span className="text-secondary">{user.phone || "No phone"}</span>
                    </td>
                    <td>{specialityText || "-"}</td>
                    <td>
                      {certificate.name ? (
                        <>
                          <strong>{certificate.name}</strong> ({certificate.organization})
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${req.status}`}>
                        {req.status === "pending"
                          ? "Pending"
                          : req.status === "approved"
                          ? "Approved"
                          : "Rejected"}
                      </span>
                      {req.adminNote && (
                        <div className="admin-note-text">
                          <small>Note: {req.adminNote}</small>
                        </div>
                      )}
                    </td>
                    <td>
                      {req.status === "pending" && (
                        <>
                          <button className="approve-btn" onClick={() => openModal(req, "approve")}>
                            Approve
                          </button>
                          <button className="reject-btn" onClick={() => openModal(req, "reject")}>
                            Reject
                          </button>
                        </>
                      )}
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
            <h2>{actionType === "approve" ? "Approve request" : "Reject request"}</h2>
            <form onSubmit={handleProcessRequest}>
              <div className="form-group">
                <label>Admin note:</label>
                <textarea
                  name="adminNote"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows="3"
                  placeholder="Add a note for the applicant (optional)..."
                />
              </div>
              <div className="modal-actions">
                <button
                  type="submit"
                  className={actionType === "approve" ? "approve-btn" : "reject-btn"}
                >
                  Confirm
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .staff-requests-admin {
          padding: 24px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h2 {
          margin: 0;
          color: #0b2e5c;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .requests-table {
          width: 100%;
          border-collapse: collapse;
        }

        .requests-table th,
        .requests-table td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }

        .requests-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }

        .text-secondary {
          font-size: 13px;
          color: #6b7280;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-pending {
          background: #fef3c7;
          color: #d97706;
        }

        .status-approved {
          background: #d1fae5;
          color: #059669;
        }

        .status-rejected {
          background: #fee2e2;
          color: #dc2626;
        }

        .admin-note-text {
          margin-top: 6px;
          color: #4b5563;
        }

        .approve-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-right: 8px;
        }

        .approve-btn:hover {
          background: #059669;
        }

        .reject-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .reject-btn:hover {
          background: #dc2626;
        }

        .cancel-btn {
          background: #e5e7eb;
          color: #374151;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }

        .cancel-btn:hover {
          background: #d1d5db;
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

        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
}
