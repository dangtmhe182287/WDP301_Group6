import { useEffect, useState } from "react";
import { staffService } from "@/services/staff.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { RefreshCw, CalendarDays, ChartColumn } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await staffService.getDashboard();
      const rawData = res.data || [];

      const mapped = {
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
      };

      rawData.forEach((item) => {
        if (item._id === "Completed") mapped.completed = item.count;
        if (item._id === "Pending") mapped.pending = item.count;
        if (item._id === "Cancelled") mapped.cancelled = item.count;
      });

      mapped.total =
        mapped.completed +
        mapped.pending +
        mapped.cancelled;

      setStats(mapped);

      setChartData([
        { status: "Pending", count: mapped.pending },
        { status: "Completed", count: mapped.completed },
        { status: "Cancelled", count: mapped.cancelled },
      ]);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const chartConfig = {
    count: {
      label: "Appointments",
      color: "#22c55e",
    },
  };

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ChartColumn className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            Theo dõi lịch hẹn, trạng thái xử lý và hiệu suất làm việc của bạn.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="secondary" className="gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {today}
            </Badge>

            <Badge variant="outline">
              Total: {stats.total}
            </Badge>

            <Badge variant="outline">
              Completed: {stats.completed}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchDashboard}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <h2 className="text-3xl font-bold">{stats.total}</h2>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Completed</p>
            <h2 className="text-3xl font-bold">{stats.completed}</h2>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <h2 className="text-3xl font-bold">{stats.pending}</h2>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <h2 className="text-3xl font-bold">{stats.cancelled}</h2>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
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