"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR, formatDate } from "../../lib/utils";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/shared/Button";
import { Dialog } from "../../components/shared/Dialog";
import { Input } from "../../components/shared/Input";
import { Select } from "../../components/shared/Select";
import { EmptyState } from "../../components/shared/EmptyState";
import { MetricCard } from "../../components/dashboard/MetricCard";
import {
  IProjectData,
  IPaymentData,
  ITaskData,
  IActivityData,
  IClientData,
} from "../../types";
import {
  TrendingUp,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  CreditCard,
  Calendar,
} from "lucide-react";

interface DashboardData {
  metrics: {
    revenueReceived: number;
    outstandingPayments: number;
    activeProjectsCount: number;
    completedProjectsCount: number;
    totalProjectsCount: number;
  };
  activeProjects: IProjectData[];
  recentPayments: IPaymentData[];
  upcomingDeadlines: ITaskData[];
  overdueTasks: ITaskData[];
  recentActivities: IActivityData[];
  statusDistribution: { status: string; count: number }[];
  revenueTrend: { month: string; amount: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clients, setClients] = useState<IClientData[]>([]);

  // Project form state
  const [newProject, setNewProject] = useState({
    title: "",
    clientId: "",
    budget: "",
    status: "Planning",
    priority: "Medium",
    deadline: "",
    description: "",
  });

  // Client form state
  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
      const cRes = await fetch("/api/clients");
      if (cRes.ok) {
        const cJson = await cRes.json();
        setClients(cJson);
        if (cJson.length > 0 && !newProject.clientId) {
          setNewProject((prev) => ({ ...prev, clientId: cJson[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.clientId || !newProject.budget) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        setIsProjectModalOpen(false);
        setNewProject({
          title: "",
          clientId: clients[0]?._id || "",
          budget: "",
          status: "Planning",
          priority: "Medium",
          deadline: "",
          description: "",
        });
        fetchDashboard();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      if (res.ok) {
        setIsClientModalOpen(false);
        setNewClient({ name: "", company: "", email: "", phone: "" });
        fetchDashboard();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[#E5E7E2]/60 rounded-md animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white border border-[#E5E7E2] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white border border-[#E5E7E2] rounded-lg animate-pulse" />
          <div className="h-72 bg-white border border-[#E5E7E2] rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    revenueReceived: 0,
    outstandingPayments: 0,
    activeProjectsCount: 0,
    completedProjectsCount: 0,
    totalProjectsCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7E2]/80">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-[#20231F] tracking-tight">
            Good morning.
          </h1>
          <p className="text-xs sm:text-sm text-[#747970] mt-0.5">
            Here&apos;s what&apos;s happening with your freelance business.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={<Plus className="w-3.5 h-3.5 text-[#747970]" />}
            onClick={() => setIsClientModalOpen(true)}
          >
            Add client
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsProjectModalOpen(true)}
          >
            Create project
          </Button>
        </div>
      </div>

      {/* 4 Core Business Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          label="Revenue Received"
          value={formatINR(metrics.revenueReceived)}
          description="Confirmed payments received"
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          iconColorClass="text-[#3F7954]"
          iconBgClass="bg-[#3F7954]/10"
        />

        <MetricCard
          label="Outstanding Payments"
          value={formatINR(metrics.outstandingPayments)}
          description="Pending client balance across projects"
          icon={<AlertCircle className="w-3.5 h-3.5" />}
          iconColorClass="text-[#B78035]"
          iconBgClass="bg-[#B78035]/10"
        />

        <MetricCard
          label="Active Projects"
          value={metrics.activeProjectsCount}
          description="Currently in flight or planning"
          icon={<Briefcase className="w-3.5 h-3.5" />}
          iconColorClass="text-[#426B50]"
          iconBgClass="bg-[#426B50]/10"
        />

        <MetricCard
          label="Completed Projects"
          value={metrics.completedProjectsCount}
          description="Successfully delivered"
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          iconColorClass="text-[#587B91]"
          iconBgClass="bg-[#587B91]/10"
        />
      </div>

      {/* Main Two-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7E2] bg-[#F7F7F4]/40">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#426B50]" />
                <h3 className="text-sm font-semibold text-[#20231F]">Active Projects</h3>
              </div>
              <Link
                href="/projects"
                className="text-xs font-medium text-[#426B50] hover:text-[#34573F] flex items-center gap-1"
              >
                <span>View all ({metrics.totalProjectsCount})</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {data?.activeProjects && data.activeProjects.length > 0 ? (
              <div className="divide-y divide-[#E5E7E2]">
                {data.activeProjects.map((project) => {
                  const clientObj = typeof project.clientId === "object" ? project.clientId : undefined;
                  return (
                    <div
                      key={project._id}
                      className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F7F4]/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/projects/${project._id}`}
                            className="text-sm font-semibold text-[#20231F] hover:text-[#426B50] transition-colors"
                          >
                            {project.title}
                          </Link>
                          <StatusBadge status={project.status} />
                        </div>
                        <p className="text-xs text-[#747970]">
                          {clientObj?.company
                            ? `${clientObj.company} (${clientObj.name})`
                            : clientObj?.name || "Client"}
                          {" • "}
                          Deadline: {formatDate(project.deadline)}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-semibold text-[#20231F]">
                            {formatINR(project.budget)}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-20 bg-[#F1F2EE] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#426B50] h-1.5 rounded-full"
                                style={{ width: `${project.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-[#747970] font-medium">
                              {project.progress || 0}%
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/projects/${project._id}`}
                          className="p-1.5 rounded-md text-[#747970] hover:text-[#20231F] hover:bg-[#F1F2EE] transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="No active projects"
                  description="Start by creating your first client project to track scope, progress, and revenue."
                  action={
                    <Button
                      size="sm"
                      onClick={() => setIsProjectModalOpen(true)}
                      icon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Create project
                    </Button>
                  }
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7E2] bg-[#F7F7F4]/40">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#426B50]" />
                <h3 className="text-sm font-semibold text-[#20231F]">Recent Transactions</h3>
              </div>
              <Link
                href="/payments"
                className="text-xs font-medium text-[#426B50] hover:text-[#34573F] flex items-center gap-1"
              >
                <span>All payments</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {data?.recentPayments && data.recentPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F7F4]/60 text-[#747970] font-medium border-b border-[#E5E7E2]">
                    <tr>
                      <th className="py-2.5 px-4">Client & Project</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Method</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7E2]">
                    {data.recentPayments.map((p) => (
                      <tr key={p._id} className="hover:bg-[#F7F7F4]/50 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="font-medium text-[#20231F]">{p.clientId?.name || "Client"}</div>
                          <div className="text-[11px] text-[#747970]">{p.projectId?.title || "General"}</div>
                        </td>
                        <td className="py-2.5 px-4 text-[#747970]">{formatDate(p.paymentDate)}</td>
                        <td className="py-2.5 px-4 text-[#747970]">{p.method}</td>
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
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#747970]">
                No payment transactions recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Secondary Column */}
        <div className="space-y-6">
          {data?.overdueTasks && data.overdueTasks.length > 0 && (
            <div className="p-4 rounded-lg bg-[#B94B45]/5 border border-[#B94B45]/20 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#B94B45]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">
                  Overdue Tasks ({data.overdueTasks.length})
                </h3>
              </div>
              <div className="space-y-2">
                {data.overdueTasks.map((t) => (
                  <div
                    key={t._id}
                    className="p-2.5 rounded bg-white border border-[#B94B45]/20 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-medium text-[#20231F] line-clamp-1">{t.title}</p>
                      <p className="text-[11px] text-[#B94B45]">
                        Due {formatDate(t.dueDate)}
                      </p>
                    </div>
                    <Link
                      href="/tasks"
                      className="text-[11px] font-medium text-[#B94B45] hover:underline shrink-0"
                    >
                      Update
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7E2]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#426B50]" />
                <h3 className="text-xs font-semibold text-[#20231F]">Upcoming Deadlines</h3>
              </div>
              <Link href="/tasks" className="text-[11px] text-[#426B50] hover:underline">
                View all
              </Link>
            </div>

            {data?.upcomingDeadlines && data.upcomingDeadlines.length > 0 ? (
              <div className="space-y-2.5">
                {data.upcomingDeadlines.map((item) => (
                  <div key={item._id} className="flex items-start justify-between gap-2 text-xs">
                    <div>
                      <p className="font-medium text-[#20231F]">{item.title}</p>
                      <p className="text-[11px] text-[#747970]">{item.projectId?.title || "Project"}</p>
                    </div>
                    <span className="text-[11px] font-medium text-[#747970] shrink-0">
                      {formatDate(item.dueDate)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#747970] py-2">No deadlines due in the next 14 days.</p>
            )}
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs p-4 space-y-3">
            <div className="flex items-center gap-1.5 pb-2 border-b border-[#E5E7E2]">
              <Calendar className="w-4 h-4 text-[#426B50]" />
              <h3 className="text-xs font-semibold text-[#20231F]">Recent Activity</h3>
            </div>

            {data?.recentActivities && data.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivities.map((act) => (
                  <div key={act._id} className="flex items-start gap-2.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#426B50] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-[#20231F] leading-tight font-medium">{act.title}</p>
                      <p className="text-[11px] text-[#747970] mt-0.5 leading-snug">{act.description}</p>
                      <span className="text-[10px] text-[#92978F]">{formatDate(act.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#747970] py-2">No recent audit log entries.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create Project */}
      <Dialog
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title="Create New Project"
        description="Add a new client engagement with clear budget, scope, and deadlines."
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Title"
            placeholder="e.g. Design System & Frontend Revamp"
            required
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Client"
              required
              value={newProject.clientId}
              onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
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
              placeholder="e.g. 75000"
              required
              value={newProject.budget}
              onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Status"
              value={newProject.status}
              onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </Select>

            <Select
              label="Priority"
              value={newProject.priority}
              onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>

            <Input
              label="Target Deadline"
              type="date"
              value={newProject.deadline}
              onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#20231F]">Scope Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7E2] rounded-md text-[#20231F] focus:outline-none focus:ring-2 focus:ring-[#426B50]/20 focus:border-[#426B50]"
              placeholder="Brief summary of expected outcomes and client deliverables..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7E2]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Create project
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Add Client */}
      <Dialog
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Add New Client"
        description="Register a company or individual client contact."
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <Input
            label="Contact Name"
            placeholder="e.g. Alice Johnson"
            required
            value={newClient.name}
            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
          />

          <Input
            label="Company Name"
            placeholder="e.g. Design Co. Ltd."
            value={newClient.company}
            onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="alice@designco.com"
              required
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7E2]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClientModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Add client
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
