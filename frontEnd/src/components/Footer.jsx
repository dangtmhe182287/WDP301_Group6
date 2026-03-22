import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <>
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="logo" onClick={() => navigate("/")}>
              <img src={logo} alt="logo" className="logo-icon" />
              <span>Elysina.</span>
            </div>

            <p>
              Redefining the modern salon experience with creativity, refined craft, and
              premium care that respects your time.
            </p>
            <p>ElysinaCut@gmail.com</p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li>Services</li>
              <li onClick={() => navigate("/appointment")}>Book an Appointment</li>
              <li>Gift Cards</li>
              <li>Policies</li>
            </ul>
          </div>

          <div className="footer-location">
            <h4>Location</h4>
            <p></p>
          </div>
        </div>

        <div className="footer-bottom">© 2026 Elysina Salon. All rights reserved.</div>
      </footer>

      <style>{`
        .footer{
          background:#020d1b;
          color:white;
          padding-top:10px;
          width: 100%;
          margin-top: auto;
        }

        .footer-grid{
          display:grid;
          grid-template-columns:2fr 1fr 1fr;
          gap:40px;
        }

        .logo{
          display:flex;
          align-items:center;
          font-weight:700;
          font-size:18px;
          cursor:pointer;
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

        .footer-brand p{
          margin:15px 0;
          color:#94a3b8;
        }

        .footer h4{
          margin-bottom:15px;
        }

        .footer ul{
          list-style:none;
          padding:0;
        }

        .footer ul li{
          margin-bottom:10px;
          color:#cbd5e1;
          cursor:pointer;
        }

        .footer ul li:hover{
          color:#22d3c5;
        }

        .socials span{
          margin-right:10px;
          font-size:18px;
          cursor:pointer;
        }

        .newsletter{
          display:flex;
          margin-top:10px;
        }

        .newsletter input{
          flex:1;
          padding:10px;
          border-radius:20px 0 0 20px;
          border:none;
          outline:none;
        }

        .newsletter button{
          padding:10px 16px;
          border:none;
          background:#22d3c5;
          color:white;
          border-radius:0 20px 20px 0;
          cursor:pointer;
        }

        .footer-bottom{
          border-top:1px solid #1e293b;
          margin-top:10px;
          padding:10px 0;
          text-align:center;
          color:#94a3b8;
        }
      `}</style>
    </>
  );
}
