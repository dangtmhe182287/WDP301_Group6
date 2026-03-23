import { useEffect, useState } from "react";
import { staffService } from "@/services/staff.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    staffService.getSchedule().then(res => {
      setSchedule(res.data.schedule || []);
    });
  }, []);

  const save = async () => {
    await staffService.updateSchedule(schedule);
    alert("Saved!");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Schedule</h1>

      {schedule.map((s, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={s.startTime}
            onChange={(e) => {
              const newData = [...schedule];
              newData[i].startTime = e.target.value;
              setSchedule(newData);
            }}
          />

          <Input
            value={s.endTime}
            onChange={(e) => {
              const newData = [...schedule];
              newData[i].endTime = e.target.value;
              setSchedule(newData);
            }}
          />
        </div>
      ))}

      <Button onClick={save}>Save</Button>
    </div>
  );
}