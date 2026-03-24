import { useEffect, useState } from "react";
import { staffService } from "@/services/staff.service";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");

  const fetchData = async () => {
    const res = await staffService.getAppointments();
    setAppointments(res.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    await staffService.updateStatus(id, status);
    fetchData();
  };

  const confirmPayment = async (id) => {
    await staffService.confirmPayment(id);
    fetchData();
  };

  const filters = ["All", "Pending", "Scheduled", "Completed", "Cancelled"];

  const filtered =
    filter === "All"
      ? appointments
      : appointments.filter((a) => a.status === filter);

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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Appointments</h1>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No appointments
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell>
                      <div className="font-medium">
                        {a.customerId?.fullName ||
                          a.walkInCustomerName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {a.customerId?.phone}
                      </div>
                    </TableCell>

                    <TableCell>
                      {new Date(a.appointmentDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Badge variant={getBadgeVariant(a.status)}>
                        {a.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={a.paymentStatus === "Paid" ? "default" : "secondary"}>
                        {a.paymentStatus || "Unpaid"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateStatus(a._id, "Completed")}
                          disabled={a.status === "Completed"}
                        >
                          Complete
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => confirmPayment(a._id)}
                          disabled={a.paymentStatus === "Paid" || a.status !== "Completed"}
                        >
                          Mark as Paid
                        </Button>

                        <div className="w-px h-5 bg-border mx-1" />

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(a._id, "Cancelled")}
                          disabled={a.status === "Cancelled"}
                        >
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}