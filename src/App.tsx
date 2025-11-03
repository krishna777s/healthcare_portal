import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import Dashboard from "./pages/Dashboard";
import Entities from "./pages/Entities";
import Departments from "./pages/Departments";
import Staff from "./pages/Staff";
import Patients from "./pages/Patients";
import Diagnostics from "./pages/Diagnostics";
import Collaborations from "./pages/Collaborations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen w-full flex bg-background">
          <Sidebar />
          <div className="flex-1 lg:ml-64">
            <Header />
            <main className="min-h-[calc(100vh-4rem)]">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/entities" element={<Entities />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/diagnostics" element={<Diagnostics />} />
                <Route path="/collaborations" element={<Collaborations />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
