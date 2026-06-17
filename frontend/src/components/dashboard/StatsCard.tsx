import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatsCard = ({ title, value, icon: Icon, trend, className }: StatsCardProps) => {
  return (
    <Card className={cn(
      "relative overflow-hidden border-[#2D2755] bg-[#051650]/10 backdrop-blur-sm",
      "hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:scale-105",
      "h-[88px]", // fixed height so all cards are same size
      className
    )}>
      <CardContent className="p-4 h-full flex items-center">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-[#D1D5DB] leading-tight truncate">{title}</p>
            <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
