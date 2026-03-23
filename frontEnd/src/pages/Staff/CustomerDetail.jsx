import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { staffService } from "@/services/staff.service";

export default function CustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    staffService.getCustomer(id).then(res => setData(res.data));
  }, [id]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">{data.fullName}</h1>
      <p>Email: {data.email}</p>
      <p>Phone: {data.phone}</p>
    </div>
  );
}