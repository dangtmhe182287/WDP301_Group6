import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Scissors, Mail, Phone, Award, Pencil, Trash2, Sparkles } from "lucide-react";

const API_BASE = "http://localhost:3000";

export default function Stylists() {
  const [staffs, setStaffs] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const emptyForm = {
    fullName: "",
    email: "",
    phone: "",
    rating: 0,
    speciality: [],
    experienceYears: 0,
    certificate: { name: "", organization: "", certificateId: "", image: "" },
    portfolio: [],
    schedule: [],
    serviceIds: [],
  };

  const [formData, setFormData] = useState(emptyForm);

  const loadStaffs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/staffs?includeInactive=true`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load staff");
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setStaffs(list);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffs();
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true);
      try {
        const response = await fetch(`${API_BASE}/services`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Unable to load services");
        }
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  const handleCreate = () => {
    setEditingStaff(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (staff) => {
    const staffInfo = staff.staff || staff;

    setEditingStaff(staff);
    setFormData({
      fullName: staff.fullName || "",
      email: staff.email || "",
      phone: staff.phone || "",
      rating: staffInfo.rating || 0,
      speciality: Array.isArray(staffInfo.speciality) ? staffInfo.speciality : [],
      experienceYears: staffInfo.experienceYears || staffInfo.staffExperienceYears || 0,
      certificate:
        staffInfo.certificate || {
          name: "",
          organization: "",
          certificateId: "",
          image: "",
        },
      portfolio: Array.isArray(staffInfo.portfolio) ? staffInfo.portfolio : [],
      schedule: Array.isArray(staffInfo.schedule) ? staffInfo.schedule : [],
      serviceIds: Array.isArray(staffInfo.serviceIds)
        ? staffInfo.serviceIds.map((svc) => String(svc?._id || svc)).filter(Boolean)
        : [],
    });
    setShowModal(true);
  };

  const handleDelete = async (staffId) => {
    const doDelete = async () => {
      try {
        const response = await fetch(`${API_BASE}/staffs/${staffId}`, {
          method: "DELETE",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Failed to delete staff");
        }

        toast.success("Staff set to inactive successfully");
        await loadStaffs();
      } catch (err) {
        toast.error(err.message || "Deactivate failed");
        setError(err.message || "Deactivate failed");
      }
    };

    toast("Set this staff to inactive?", {
      description: "Staff will be hidden from booking and reschedule.",
      action: {
        label: "Confirm",
        onClick: doDelete,
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleActivate = async (staffId) => {
    try {
      const response = await fetch(`${API_BASE}/staffs/${staffId}/activate`, {
        method: "PATCH",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to activate staff");
      }
      toast.success("Staff set to active successfully");
      await loadStaffs();
    } catch (err) {
      toast.error(err.message || "Activate failed");
      setError(err.message || "Activate failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingStaff ? "PUT" : "POST";
      const url = editingStaff
        ? `${API_BASE}/staffs/${editingStaff.staff?._id || editingStaff._id}`
        : `${API_BASE}/staffs`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}`);
      }

      toast.success(editingStaff ? "Updated successfully" : "Created successfully");
      setShowModal(false);
      await loadStaffs();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Save failed");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "speciality") {
      setFormData((prev) => ({
        ...prev,
        speciality: value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }));
    } else if (name.startsWith("certificate.")) {
      const certField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        certificate: { ...prev.certificate, [certField]: value },
      }));
    } else {
      const processedValue =
        type === "number" ? (value === "" ? 0 : Number(value)) : value;
      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    }
  };

  const toggleService = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const getDisplaySpeciality = (user, staffInfo) => {
    return (
      (Array.isArray(staffInfo.speciality) &&
        staffInfo.speciality.length > 0 &&
        staffInfo.speciality.join(", ")) ||
      user.speciality ||
      "-"
    );
  };

  const getDisplayExperience = (staffInfo) => {
    return staffInfo.experienceYears ?? staffInfo.staffExperienceYears ?? "-";
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Staff</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage stylists, specialties and experience
          </p>
        </div>

        <Button
          onClick={handleCreate}
          className="rounded-xl bg-teal-400 text-slate-950 hover:bg-teal-500"
        >
          Add Staff
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="rounded-2xl border-red-200">
          <CardContent className="p-6 text-red-500">{error}</CardContent>
        </Card>
      ) : staffs.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-10 text-center text-slate-500">
            No staff available.
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-slate-50/80 px-5 py-4">
            <CardTitle>All Stylists</CardTitle>
            <CardDescription>Overview of staff in the system</CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b text-slate-500">
                    <th className="px-5 py-3 text-left font-semibold">Staff</th>
                    <th className="px-5 py-3 text-left font-semibold">Contact</th>
                    <th className="px-5 py-3 text-left font-semibold">Speciality</th>
                    <th className="px-5 py-3 text-left font-semibold">Experience</th>
                    <th className="px-5 py-3 text-left font-semibold">Services</th>
                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                    <th className="px-5 py-3 text-left font-semibold">Rating</th>
                    <th className="px-5 py-3 text-left font-semibold">Revenue</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {staffs.map((staff) => {
                    const user = staff.userId
                      ? staff.userId
                      : {
                          fullName: staff.fullName,
                          email: staff.email,
                          phone: staff.phone,
                          role: staff.role,
                          imgUrl: staff.imgUrl,
                        };

                    const staffInfo = staff.staff || staff;
                    const isActive = staffInfo?.isActive !== false;
                    const speciality = getDisplaySpeciality(user, staffInfo);
                    const experience = getDisplayExperience(staffInfo);
                    const serviceNames = Array.isArray(staffInfo.serviceIds)
                      ? staffInfo.serviceIds
                          .map((svc) => svc?.name || svc?.categoryId?.name || "")
                          .filter(Boolean)
                      : [];

                    return (
                      <tr
                        key={staff._id}
                        className="border-b last:border-0 transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-200">
                              <AvatarImage
                                src={
                                  user.imgUrl ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user.fullName || "Staff"
                                  )}&background=random`
                                }
                                alt={user.fullName || "Staff"}
                              />
                              <AvatarFallback>
                                {user.fullName?.charAt(0) || "S"}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {user.fullName || "No name"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {user.role || "Staff"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-700">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span className="truncate max-w-[180px]">
                                {user.email || "-"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              <span>{user.phone || "-"}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="max-w-[220px]">
                            {speciality !== "-" ? (
                              <div className="flex flex-wrap gap-2">
                                {speciality.split(", ").map((item, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="rounded-full bg-teal-50 text-teal-700 hover:bg-teal-50"
                                  >
                                    <Scissors className="mr-1 h-3 w-3" />
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {experience === "-" ? (
                            <span className="text-slate-400">-</span>
                          ) : (
                            <Badge
                              variant="outline"
                              className="rounded-full border-slate-200 text-slate-700"
                            >
                              <Sparkles className="mr-1 h-3 w-3" />
                              {experience} years
                            </Badge>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {serviceNames.length ? (
                            <div className="flex flex-wrap gap-2">
                              {serviceNames.map((name, idx) => (
                                <Badge
                                  key={`${name}-${idx}`}
                                  variant="secondary"
                                  className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100"
                                >
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <Badge
                            variant={isActive ? "secondary" : "outline"}
                            className={
                              isActive
                                ? "rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                : "rounded-full border-slate-300 text-slate-600"
                            }
                          >
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        <td className="px-5 py-4">
                          <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100">
                            <Award className="mr-1 h-3.5 w-3.5" />
                            {staffInfo.rating ?? "-"}
                          </Badge>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-medium text-slate-700">
                            {(staff.revenue || 0).toLocaleString("en-US")} VND
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => handleEdit(staff)}
                            >
                              <Pencil className="mr-1 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            {isActive ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="rounded-lg"
                                onClick={() =>
                                  handleDelete(staff.staff?._id || staff._id)
                                }
                              >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                Set Inactive
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                                onClick={() =>
                                  handleActivate(staff.staff?._id || staff._id)
                                }
                              >
                                Set Active
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-[96vw] max-w-2xl rounded-2xl p-0 overflow-hidden max-h-[90vh]">
          <DialogHeader className="border-b bg-slate-50 px-6 py-4">
            <DialogTitle>{editingStaff ? "Edit staff" : "Add staff"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="max-h-[calc(90vh-72px)] overflow-y-auto px-6 py-5">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Speciality</label>
              <Input
                type="text"
                name="speciality"
                value={formData.speciality.join(", ")}
                onChange={handleInputChange}
                placeholder="Fade, Perm, Styling"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">
                Services this staff can do
              </label>
              {loadingServices ? (
                <div className="text-sm text-slate-500">Loading services...</div>
              ) : services.length === 0 ? (
                <div className="text-sm text-slate-500">No services found.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => {
                    const id = String(service._id);
                    const checked = formData.serviceIds.includes(id);
                    return (
                      <label
                        key={service._id}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                          checked
                            ? "border-teal-300 bg-teal-50 text-teal-700"
                            : "border-slate-200 text-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(id)}
                        />
                        <span>{service.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">
                Experience (years)
              </label>
              <Input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Rating</label>
              <Input
                type="number"
                step="0.1"
                name="rating"
                value={formData.rating}
                readOnly
                disabled
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button className="bg-teal-400 text-slate-950 hover:bg-teal-500">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
