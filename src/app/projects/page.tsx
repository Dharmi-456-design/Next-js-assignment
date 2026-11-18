"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { formatINR, formatDate, isOverdue } from "../../lib/utils";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/shared/Button";
import { Dialog } from "../../components/shared/Dialog";
import { Input } from "../../components/shared/Input";
import { Select } from "../../components/shared/Select";
import { EmptyState } from "../../components/shared/EmptyState";
import { PageHeader } from "../../components/shared/PageHeader";
import { IProjectData, IClientData } from "../../types";
import {
  Search,
  LayoutList,
  LayoutGrid,
  Plus,
  ArrowRight,
  Trash2,
  ExternalLink,
  X,
} from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<IProjectData[]>([]);
  const [clients, setClients] = useState<IClientData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("All");
  const [sortBy, setSortBy] = useState("deadline");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  // Create Project Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    clientId: "",
    budget: "",
    status: "Planning",
    priority: "Medium",
    deadline: "",
    description: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/clients"),
      ]);

      if (pRes.ok) {
        const pJson = await pRes.json();
        setProjects(pJson);
      }
      if (cRes.ok) {
        const cJson = await cRes.json();
        setClients(cJson);
        if (cJson.length > 0 && !formData.clientId) {
          setFormData((prev) => ({ ...prev, clientId: cJson[0]._id }));
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
    if (!formData.title || !formData.clientId || !formData.budget) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          title: "",
          clientId: clients[0]?._id || "",
          budget: "",
          status: "Planning",
          priority: "Medium",
          deadline: "",
          description: "",
        });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete project "${title}"?`)) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects(projects.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter and sort logic
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.client?.name && p.client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.client?.company && p.client.company.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === "All" || p.status === statusFilter;
        const matchesPriority =
          priorityFilter === "All" || p.priority === priorityFilter;
        const cId = typeof p.clientId === "object" ? p.clientId?._id : p.clientId;
        const matchesClient =
          clientFilter === "All" ||
          cId === clientFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesClient;
      })
      .sort((a, b) => {
        if (sortBy === "deadline") {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === "budget-desc") {
          return (b.budget || 0) - (a.budget || 0);
        }
        if (sortBy === "progress-desc") {
          return (b.progress || 0) - (a.progress || 0);
        }
        return 0;
      });
  }, [projects, searchQuery, statusFilter, priorityFilter, clientFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Projects"
        description="Plan, track and deliver your client work."
        action={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            New project
          </Button>
        }
      />

      {/* Control Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-[#E5E7E2] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#92978F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects or clients..."
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

        {/* Filters and View Toggle */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Client Filter */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#E5E7E2] rounded-md text-[#20231F] cursor-pointer"
          >
            <option value="All">All Clients</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
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
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#E5E7E2] rounded-md text-[#20231F] cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#E5E7E2] rounded-md text-[#20231F] cursor-pointer"
          >
            <option value="deadline">Earliest Deadline</option>
            <option value="budget-desc">Highest Budget</option>
            <option value="progress-desc">Highest Progress</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center border border-[#E5E7E2] rounded-md bg-[#F7F7F4] p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-[#20231F] shadow-xs font-semibold"
                  : "text-[#747970] hover:text-[#20231F]"
              }`}
              title="List view"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                viewMode === "card"
                  ? "bg-white text-[#20231F] shadow-xs font-semibold"
                  : "text-[#747970] hover:text-[#20231F]"
              }`}
              title="Card view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white border border-[#E5E7E2] rounded-md animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects match your filter"
          description="Try clearing search queries or filters, or add a new project."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setPriorityFilter("All");
                setClientFilter("All");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : viewMode === "list" ? (
        /* List View: Professional Compact Data Table */
        <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F4]/70 text-[#747970] font-medium border-b border-[#E5E7E2]">
                <tr>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7E2]">
                {filteredProjects.map((p) => {
                  const overdue = isOverdue(p.deadline, p.status === "Completed");

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-[#F7F7F4]/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/projects/${p._id}`}
                          className="font-semibold text-[#20231F] hover:text-[#426B50] transition-colors"
                        >
                          {p.title}
                        </Link>
                        {p.description && (
                          <p className="text-[11px] text-[#747970] line-clamp-1 mt-0.5">
                            {p.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#747970]">
                        {p.client?.company
                          ? `${p.client.company}`
                          : p.client?.name || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#F1F2EE] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#426B50] h-1.5 rounded-full"
                              style={{ width: `${p.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium text-[#20231F]">
                            {p.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${overdue ? "text-[#B94B45] font-semibold" : "text-[#747970]"}`}>
                        {formatDate(p.deadline)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#20231F]">
                        {formatINR(p.budget)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/projects/${p._id}`}
                            className="p-1 rounded text-[#747970] hover:text-[#426B50] hover:bg-[#F1F2EE] transition-colors"
                            title="Open project workspace"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.title)}
                            className="p-1 rounded text-[#747970] hover:text-[#B94B45] hover:bg-[#B94B45]/10 transition-colors cursor-pointer"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View: Structured Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => {
            const overdue = isOverdue(p.deadline, p.status === "Completed");

            return (
              <div
                key={p._id}
                className="p-5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#426B50]/30 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <StatusBadge status={p.status} />
                    <StatusBadge status={p.priority} />
                  </div>

                  <div>
                    <Link
                      href={`/projects/${p._id}`}
                      className="text-base font-semibold text-[#20231F] hover:text-[#426B50] transition-colors block line-clamp-1"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-[#747970] mt-0.5">
                      Client: {p.client?.company ? `${p.client.company} (${p.client.name})` : p.client?.name || "—"}
                    </p>
                  </div>

                  {p.description && (
                    <p className="text-xs text-[#747970] line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E5E7E2] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#747970]">Progress</span>
                    <span className="font-semibold text-[#20231F]">{p.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-[#F1F2EE] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#426B50] h-1.5 rounded-full"
                      style={{ width: `${p.progress || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-[#92978F] block">BUDGET</span>
                      <span className="font-semibold text-[#20231F]">{formatINR(p.budget)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#92978F] block">DEADLINE</span>
                      <span className={`font-medium ${overdue ? "text-[#B94B45] font-semibold" : "text-[#20231F]"}`}>
                        {formatDate(p.deadline)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/projects/${p._id}`}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md border border-[#E5E7E2] bg-[#F7F7F4] hover:bg-[#F1F2EE] text-[#20231F] transition-colors"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Project */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
        description="Initialize a new client engagement with budget, dates, and scope."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project Title"
            placeholder="e.g. Website Re-architecture"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

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

            <Input
              label="Budget (₹ INR)"
              type="number"
              min="0"
              placeholder="e.g. 100000"
              required
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </Select>

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>

            <Input
              label="Target Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#20231F]">Scope Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7E2] rounded-md text-[#20231F] focus:outline-none focus:ring-2 focus:ring-[#426B50]/20 focus:border-[#426B50]"
              placeholder="Outline deliverables, technical stack requirements, or client guidelines..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Create project
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
