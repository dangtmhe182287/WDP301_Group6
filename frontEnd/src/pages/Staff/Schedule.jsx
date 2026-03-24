import { useEffect, useState } from "react";
import { staffService } from "@/services/staff.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    staffService.getSchedule().then((res) => {
      setSchedule(res.data || []);
    });
  }, []);

  const handleChange = (index, field, value) => {
    const newData = [...schedule];
    newData[index][field] = value;
    setSchedule(newData);
  };

  const save = async () => {
    await staffService.updateSchedule(schedule);
    alert("Saved!");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Schedule</h1>

      <Card>
        <CardContent className="space-y-4 p-4">
          {schedule.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              No schedule available
            </div>
          ) : (
            schedule.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border rounded-lg p-3"
              >
                <div className="w-32 text-sm text-muted-foreground">
                  {new Date(s.workingDate).toLocaleDateString()}
                </div>

                <Input
                  value={s.startTime}
                  onChange={(e) =>
                    handleChange(i, "startTime", e.target.value)
                  }
                  placeholder="Start time"
                />

                <Input
                  value={s.endTime}
                  onChange={(e) =>
                    handleChange(i, "endTime", e.target.value)
                  }
                  placeholder="End time"
                />
              </div>
            ))
          )}

          <div className="flex justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}