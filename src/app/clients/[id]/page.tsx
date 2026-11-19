"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { formatINR, formatDate } from "../../../lib/utils";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import { IClientData, IProjectData, IPaymentData } from "../../../types";
import {
  Briefcase,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Trash2,
} from "lucide-react";

interface ClientDetailData {
  client: IClientData;
  projects: IProjectData[];
  payments: IPaymentData[];
  financials: {
    totalProjectValue: number;
    amountReceived: number;
    outstandingBalance: number;
  };
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [data, setData] = useState<ClientDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/clients/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const handleDeleteClient = async () => {
    if (!data?.client) return;
    if (!confirm(`Are you sure you want to delete client "${data.client.name}"?`)) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/clients";
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-[#E5E7E2]/60 rounded-md animate-pulse" />
        <div className="h-10 w-96 bg-[#E5E7E2]/60 rounded-md animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white border border-[#E5E7E2] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { client, projects, payments, financials } = data;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs */}
      <div className="space-y-2">
        <nav className="flex items-center gap-1.5 text-xs text-[#747970]">
          <Link href="/clients" className="hover:text-[#20231F] flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            <span>Clients</span>
          </Link>
          <span>/</span>
          <span className="text-[#20231F] font-medium">{client.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#20231F] tracking-tight">
              {client.name}
            </h1>
            {client.company && (
              <p className="text-xs sm:text-sm text-[#747970] mt-0.5">{client.company}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteClient}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[#E5E7E2] text-[#B94B45] hover:bg-[#B94B45]/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Client</span>
            </button>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-[#426B50] text-white hover:bg-[#34573F] transition-colors"
            >
              <span>Assign New Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Financial Ledger Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <span className="text-[11px] font-medium text-[#747970] block">TOTAL ENGAGEMENT VALUE</span>
          <div className="text-xl font-semibold text-[#20231F] mt-0.5">
            {formatINR(financials.totalProjectValue)}
          </div>
          <span className="text-[11px] text-[#747970] mt-1 block">
            Across {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <span className="text-[11px] font-medium text-[#747970] block">SETTLED PAYMENTS</span>
          <div className="text-xl font-semibold text-[#3F7954] mt-0.5">
            {formatINR(financials.amountReceived)}
          </div>
          <span className="text-[11px] text-[#3F7954] mt-1 block">Successfully credited</span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <span className="text-[11px] font-medium text-[#747970] block">OUTSTANDING RECEIVABLE</span>
          <div className="text-xl font-semibold text-[#B78035] mt-0.5">
            {formatINR(financials.outstandingBalance)}
          </div>
          <span className="text-[11px] text-[#B78035] mt-1 block">Due upon milestones</span>
        </div>
      </div>

      {/* Two Column Layout: Details & Associated Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client Profile Info */}
        <div className="space-y-6">
          <div className="p-5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-[#20231F]">Contact Information</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#92978F] mt-0.5" />
                <div>
                  <span className="text-[11px] text-[#92978F] block">EMAIL</span>
                  <a href={`mailto:${client.email}`} className="text-[#426B50] font-medium hover:underline">
                    {client.email}
                  </a>
                </div>
              </div>

              {client.phone && (
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#92978F] mt-0.5" />
                  <div>
                    <span className="text-[11px] text-[#92978F] block">PHONE</span>
                    <span className="text-[#20231F] font-medium">{client.phone}</span>
                  </div>
                </div>
              )}

              {client.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#92978F] mt-0.5" />
                  <div>
                    <span className="text-[11px] text-[#92978F] block">OFFICE ADDRESS</span>
                    <span className="text-[#747970]">{client.address}</span>
                  </div>
                </div>
              )}
            </div>

            {client.notes && (
              <div className="pt-3 border-t border-[#E5E7E2]">
                <span className="text-[11px] text-[#92978F] block mb-1">CLIENT NOTES</span>
                <p className="text-xs text-[#747970] leading-relaxed bg-[#F7F7F4] p-3 rounded border border-[#E5E7E2]">
                  {client.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Associated Projects & Payments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects */}
          <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-[#E5E7E2] bg-[#F7F7F4]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#426B50]" />
                <h3 className="text-sm font-semibold text-[#20231F]">
                  Associated Projects ({projects.length})
                </h3>
              </div>
            </div>

            {projects.length > 0 ? (
              <div className="divide-y divide-[#E5E7E2]">
                {projects.map((p) => (
                  <div
                    key={p._id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-[#F7F7F4]/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projects/${p._id}`}
                          className="font-semibold text-sm text-[#20231F] hover:text-[#426B50] transition-colors"
                        >
                          {p.title}
                        </Link>
                        <StatusBadge status={p.status} />
                      </div>
                      <span className="text-xs text-[#747970] mt-0.5 block">
                        Budget: {formatINR(p.budget)} • Deadline: {formatDate(p.deadline)}
                      </span>
                    </div>

                    <Link
                      href={`/projects/${p._id}`}
                      className="p-1 rounded text-[#747970] hover:text-[#426B50] hover:bg-[#F1F2EE] transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#747970]">
                No projects assigned to this client yet.
              </div>
            )}
          </div>

          {/* Payments History */}
          <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-[#E5E7E2] bg-[#F7F7F4]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#426B50]" />
                <h3 className="text-sm font-semibold text-[#20231F]">
                  Payment History ({payments.length})
                </h3>
              </div>
            </div>

            {payments.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F7F4]/60 text-[#747970] font-medium border-b border-[#E5E7E2]">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Reference</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7E2]">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-[#F7F7F4]/40 transition-colors">
                      <td className="py-2.5 px-4 text-[#747970]">{formatDate(p.paymentDate)}</td>
                      <td className="py-2.5 px-4 text-[#747970]">{p.method}</td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#747970]">
                        {p.reference || "—"}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#20231F]">
                        {formatINR(p.amount)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-[#747970]">
                No payment transactions recorded for this client.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
