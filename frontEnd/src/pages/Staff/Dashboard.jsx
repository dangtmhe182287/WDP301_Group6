import { useEffect, useState } from "react";
import { staffService } from "@/services/staff.service";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    staffService.getDashboard().then(res => setData(res.data));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      <Card>
        <CardContent>
          <p>Total</p>
          <h2 className="text-2xl">{data.total}</h2>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p>Completed</p>
          <h2 className="text-2xl">{data.completed}</h2>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p>Pending</p>
          <h2 className="text-2xl">{data.pending}</h2>
        </CardContent>
      </Card>
    </div>
  );
}