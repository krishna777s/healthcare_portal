import { usePharmacyOrders, useMarkReady, useMarkDispensed } from "@/dashboards/pharmacy/PharmacyDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Clock, CheckCircle, Package, Pill, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { getFileUrl } from "@/lib/api";

const statusStyle: Record<string, string> = {
  pending:   "bg-amber-500/20 text-amber-400 border-amber-500/30",
  ready:     "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  dispensed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

type FilterType = "all" | "pending" | "ready" | "dispensed";

export function PharmacyOrdersPage({ filter = "all" }: { filter?: FilterType }) {
  const { data: orders = [], isLoading } = usePharmacyOrders();
  const markReady = useMarkReady();
  const markDispensed = useMarkDispensed();

  const filtered = filter === "all" ? orders : orders.filter((o: any) => o.status === filter);

  const icons: Record<FilterType, any> = {
    all:       ShoppingBag,
    pending:   Clock,
    ready:     CheckCircle,
    dispensed: Package,
  };

  const titles: Record<FilterType, string> = {
    all:       "All Pharmacy Orders",
    pending:   "Pending Orders",
    ready:     "Ready for Pickup",
    dispensed: "Dispensed Orders",
  };

  const Icon = icons[filter];

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Icon className="h-8 w-8 text-emerald-400" /> {titles[filter]}
        </h1>
        <p className="text-[#D1D5DB]">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          {filter !== "all" ? ` with status: ${filter}` : " total"} — auto-refreshes every 20s
        </p>
      </div>

      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Icon className="h-5 w-5 text-emerald-400" />
            {titles[filter]}
            <span className="ml-auto px-2 py-0.5 bg-[#2D2755] text-[#D1D5DB] rounded-full text-xs">{filtered.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 bg-[#1e2d4d] rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle className="h-14 w-14 text-emerald-400 mx-auto mb-4 opacity-50" />
              <p className="text-[#D1D5DB] text-lg">No {filter === "all" ? "" : filter} orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((o: any) => (
                <div
                  key={o.id}
                  className={`p-4 rounded-xl border ${statusStyle[o.status]} transition-colors`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <User className="h-4 w-4 text-[#D1D5DB]" />
                        <p className="text-white font-semibold text-base">{o.patient_name || "Unknown"}</p>
                      </div>
                      <p className="text-[#D1D5DB] text-sm">Dr. {o.doctor_name} · {formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${statusStyle[o.status]}`}>
                      {o.status}
                    </span>
                  </div>

                  {/* Medicines */}
                  {o.medicines && o.medicines.length > 0 && (
                    <div className="mb-3 space-y-1.5 pl-3 border-l-2 border-[#2D2755]">
                      {o.medicines.map((m: any, idx: number) => (
                        <div key={idx} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
                          <Pill className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="text-white font-medium">{m.medicine_name}</span>
                          {m.dosage && <span className="text-[#D1D5DB]">{m.dosage}</span>}
                          {m.frequency && <span className="text-[#9CA3AF]">· {m.frequency}</span>}
                          {m.duration && <span className="text-[#9CA3AF]">· {m.duration}</span>}
                          {m.instructions && <span className="text-amber-300/70 text-xs italic">({m.instructions})</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timestamps + Actions */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs text-[#9CA3AF] space-x-3">
                      <span>Created: {new Date(o.created_at).toLocaleString()}</span>
                      {o.ready_at && <span>· Ready: {new Date(o.ready_at).toLocaleString()}</span>}
                    </div>
                    <div className="flex gap-2">
                      {o.status === "pending" && (
                        <button
                          onClick={() => markReady.mutate(o.id)}
                          disabled={markReady.isPending}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" /> Mark Ready
                        </button>
                      )}
                      {o.status === "ready" && (
                        <button
                          onClick={() => markDispensed.mutate(o.id)}
                          disabled={markDispensed.isPending}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <Package className="h-4 w-4" /> Mark Dispensed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Named page exports for routing
export const AllOrdersPage    = () => <PharmacyOrdersPage filter="all"       />;
export const PendingPage      = () => <PharmacyOrdersPage filter="pending"   />;
export const ReadyPage        = () => <PharmacyOrdersPage filter="ready"     />;
export const DispensedPage    = () => <PharmacyOrdersPage filter="dispensed" />;
