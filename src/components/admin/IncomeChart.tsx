"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Trophy } from "lucide-react";

interface ChartDataPoint {
  month: string;
  key: string;
  ingresos: number;
}

interface IncomeData {
  chartData: ChartDataPoint[];
  totalRevenue: number;
  currentMonth: number;
  previousMonth: number;
  monthlyGrowth: number;
  bestMonth: { month: string; ingresos: number } | null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-900">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function IncomeChart() {
  const [data, setData] = useState<IncomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ingresos");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-48 rounded bg-gray-100" />
          <div className="h-4 w-32 rounded bg-gray-100" />
          <div className="h-48 rounded-xl bg-gray-50" />
        </div>
      </div>
    );
  }

  if (!data || data.chartData.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <DollarSign className="h-10 w-10 mb-3" />
          <p className="text-sm font-medium">Sin datos de ingresos</p>
          <p className="text-xs mt-1">
            Los ingresos aparecerán cuando haya alquileres completados
          </p>
        </div>
      </div>
    );
  }

  const maxIncome = Math.max(...data.chartData.map((d) => d.ingresos), 1);
  const growthColor =
    data.monthlyGrowth > 0
      ? "text-green-600"
      : data.monthlyGrowth < 0
        ? "text-red-600"
        : "text-gray-500";
  const GrowthIcon =
    data.monthlyGrowth > 0
      ? TrendingUp
      : data.monthlyGrowth < 0
        ? TrendingDown
        : TrendingUp;

  // Calculate Y-axis max for nice round number
  const yAxisMax = Math.ceil(maxIncome / 1000) * 1000 * 1.2;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-playfair text-lg font-semibold text-gray-900">
              Ingresos Mensuales
            </h2>
            <span className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {year}
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.totalRevenue)}
            </p>
            <div className={`flex items-center gap-1 text-xs font-semibold ${growthColor}`}>
              <GrowthIcon className="h-3.5 w-3.5" />
              <span>
                {data.monthlyGrowth > 0 ? "+" : ""}
                {data.monthlyGrowth}% vs mes ant.
              </span>
            </div>
          </div>
        </div>

        {/* Best month badge */}
        {data.bestMonth && data.bestMonth.ingresos > 0 && (
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-[10px] text-amber-600 font-medium">
                Mejor mes
              </p>
              <p className="text-xs font-bold text-amber-800">
                {data.bestMonth.month} · {formatCurrency(data.bestMonth.ingresos)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.chartData}
            margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
                <stop offset="50%" stopColor="#EC4899" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              domain={[0, yAxisMax]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="ingresos"
              fill="url(#incomeGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly summary */}
      <div className="mt-5 grid grid-cols-4 gap-3 border-t border-gray-100 pt-4">
        {data.chartData
          .slice(-4)
          .reverse()
          .map((item) => (
            <div key={item.key} className="text-center">
              <p className="text-[10px] font-medium text-gray-400">
                {item.month}
              </p>
              <p className="mt-0.5 text-xs font-bold text-gray-700 truncate">
                {formatCurrency(item.ingresos)}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
