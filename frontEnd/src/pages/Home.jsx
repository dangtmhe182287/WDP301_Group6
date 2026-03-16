import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-eyebrow">Chăm sóc chủ động, dịch vụ tận tâm</p>
          <h1>Đặt lịch nhanh, chọn dịch vụ linh hoạt cho nhu cầu của bạn.</h1>
          <p>
            Hành trình chăm sóc tốt bắt đầu từ lựa chọn đúng dịch vụ. Chúng tôi giúp bạn
            kết nối với staff phù hợp chỉ trong vài bước.
          </p>
          <div className="home-actions">
            <button className="primary-btn" onClick={() => navigate("/appointment")}>
              Đặt lịch ngay
            </button>
            <button className="ghost-btn" onClick={() => navigate("/appointment")}>
              Xem dịch vụ
            </button>
          </div>
        </div>
        <div className="home-hero-card">
          <h3>Vì sao khách hàng chọn chúng tôi</h3>
          <ul>
            <li>Tư vấn rõ ràng, lộ trình minh bạch</li>
            <li>Staff chuyên môn cao, lịch làm việc linh hoạt</li>
            <li>Dịch vụ đa dạng, dễ chọn nhiều dịch vụ cùng lúc</li>
          </ul>
        </div>
      </section>

      <section className="home-quotes">
        <div className="quote-card">
          <p>“Sắp xếp lịch chăm sóc không còn mất thời gian.”</p>
          <span>Khách hàng thân thiết</span>
        </div>
        <div className="quote-card">
          <p>“Chọn nhiều dịch vụ cùng lúc giúp tối ưu lịch làm việc.”</p>
          <span>Chuyên viên tư vấn</span>
        </div>
        <div className="quote-card">
          <p>“Đặt lịch nhanh, nhận xác nhận rõ ràng.”</p>
          <span>Khách hàng mới</span>
        </div>
      </section>
    </main>
  );
}
