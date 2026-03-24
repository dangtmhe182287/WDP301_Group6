  import { useEffect, useState } from "react";
  import { useAuth } from "../context/AuthContext";
  import axiosInstance from "../utils/axiosInstance";
  import anonymousAvatar from "../assets/anomyous.jpg";
  import { toast } from "sonner";

  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Input as ShadInput } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Textarea } from "@/components/ui/textarea";

  export default function Settings() {
    const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showRequest, setShowRequest] = useState(false);

    const [staffForm, setStaffForm] = useState({
      speciality: "",
      certificateName: "",
      organization: "",
      certificateId: "",
      portfolio: "",
    });

    const [requestLoading, setRequestLoading] = useState(false);

    const API_BASE = import.meta.env.VITE_SERVER_API || "http://localhost:3000";

    const resolveAvatar = (value) => {
      if (!value) return anonymousAvatar;
      if (value.startsWith("http")) return value;
      return `${API_BASE}${value}`;
    };

    useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        password: "",
      });
      setAvatarPreview(resolveAvatar(user.imgUrl));
    }
  }, [user]);

    const handleChange = (field) => (event) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

    const handleSubmit = async (event) => {
      event.preventDefault();

      const payload = {
        fullName: form.fullName,
        phone: form.phone,
      };

    if (form.password) payload.password = form.password;

    try {
      const res = await axiosInstance.put("/users/me", payload);
      updateUser(res.data.user);
      setAvatarPreview(resolveAvatar(res.data.user?.imgUrl));
        toast.success("Profile updated ");
        setIsEditing(false);
      } catch (err) {
        toast.error(err.response?.data?.message || "Update failed ");
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setAvatarUploading(true);
      const res = await axiosInstance.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(res.data.user);
      setAvatarPreview(resolveAvatar(res.data.user?.imgUrl));
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Avatar upload failed");
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

    // ✅ VALIDATE
    const validateForm = () => {
      if (!staffForm.speciality) return "Speciality is required";
      if (!staffForm.certificateName) return "Certificate name is required";
      if (!staffForm.organization) return "Organization is required";
      if (!staffForm.certificateId) return "Certificate ID is required";
      if (!staffForm.portfolio) return "Portfolio is required";
      return null;
    };

    // ✅ DISABLE BUTTON
    const isInvalid =
      !staffForm.speciality ||
      !staffForm.certificateName ||
      !staffForm.organization ||
      !staffForm.certificateId ||
      !staffForm.portfolio;

    // ✅ HANDLE REQUEST
    const handleSubmitRequest = async () => {
      const error = validateForm();
      if (error) return toast.error(error);

      try {
        setRequestLoading(true);

        await axiosInstance.post("/staff-request/applyStaffRequest", {
          speciality: [staffForm.speciality],
          certificate: {
            name: staffForm.certificateName,
            organization: staffForm.organization,
            certificateId: staffForm.certificateId,
            image: "",
          },
          portfolio: staffForm.portfolio,
        });

        toast.success("Request sent successfully ");

        // reset form
        setStaffForm({
          speciality: "",
          certificateName: "",
          organization: "",
          certificateId: "",
          portfolio: "",
        });

        setShowRequest(false);
      } catch (err) {
        toast.error(err.response?.data?.message || "Send failed ");
      } finally {
        setRequestLoading(false);
      }
    };

    if (!user) return <div className="p-6">Please login</div>;

    return (
      <main className="min-h-[80vh] flex justify-center py-10">
        <div className="w-full max-w-3xl space-y-6 px-4">

          {/* PROFILE */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <img
                src={avatarPreview}
                className="w-16 h-16 rounded-full object-cover"
              />

              <ShadInput
                value={form.fullName}
                onChange={handleChange("fullName")}
                disabled={!isEditing}
                placeholder="Full name"
              />

              <ShadInput
                value={form.phone}
                onChange={handleChange("phone")}
                disabled={!isEditing}
                placeholder="Phone"
              />

              {isEditing && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Avatar image</label>
                    <ShadInput
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={avatarUploading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload a new avatar image (JPG/PNG).
                    </p>
                  </div>

                  <ShadInput
                    type="password"
                    value={form.password}
                    onChange={handleChange("password")}
                    placeholder="New password"
                    autoComplete="new-password"
                    name="new-password"
                  />
                </>
              )}

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSubmit} disabled={avatarUploading}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* STAFF REQUEST */}
          {user.role === "customer" && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Become Staff</CardTitle>

                <Button
                  variant={showRequest ? "outline" : "default"}
                  onClick={() => setShowRequest(!showRequest)}
                >
                  {showRequest ? "Close" : "Apply"}
                </Button>
              </CardHeader>

              {showRequest && (
                <CardContent className="space-y-3">
                  <ShadInput
                    placeholder="Speciality"
                    value={staffForm.speciality}
                    onChange={(e) =>
                      setStaffForm((p) => ({ ...p, speciality: e.target.value }))
                    }
                  />

                  <ShadInput
                    placeholder="Certificate name"
                    value={staffForm.certificateName}
                    onChange={(e) =>
                      setStaffForm((p) => ({
                        ...p,
                        certificateName: e.target.value,
                      }))
                    }
                  />

                  <ShadInput
                    placeholder="Organization"
                    value={staffForm.organization}
                    onChange={(e) =>
                      setStaffForm((p) => ({
                        ...p,
                        organization: e.target.value,
                      }))
                    }
                  />

                  <ShadInput
                    placeholder="Certificate ID"
                    value={staffForm.certificateId}
                    onChange={(e) =>
                      setStaffForm((p) => ({
                        ...p,
                        certificateId: e.target.value,
                      }))
                    }
                  />

                  <Textarea
                    placeholder="Portfolio"
                    value={staffForm.portfolio}
                    onChange={(e) =>
                      setStaffForm((p) => ({
                        ...p,
                        portfolio: e.target.value,
                      }))
                    }
                  />

                  <Button
                    className="w-full"
                    disabled={requestLoading || isInvalid}
                    onClick={handleSubmitRequest}
                  >
                    {requestLoading ? "Sending..." : "Send Request"}
                  </Button>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </main>
    );
  }
