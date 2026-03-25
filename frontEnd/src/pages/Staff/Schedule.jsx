import { useEffect, useMemo, useState } from "react";
import { staffService } from "@/services/staff.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  Clock3,
  CalendarRange,
  Info,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

/* ================= HELPERS ================= */
const getDateKey = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

const formatDate = (date) => {
  if (!date) return "--";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "--";

  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTimeRange = (start, end) => {
  if (!start || !end) return "--";
  return `${start} - ${end}`;
};

const getDayName = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { weekday: "long" });
};

/* ================= COMPONENT ================= */
export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const res = await staffService.getSchedule();
        setSchedule(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        toast.error("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const sortedSchedule = useMemo(() => {
    return [...schedule].sort((a, b) => {
      const dateA = new Date(a.workingDate).getTime();
      const dateB = new Date(b.workingDate).getTime();

      if (dateA !== dateB) return dateA - dateB;
      return (a.startTime || "").localeCompare(b.startTime || "");
    });
  }, [schedule]);

  const totalSlots = sortedSchedule.length;

  const totalDays = useMemo(() => {
    const uniqueDays = new Set(
      sortedSchedule.map((item) => getDateKey(item.workingDate)).filter(Boolean)
    );
    return uniqueDays.size;
  }, [sortedSchedule]);

  const upcomingSlot = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sortedSchedule.find((item) => {
      const d = new Date(item.workingDate);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    });
  }, [sortedSchedule]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        {/* HEADER */}
        <div className="overflow-hidden rounded-3xl border bg-background shadow-sm">
          <div className="relative p-6 md:p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full px-3 py-1">
                    Read only
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    Staff Schedule
                  </Badge>
                </div>

                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Your Working Schedule
                </h1>

                <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                  This page is view-only. Staff can only see assigned working
                  dates and time slots.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                No edit permission
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total slots</p>
                <p className="text-2xl font-bold">{loading ? "--" : totalSlots}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3">
                <Clock3 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Working days</p>
                <p className="text-2xl font-bold">{loading ? "--" : totalDays}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3">
                <CalendarRange className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Next shift</p>
                <p className="text-sm font-semibold">
                  {loading
                    ? "--"
                    : upcomingSlot
                    ? formatDate(upcomingSlot.workingDate)
                    : "No upcoming shift"}
                </p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3">
                <Briefcase className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl shadow-sm">
                <CardHeader className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedSchedule.length === 0 ? (
          <Card className="rounded-3xl border-dashed shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold">No schedule available</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Your working schedule has not been assigned yet. Please check
                again later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedSchedule.map((s, i) => (
              <Card
                key={`${getDateKey(s.workingDate)}-${s.startTime}-${i}`}
                className="rounded-2xl border shadow-sm transition hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {formatDate(s.workingDate)}
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {getDayName(s.workingDate)}
                      </p>
                    </div>

                    <Badge variant="secondary" className="rounded-full">
                      Slot {i + 1}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-background p-2 shadow-sm">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Working date
                        </p>
                        <p className="font-medium">
                          {getDateKey(s.workingDate) || "--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-background p-2 shadow-sm">
                        <Clock3 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Time slot
                        </p>
                        <p className="font-medium">
                          {formatTimeRange(s.startTime, s.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm text-muted-foreground">
                    <span>Status</span>
                    <Badge variant="outline" className="rounded-full">
                      View only
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}