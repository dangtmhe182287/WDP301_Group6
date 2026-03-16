import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendTestMail() {
  try {
    const info = await transporter.sendMail({
      from: `"Elysina" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // gửi cho chính mình
      subject: "Test Mail",
      text: "Test nodemailer thành công!"
    });

    console.log("Mail sent:", info.response);
  } catch (error) {
    console.error("Error:", error);
  }
}

sendTestMail();