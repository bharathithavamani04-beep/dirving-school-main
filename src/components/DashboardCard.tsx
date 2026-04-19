"use client";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: "pink" | "blue" | "green" | "purple";
}

export function DashboardCard({
  title,
  value,
  icon,
  color = "pink",
}: DashboardCardProps) {
  const colorClasses = {
    pink: "bg-gradient-to-br from-[#E91E63] to-[#C2185B]",
    blue: "bg-gradient-to-br from-blue-500 to-blue-700",
    green: "bg-gradient-to-br from-green-500 to-green-700",
    purple: "bg-gradient-to-br from-purple-500 to-purple-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-700 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className={`${colorClasses[color]} rounded-lg p-4 text-white`}>
            <span className="text-3xl">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
