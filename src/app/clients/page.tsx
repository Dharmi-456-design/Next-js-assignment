"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { formatINR } from "../../lib/utils";
import { Button } from "../../components/shared/Button";
import { Dialog } from "../../components/shared/Dialog";
import { Input } from "../../components/shared/Input";
import { PageHeader } from "../../components/shared/PageHeader";
import { EmptyState } from "../../components/shared/EmptyState";
import { IClientData } from "../../types";
import {
  Search,
  Plus,
  ExternalLink,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<IClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/clients");
      if (res.ok) {
        const json = await res.json();
        setClients(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          address: "",
          notes: "",
        });
        fetchClients();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove client "${name}"?`)) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (res.ok) {
        setClients(clients.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [clients, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Clients"
        description="Directory of company accounts, contract values, and payment ledgers."
        action={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add client
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-[#E5E7E2] shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-[#92978F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search clients by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F7F4]/60 border border-[#E5E7E2] rounded-md text-[#20231F] placeholder:text-[#92978F] focus:outline-none focus:ring-1 focus:ring-[#426B50] focus:border-[#426B50]"
          />
        </div>

        <span className="text-xs text-[#747970] shrink-0 font-medium">
          {filteredClients.length} {filteredClients.length === 1 ? "Client" : "Clients"}
        </span>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white border border-[#E5E7E2] rounded-md animate-pulse" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="Add your first client to start creating associated projects and invoices."
          action={
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add client
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F4]/70 text-[#747970] font-medium border-b border-[#E5E7E2]">
                <tr>
                  <th className="py-3 px-4">Client Name & Company</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Projects</th>
                  <th className="py-3 px-4">Total Contract Value</th>
                  <th className="py-3 px-4">Received</th>
                  <th className="py-3 px-4">Outstanding</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7E2]">
                {filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-[#F7F7F4]/50 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/clients/${client._id}`}
                        className="font-semibold text-[#20231F] hover:text-[#426B50] transition-colors block"
                      >
                        {client.name}
                      </Link>
                      {client.company && (
                        <span className="text-[11px] text-[#747970]">{client.company}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#747970]">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-[#92978F]" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                          <Phone className="w-3 h-3 text-[#92978F]" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F1F2EE] text-[#20231F]">
                        {client.projectCount || 0}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#20231F]">
                      {formatINR(client.totalProjectValue)}
                    </td>

                    <td className="py-3 px-4 font-medium text-[#3F7954]">
                      {formatINR(client.amountReceived)}
                    </td>

                    <td className="py-3 px-4 font-medium text-[#B78035]">
                      {formatINR(client.outstandingBalance)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/clients/${client._id}`}
                          className="p-1 rounded text-[#747970] hover:text-[#426B50] hover:bg-[#F1F2EE] transition-colors"
                          title="Open client ledger"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(client._id, client.name)}
                          className="p-1 rounded text-[#747970] hover:text-[#B94B45] hover:bg-[#B94B45]/10 transition-colors cursor-pointer"
                          title="Delete client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Client */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Client"
        description="Register a company or individual client contact."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Client Contact Name"
            placeholder="e.g. Alice Johnson"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Company Name"
            placeholder="e.g. Design Co. Ltd."
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="alice@designco.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Input
            label="Office Address"
            placeholder="e.g. Indiranagar, Bengaluru"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#20231F]">Client Notes</label>
            <textarea
              rows={2}
              className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7E2] rounded-md text-[#20231F] focus:outline-none focus:ring-2 focus:ring-[#426B50]/20 focus:border-[#426B50]"
              placeholder="Billing preferences, contractual agreements, or working style..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7E2]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Add Client
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
