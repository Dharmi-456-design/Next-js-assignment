"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { formatINR, formatDate, isOverdue } from "../../../lib/utils";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import { Button } from "../../../components/shared/Button";
import { Dialog } from "../../../components/shared/Dialog";
import { Input } from "../../../components/shared/Input";
import { Select } from "../../../components/shared/Select";
import { EmptyState } from "../../../components/shared/EmptyState";
import {
  IProjectData,
  IClientData,
  ITaskData,
  IMilestoneData,
  IDeliverableData,
  IPaymentData,
  IActivityData,
  ICommentData,
} from "../../../types";
import {
  Briefcase,
  CheckSquare,
  FileCheck,
  CreditCard,
  Activity as ActivityIcon,
  Plus,
  Edit,
  ExternalLink,
  Calendar,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

type ProjectTabKey =
  | "overview"
  | "tasks"
  | "milestones"
  | "deliverables"
  | "payments"
  | "activity";

interface ProjectWorkspaceData {
  project: IProjectData;
  client?: IClientData;
  tasks: ITaskData[];
  milestones: IMilestoneData[];
  deliverables: IDeliverableData[];
  payments: IPaymentData[];
  activities: IActivityData[];
  comments: ICommentData[];
  financials: {
    budget: number;
    receivedAmount: number;
    outstandingBalance: number;
    taskCompletionRate: number;
  };
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [data, setData] = useState<ProjectWorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "milestones" | "deliverables" | "payments" | "activity"
  >("overview");

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    status: "To Do",
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "To Do",
  });

  const [deliverableForm, setDeliverableForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    fileName: "",
    submissionDate: "",
    status: "Pending",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "Bank Transfer",
    status: "Successful",
    reference: "",
    notes: "",
  });

  const [progressForm, setProgressForm] = useState({
    progress: 50,
    progressDescription: "",
  });

  const [commentText, setCommentText] = useState("");

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setProgressForm({
          progress: json.project.progress || 0,
          progressDescription: "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Handle Progress Update
  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progressForm),
      });
      if (res.ok) {
        setIsProgressModalOpen(false);
        fetchProjectData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Task Create
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...taskForm, projectId: id }),
      });
      if (res.ok) {
        setIsTaskModalOpen(false);
        setTaskForm({
          title: "",
          description: "",
          priority: "Medium",
          dueDate: "",
          status: "To Do",
        });
        fetchProjectData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Task Status Change
  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchProjectData();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Milestone Create
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneForm.title) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...milestoneForm, projectId: id }),
      });
      if (res.ok) {
        setIsMilestoneModalOpen(false);
        setMilestoneForm({
          title: "",
          description: "",
          dueDate: "",
          status: "To Do",
        });
        fetchProjectData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Complete Milestone
  const handleCompleteMilestone = async (milestoneId: string) => {
    try {
      await fetch(`/api/milestones/${milestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      });
      fetchProjectData();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Deliverable Create
  const handleCreateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableForm.title) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...deliverableForm, projectId: id }),
      });
      if (res.ok) {
        setIsDeliverableModalOpen(false);
        setDeliverableForm({
          title: "",
          description: "",
          fileUrl: "",
          fileName: "",
          submissionDate: "",
          status: "Pending",
        });
        fetchProjectData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Deliverable Status Change
  const handleDeliverableStatusChange = async (
    deliverableId: string,
    newStatus: string
  ) => {
    try {
      await fetch(`/api/deliverables/${deliverableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchProjectData();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Payment Create
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.amount || !data?.client?._id) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentForm,
          projectId: id,
          clientId: data.client._id,
        }),
      });
      if (res.ok) {
        setIsPaymentModalOpen(false);
        setPaymentForm({
          amount: "",
          method: "Bank Transfer",
          status: "Successful",
          reference: "",
          notes: "",
        });
        fetchProjectData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id, content: commentText.trim() }),
      });
      if (res.ok) {
        setCommentText("");
        fetchProjectData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-[#E5E7E2]/60 rounded-md animate-pulse" />
        <div className="h-10 w-96 bg-[#E5E7E2]/60 rounded-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white border border-[#E5E7E2] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { project, client, tasks, milestones, deliverables, payments, activities, comments, financials } = data;
  const overdue = isOverdue(project.deadline, project.status === "Completed");

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="space-y-2">
        <nav className="flex items-center gap-1.5 text-xs text-[#747970]">
          <Link href="/projects" className="hover:text-[#20231F] flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            <span>Projects</span>
          </Link>
          <span>/</span>
          <span className="text-[#20231F] font-medium">{project.title}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#20231F] tracking-tight">
                {project.title}
              </h1>
              <StatusBadge status={project.status} />
              <StatusBadge status={project.priority} />
            </div>
            <p className="text-xs sm:text-sm text-[#747970]">
              Client:{" "}
              {client ? (
                <Link
                  href={`/clients/${client._id}`}
                  className="font-medium text-[#20231F] hover:text-[#426B50] hover:underline"
                >
                  {client.company ? `${client.company} (${client.name})` : client.name}
                </Link>
              ) : (
                "Unassigned"
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProgressModalOpen(true)}
              icon={<Edit className="w-3.5 h-3.5 text-[#747970]" />}
            >
              Update Progress
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (activeTab === "tasks") setIsTaskModalOpen(true);
                else if (activeTab === "milestones") setIsMilestoneModalOpen(true);
                else if (activeTab === "deliverables") setIsDeliverableModalOpen(true);
                else if (activeTab === "payments") setIsPaymentModalOpen(true);
                else setIsTaskModalOpen(true);
              }}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add {activeTab === "overview" ? "Task" : activeTab.slice(0, -1)}
            </Button>
          </div>
        </div>
      </div>

      {/* Financial & Delivery Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <span className="text-[11px] font-medium text-[#747970] block">CONTRACT BUDGET</span>
          <div className="text-lg sm:text-xl font-semibold text-[#20231F] mt-0.5">
            {formatINR(financials.budget)}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <span className="text-[11px] font-medium text-[#747970] block">RECEIVED PAYMENTS</span>
          <div className="text-lg sm:text-xl font-semibold text-[#3F7954] mt-0.5">
            {formatINR(financials.receivedAmount)}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <span className="text-[11px] font-medium text-[#747970] block">OUTSTANDING BALANCE</span>
          <div className="text-lg sm:text-xl font-semibold text-[#B78035] mt-0.5">
            {formatINR(financials.outstandingBalance)}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs">
          <span className="text-[11px] font-medium text-[#747970] block">DELIVERY PROGRESS</span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="text-lg sm:text-xl font-semibold text-[#20231F]">
              {project.progress || 0}%
            </div>
            <div className="flex-1 bg-[#F1F2EE] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#426B50] h-1.5 rounded-full"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#E5E7E2] flex items-center gap-1 overflow-x-auto">
        {[
          { key: "overview", label: "Overview", icon: Briefcase, count: null },
          { key: "tasks", label: "Tasks", icon: CheckSquare, count: tasks.length },
          { key: "milestones", label: "Milestones", icon: Calendar, count: milestones.length },
          { key: "deliverables", label: "Deliverables", icon: FileCheck, count: deliverables.length },
          { key: "payments", label: "Payments", icon: CreditCard, count: payments.length },
          { key: "activity", label: "Activity & Notes", icon: ActivityIcon, count: activities.length + comments.length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ProjectTabKey)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-[#426B50] text-[#426B50] font-semibold"
                  : "border-transparent text-[#747970] hover:text-[#20231F] hover:border-[#E5E7E2]"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#F1F2EE] text-[#747970]">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-3">
              <h3 className="text-sm font-semibold text-[#20231F]">Scope & Objectives</h3>
              <p className="text-xs text-[#747970] leading-relaxed">
                {project.description || "No detailed scope description provided for this project."}
              </p>
              <div className="pt-3 border-t border-[#E5E7E2] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#92978F] block">START DATE</span>
                  <span className="font-medium text-[#20231F]">{formatDate(project.startDate)}</span>
                </div>
                <div>
                  <span className="text-[#92978F] block">TARGET DEADLINE</span>
                  <span className={`font-medium ${overdue ? "text-[#B94B45] font-semibold" : "text-[#20231F]"}`}>
                    {formatDate(project.deadline)}
                  </span>
                </div>
                <div>
                  <span className="text-[#92978F] block">TASK COMPLETION</span>
                  <span className="font-medium text-[#20231F]">{financials.taskCompletionRate}%</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#20231F]">Progress</h3>
                <button
                  onClick={() => setIsProgressModalOpen(true)}
                  className="text-xs text-[#426B50] font-medium hover:underline"
                >
                  Update progress
                </button>
              </div>
              <p className="text-xs text-[#747970]">Current progress: {project.progress || 0}%</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-3">
              <h3 className="text-sm font-semibold text-[#20231F]">Client Information</h3>
              {client ? (
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[#92978F] block">NAME & COMPANY</span>
                    <span className="font-semibold text-[#20231F]">
                      {client.name} {client.company ? `— ${client.company}` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#92978F] block">EMAIL</span>
                    <a href={`mailto:${client.email}`} className="text-[#426B50] hover:underline">
                      {client.email}
                    </a>
                  </div>
                  {client.phone && (
                    <div>
                      <span className="text-[#92978F] block">PHONE</span>
                      <span className="text-[#20231F]">{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div>
                      <span className="text-[#92978F] block">OFFICE / ADDRESS</span>
                      <span className="text-[#747970]">{client.address}</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <Link
                      href={`/clients/${client._id}`}
                      className="text-xs text-[#426B50] font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <span>View client profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#747970]">No client assigned.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tasks */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#20231F]">Project Tasks ({tasks.length})</h3>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsTaskModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add task
            </Button>
          </div>

          {tasks.length > 0 ? (
            <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F7F4]/70 text-[#747970] font-medium border-b border-[#E5E7E2]">
                  <tr>
                    <th className="py-2.5 px-4">Task</th>
                    <th className="py-2.5 px-4">Priority</th>
                    <th className="py-2.5 px-4">Due Date</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7E2]">
                  {tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-[#F7F7F4]/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <span className={`font-medium ${task.status === "Completed" ? "line-through text-[#747970]" : "text-[#20231F]"}`}>
                          {task.title}
                        </span>
                        {task.description && (
                          <p className="text-[11px] text-[#747970]">{task.description}</p>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={task.priority} />
                      </td>
                      <td className="py-2.5 px-4 text-[#747970]">
                        {formatDate(task.dueDate)}
                      </td>
                      <td className="py-2.5 px-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}
                          className="px-2 py-1 text-xs bg-white border border-[#E5E7E2] rounded cursor-pointer"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleTaskStatusChange(task._id, task.status === "Completed" ? "In Progress" : "Completed")}
                          className="text-xs text-[#426B50] font-medium hover:underline cursor-pointer"
                        >
                          {task.status === "Completed" ? "Reopen" : "Mark Done"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No tasks added yet"
              description="Break down this project scope into concrete actionable tasks."
              action={
                <Button
                  size="sm"
                  onClick={() => setIsTaskModalOpen(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create first task
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* Tab 3: Milestones */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#20231F]">
              Milestones & Phases ({milestones.length})
            </h3>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsMilestoneModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add milestone
            </Button>
          </div>

          {milestones.length > 0 ? (
            <div className="space-y-3">
              {milestones.map((m) => (
                <div
                  key={m._id}
                  className="p-4 rounded-lg bg-white border border-[#E5E7E2] shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#20231F]">{m.title}</h4>
                      <StatusBadge status={m.status} />
                    </div>
                    {m.description && (
                      <p className="text-xs text-[#747970]">{m.description}</p>
                    )}
                    <span className="text-[11px] text-[#92978F] block">
                      Target Due: {formatDate(m.dueDate)}
                      {m.completedAt && ` • Completed ${formatDate(m.completedAt)}`}
                    </span>
                  </div>

                  {m.status !== "Completed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteMilestone(m._id)}
                      icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#3F7954]" />}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No milestones set"
              description="Define key project checkpoints and payment milestone criteria."
              action={
                <Button
                  size="sm"
                  onClick={() => setIsMilestoneModalOpen(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add milestone
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* Tab 4: Deliverables */}
      {activeTab === "deliverables" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#20231F]">
              Deliverables & Assets ({deliverables.length})
            </h3>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsDeliverableModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add deliverable
            </Button>
          </div>

          {deliverables.length > 0 ? (
            <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F7F4]/70 text-[#747970] font-medium border-b border-[#E5E7E2]">
                  <tr>
                    <th className="py-2.5 px-4">Deliverable</th>
                    <th className="py-2.5 px-4">Attachment</th>
                    <th className="py-2.5 px-4">Submission Date</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7E2]">
                  {deliverables.map((d) => (
                    <tr key={d._id} className="hover:bg-[#F7F7F4]/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-[#20231F]">{d.title}</div>
                        {d.description && (
                          <p className="text-[11px] text-[#747970]">{d.description}</p>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        {d.fileUrl ? (
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#426B50] hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            <span>{d.fileName || "View Asset Link"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[#92978F]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-[#747970]">
                        {formatDate(d.submissionDate)}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <select
                          value={d.status}
                          onChange={(e) => handleDeliverableStatusChange(d._id, e.target.value)}
                          className="px-2 py-1 text-xs bg-white border border-[#E5E7E2] rounded cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Approved">Approved</option>
                          <option value="Revision Required">Revision Required</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No deliverables registered"
              description="Submit mockups, prototypes, code repositories or files for client sign-off."
              action={
                <Button
                  size="sm"
                  onClick={() => setIsDeliverableModalOpen(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create deliverable
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* Tab 5: Payments */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#20231F]">
              Payments for this Project ({payments.length})
            </h3>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsPaymentModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Record payment
            </Button>
          </div>

          {payments.length > 0 ? (
            <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F7F4]/70 text-[#747970] font-medium border-b border-[#E5E7E2]">
                  <tr>
                    <th className="py-2.5 px-4">Reference</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7E2]">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-[#F7F7F4]/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-[#20231F]">
                          {p.reference || "Direct Receipt"}
                        </span>
                        {p.notes && <p className="text-[11px] text-[#747970]">{p.notes}</p>}
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
            <EmptyState
              title="No payments recorded"
              description="Record milestone advances, final installments, and payment receipts."
              action={
                <Button
                  size="sm"
                  onClick={() => setIsPaymentModalOpen(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Record payment
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* Tab 6: Activity & Notes */}
      {activeTab === "activity" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-[#20231F]">Project Notes & Comments</h3>
            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                rows={3}
                placeholder="Write a project note or record client meeting feedback..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F7F4]/60 border border-[#E5E7E2] rounded-md focus:outline-none focus:ring-1 focus:ring-[#426B50] focus:border-[#426B50]"
              />
              <div className="flex justify-end">
                <Button size="sm" type="submit" disabled={!commentText.trim()}>
                  Post Note
                </Button>
              </div>
            </form>

            <div className="divide-y divide-[#E5E7E2] pt-2">
              {comments.map((c) => (
                <div key={c._id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#20231F]">{c.author || "You"}</span>
                    <span className="text-[10px] text-[#92978F]">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-[#747970] leading-relaxed">{c.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-[#747970] py-4 text-center">No notes added yet.</p>
              )}
            </div>
          </div>

          <div className="p-5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-[#20231F]">Audit Activity Stream</h3>
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a._id} className="flex items-start gap-2.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#426B50] mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-[#20231F]">{a.title}</span>
                    <p className="text-[11px] text-[#747970] mt-0.5">{a.description}</p>
                    <span className="text-[10px] text-[#92978F]">{formatDate(a.createdAt)}</span>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-xs text-[#747970] py-4 text-center">No audit records yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Update Progress */}
      <Dialog
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        title="Update Project Progress"
        description="Adjust overall delivery progress and log a progress update entry."
      >
        <form onSubmit={handleUpdateProgress} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[#20231F]">Progress Percentage</span>
              <span className="font-bold text-[#426B50]">{progressForm.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progressForm.progress}
              onChange={(e) => setProgressForm({ ...progressForm, progress: Number(e.target.value) })}
              className="w-full accent-[#426B50] cursor-pointer"
            />
          </div>

          <Input
            label="Progress Description Note"
            placeholder="e.g. Completed frontend prototype, awaiting feedback"
            value={progressForm.progressDescription}
            onChange={(e) => setProgressForm({ ...progressForm, progressDescription: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7E2]">
            <Button type="button" variant="outline" onClick={() => setIsProgressModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Save Progress
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Add Task */}
      <Dialog
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Task"
        description="Add a task to this project workspace."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            required
            placeholder="e.g. Wireframe responsive navigation"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>

            <Input
              label="Due Date"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />
          </div>

          <Input
            label="Details (optional)"
            placeholder="Additional requirements or context..."
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7E2]">
            <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Add Task
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Add Milestone */}
      <Dialog
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        title="Create Milestone"
        description="Add a major delivery checkpoint or payment gate."
      >
        <form onSubmit={handleCreateMilestone} className="space-y-4">
          <Input
            label="Milestone Title"
            required
            placeholder="e.g. Phase 2: Design Approval"
            value={milestoneForm.title}
            onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
          />

          <Input
            label="Target Due Date"
            type="date"
            value={milestoneForm.dueDate}
            onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
          />

          <Input
            label="Milestone Scope Description"
            placeholder="Required deliverables to consider this phase complete..."
            value={milestoneForm.description}
            onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7E2]">
            <Button type="button" variant="outline" onClick={() => setIsMilestoneModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Create Milestone
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Add Deliverable */}
      <Dialog
        isOpen={isDeliverableModalOpen}
        onClose={() => setIsDeliverableModalOpen(false)}
        title="Register Deliverable"
        description="Submit an asset, Figma prototype, or code archive for client sign-off."
      >
        <form onSubmit={handleCreateDeliverable} className="space-y-4">
          <Input
            label="Deliverable Title"
            required
            placeholder="e.g. Master Design System Components"
            value={deliverableForm.title}
            onChange={(e) => setDeliverableForm({ ...deliverableForm, title: e.target.value })}
          />

          <Input
            label="External Asset Link (URL)"
            placeholder="https://figma.com/@project or Google Drive link"
            value={deliverableForm.fileUrl}
            onChange={(e) => setDeliverableForm({ ...deliverableForm, fileUrl: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Asset Label / Filename"
              placeholder="e.g. Workloom_Design_v2.fig"
              value={deliverableForm.fileName}
              onChange={(e) => setDeliverableForm({ ...deliverableForm, fileName: e.target.value })}
            />

            <Select
              label="Status"
              value={deliverableForm.status}
              onChange={(e) => setDeliverableForm({ ...deliverableForm, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Revision Required">Revision Required</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7E2]">
            <Button type="button" variant="outline" onClick={() => setIsDeliverableModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Add Deliverable
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Add Payment */}
      <Dialog
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment"
        description="Log an installment or full payment received for this project."
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <Input
            label="Amount (₹ INR)"
            type="number"
            min="0"
            required
            placeholder="e.g. 50000"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Payment Method"
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI (Google Pay/PhonePe)</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </Select>

            <Select
              label="Payment Status"
              value={paymentForm.status}
              onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
            >
              <option value="Successful">Successful (Confirmed)</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </Select>
          </div>

          <Input
            label="Transaction / Reference ID"
            placeholder="e.g. UTR-9840219"
            value={paymentForm.reference}
            onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7E2]">
            <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
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
