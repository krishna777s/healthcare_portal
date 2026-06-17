import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag, Clock, CheckCircle, Package,
  TrendingUp, Bell, User, Pill,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

// ─── Shared hooks ──────────────────────────────────────────────────────────────
export const usePharmacyOrders = () =>
  useQuery({
    queryKey: ["pharmacy-orders"],
    queryFn: async () => (await api.get("/pharmacy/orders")).data,
    staleTime: 15_000,
    refetchInterval: 20_000,
  });

export const useMarkReady = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.put(`/pharmacy/orders/${id}/ready`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pharmacy-orders"] });
      qc.invalidateQueries({ queryKey: ["pharmacy-orders-sidebar"] });
    },
  });
};

export const useMarkDispensed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.put(`/pharmacy/orders/${id}/dispensed`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pharmacy-orders"] });
      qc.invalidateQueries({ queryKey: ["pharmacy-orders-sidebar"] });
    },
  });
};

// ─── Pharmacy Dashboard ────────────────────────────────────────────────────────
export default function PharmacyDashboard() {
  const { data: orders = [], isLoading } = usePharmacyOrders();
  const markReady = useMarkReady();
  const markDispensed = useMarkDispensed();

  const pending   = orders.filter((o: any) => o.status === "pending");
  const ready     = orders.filter((o: any) => o.status === "ready");
  const dispensed = orders.filter((o: any) => o.status === "dispensed");

  const todayDispensed = dispensed.filter((o: any) => {
    const d = new Date(o.dispensed_at || o.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const stats = [
    { label: "Pending Orders",    value: pending.length,   icon: Clock,       color: "text-amber-400",   bg: "border-amber-500/30  bg-amber-500/10"  },
    { label: "Ready to Dispense", value: ready.length,     icon: CheckCircle, color: "text-emerald-400", bg: "border-emerald-500/30 bg-emerald-500/10"},
    { label: "Dispensed Today",   value: todayDispensed,   icon: Package,     color: "text-blue-400",    bg: "border-blue-500/30   bg-blue-500/10"   },
    { label: "Total All Time",    value: orders.length,    icon: TrendingUp,  color: "text-purple-400",  bg: "border-purple-500/30 bg-purple-500/10" },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-emerald-400" /> Pharmacy Dashboard
          </h1>
          <p className="text-[#D1D5DB]">Live prescription order queue — auto-refreshes every 20s</p>
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-xl animate-pulse">
            <Bell className="h-5 w-5 text-amber-400" />
            <span className="text-amber-300 font-bold">{pending.length} order{pending.length > 1 ? "s" : ""} need attention</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className={`border ${s.bg} backdrop-blur-sm`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[#D1D5DB] text-sm">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`h-9 w-9 ${s.color} opacity-50`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Orders — Priority Queue */}
      <Card className="border-amber-500/30 bg-amber-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            Pending Orders — Action Required
            {pending.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-bold">{pending.length}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 bg-[#1e2d4d] rounded-xl" />)}</div>
          ) : pending.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-[#D1D5DB]">All caught up! No pending orders.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((o: any) => (
                <OrderCard key={o.id} order={o} onMarkReady={() => markReady.mutate(o.id)} isPending={markReady.isPending} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ready Orders */}
      {ready.length > 0 && (
        <Card className="border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              Ready — Waiting for Patient Pickup
              <span className="ml-2 px-2 py-0.5 bg-emerald-600 text-white rounded-full text-xs font-bold">{ready.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ready.map((o: any) => (
                <OrderCard key={o.id} order={o} onMarkDispensed={() => markDispensed.mutate(o.id)} isPending={markDispensed.isPending} variant="ready" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Dispensed */}
      {dispensed.length > 0 && (
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-400" /> Recently Dispensed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dispensed.slice(0, 5).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-[#051650]/30">
                  <div>
                    <p className="text-white font-medium">{o.patient_name || "Unknown"}</p>
                    <p className="text-[#D1D5DB] text-sm">{o.medicines?.length || 0} medicine{o.medicines?.length !== 1 ? "s" : ""} · Dr. {o.doctor_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">Dispensed</span>
                    <p className="text-[#9CA3AF] text-xs mt-1">{formatDistanceToNow(new Date(o.ready_at || o.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Order Card Component ──────────────────────────────────────────────────────
function OrderCard({
  order, onMarkReady, onMarkDispensed, isPending, variant = "pending",
}: {
  order: any;
  onMarkReady?: () => void;
  onMarkDispensed?: () => void;
  isPending?: boolean;
  variant?: "pending" | "ready";
}) {
  return (
    <div className={`p-4 rounded-xl border transition-colors ${
      variant === "pending"
        ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
        : "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
    }`}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#D1D5DB]" />
            <p className="text-white font-semibold">{order.patient_name || "Unknown Patient"}</p>
          </div>
          <p className="text-[#D1D5DB] text-sm mt-0.5">Prescribed by Dr. {order.doctor_name} · {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          variant === "pending" ? "bg-amber-500/30 text-amber-300" : "bg-emerald-500/30 text-emerald-300"
        }`}>
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* Medicines List */}
      {order.medicines && order.medicines.length > 0 && (
        <div className="mb-3 space-y-1.5 pl-2 border-l-2 border-[#2D2755]">
          {order.medicines.map((m: any, i: number) => (
            <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
              <Pill className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-white font-medium">{m.medicine_name}</span>
              {m.dosage && <span className="text-[#D1D5DB]">{m.dosage}</span>}
              {m.frequency && <span className="text-[#9CA3AF]">· {m.frequency}</span>}
              {m.duration && <span className="text-[#9CA3AF]">· {m.duration}</span>}
              {m.instructions && <span className="text-amber-300/70 text-xs">({m.instructions})</span>}
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      <div className="flex gap-2 mt-2">
        {variant === "pending" && onMarkReady && (
          <button
            onClick={onMarkReady}
            disabled={isPending}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {isPending ? "Updating..." : "Mark as Ready"}
          </button>
        )}
        {variant === "ready" && onMarkDispensed && (
          <button
            onClick={onMarkDispensed}
            disabled={isPending}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            {isPending ? "Updating..." : "Mark as Dispensed"}
          </button>
        )}
      </div>
    </div>
  );
}
