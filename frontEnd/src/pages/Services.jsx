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
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Scissors,
  Clock3,
  Wallet,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";

const API_BASE = "http://localhost:3000";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    duration: 0,
    description: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      duration: 0,
      description: "",
    });
  };

  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/services`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load services");
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setServices(list);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleCreate = () => {
    setEditingService(null);
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || "",
      price: service.price || 0,
      duration: service.duration || 0,
      description: service.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    const doDelete = async () => {
      try {
        const response = await fetch(`${API_BASE}/services/delete/${serviceId}`, {
          method: "DELETE",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Failed to delete service");
        }

        toast.success("Deleted service successfully");
        await loadServices();
      } catch (err) {
        setError(err.message || "Delete failed");
        toast.error(err.message || "Delete failed");
      }
    };

    toast("Delete this service?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: doDelete,
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a service name");
      return;
    }
    if (formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (formData.duration <= 0) {
      toast.error("Duration must be greater than 0");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    try {
      const method = editingService ? "PUT" : "POST";
      const url = editingService
        ? `${API_BASE}/services/update/${editingService._id}`
        : `${API_BASE}/services/create`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save service");
      }

      toast.success(editingService ? "Updated successfully" : "Created successfully");
      setShowModal(false);
      resetForm();
      await loadServices();
    } catch (err) {
      setError(err.message || "Save failed");
      toast.error(err.message || "Save failed");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue =
      type === "number" ? (value === "" ? 0 : Number(value)) : value;

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Services
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage salon services, pricing and duration
          </p>
        </div>

        <Button
          onClick={handleCreate}
          className="rounded-xl bg-teal-400 text-slate-950 hover:bg-teal-500"
        >
          Add Service
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
      ) : services.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-10 text-center text-slate-500">
            No services available.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/80 px-5 py-4">
            <CardTitle>All Services</CardTitle>
            <CardDescription>
              Overview of services currently in the system
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b text-slate-500">
                    <th className="px-5 py-3 text-left font-semibold">Service</th>
                    <th className="px-5 py-3 text-left font-semibold">Price</th>
                    <th className="px-5 py-3 text-left font-semibold">Duration</th>
                    <th className="px-5 py-3 text-left font-semibold">Description</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {services.map((service) => (
                    <tr
                      key={service._id}
                      className="border-b last:border-0 transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                            <Scissors className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {service.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Service item
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          <Wallet className="mr-1 h-3.5 w-3.5" />
                          {service.price?.toLocaleString("en-US")} VND
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className="rounded-full border-slate-200 text-slate-700"
                        >
                          <Clock3 className="mr-1 h-3.5 w-3.5" />
                          {service.duration} min
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[320px] text-slate-600 line-clamp-2">
                          {service.description}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => handleEdit(service)}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => handleDelete(service._id)}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-[95vw] max-w-xl rounded-2xl p-0 overflow-hidden max-h-[90vh]">
          <DialogHeader className="border-b bg-slate-50 px-6 py-4">
            <DialogTitle>
              {editingService ? "Edit service" : "Add service"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="max-h-[calc(90vh-72px)] overflow-y-auto px-6 py-5"
          >
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Service name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Hair Cut"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    Price (VND)
                  </label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    Duration (min)
                  </label>
                  <Input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe the service..."
                  className="resize-none"
                  required
                />
              </div>

              <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-teal-600 shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Service preview
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formData.name || "Unnamed service"} ·{" "}
                      {(formData.price || 0).toLocaleString("en-US")} VND ·{" "}
                      {formData.duration || 0} min
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white pt-4">
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
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}