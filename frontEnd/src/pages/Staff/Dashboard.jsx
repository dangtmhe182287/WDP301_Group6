import { useEffect, useState } from "react";
import { staffService } from "@/services/staff.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    scheduled: 0,
    cancelled: 0,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await staffService.getDashboard();
        const rawData = res.data || [];

        const mapped = {
          total: 0,
          completed: 0,
          pending: 0,
          scheduled: 0,
          cancelled: 0,
        };

        rawData.forEach((item) => {
          if (item._id === "Completed") mapped.completed = item.count;
          if (item._id === "Pending") mapped.pending = item.count;
          if (item._id === "Scheduled") mapped.scheduled = item.count;
          if (item._id === "Cancelled") mapped.cancelled = item.count;
        });

        mapped.total =
          mapped.completed +
          mapped.pending +
          mapped.scheduled +
          mapped.cancelled;

        setStats(mapped);

        setChartData([
          { status: "Pending", count: mapped.pending },
          { status: "Scheduled", count: mapped.scheduled },
          { status: "Completed", count: mapped.completed },
          { status: "Cancelled", count: mapped.cancelled },
        ]);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    fetchDashboard();
  }, []);

  const chartConfig = {
    count: {
      label: "Appointments",
      color: "#22c55e",
    },
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <h2 className="text-3xl font-bold">{stats.total}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Completed</p>
            <h2 className="text-3xl font-bold">{stats.completed}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <h2 className="text-3xl font-bold">{stats.pending}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <h2 className="text-3xl font-bold">{stats.cancelled}</h2>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Status Overview</CardTitle>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="status" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}