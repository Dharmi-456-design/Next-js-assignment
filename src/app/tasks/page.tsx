"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { formatDate, isOverdue } from "../../lib/utils";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/shared/Button";
import { Dialog } from "../../components/shared/Dialog";
import { Input } from "../../components/shared/Input";
import { Select } from "../../components/shared/Select";
import { PageHeader } from "../../components/shared/PageHeader";
import { EmptyState } from "../../components/shared/EmptyState";
import { ITaskData, IProjectData } from "../../types";
import {
  Search,
  LayoutList,
  Columns,
  Plus,
  Clock,
  Trash2,
} from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<ITaskData[]>([]);
  const [projects, setProjects] = useState<IProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  // Create Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "Medium",
    dueDate: "",
    status: "To Do",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tRes, pRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/projects"),
      ]);
      if (tRes.ok) {
        const tJson = await tRes.json();
        setTasks(tJson);
      }
      if (pRes.ok) {
        const pJson = await pRes.json();
        setProjects(pJson);
        if (pJson.length > 0) {
          setFormData((prev) => (prev.projectId ? prev : { ...prev, projectId: pJson[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
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
          priority: "Medium",
          dueDate: "",
          status: "To Do",
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: ITaskData["status"]
  ) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );

      await fetch(`/api/tasks/${taskId}`, {
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
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter((t) => t._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.projectId?.title?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProject =
        projectFilter === "All" || t.projectId?._id === projectFilter;

      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || t.priority === priorityFilter;

      return matchesSearch && matchesProject && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, projectFilter, statusFilter, priorityFilter]);

  // Tasks grouped for Kanban Board
  const todoTasks = filteredTasks.filter((t) => t.status === "To Do");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "In Progress");
  const completedTasks = filteredTasks.filter((t) => t.status === "Completed");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Track execution across all your client deliverables and deadlines."
        action={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            New task
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-[#E5E7E2] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#92978F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F7F4]/60 border border-[#E5E7E2] rounded-md text-[#20231F] placeholder:text-[#92978F] focus:outline-none focus:ring-1 focus:ring-[#426B50] focus:border-[#426B50]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Project Filter */}
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#E5E7E2] rounded-md text-[#20231F] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#E5E7E2] rounded-md text-[#20231F] cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-[#E5E7E2] rounded-md bg-[#F7F7F4] p-0.5">
            <button
              onClick={() => setViewMode("board")}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                viewMode === "board"
                  ? "bg-white text-[#20231F] shadow-xs font-semibold"
                  : "text-[#747970] hover:text-[#20231F]"
              }`}
              title="Board view"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
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
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white border border-[#E5E7E2] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks match criteria"
          description="Try adjusting your filters or create a new task."
          action={
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Create task
            </Button>
          }
        />
      ) : viewMode === "board" ? (
        /* Board View (Kanban) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column: To Do */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[#F1F2EE] border border-[#E5E7E2]">
              <span className="text-xs font-semibold text-[#20231F]">To Do</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#747970]">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {todoTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, false);
                return (
                  <div
                    key={task._id}
                    className="p-3.5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-2.5 hover:border-[#426B50]/40 transition-all"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-medium text-[#747970] line-clamp-1">
                        {task.projectId?.title || "Project"}
                      </span>
                      <StatusBadge status={task.priority} />
                    </div>

                    <h4 className="text-xs font-semibold text-[#20231F] leading-snug">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-[#747970] line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-[#E5E7E2] flex items-center justify-between text-[11px]">
                      <span className={`flex items-center gap-1 ${overdue ? "text-[#B94B45] font-semibold" : "text-[#747970]"}`}>
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(task.dueDate)}</span>
                      </span>

                      <button
                        onClick={() => handleStatusChange(task._id, "In Progress")}
                        className="text-xs font-medium text-[#426B50] hover:underline cursor-pointer"
                      >
                        Start →
                      </button>
                    </div>
                  </div>
                );
              })}
              {todoTasks.length === 0 && (
                <div className="p-6 text-center text-xs text-[#747970] border border-dashed border-[#E5E7E2] rounded-lg">
                  No tasks to do
                </div>
              )}
            </div>
          </div>

          {/* Column: In Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[#426B50]/10 border border-[#426B50]/20">
              <span className="text-xs font-semibold text-[#426B50]">In Progress</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#426B50]">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {inProgressTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, false);
                return (
                  <div
                    key={task._id}
                    className="p-3.5 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-2.5 hover:border-[#426B50]/40 transition-all"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-medium text-[#747970] line-clamp-1">
                        {task.projectId?.title || "Project"}
                      </span>
                      <StatusBadge status={task.priority} />
                    </div>

                    <h4 className="text-xs font-semibold text-[#20231F] leading-snug">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-[#747970] line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-[#E5E7E2] flex items-center justify-between text-[11px]">
                      <span className={`flex items-center gap-1 ${overdue ? "text-[#B94B45] font-semibold" : "text-[#747970]"}`}>
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(task.dueDate)}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(task._id, "To Do")}
                          className="text-[11px] text-[#747970] hover:underline cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          onClick={() => handleStatusChange(task._id, "Completed")}
                          className="text-xs font-medium text-[#3F7954] hover:underline cursor-pointer"
                        >
                          Complete ✓
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {inProgressTasks.length === 0 && (
                <div className="p-6 text-center text-xs text-[#747970] border border-dashed border-[#E5E7E2] rounded-lg">
                  No active tasks
                </div>
              )}
            </div>
          </div>

          {/* Column: Completed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[#3F7954]/10 border border-[#3F7954]/20">
              <span className="text-xs font-semibold text-[#3F7954]">Completed</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#3F7954]">
                {completedTasks.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {completedTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-3.5 rounded-lg bg-white/80 border border-[#E5E7E2] shadow-xs space-y-2.5 opacity-90"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-medium text-[#747970] line-clamp-1">
                      {task.projectId?.title || "Project"}
                    </span>
                    <StatusBadge status={task.priority} />
                  </div>

                  <h4 className="text-xs font-medium line-through text-[#747970] leading-snug">
                    {task.title}
                  </h4>

                  <div className="pt-2 border-t border-[#E5E7E2] flex items-center justify-between text-[11px]">
                    <span className="text-[#3F7954] font-medium">Done ✓</span>
                    <button
                      onClick={() => handleStatusChange(task._id, "In Progress")}
                      className="text-[11px] text-[#747970] hover:underline cursor-pointer"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
              {completedTasks.length === 0 && (
                <div className="p-6 text-center text-xs text-[#747970] border border-dashed border-[#E5E7E2] rounded-lg">
                  No completed tasks yet
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View (Table) */
        <div className="bg-white rounded-lg border border-[#E5E7E2] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F4]/70 text-[#747970] font-medium border-b border-[#E5E7E2]">
              <tr>
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E2]">
              {filteredTasks.map((t) => {
                const overdue = isOverdue(t.dueDate, t.status === "Completed");

                return (
                  <tr key={t._id} className="hover:bg-[#F7F7F4]/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${t.status === "Completed" ? "line-through text-[#747970]" : "text-[#20231F]"}`}>
                        {t.title}
                      </span>
                      {t.description && (
                        <p className="text-[11px] text-[#747970] line-clamp-1">{t.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#747970]">
                      {t.projectId?.title || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.priority} />
                    </td>
                    <td className={`py-3 px-4 ${overdue ? "text-[#B94B45] font-semibold" : "text-[#747970]"}`}>
                      {formatDate(t.dueDate)}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={t.status}
                        onChange={(e) =>
                          handleStatusChange(
                            t._id,
                            e.target.value as ITaskData["status"]
                          )
                        }
                        className="px-2 py-1 text-xs bg-white border border-[#E5E7E2] rounded cursor-pointer"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="p-1 rounded text-[#747970] hover:text-[#B94B45] hover:bg-[#B94B45]/10 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: New Task */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
        description="Add a task with deadline and project assignment."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Task Title"
            required
            placeholder="e.g. Audit mobile typography & line heights"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />

            <Select
              label="Initial Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </Select>
          </div>

          <Input
            label="Task Description (optional)"
            placeholder="Additional requirements or context..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Create task
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
