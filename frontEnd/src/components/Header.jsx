import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  return (
    <>
      <header className="header">
        <div className="container header-inner">

          <div className="logo">
            <div className="logo-icon">✂</div>
            <span>Elysina.</span>
          </div>

          <nav className="nav">
            <a onClick={() => navigate("/")}>Home</a>
            <a href="#">Services</a>
            <a href="#">Stylists</a>
            <a href="#">About Us</a>
          </nav>

          <div className="auth-buttons">
            <button className="btn-login">Login</button>
            <button
              className="btn-signup"
            // onClick={() => navigate("/appointment")}
            >
              Sign Up
            </button>


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
          background:#22d3c5;
          color:white;
          border-radius:50%;
          width:28px;
          height:28px;
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
        }

        .nav a:hover{
          color:#22d3c5;
        }

        .auth-buttons button{
          
          margin-right:20px;
          padding:8px 16px;
          border-radius:20px;
          border:none;
          cursor:pointer;
          width: 90px;
        }

        .btn-login{
          background:white;
          border:1px solid #ccc;
        }

        .btn-signup{
          background:#22d3c5;
          color:white;
        }
      `}</style>
    </>
  );
}