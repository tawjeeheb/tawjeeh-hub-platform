import { adminListAuditLogs } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";
import type { AuditAction } from "@/lib/types";

const ACTION_LABELS: Record<AuditAction, string> = {
  login: "تسجيل دخول",
  purchase_created: "إنشاء طلب",
  payment_confirmed: "تأكيد دفع",
  file_downloaded: "تحميل ملف",
  admin_product_updated: "تحديث منتج (إدارة)",
};

export default async function AdminAuditPage() {
  const logs = await adminListAuditLogs();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">سجل الأحداث</h1>
      <p className="mt-1 text-sm text-navy/60">
        أحدث الأحداث الأمنية والتشغيلية المهمة.
      </p>

      {logs.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-navy/15 bg-offwhite p-10 text-center text-sm text-navy/60">
          لا توجد أحداث مسجّلة بعد.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="bg-offwhite text-navy/60">
              <tr>
                <th className="px-5 py-3 font-semibold">الحدث</th>
                <th className="px-5 py-3 font-semibold">الكيان</th>
                <th className="px-5 py-3 font-semibold">المُنفّذ</th>
                <th className="px-5 py-3 font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-5 py-4 font-medium text-navy">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </td>
                  <td className="px-5 py-4 text-navy/70" dir="ltr">
                    {log.entity_type
                      ? `${log.entity_type}:${(log.entity_id ?? "").slice(0, 8)}`
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-navy/60" dir="ltr">
                    {log.actor_id ? log.actor_id.slice(0, 8) : "system"}
                  </td>
                  <td className="px-5 py-4 text-navy/60">
                    {formatDate(log.created_at)}
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
