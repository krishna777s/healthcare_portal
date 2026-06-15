import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, CheckCircle, Clock, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const usePharmacyOrders = () =>
  useQuery({
    queryKey: ["pharmacy-orders"],
    queryFn: async () => (await api.get("/pharmacy/orders")).data,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

const useMarkReady = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.put(`/pharmacy/orders/${id}/ready`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pharmacy-orders"] }),
  });
};

const useMarkDispensed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.put(`/pharmacy/orders/${id}/dispensed`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pharmacy-orders"] }),
  });
};

const statusStyle: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  ready: "bg-green-500/20 text-green-400",
  dispensed: "bg-blue-500/20 text-blue-400",
};

export default function Pharmacy() {
  const { data: orders = [], isLoading } = usePharmacyOrders();
  const markReady = useMarkReady();
  const markDispensed = useMarkDispensed();
  const [filter, setFilter] = useState<"all" | "pending" | "ready" | "dispensed">("all");

  const filtered = filter === "all" ? orders : orders.filter((o: any) => o.status === filter);

  const pendingCount = orders.filter((o: any) => o.status === "pending").length;
  const readyCount = orders.filter((o: any) => o.status === "ready").length;
  const dispensedCount = orders.filter((o: any) => o.status === "dispensed").length;

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-[#4F83FF]" /> Pharmacy Orders
        </h1>
        <p className="text-[#D1D5DB]">Prescription-based medicine orders — auto-refreshes every 30s</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Pending", count: pendingCount, color: "text-yellow-400", bg: "border-yellow-500/30 bg-yellow-500/10", icon: Clock },
          { label: "Ready for Patient", count: readyCount, color: "text-green-400", bg: "border-green-500/30 bg-green-500/10", icon: CheckCircle },
          { label: "Dispensed", count: dispensedCount, color: "text-blue-400", bg: "border-blue-500/30 bg-blue-500/10", icon: Package },
        ].map((s) => (
          <Card key={s.label} className={`border ${s.bg}`}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[#D1D5DB] text-sm">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
              </div>
              <s.icon className={`h-10 w-10 ${s.color} opacity-50`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["all", "pending", "ready", "dispensed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-primary text-white" : "bg-[#051650]/30 text-[#D1D5DB] hover:bg-[#051650]/50"
            }`}
          >
            {f} {f !== "all" && `(${orders.filter((o: any) => o.status === f).length})`}
          </button>
        ))}
      </div>

      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Orders ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 bg-[#1e2d4d] rounded-lg" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-10 text-[#D1D5DB]">No orders in this category.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((o: any) => (
                <div key={o.id} className="p-4 rounded-xl bg-[#051650]/20 border border-[#2D2755] hover:bg-[#051650]/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">{o.patient_name || "Unknown Patient"}</p>
                      <p className="text-[#D1D5DB] text-sm">Dr. {o.doctor_name} · {new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusStyle[o.status]}`}>
                      {o.status}
                    </span>
                  </div>
                  {o.medicines && o.medicines.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {o.medicines.map((m: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <span className="w-2 h-2 rounded-full bg-[#4F83FF] flex-shrink-0" />
                          <span className="text-white">{m.medicine_name}</span>
                          {m.dosage && <span className="text-[#D1D5DB]">{m.dosage}</span>}
                          {m.frequency && <span className="text-[#9CA3AF]">· {m.frequency}</span>}
                          {m.duration && <span className="text-[#9CA3AF]">· {m.duration}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {o.status === "pending" && (
                      <button
                        onClick={() => markReady.mutate(o.id)}
                        disabled={markReady.isPending}
                        className="px-4 py-1.5 text-sm bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors font-medium"
                      >
                        Mark as Ready
                      </button>
                    )}
                    {o.status === "ready" && (
                      <button
                        onClick={() => markDispensed.mutate(o.id)}
                        disabled={markDispensed.isPending}
                        className="px-4 py-1.5 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors font-medium"
                      >
                        Mark as Dispensed
                      </button>
                    )}
                    {o.status === "dispensed" && (
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle className="h-4 w-4" /> Dispensed
                        {o.ready_at && <span className="text-[#D1D5DB]">· Ready at {new Date(o.ready_at).toLocaleTimeString()}</span>}
                      </div>
                    )}
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
