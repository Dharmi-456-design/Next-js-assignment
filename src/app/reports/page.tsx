"use client";

import React, { useEffect, useState } from "react";
import { formatINR } from "../../lib/utils";
import { PageHeader } from "../../components/shared/PageHeader";
import { IClientData } from "../../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
} from "lucide-react";

interface ReportsData {
  summary: {
    totalRevenue: number;
    totalBudget: number;
    overallCompletionRate: number;
    activeProjectsCount: number;
  };
  monthlyRevenue: { month: string; amount: number }[];
  clientEarnings: { name: string; earned: number; outstanding: number }[];
  statusDistribution: { name: string; value: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  Planning: "#587B91",
  "In Progress": "#426B50",
  "On Hold": "#B78035",
  Completed: "#3F7954",
  Cancelled: "#B94B45",
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [clients, setClients] = useState<IClientData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [clientFilter, setClientFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/reports", window.location.origin);
      if (clientFilter !== "All") url.searchParams.set("clientId", clientFilter);
      if (statusFilter !== "All") url.searchParams.set("status", statusFilter);

      const [rRes, cRes] = await Promise.all([
        fetch(url.toString()),
        fetch("/api/clients"),
      ]);

      if (rRes.ok) {
        const json = await rRes.json();
        setData(json);
      }
      if (cRes.ok) {
        const cJson = await cRes.json();
        setClients(cJson);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientFilter, statusFilter]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-[#E5E7E2]/60 rounded-md animate-pulse" />
        <div className="h-10 w-96 bg-[#E5E7E2]/60 rounded-md animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white border border-[#E5E7E2] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { summary, monthlyRevenue, clientEarnings, statusDistribution } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Studio revenue trends, client-wise earnings distribution, and delivery velocity."
      />

      {/* Filters Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-[#E5E7E2] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[#20231F]">Performance Filters</span>
        <div className="flex items-center gap-2">
          {(clientFilter !== "All" || statusFilter !== "All") && (
            <button
              onClick={() => {
                setClientFilter("All");
                setStatusFilter("All");
              }}
              className="px-2 py-1 text-xs text-[#747970] hover:text-[#20231F] underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#E5E7E2] rounded-md text-[#20231F] cursor-pointer"
          >
            <option value="All">All Clients</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.company ? `${c.name} (${c.company})` : c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#E5E7E2] rounded-md text-[#20231F] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Planning">Planning</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <span className="text-[11px] font-medium text-[#747970] block">TOTAL RECEIVED REVENUE</span>
          <div className="text-xl sm:text-2xl font-semibold text-[#3F7954] mt-0.5">
            {formatINR(summary.totalRevenue)}
          </div>
          <p className="text-[11px] text-[#747970] mt-1">Confirmed bank credits</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <span className="text-[11px] font-medium text-[#747970] block">TOTAL CONTRACT PIPELINE</span>
          <div className="text-xl sm:text-2xl font-semibold text-[#20231F] mt-0.5">
            {formatINR(summary.totalBudget)}
          </div>
          <p className="text-[11px] text-[#747970] mt-1">Total value across active projects</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <span className="text-[11px] font-medium text-[#747970] block">ACTIVE PROJECT COUNT</span>
          <div className="text-xl sm:text-2xl font-semibold text-[#426B50] mt-0.5">
            {summary.activeProjectsCount}
          </div>
          <p className="text-[11px] text-[#747970] mt-1">Engagements currently in progress</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <span className="text-[11px] font-medium text-[#747970] block">TASK COMPLETION RATE</span>
          <div className="text-xl sm:text-2xl font-semibold text-[#20231F] mt-0.5">
            {summary.overallCompletionRate}%
          </div>
          <p className="text-[11px] text-[#747970] mt-1">Across all milestone tasks</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend (2/3) */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#20231F]">Monthly Revenue Velocity</h3>
              <p className="text-xs text-[#747970] mt-0.5">Cleared invoices over the past 12 months</p>
            </div>
            <span className="text-xs font-semibold text-[#426B50]">
              {formatINR(summary.totalRevenue)} Total
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F2EE" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#92978F"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7E2" }}
                />
                <YAxis
                  stroke="#92978F"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7E2" }}
                  tickFormatter={(val) => (val === 0 ? "₹0" : `₹${Math.round(val / 1000)}k`)}
                />
                <Tooltip
                  formatter={(val: any) => [formatINR(val), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E7E2",
                    borderRadius: "6px",
                    fontSize: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                />
                <Bar dataKey="amount" fill="#426B50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Distribution (1/3) */}
        <div className="p-5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#20231F]">Project Status Breakdown</h3>
            <p className="text-xs text-[#747970] mt-0.5">Distribution across project stages</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {statusDistribution.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || "#92978F"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} projects`, name]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E7E2",
                    borderRadius: "6px",
                    fontSize: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#E5E7E2]">
            {statusDistribution.map((item: any) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[item.name] || "#92978F" }}
                />
                <span className="text-[#747970]">{item.name}:</span>
                <span className="font-semibold text-[#20231F]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client-wise Earnings Breakdown Table */}
      <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E5E7E2] bg-[#F7F7F4]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#426B50]" />
            <h3 className="text-sm font-semibold text-[#20231F]">
              Client-wise Earnings & Receivables
            </h3>
          </div>
        </div>

        {clientEarnings && clientEarnings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F4]/60 text-[#747970] font-medium border-b border-[#E5E7E2]">
              <tr>
                <th className="py-2.5 px-4">Client Account</th>
                <th className="py-2.5 px-4">Realized Earnings (₹)</th>
                <th className="py-2.5 px-4">Outstanding Receivable (₹)</th>
                <th className="py-2.5 px-4 text-right">Revenue Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E2]">
              {clientEarnings.map((c: any, idx: number) => {
                const totalRev = summary.totalRevenue || 1;
                const sharePercent = Math.round((c.earned / totalRev) * 100);

                return (
                  <tr key={idx} className="hover:bg-[#F7F7F4]/40 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-[#20231F]">{c.name}</td>
                    <td className="py-2.5 px-4 font-medium text-[#3F7954]">{formatINR(c.earned)}</td>
                    <td className="py-2.5 px-4 font-medium text-[#B78035]">{formatINR(c.outstanding)}</td>
                    <td className="py-2.5 px-4 text-right font-medium text-[#747970]">
                      {sharePercent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#F7F7F4]/90 font-medium text-xs border-t border-[#E5E7E2]">
              <tr>
                <td className="py-2.5 px-4 font-semibold text-[#20231F]">
                  Total ({clientEarnings.length} clients)
                </td>
                <td className="py-2.5 px-4 font-bold text-[#3F7954]">
                  {formatINR(clientEarnings.reduce((acc: number, c: any) => acc + (c.earned || 0), 0))}
                </td>
                <td className="py-2.5 px-4 font-bold text-[#B78035]">
                  {formatINR(clientEarnings.reduce((acc: number, c: any) => acc + (c.outstanding || 0), 0))}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-[#20231F]">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#747970]">
            No client financial data recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
