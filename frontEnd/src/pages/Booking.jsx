import "./Booking.css";

export default function Booking() {
  return (
    <div className="booking-page">
      <h1 className="booking-title">ĐẶT LỊCH CẮT TÓC</h1>

      <form className="booking-form">
        <input placeholder="Họ và tên" />
        <input placeholder="Số điện thoại" />

        <div className="service-box">
          <p>Chọn dịch vụ:</p>
          <label><input type="checkbox" /> Haircut</label>
          <label><input type="checkbox" /> Shaving</label>
          <label><input type="checkbox" /> Hair Wash</label>
          <label><input type="checkbox" /> VIP Combo</label>
        </div>

        <input type="date" />
        <input type="time" />

        <button className="btn-submit">XÁC NHẬN ĐẶT LỊCH</button>
      </form>
    </div>
  );
}
