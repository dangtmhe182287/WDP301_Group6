import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { staffService } from "@/services/staff.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, UserRound, ShieldCheck } from "lucide-react";

export default function CustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await staffService.getCustomer(id);
        setData(res.data);
      } catch (error) {
        console.error("Fetch customer error:", error);
      }
    };

    fetchCustomer();
  }, [id]);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Loading customer...
      </div>
    );
  }

  const initials =
    data.fullName
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CU";

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={data.imgUrl || ""} alt={data.fullName} />
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-bold">{data.fullName}</h1>
              <p className="text-sm text-muted-foreground">
                Customer profile and contact information
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              <UserRound className="mr-1 h-3.5 w-3.5" />
              Customer
            </Badge>

            {data.status && (
              <Badge variant="outline" className="px-3 py-1">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                {data.status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground mb-1">Full Name</p>
              <p className="text-base font-medium">{data.fullName || "N/A"}</p>
            </div>

            <div className="rounded-xl border p-4 flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="text-base font-medium">{data.email || "N/A"}</p>
              </div>
            </div>

            <div className="rounded-xl border p-4 flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p className="text-base font-medium">{data.phone || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Customer Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="mt-1 text-lg font-semibold">
                  {data.status || "Active"}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="mt-1 text-lg font-semibold">
                  {data.role || "Customer"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Quick Notes
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                This page shows the customer’s basic profile information for
                staff reference before or during appointments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}