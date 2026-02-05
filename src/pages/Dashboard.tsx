import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, UserCircle, FlaskConical, Stethoscope } from "lucide-react";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const statsData = [
  { title: "Departments", value: "12", icon: Stethoscope, trend: { value: "8%", isPositive: true } },
  { title: "Doctors & Staff", value: "248", icon: Users, trend: { value: "15%", isPositive: true } },
  { title: "Active Patients", value: "1,456", icon: UserCircle, trend: { value: "23%", isPositive: true } },
  { title: "Lab Reports", value: "892", icon: FlaskConical, trend: { value: "5%", isPositive: false } },
];

const lineChartData = [
  { month: "Jan", patients: 4000, staff: 2400 },
  { month: "Feb", patients: 3000, staff: 1398 },
  { month: "Mar", patients: 5000, staff: 2800 },
  { month: "Apr", patients: 4780, staff: 3908 },
  { month: "May", patients: 5890, staff: 4800 },
  { month: "Jun", patients: 6390, staff: 3800 },
];

const pieChartData = [
  { name: "Oncology", value: 35, color: "hsl(228, 100%, 56%)" },
  { name: "Radiology", value: 25, color: "hsl(190, 100%, 50%)" },
  { name: "Pathology", value: 20, color: "hsl(280, 80%, 60%)" },
  { name: "Cardiology", value: 15, color: "hsl(40, 100%, 60%)" },
  { name: "Others", value: 5, color: "hsl(160, 70%, 50%)" },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 animate-fade-in bg-[#131e3a] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Hospital Dashboard</h1>
        <p className="text-[#D1D5DB]">Manage your hospital's departments, staff, and patients</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div key={stat.title} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Patient & Staff Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 30%, 20%)" />
                <XAxis dataKey="month" stroke="hsl(228, 10%, 70%)" />
                <YAxis stroke="hsl(228, 10%, 70%)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(228, 44%, 16%)", 
                    border: "1px solid hsl(228, 30%, 20%)",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="patients" stroke="hsl(228, 100%, 56%)" strokeWidth={2} />
                <Line type="monotone" dataKey="staff" stroke="hsl(190, 100%, 50%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(228, 44%, 16%)", 
                    border: "1px solid hsl(228, 30%, 20%)",
                    borderRadius: "8px"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Area Chart */}
      <Card className="border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Monthly Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={lineChartData}>
              <defs>
                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(228, 100%, 56%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(228, 100%, 56%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 30%, 20%)" />
              <XAxis dataKey="month" stroke="hsl(228, 10%, 70%)" />
              <YAxis stroke="hsl(228, 10%, 70%)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(228, 44%, 16%)", 
                  border: "1px solid hsl(228, 30%, 20%)",
                  borderRadius: "8px"
                }} 
              />
              <Area type="monotone" dataKey="patients" stroke="hsl(228, 100%, 56%)" fillOpacity={1} fill="url(#colorPatients)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
