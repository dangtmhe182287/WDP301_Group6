import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { staffService } from "@/services/staff.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    staffService.getCustomer(id).then((res) => setData(res.data));
  }, [id]);

  if (!data) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Loading customer...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Customer Detail</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Name */}
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="text-lg font-semibold">{data.fullName}</p>
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p>{data.email || "N/A"}</p>
          </div>

          {/* Phone */}
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p>{data.phone || "N/A"}</p>
          </div>

          {/* Status (optional nếu có) */}
          {data.status && (
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline">{data.status}</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}