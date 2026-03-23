import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`http://localhost:3000/auth/reset-password/${token}`, { password });

      toast.success("Password reset successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Token is invalid or expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left */}
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

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <Card className="w-full max-w-md bg-white border-gray-200 shadow-2xl">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-black mb-2">Reset password</h2>

            <p className="text-sm text-gray-500 mb-6">
              Enter a new password for your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">New password</Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-[#F4F4F4] pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Confirm password</Label>

                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 bg-[#F4F4F4] pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-black hover:bg-gray-900 text-white"
              >
                {loading ? (
                  <div className="flex gap-2 items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>

            <p className="text-sm text-center text-gray-600 mt-6">
              Back to{" "}
              <span onClick={() => navigate("/login")} className="text-blue-600 cursor-pointer">
                log in
              </span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
