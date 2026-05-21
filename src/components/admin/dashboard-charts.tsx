"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const GOLD = "#D4A744";
const NAVY_700 = "#1B2F4E";
const CREAM_300 = "#C9C2AE";
const SILVER_500 = "#9098A6";

const tooltipStyle = {
  backgroundColor: "#0A1628",
  border: `1px solid ${GOLD}`,
  borderRadius: 8,
  color: "#F5F1E8",
  fontSize: 12,
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#4ADE80",
  DRAFT: SILVER_500,
  PENDING: "#FBBF24",
  SOLD: "#60A5FA",
  RENTED: "#C084FC",
  ARCHIVED: "#475569",
};

const CATEGORY_COLORS = [GOLD, "#E0B85C", "#B8902F", "#8E6E1F"];

interface DailyData {
  gun: string;
  ilan: number;
  uye: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface Props {
  dailyData: DailyData[];
  categoryData: CategoryData[];
  statusData: StatusData[];
}

export function DailyActivityChart({ dailyData }: { dailyData: DailyData[] }) {
  return (
    <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-5">
      <p className="text-xs font-semibold text-silver-300 uppercase tracking-wider mb-4">
        Son 7 Gün — İlan &amp; Üye
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
              <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={NAVY_700} />
          <XAxis dataKey="gun" tick={{ fill: SILVER_500, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: SILVER_500, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: GOLD, strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Area type="monotone" dataKey="ilan" name="İlan" stroke={GOLD} strokeWidth={2} fill="url(#gradGold)" dot={false} />
          <Area type="monotone" dataKey="uye" name="Üye" stroke="#60A5FA" strokeWidth={2} fill="url(#gradBlue)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart({ categoryData }: { categoryData: CategoryData[] }) {
  return (
    <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-5">
      <p className="text-xs font-semibold text-silver-300 uppercase tracking-wider mb-4">
        Kategori Dağılımı (Aktif)
      </p>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={62}
              paddingAngle={3}
              dataKey="value"
            >
              {categoryData.map((_, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <ul className="space-y-2 flex-1">
          {categoryData.map((item, i) => (
            <li key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                />
                <span className="text-cream-300">{item.name}</span>
              </div>
              <span className="text-cream-100 font-medium tabular-nums">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function StatusChart({ statusData }: { statusData: StatusData[] }) {
  return (
    <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-5">
      <p className="text-xs font-semibold text-silver-300 uppercase tracking-wider mb-4">
        Durum Dağılımı
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={statusData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke={NAVY_700} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: SILVER_500, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: SILVER_500, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(212,167,68,0.06)" }} />
          <Bar dataKey="value" name="Sayı" radius={[4, 4, 0, 0]}>
            {statusData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardCharts({ dailyData, categoryData, statusData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
      <div className="lg:col-span-2">
        <DailyActivityChart dailyData={dailyData} />
      </div>
      <CategoryChart categoryData={categoryData} />
      <div className="lg:col-span-3">
        <StatusChart statusData={statusData} />
      </div>
    </div>
  );
}
