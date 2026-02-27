"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type WardStatus = {
  id: number;
  ward: string;
  totalBeds: number;
  occupied: number;
};

const wards: WardStatus[] = [
  { id: 1, ward: "ICU", totalBeds: 20, occupied: 15 },
  { id: 2, ward: "General Ward", totalBeds: 50, occupied: 32 },
  { id: 3, ward: "Maternity", totalBeds: 30, occupied: 18 },
];

export default function BedStatusDashboard() {
  const totalBeds = wards.reduce((a, b) => a + b.totalBeds, 0);
  const occupiedBeds = wards.reduce((a, b) => a + b.occupied, 0);
  const availableBeds = totalBeds - occupiedBeds;

   const pieData = [
    { name: "Occupied", value: occupiedBeds },
    { name: "Available", value: totalBeds - occupiedBeds },
  ];

  return (
    <section className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Total Beds" value={totalBeds} color="blue" />
        <SummaryCard title="Occupied Beds" value={occupiedBeds} color="red" />
        <SummaryCard title="Available Beds" value={availableBeds} color="green" />
      </div>

       <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">
            Overall Utilization
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill="#ef4444" />
                <Cell fill="#22c55e" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex justify-center gap-4 mt-2 text-sm">
            <LegendDot color="red" label="Occupied" />
            <LegendDot color="green" label="Available" />
          </div>
        </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold text-gray-700">
          🏥 Bed Status by Ward
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <Th>S.No</Th>
                <Th>Ward</Th>
                <Th>Total Beds</Th>
                <Th>Occupied</Th>
                <Th>Available</Th>
                <Th>Utilization</Th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {wards.map((ward, index) => {
                const available = ward.totalBeds - ward.occupied;
                const percent = Math.round(
                  (ward.occupied / ward.totalBeds) * 100
                );

                return (
                  <tr
                    key={ward.id}
                    className="hover:bg-blue-50 transition"
                  >
                    <Td>{index + 1}</Td>
                    <Td className="font-medium">{ward.ward}</Td>
                    <Td>{ward.totalBeds}</Td>
                    <Td className="text-red-600 font-semibold">
                      {ward.occupied}
                    </Td>
                    <Td
                      className={`font-semibold ${
                        available === 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {available}
                    </Td>
                    <Td className="w-48">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              percent > 80
                                ? "bg-red-500"
                                : percent > 50
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {percent}%
                        </span>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
         
      </div>
    </section>
  );
}

/* ---------- Small Reusable Components ---------- */

function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "blue" | "red" | "green";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    green: "bg-green-50 text-green-700",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left font-semibold text-gray-700">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function LegendDot({
  color,
  label,
}: {
  color: "red" | "green";
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-3 h-3 rounded-full ${
          color === "red" ? "bg-red-500" : "bg-green-500"
        }`}
      />
      {label}
    </div>
  );
}
