import { useEffect, useState } from "react";
import { staffService } from "@/services/staff.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock3, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

/* ================= HELPERS ================= */
const timeToMinutes = (time) => {
  if (!/^\d{2}:\d{2}$/.test(time)) return null;
  const [h, m] = time.split(":").map(Number);
  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    return null;
  }
  return h * 60 + m;
};

const getDateKey = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

/* ================= VALIDATE ================= */
const validateSchedule = (schedule) => {
  const errors = {};

  schedule.forEach((item, index) => {
    const rowErrors = {};

    if (!item.workingDate) {
      rowErrors.workingDate = "Working date is required";
    }

    if (!item.startTime) {
      rowErrors.startTime = "Start time is required";
    }

    if (!item.endTime) {
      rowErrors.endTime = "End time is required";
    }

    const start = timeToMinutes(item.startTime);
    const end = timeToMinutes(item.endTime);

    if (item.startTime && start === null) {
      rowErrors.startTime = "Invalid time format";
    }

    if (item.endTime && end === null) {
      rowErrors.endTime = "Invalid time format";
    }

    if (start !== null && end !== null && start >= end) {
      rowErrors.endTime = "End time must be later than start time";
    }

    if (Object.keys(rowErrors).length > 0) {
      errors[index] = rowErrors;
    }
  });

  // overlap check
  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      const a = schedule[i];
      const b = schedule[j];

      const sameDay =
        getDateKey(a.workingDate) &&
        getDateKey(a.workingDate) === getDateKey(b.workingDate);

      if (!sameDay) continue;

      const aStart = timeToMinutes(a.startTime);
      const aEnd = timeToMinutes(a.endTime);
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);

      if (
        aStart !== null &&
        aEnd !== null &&
        bStart !== null &&
        bEnd !== null &&
        aStart < bEnd &&
        aEnd > bStart
      ) {
        errors[i] = {
          ...(errors[i] || {}),
          endTime: "Overlap with another slot",
        };
        errors[j] = {
          ...(errors[j] || {}),
          endTime: "Overlap with another slot",
        };
      }
    }
  }

  return errors;
};

/* ================= COMPONENT ================= */
export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [errors, setErrors] = useState({});

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await staffService.getSchedule();
        setSchedule(res.data || []);
      } catch (error) {
        toast.error("Failed to load schedule");
      }
    };

    fetchSchedule();
  }, []);

  /* ===== HANDLE CHANGE ===== */
  const handleChange = (index, field, value) => {
    const newData = [...schedule];
    newData[index][field] = value;
    setSchedule(newData);

    setErrors(validateSchedule(newData));
  };

  /* ===== ADD ===== */
  const addScheduleRow = () => {
    const newData = [
      ...schedule,
      {
        workingDate: new Date().toISOString().split("T")[0],
        startTime: "08:00",
        endTime: "17:00",
      },
    ];

    setSchedule(newData);
    setErrors(validateSchedule(newData));

    toast("Added new slot");
  };

  /* ===== REMOVE ===== */
  const removeScheduleRow = (index) => {
    const newData = schedule.filter((_, i) => i !== index);

    setSchedule(newData);
    setErrors(validateSchedule(newData));

    toast.warning("Removed slot");
  };

  /* ===== SAVE ===== */
  const save = async () => {
    const newErrors = validateSchedule(schedule);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }

    try {
      await staffService.updateSchedule(schedule);
      toast.success("Saved successfully ");
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Staff Schedule</h1>
          <p className="text-sm text-muted-foreground">
            Manage your working time slots
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={addScheduleRow}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>

          <Button onClick={save}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* EMPTY */}
      {schedule.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <CalendarDays className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p>No schedule</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {schedule.map((s, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base flex justify-between">
                  {getDateKey(s.workingDate)}
                  <Badge>Slot {i + 1}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* DATE */}
                <Input
                  type="date"
                  value={getDateKey(s.workingDate)}
                  onChange={(e) =>
                    handleChange(i, "workingDate", e.target.value)
                  }
                />
                {errors[i]?.workingDate && (
                  <p className="text-red-500 text-sm">
                    {errors[i].workingDate}
                  </p>
                )}

                {/* TIME */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="time"
                      value={s.startTime}
                      onChange={(e) =>
                        handleChange(i, "startTime", e.target.value)
                      }
                    />
                    {errors[i]?.startTime && (
                      <p className="text-red-500 text-sm">
                        {errors[i].startTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      type="time"
                      value={s.endTime}
                      onChange={(e) =>
                        handleChange(i, "endTime", e.target.value)
                      }
                    />
                    {errors[i]?.endTime && (
                      <p className="text-red-500 text-sm">
                        {errors[i].endTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* REMOVE */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeScheduleRow(i)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}