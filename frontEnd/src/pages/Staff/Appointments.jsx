import { useEffect, useMemo, useState } from "react";
import { staffService } from "@/services/staff.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  CalendarDays,
  Users,
} from "lucide-react";
const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTimeRange = (startTime, endTime) => {
  if (!startTime && !endTime) return "-";
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  return startTime || endTime || "-";
};

const getServiceName = (appointment, serviceId) => {
  const service = Array.isArray(appointment?.serviceIds)
    ? appointment.serviceIds.find((item) => String(item?._id || item) === String(serviceId))
    : null;
  return service?.name || "Service";
};

const getAssignmentSegments = (appointment) => {
  const assignments = Array.isArray(appointment?.serviceStaffAssignments)
    ? appointment.serviceStaffAssignments
    : [];
  return assignments
    .slice()
    .sort((a, b) => (a.startMinute || 0) - (b.startMinute || 0))
    .map((item) => ({
      serviceName: getServiceName(appointment, item.serviceId),
      startTime: item.startTime,
      endTime: item.endTime,
    }));
};
export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await staffService.getAppointments();
      setAppointments(res.data || []);
    } catch (error) {
      console.error("Fetch appointments error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await staffService.updateStatus(id, status);
      fetchData();
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  const confirmPayment = async (id) => {
    try {
      await staffService.confirmPayment(id);
      fetchData();
    } catch (error) {
      console.error("Confirm payment error:", error);
    }
  };

  const handleOpenAlert = (appointment, actionType) => {
    setSelectedAction({
      id: appointment._id,
      customerName:
        appointment.customerId?.fullName ||
        appointment.customerName ||
        appointment.walkInCustomerName ||
        "Walk-in customer",
      actionType,
    });
    setAlertOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedAction) return;

    try {
      if (selectedAction.actionType === "complete") {
        await updateStatus(selectedAction.id, "Completed");
      } else if (selectedAction.actionType === "cancel") {
        await updateStatus(selectedAction.id, "Cancelled");
      } else if (selectedAction.actionType === "paid") {
        await confirmPayment(selectedAction.id);
      }
    } finally {
      setAlertOpen(false);
      setSelectedAction(null);
    }
  };

  const filters = ["All", "Pending", "Scheduled", "Completed", "Cancelled"];

  const filtered = useMemo(() => {
    let data =
      filter === "All"
        ? appointments
        : appointments.filter((a) => a.status === filter);

    const keyword = search.trim().toLowerCase();

    if (!keyword) return data;

    return data.filter((a) => {
      const customerName =
        a.customerId?.fullName || a.customerName || a.walkInCustomerName || "";
      const phone = a.customerId?.phone || "";
      const paymentStatus = a.paymentStatus || "Unpaid";
      const status = a.status || "";

      return (
        customerName.toLowerCase().includes(keyword) ||
        phone.toLowerCase().includes(keyword) ||
        paymentStatus.toLowerCase().includes(keyword) ||
        status.toLowerCase().includes(keyword)
      );
    });
  }, [appointments, filter, search]);

  const getBadgeVariant = (status) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Cancelled":
        return "destructive";
      case "Pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getAlertContent = () => {
    if (!selectedAction) {
      return {
        title: "Confirm action",
        description: "Are you sure?",
        actionText: "Confirm",
      };
    }

    switch (selectedAction.actionType) {
      case "complete":
        return {
          title: "Complete appointment?",
          description: `Are you sure you want to mark appointment of "${selectedAction.customerName}" as Completed?`,
          actionText: "Complete",
        };
      case "cancel":
        return {
          title: "Cancel appointment?",
          description: `Are you sure you want to cancel appointment of "${selectedAction.customerName}"?`,
          actionText: "Cancel appointment",
        };
      case "paid":
        return {
          title: "Confirm payment?",
          description: `Are you sure you want to mark payment of "${selectedAction.customerName}" as Paid?`,
          actionText: "Mark as Paid",
        };
      default:
        return {
          title: "Confirm action",
          description: "Are you sure?",
          actionText: "Confirm",
        };
    }
  };

  const alertContent = getAlertContent();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="rounded-3xl border bg-background shadow-sm">
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="space-y-2">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Staff Panel
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Appointments
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Manage customer appointments, payment state, and booking status.
              </p>
            </div>

            <div className="w-full md:w-[340px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customer, phone, payment, status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 rounded-xl pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filter by status</CardTitle>
            <CardDescription>
              Select a status to narrow the appointment list.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden rounded-2xl shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Appointments List</CardTitle>
                <CardDescription>
                  Showing {filtered.length} appointment(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableHead className="min-w-[220px]">Customer</TableHead>
                    <TableHead className="min-w-[140px]">Date & Time</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Payment</TableHead>
                    <TableHead className="min-w-[280px]">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="rounded-full bg-muted p-4">
                            <CalendarDays className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">No appointments</p>
                            <p className="text-sm text-muted-foreground">
                              There is no data matching your current filter.
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((a) => {
                      const segments = getAssignmentSegments(a);
                      return (
                      <TableRow key={a._id} className="hover:bg-muted/20">
                        <TableCell>
                          <div
                            className="cursor-pointer font-semibold text-primary transition hover:underline"
                            onClick={() =>
                              a.customerId?._id &&
                              navigate(`/staff/customer/${a.customerId._id}`)
                            }
                          >
                            {a.customerId?.fullName ||
                              a.customerName ||
                              a.walkInCustomerName ||
                              "Walk-in customer"}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {a.customerId?.phone || "-"}
                          </div>
                        </TableCell>

                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{formatDate(a.appointmentDate)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeRange(a.startTime, a.endTime)}
                            </span>
                            {segments.length > 0 ? (
                              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                {segments.map((segment, index) => (
                                  <div key={`${segment.serviceName}-${index}`}>
                                    {segment.serviceName}: {formatTimeRange(segment.startTime, segment.endTime)}
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
</TableCell>

                        <TableCell>
                          <Badge
                            variant={getBadgeVariant(a.status)}
                            className="rounded-full"
                          >
                            {a.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              a.paymentStatus === "Paid" ? "default" : "secondary"
                            }
                            className="rounded-full"
                          >
                            {a.paymentStatus || "Unpaid"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              className="rounded-lg"
                              onClick={() => handleOpenAlert(a, "complete")}
                              disabled={a.status === "Completed"}
                            >
                              Complete
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg"
                              onClick={() => handleOpenAlert(a, "paid")}
                              disabled={
                                a.paymentStatus === "Paid" ||
                                a.status !== "Completed"
                              }
                            >
                              Mark as Paid
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-lg"
                              onClick={() => handleOpenAlert(a, "cancel")}
                              disabled={a.status === "Cancelled"}
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {alertContent.actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
