import { useEffect, useState } from "react";
import { staffService } from "@/services/staff.service";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);

  const fetchData = async () => {
    const res = await staffService.getAppointments();
    setAppointments(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    await staffService.updateStatus(id, status);
    fetchData();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Appointments</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {appointments.map((a) => (
            <TableRow key={a._id}>
              <TableCell>
                {a.customerId?.fullName || a.walkInCustomerName}
              </TableCell>
              <TableCell>
                {new Date(a.appointmentDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{a.status}</TableCell>

              <TableCell className="space-x-2">
                <Button
                  size="sm"
                  onClick={() => updateStatus(a._id, "Completed")}
                >
                  Complete
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateStatus(a._id, "Cancelled")}
                >
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}