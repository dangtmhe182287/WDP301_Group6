import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterForm() {
  const [activeTab, setActiveTab] = useState("register");
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(formData.name)) {
      toast.error("Name can only include letters A-Z or a-z");
      return;
    }

    const emailRegex = /^[\w.-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email");
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Invalid phone number");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };

      const result = await register(payload);

      if (result.success) {
        toast.success(result.message || "Account created successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        console.log("Server response:", result.data);
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Unable to connect to the server");
      console.error(error);
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
        <div className="max-w-md text-black">
          <h1 className="text-4xl font-bold mb-4 text-white">Elysina</h1>
          <p className="text-white text-lg">Luxury Haircare, One Booking Away.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <Card className="w-full max-w-md bg-white border-gray-200 shadow-2xl">
          <div className="p-8">
            <div className="flex gap-8 mb-8 border-b border-gray-200">
              <button
                onClick={() => (window.location.href = "/login")}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === "login" ? "text-black" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Log in
              </button>

              <button
                onClick={() => (window.location.href = "/register")}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === "register"
                    ? "text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sign up
                {activeTab === "register" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            </div>

            <h2 className="text-2xl font-bold text-black mb-6">Create a new account</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-black font-medium">
                  Full name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-11 bg-[#F4F4F4] border-gray-300 text-black placeholder:text-gray-500 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-black font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 bg-[#F4F4F4] border-gray-300 text-black placeholder:text-gray-500 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm text-black font-medium">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="h-11 bg-[#F4F4F4] border-gray-300 text-black placeholder:text-gray-500 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-black font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-11 bg-[#F4F4F4] border-gray-300 text-black placeholder:text-gray-500 focus:border-blue-600 focus:ring-blue-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-black font-medium">
                  Confirm password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="h-11 bg-[#F4F4F4] border-gray-300 text-black placeholder:text-gray-500 focus:border-blue-600 focus:ring-blue-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-black hover:bg-gray-900 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>

            <p className="text-xs text-gray-600 text-center mt-6">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}