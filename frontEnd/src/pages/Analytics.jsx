import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

export default function Analytics() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/services/stats/bookings`);
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu thống kê dịch vụ.");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h2>Thống kê Dịch vụ</h2>
        <p className="subtitle">
          Bảng xếp hạng số lượt khách hàng đặt lịch đối với từng dịch vụ
        </p>
      </div>

      {loading ? (
        <div className="loading">Đang tải biểu đồ...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : stats.length === 0 ? (
        <div className="empty">Chưa có dữ liệu đặt lịch cho dịch vụ nào.</div>
      ) : (
        <div className="stats-card">
          <div className="stats-header">Top dịch vụ thịnh hành</div>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Xếp hạng</th>
                <th>Tên dịch vụ</th>
                <th>Đơn giá</th>
                <th>Số lượt đặt</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((item, index) => (
                <tr key={item._id} className={index < 3 ? "top-rank" : ""}>
                  <td>
                    <div className={`rank-badge rank-${index + 1}`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="service-name">{item.serviceName || "Dịch vụ đã xóa"}</td>
                  <td>
                    {item.price ? item.price.toLocaleString("vi-VN") + " đ" : "-"}
                  </td>
                  <td>
                    <strong>{item.bookingCount}</strong> lượt
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${(item.bookingCount / stats[0].bookingCount) * 100}%`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .analytics-page {
          padding: 24px;
          animation: fadeIn 0.4s ease;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .page-header h2 {
          color: #0b2e5c;
          margin: 0 0 8px 0;
          font-size: 24px;
        }

        .subtitle {
          color: #64748b;
          margin: 0;
          font-size: 15px;
        }

        .stats-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          margin-bottom: 30px;
        }

        .stats-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          background: #f8fafc;
        }

        .stats-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .stats-table th {
          background: white;
          padding: 16px 24px;
          color: #64748b;
          font-weight: 600;
          font-size: 14px;
          border-bottom: 1px solid #e2e8f0;
        }

        .stats-table td {
          padding: 16px 24px;
          vertical-align: middle;
          border-bottom: 1px solid #f1f5f9;
        }

        .stats-table tr:last-child td {
          border-bottom: none;
        }

        .stats-table tr:hover {
          background: #f8fafc;
        }

        .rank-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #475569;
          font-weight: 700;
          font-size: 15px;
        }

        .rank-1 {
          background: #fef08a;
          color: #ca8a04;
          box-shadow: 0 0 10px rgba(234, 179, 8, 0.4);
        }

        .rank-2 {
          background: #e2e8f0;
          color: #64748b;
        }

        .rank-3 {
          background: #fed7aa;
          color: #ea580c;
        }

        .service-name {
          font-weight: 500;
          color: #0f172a;
        }

        .top-rank .service-name {
          font-weight: 700;
        }

        .progress-bar-bg {
          width: 120px;
          height: 6px;
          background: #e2e8f0;
          border-radius: 4px;
          margin-top: 8px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: #2dd4bf;
          border-radius: 4px;
        }

        .top-rank .progress-bar-fill {
          background: #0ea5e9;
        }

        .loading, .error, .empty {
          padding: 40px;
          text-align: center;
          background: white;
          border-radius: 12px;
          color: #64748b;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .error {
          color: #ef4444;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
