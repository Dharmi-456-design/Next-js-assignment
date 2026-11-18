"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatDate } from "../../lib/utils";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/shared/Button";
import { Dialog } from "../../components/shared/Dialog";
import { Input } from "../../components/shared/Input";
import { Select } from "../../components/shared/Select";
import { PageHeader } from "../../components/shared/PageHeader";
import { EmptyState } from "../../components/shared/EmptyState";
import { IDeliverableData, IProjectData } from "../../types";
import {
  Search,
  Plus,
  ExternalLink,
  Trash2,
  Paperclip,
  X,
} from "lucide-react";

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<IDeliverableData[]>([]);
  const [projects, setProjects] = useState<IProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    fileUrl: "",
    fileName: "",
    submissionDate: "",
    status: "Pending",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dRes, pRes] = await Promise.all([
        fetch("/api/deliverables"),
        fetch("/api/projects"),
      ]);
      if (dRes.ok) {
        const dJson = await dRes.json();
        setDeliverables(dJson);
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
    if (!formData.title || !formData.projectId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          title: "",
          description: "",
          projectId: projects[0]?._id || "",
          fileUrl: "",
          fileName: "",
          submissionDate: "",
          status: "Pending",
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setDeliverables((prev) =>
        prev.map((d) => (d._id === id ? { ...d, status: newStatus } : d))
      );
      await fetch(`/api/deliverables/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error(e);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this deliverable?")) return;
    try {
      const res = await fetch(`/api/deliverables/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeliverables(deliverables.filter((d) => d._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDeliverables = useMemo(() => {
    return deliverables.filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.projectId?.title?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || d.status === statusFilter;
      const matchesProject =
        projectFilter === "All" ||
        d.projectId?._id === projectFilter ||
        d.projectId === projectFilter;

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [deliverables, searchQuery, statusFilter, projectFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deliverables"
        description="Review, submit, and track client sign-offs and asset handovers."
        action={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            New deliverable
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-[#E5E7E2] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#92978F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search deliverables or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#F7F7F4]/60 border border-[#E5E7E2] rounded-md text-[#20231F] placeholder:text-[#92978F] focus:outline-none focus:ring-1 focus:ring-[#426B50] focus:border-[#426B50]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#92978F] hover:text-[#20231F] p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#E5E7E2] rounded-md text-[#20231F] cursor-pointer"
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#E5E7E2] rounded-md text-[#20231F] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Revision Required">Revision Required</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white border border-[#E5E7E2] rounded-md animate-pulse" />
          ))}
        </div>
      ) : filteredDeliverables.length === 0 ? (
        <EmptyState
          title="No deliverables found"
          description="Register your first deliverable or adjust filters."
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setProjectFilter("All");
                }}
              >
                Reset filters
              </Button>
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add deliverable
              </Button>
            </div>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F4]/70 text-[#747970] font-medium border-b border-[#E5E7E2]">
              <tr>
                <th className="py-3 px-4">Deliverable</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Attachment / Asset Link</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Update Status</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E2]">
              {filteredDeliverables.map((d) => (
                <tr key={d._id} className="hover:bg-[#F7F7F4]/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#20231F] block">{d.title}</span>
                    {d.description && (
                      <p className="text-[11px] text-[#747970] line-clamp-1 mt-0.5">{d.description}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#747970]">
                    {d.projectId?.title || "—"}
                  </td>
                  <td className="py-3 px-4">
                    {d.fileUrl ? (
                      <a
                        href={d.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#426B50] font-medium hover:underline inline-flex items-center gap-1.5"
                      >
                        <Paperclip className="w-3 h-3 text-[#426B50]" />
                        <span>{d.fileName || "View Resource"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[#92978F]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#747970]">
                    {formatDate(d.submissionDate)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={d.status}
                      onChange={(e) => handleStatusChange(d._id, e.target.value)}
                      className="px-2 py-1 text-xs bg-white border border-[#E5E7E2] rounded cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Approved">Approved</option>
                      <option value="Revision Required">Revision Required</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(d._id)}
                      className="p-1 rounded text-[#747970] hover:text-[#B94B45] hover:bg-[#B94B45]/10 transition-colors cursor-pointer"
                      title="Delete deliverable"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

      {/* Modal: New Deliverable */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Deliverable"
        description="Register a deliverable or client sign-off link."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Deliverable Title"
            required
            placeholder="e.g. Interactive UI Flow Prototype"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Select
            label="Associated Project"
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

          <Input
            label="External Asset Link (URL)"
            placeholder="https://figma.com/@project or Google Drive link"
            value={formData.fileUrl}
            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Asset Label / Filename"
              placeholder="e.g. Master_Flow_v2.fig"
              value={formData.fileName}
              onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Revision Required">Revision Required</option>
            </Select>
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
              Create Deliverable
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
