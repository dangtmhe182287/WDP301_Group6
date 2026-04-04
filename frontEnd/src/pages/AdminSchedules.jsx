
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

export default function AdminSchedules() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Draft schedules for editing
  const [drafts, setDrafts] = useState({});

  const loadStaffs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/staffs`);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data?.message || "Unable to load staff");

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setStaffs(list);

      // Initialize drafts
      const newDrafts = {};
      list.forEach((s) => {
        const sId = s.staff?._id || s._id;
        const schedule = s.staff?.schedule || s.schedule || [];

        newDrafts[sId] = schedule.map((shift) => ({
          startTime: shift.startTime || "08:00",
          endTime: shift.endTime || "17:00",
        }));
      });

      setDrafts(newDrafts);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffs();
  }, []);

  const handleAddTimeSlot = (staffId) => {
    setDrafts((prev) => ({
      ...prev,
      [staffId]: [
        ...(prev[staffId] || []),
        { startTime: "08:00", endTime: "12:00" },
      ],
    }));
  };

  const handleRemoveTimeSlot = (staffId, index) => {
    setDrafts((prev) => {
      const arr = [...(prev[staffId] || [])];
      arr.splice(index, 1);
      return { ...prev, [staffId]: arr };
    });
  };

  const handleChangeTime = (staffId, index, field, value) => {
    setDrafts((prev) => {
      const arr = [...(prev[staffId] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [staffId]: arr };
    });
  };

  const handleSave = async (staffId) => {
    const payload = drafts[staffId] || [];

    try {
      const url = `${API_BASE}/staffs/${staffId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: payload }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data?.message || "Failed to update schedule");

      alert("Schedule updated successfully!");
      await loadStaffs();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <main className="admin-schedules-page">
      <div className="page-header">
        <h1>Shift Management</h1>
      </div>

      {loading ? (
        <p>Loading staff list...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="schedule-container">
          <div className="box-card">
            {staffs.length === 0 ? (
              <p>No staff available.</p>
            ) : (
              <div className="table-responsive">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Staff Info</th>
                      <th>Working Shifts</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffs.map((s) => {
                      const user = s.userId || s;
                      const sId = s.staff?._id || s._id;
                      const draft = drafts[sId] || [];
                      const hasCustomSchedule = draft.length > 0;

                      return (
                        <tr
                          key={sId}
                          className={hasCustomSchedule ? "has-schedule" : ""}
                        >
                          <td>
                            <div className="staff-info">
                              <strong>{user.fullName || "No Name"}</strong>
                              <span className="staff-email">
                                {user.email || "No Email"}
                              </span>

                              {!hasCustomSchedule && (
                                <span className="badge badge-default">
                                  Default Schedule
                                </span>
                              )}

                              {hasCustomSchedule && (
                                <span className="badge badge-custom">
                                  Custom Schedule
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="shifts-cell">
                            <div className="time-slots-container">
                              {draft.map((slot, index) => (
                                <div key={index} className="time-slot-item">
                                  <input
                                    type="time"
                                    value={slot.startTime}
                                    className="time-input"
                                    onChange={(e) =>
                                      handleChangeTime(
                                        sId,
                                        index,
                                        "startTime",
                                        e.target.value
                                      )
                                    }
                                  />

                                  <span className="time-separator">-</span>

                                  <input
                                    type="time"
                                    value={slot.endTime}
                                    className="time-input"
                                    onChange={(e) =>
                                      handleChangeTime(
                                        sId,
                                        index,
                                        "endTime",
                                        e.target.value
                                      )
                                    }
                                  />

                                  <button
                                    className="btn-remove-slot"
                                    onClick={() =>
                                      handleRemoveTimeSlot(sId, index)
                                    }
                                    title="Remove shift"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}

                              <button
                                className="btn-add-slot"
                                onClick={() => handleAddTimeSlot(sId)}
                              >
                                + Add Shift
                              </button>
                            </div>
                          </td>

                          <td>
                            <button
                              className="btn-save"
                              onClick={() => handleSave(sId)}
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .admin-schedules-page {
          padding: 24px;
          width: 100%;
          min-height: 100vh;
          font-family: inherit;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h1 {
          color: #0f172a;
          margin: 0;
        }

        .schedule-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .box-card {
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          margin-bottom: 24px;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .schedule-table {
          width: 100%;
          border-collapse: collapse;
        }

        .schedule-table th,
        .schedule-table td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
        }

        .schedule-table th {
          background: rgba(11, 46, 92, 0.04);
          color: #0f172a;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
        }

        .has-schedule {
          background: rgba(34, 211, 197, 0.04);
        }

        .staff-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .staff-email {
          color: #64748b;
          font-size: 13px;
        }

        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          width: fit-content;
          margin-top: 4px;
        }

        .badge-default {
          background: #f1f5f9;
          color: #64748b;
        }

        .badge-custom {
          background: #dcfce7;
          color: #166534;
        }

        .time-slots-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .time-slot-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .time-input {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
        }

        .btn-remove-slot {
          background: #fee2e2;
          color: #be123c;
          border: none;
          border-radius: 6px;
          width: 28px;
          height: 28px;
          cursor: pointer;
        }

        .btn-add-slot {
          background: #f1f5f9;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          padding: 8px 12px;
          font-weight: 600;
          cursor: pointer;
          width: fit-content;
        }

        .btn-save {
          padding: 10px 18px;
          background: #22d3c5;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}

