import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, UserCircle, FlaskConical, Stethoscope, BedDouble, Activity } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { useAdminStats, useAdminChartData, useDepartments } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

const DEPT_COLORS = [
  "hsl(228, 100%, 56%)", "hsl(190, 100%, 50%)", "hsl(280, 80%, 60%)",
  "hsl(40, 100%, 60%)", "hsl(160, 70%, 50%)", "hsl(350, 80%, 60%)",
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: chartData = [], isLoading: chartLoading } = useAdminChartData();
  const { data: departments = [] } = useDepartments();

  const statsCards = stats
    ? [
        { title: "Departments", value: String(stats.total_departments), icon: Stethoscope, trend: { value: "Live", isPositive: true } },
        { title: "Doctors & Staff", value: String(stats.total_doctors + stats.total_staff), icon: Users, trend: { value: "Live", isPositive: true } },
        { title: "Active Patients", value: String(stats.total_patients), icon: UserCircle, trend: { value: "Live", isPositive: true } },
        { title: "Outpatients", value: String(stats.total_outpatients ?? 0), icon: UserCircle, trend: { value: "Live", isPositive: true } },
        { title: "Lab Reports", value: String(stats.total_lab_reports), icon: FlaskConical, trend: { value: "Live", isPositive: true } },
        { title: "Inpatients", value: String(stats.total_inpatients), icon: BedDouble, trend: { value: "Live", isPositive: true } },
        { title: "ICU Patients", value: String(stats.total_icu), icon: Activity, trend: { value: "Live", isPositive: stats.total_icu === 0 } },
      ]
    : [];

  // Build pie data from real departments
  const pieChartData = departments.slice(0, 6).map((dept: any, i: number) => ({
    name: dept.name,
    value: dept.doctor_count || 1,
    color: DEPT_COLORS[i % DEPT_COLORS.length],
  }));

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Hospital Dashboard</h1>
        <p className="text-[#D1D5DB]">Live overview from the database</p>
      </div>

      {/* Stats Cards — 4 per row, wraps to 2 rows */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-[88px] rounded-xl bg-[#1e2d4d] animate-pulse" />
            ))
          : statsCards.map((stat, index) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
      </div>


      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Patient & Staff Trends (This Year)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-[300px] bg-[#1e2d4d] rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 30%, 20%)" />
                  <XAxis dataKey="month" stroke="hsl(228, 10%, 70%)" />
                  <YAxis stroke="hsl(228, 10%, 70%)" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(228, 44%, 16%)", border: "1px solid hsl(228, 30%, 20%)", borderRadius: "8px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="patients" stroke="hsl(228, 100%, 56%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="staff" stroke="hsl(190, 100%, 50%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Department Distribution (Doctors)</CardTitle>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-[#D1D5DB]">No department data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100} dataKey="value">
                    {pieChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(228, 44%, 16%)", border: "1px solid hsl(228, 30%, 20%)", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Area Chart */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Monthly Patient Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(228, 100%, 56%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(228, 100%, 56%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 30%, 20%)" />
              <XAxis dataKey="month" stroke="hsl(228, 10%, 70%)" />
              <YAxis stroke="hsl(228, 10%, 70%)" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(228, 44%, 16%)", border: "1px solid hsl(228, 30%, 20%)", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="patients" stroke="hsl(228, 100%, 56%)" fillOpacity={1} fill="url(#colorPatients)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Patient type breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Outpatients", count: stats.total_outpatients, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
            { label: "Inpatients (Admitted)", count: stats.total_inpatients, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
            { label: "ICU", count: stats.total_icu, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
          ].map((item) => (
            <Card key={item.label} className={`border ${item.bg} backdrop-blur-sm`}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-[#D1D5DB] text-sm">{item.label}</p>
                  <p className={`text-3xl font-bold ${item.color}`}>{item.count}</p>
                </div>
                <UserCircle className={`h-10 w-10 ${item.color} opacity-50`} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
