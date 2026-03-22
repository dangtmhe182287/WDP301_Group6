import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Invalid email format");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/auth/forgot-password", { email });

      toast.success("Password reset link sent");

      console.log("Reset link:", res.data.resetLink);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send reset request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-cover bg-center"
        style={{
          backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.2), rgba(0,0,0,0)),
          url('https://images.unsplash.com/photo-1659036354224-48dd0a9a6b86?q=80&w=880&auto=format&fit=crop')
        `,
        }}
      >
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4 text-white">Elysina</h1>
          <p className="text-white text-lg">Luxury Haircare, One Booking Away.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <Card className="w-full max-w-md bg-white border-gray-200 shadow-2xl">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-black mb-2">Forgot Password</h2>

            <p className="text-sm text-gray-500 mb-6">
              Enter your email to receive a password reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm text-black font-medium">Email</Label>

                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-[#F4F4F4] border-gray-300 text-black placeholder:text-gray-500 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-black hover:bg-gray-900 text-white font-medium"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>

            <p className="text-sm text-gray-600 text-center mt-6">
              Remember your password?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
              >
                Log in
              </span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
