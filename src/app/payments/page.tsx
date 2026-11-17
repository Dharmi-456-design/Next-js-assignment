"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { formatINR, formatDate } from "../../lib/utils";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/shared/Button";
import { Dialog } from "../../components/shared/Dialog";
import { Input } from "../../components/shared/Input";
import { Select } from "../../components/shared/Select";
import { PageHeader } from "../../components/shared/PageHeader";
import { EmptyState } from "../../components/shared/EmptyState";
import { IPaymentData, IClientData, IProjectData } from "../../types";
import {
  Search,
  Plus,
  TrendingUp,
  AlertCircle,
  XCircle,
  FileText,
} from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<IPaymentData[]>([]);
  const [summary, setSummary] = useState({
    receivedRevenue: 0,
    pendingRevenue: 0,
    failedRevenue: 0,
    outstandingBalance: 0,
  });
  const [clients, setClients] = useState<IClientData[]>([]);
  const [projects, setProjects] = useState<IProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("All");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    clientId: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    method: "Bank Transfer",
    status: "Successful",
    reference: "",
    notes: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, cRes, pRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/clients"),
        fetch("/api/projects"),
      ]);

      if (payRes.ok) {
        const json = await payRes.json();
        setPayments(json.payments || []);
        if (json.summary) setSummary(json.summary);
      }
      if (cRes.ok) {
        const cJson = await cRes.json();
        setClients(cJson);
        if (cJson.length > 0 && !formData.clientId) {
          setFormData((prev) => ({ ...prev, clientId: cJson[0]._id }));
        }
      }
      if (pRes.ok) {
        const pJson = await pRes.json();
        setProjects(pJson);
        if (pJson.length > 0 && !formData.projectId) {
          setFormData((prev) => ({ ...prev, projectId: pJson[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.clientId || !formData.amount) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          projectId: projects[0]?._id || "",
          clientId: clients[0]?._id || "",
          amount: "",
          paymentDate: new Date().toISOString().split("T")[0],
          method: "Bank Transfer",
          status: "Successful",
          reference: "",
          notes: "",
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.clientId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientId?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectId?.title?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      const matchesMethod = methodFilter === "All" || p.method === methodFilter;
      const matchesClient =
        clientFilter === "All" ||
        p.clientId?._id === clientFilter ||
        p.clientId === clientFilter;

      return matchesSearch && matchesStatus && matchesMethod && matchesClient;
    });
  }, [payments, searchQuery, statusFilter, methodFilter, clientFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Monitor verified revenue, pending installments, and receivables in INR (₹)."
        action={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Record payment
          </Button>
        }
      />

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-[#747970]">Revenue Received</span>
            <span className="w-6 h-6 rounded-md bg-[#3F7954]/10 flex items-center justify-center text-[#3F7954]">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-[#20231F]">
            {formatINR(summary.receivedRevenue)}
          </div>
          <p className="text-[11px] text-[#3F7954] mt-0.5 font-medium">Cleared & verified in bank</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-[#747970]">Pending Invoices</span>
            <span className="w-6 h-6 rounded-md bg-[#B78035]/10 flex items-center justify-center text-[#B78035]">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-[#20231F]">
            {formatINR(summary.pendingRevenue)}
          </div>
          <p className="text-[11px] text-[#B78035] mt-0.5">Awaiting bank settlement</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-[#747970]">Failed / Disputed</span>
            <span className="w-6 h-6 rounded-md bg-[#B94B45]/10 flex items-center justify-center text-[#B94B45]">
              <XCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-[#20231F]">
            {formatINR(summary.failedRevenue)}
          </div>
          <p className="text-[11px] text-[#B94B45] mt-0.5">Declined or requires re-issuance</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-[#747970]">Outstanding Contract Balance</span>
            <span className="w-6 h-6 rounded-md bg-[#426B50]/10 flex items-center justify-center text-[#426B50]">
              <FileText className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-[#20231F]">
            {formatINR(summary.outstandingBalance)}
          </div>
          <p className="text-[11px] text-[#747970] mt-0.5">Remaining across active projects</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-[#E5E7E2] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#92978F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search payments by reference, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F7F4]/60 border border-[#E5E7E2] rounded-md text-[#20231F] placeholder:text-[#92978F] focus:outline-none focus:ring-1 focus:ring-[#426B50] focus:border-[#426B50]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
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
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#E5E7E2] rounded-md text-[#20231F] cursor-pointer"
          >
            <option value="All">All Methods</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white border border-[#E5E7E2] rounded-md animate-pulse" />
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          title="No payments recorded"
          description="Log client transaction receipts and invoice remittances."
          action={
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Record payment
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F4]/70 text-[#747970] font-medium border-b border-[#E5E7E2]">
                <tr>
                  <th className="py-3 px-4">Transaction / Reference</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7E2]">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-[#F7F7F4]/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#20231F] font-mono">
                        {p.reference || "Direct Remittance"}
                      </span>
                      {p.notes && (
                        <p className="text-[11px] text-[#747970] mt-0.5">{p.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#20231F] font-medium">
                      {p.clientId?.company
                        ? `${p.clientId.company}`
                        : p.clientId?.name || "—"}
                    </td>
                    <td className="py-3 px-4 text-[#747970]">
                      {p.projectId?.title ? (
                        <Link
                          href={`/projects/${p.projectId._id}`}
                          className="hover:text-[#426B50] hover:underline"
                        >
                          {p.projectId.title}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#747970]">{formatDate(p.paymentDate)}</td>
                    <td className="py-3 px-4 text-[#747970]">
                      <span className="px-2 py-0.5 rounded bg-[#F1F2EE] text-[11px] font-medium">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#20231F] text-sm">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Payment"
        description="Add a transaction receipt to update client and project balances."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Client"
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            >
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.company ? `${c.name} (${c.company})` : c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Project"
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount (₹ INR)"
              type="number"
              min="0"
              required
              placeholder="e.g. 50000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />

            <Input
              label="Payment Date"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Payment Method"
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI (Google Pay/PhonePe)</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </Select>

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Successful">Successful (Credited)</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </Select>
          </div>

          <Input
            label="Transaction / Reference ID"
            placeholder="e.g. UTR-2026-98104"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          />

          <Input
            label="Internal Notes"
            placeholder="e.g. 50% advance for milestone 1"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7E2]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Record Payment
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
