import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import anonymousAvatar from "../assets/anomyous.jpg";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const handleLogout = async () => {
  await logout();
  navigate("/login"); // hoặc "/"
};


  const API_BASE = import.meta.env.VITE_SERVER_API || "http://localhost:3000";
  const avatarSrc = user?.imgUrl
    ? (user.imgUrl.startsWith("http") ? user.imgUrl : `${API_BASE}${user.imgUrl}`)
    : anonymousAvatar;
  return (
    <>
      <header className="header">
        <div className="container header-inner">

          <div className="logo" onClick={() => navigate("/")}>
            <img src={logo} alt="logo" className="logo-icon" />
            <span>Elysina.</span>
          </div>

          <nav className="nav">
            <a onClick={() => navigate("/")}>Trang chủ</a>
            <a href="#">Dịch vụ</a>
            <a href="#">Kiểu dáng</a>
            <a href="#">Về chúng tôi</a>
          </nav>

          <div className="auth-buttons">
            {!user ? (
              <>
                <button
                  className="btn-login"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>

                <button
                  className="btn-signup"
                  onClick={() => navigate("/register")}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="avatar-menu" ref={menuRef}>
                <button
                  className="avatar-button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <img src={avatarSrc} alt="avatar" />
                </button>
                {menuOpen ? (
                  <div className="avatar-dropdown">
                    <button onClick={() => navigate("/my-bookings")}>My Booking</button>
                    <button onClick={() => navigate("/settings")}>Cài đặt</button>
                    <button onClick={handleLogout}>Đăng xuất</button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

        </div>
      </header>

      <style>{`
        .header{
          width:100%;
          background:#f4f6f7;
          padding:16px 0;
        }



        .header-inner{
          display:flex;
          align-items:center;
          justify-content:space-between;
          flex-wrap: wrap;
        }

        .logo{
          display:flex;
          align-items:center;
          font-weight:700;
          font-size:18px;
          padding-left:20px;
        }

        .logo-icon{
          color:white;
          border-radius:50%;
          width:35px;
          height:35px;
          display:flex;
          align-items:center;
          justify-content:center;
          margin-right:8px;
        }

        .nav a{
          margin:0 18px;
          text-decoration:none;
          color:#333;
          font-weight:500;
          cursor:pointer;
        }

        .nav a:hover{
          color:#22d3c5;
        }

        .btn-login, .btn-signup{
          
          margin-right:20px;
          padding:8px 16px;
          border-radius:20px;
          border:none;
          cursor:pointer;
          width: 90px;
        }

        .avatar-button{
          width:40px;
          height:40px;
          border-radius:50%;
          border:2px solid #22d3c5;
          padding:0;
          overflow:hidden;
          background:white;
          cursor:pointer;
        }

        .avatar-button img{
          width:100%;
          height:100%;
          object-fit:cover;
        }

        .btn-login{
          background:white;
          border:1px solid #ccc;
        }

        .btn-signup{
          background:#22d3c5;
          color:white;
        }

        .avatar-menu{
          position:relative;
          display:flex;
          align-items:center;
          margin-right:20px;
        }

        

        .avatar-dropdown{
          position:absolute;
          right:0;
          top:48px;
          background:white;
          border:1px solid #e2e8f0;
          border-radius:12px;
          box-shadow:0 10px 22px rgba(15, 23, 42, 0.12);
          min-width:160px;
          padding:8px;
          display:flex;
          flex-direction:column;
          gap:6px;
          z-index:10;
        }

        .avatar-dropdown button{
          background:transparent;
          border:none;
          padding:8px 10px;
          text-align:left;
          cursor:pointer;
          border-radius:8px;
          font-weight:500;
        }

        .avatar-dropdown button:hover{
          background:#f1f5f9;
          color:#0f172a;
        }
      `}</style>
    </>
  );
}

