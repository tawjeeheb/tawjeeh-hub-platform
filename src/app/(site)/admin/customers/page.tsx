import { Badge } from "@/components/ui/badge";
import { adminListCustomers } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await adminListCustomers();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">العملاء</h1>

      {customers.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-navy/15 bg-offwhite p-10 text-center text-sm text-navy/60">
          لا يوجد عملاء بعد.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
          <table className="w-full min-w-[560px] text-right text-sm">
            <thead className="bg-offwhite text-navy/60">
              <tr>
                <th className="px-5 py-3 font-semibold">الاسم</th>
                <th className="px-5 py-3 font-semibold">البريد</th>
                <th className="px-5 py-3 font-semibold">الدور</th>
                <th className="px-5 py-3 font-semibold">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-4 font-medium text-navy">
                    {c.full_name ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-navy/80" dir="ltr">
                    {c.email}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={c.role === "admin" ? "coming" : "neutral"}>
                      {c.role === "admin" ? "مدير" : "عميل"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-navy/60">
                    {formatDate(c.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
