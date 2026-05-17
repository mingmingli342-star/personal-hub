import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { Project, Task, WorkLog } from "../types";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import { formatDate, PRIORITY_COLORS, STATUS_COLORS } from "../lib/utils";
import { Plus, Edit3, Trash2, FolderKanban, CheckCircle2, Circle, Clock, Calendar, AlertCircle, ArrowRight, ArrowLeft, Timer, Target } from "lucide-react";

type Tab = "projects" | "tasks" | "logs";

export default function WorkPage() {
  const [tab, setTab] = useState<Tab>("projects");
  const tabs = [
    { key: "projects" as Tab, label: "项目" },
    { key: "tasks" as Tab, label: "任务看板" },
    { key: "logs" as Tab, label: "工作日志" },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">工作管理</h2>
      <div className="flex gap-1 mb-6 bg-[hsl(var(--muted))] rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-[hsl(var(--card))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"}`}>{t.label}</button>
        ))}
      </div>
      {tab === "projects" && <ProjectsTab />}
      {tab === "tasks" && <TasksTab />}
      {tab === "logs" && <LogsTab />}
    </div>
  );
}

// ====== Projects ======
function ProjectsTab() {
  const qc = useQueryClient();
  const { data: projects, isLoading } = useQuery({ queryKey: ["projects"], queryFn: () => api.projects.list() });
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("active");
  const [color, setColor] = useState("#3b82f6");

  const create = useMutation({ mutationFn: (d: Partial<Project>) => api.projects.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); close(); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<Project> }) => api.projects.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); close(); } });
  const del = useMutation({ mutationFn: (id: string) => api.projects.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }) });

  function openEdit(p: Project) { setEdit(p); setName(p.name); setDesc(p.description); setStatus(p.status); setColor(p.color); setModal(true); }
  function close() { setModal(false); setEdit(null); setName(""); setDesc(""); setStatus("active"); setColor("#3b82f6"); }
  function submit() { const d = { name, description: desc, status, color }; edit ? update.mutate({ id: edit.id, d }) : create.mutate(d); }

  if (isLoading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  if (!projects?.length) return <><EmptyState message="暂无项目" /><div className="text-center mt-4"><button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />新建项目</button></div></>;

  return (
    <>
      <div className="flex justify-end mb-4"><button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />新建项目</button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(p => (
          <div key={p.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden relative group">
            <div className="h-1" style={{ backgroundColor: p.color }} />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(p)} className="p-1 rounded hover:bg-[hsl(var(--accent))]"><Edit3 size={14} /></button>
                  <button onClick={() => { if (confirm("确定删除？")) del.mutate(p.id); }} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              {p.description && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">{p.description}</p>}
              <div className="flex items-center gap-2 mt-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>{p.status === "active" ? "进行中" : p.status === "paused" ? "已暂停" : "已完成"}</span>
                {p._count && <span className="text-xs text-[hsl(var(--muted-foreground))]">{p._count.tasks} 个任务</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={close} title={edit ? "编辑项目" : "新建项目"}>
        <div className="space-y-4">
          <div><label className="block text-sm mb-1">名称</label><input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm mb-1">描述</label><textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" rows={3} /></div>
          <div><label className="block text-sm mb-1">状态</label><select value={status} onChange={e => setStatus(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"><option value="active">进行中</option><option value="paused">已暂停</option><option value="completed">已完成</option></select></div>
          <div><label className="block text-sm mb-1">颜色</label><input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-full rounded-lg border border-[hsl(var(--border))]" /></div>
          <button onClick={submit} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium">保存</button>
        </div>
      </Modal>
    </>
  );
}

// ====== Tasks (Kanban) ======
function TasksTab() {
  const qc = useQueryClient();
  const { data: tasks, isLoading } = useQuery({ queryKey: ["tasks"], queryFn: () => api.tasks.list() });
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => api.projects.list() });
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState("");
  const [estimated, setEstimated] = useState("");

  const create = useMutation({ mutationFn: (d: Partial<Task>) => api.tasks.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); close(); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<Task> }) => api.tasks.update(id, d), onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }) });
  const del = useMutation({ mutationFn: (id: string) => api.tasks.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }) });

  function openEdit(t: Task) { setEdit(t); setTitle(t.title); setDesc(t.description); setProjectId(t.projectId || ""); setPriority(t.priority); setStatus(t.status); setDueDate(t.dueDate?.slice(0, 10) || ""); setEstimated(String(t.estimatedMinutes || "")); setModal(true); }
  function close() { setModal(false); setEdit(null); setTitle(""); setDesc(""); setProjectId(""); setPriority("medium"); setStatus("todo"); setDueDate(""); setEstimated(""); }
  function submit() {
    const d: Partial<Task> = { title, description: desc, projectId: projectId || null, priority, status, dueDate: dueDate ? new Date(dueDate).toISOString() : null, estimatedMinutes: parseInt(estimated) || 0 };
    edit ? update.mutate({ id: edit.id, d }) : create.mutate(d);
  }
  function moveTask(task: Task, to: string) { update.mutate({ id: task.id, d: { status: to } }); }

  const columns = [
    { key: "todo", label: "待办", color: "bg-gray-100 dark:bg-gray-800", textColor: "text-gray-600", borderColor: "border-gray-300" },
    { key: "in_progress", label: "进行中", color: "bg-blue-50 dark:bg-blue-900/20", textColor: "text-blue-600", borderColor: "border-blue-300" },
    { key: "done", label: "已完成", color: "bg-green-50 dark:bg-green-900/20", textColor: "text-green-600", borderColor: "border-green-300" },
  ];

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{columns.map(c => <Skeleton key={c.key} className="h-64" />)}</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-[hsl(var(--muted-foreground))]">{tasks?.length || 0} 个任务</span>
        <button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />添加任务</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(col => {
          const colTasks = tasks?.filter(t => t.status === col.key) || [];
          return (
            <div key={col.key} className={`rounded-xl border border-[hsl(var(--border))] ${col.color} overflow-hidden`}>
              <div className={`px-4 py-3 font-medium text-sm ${col.textColor} flex items-center justify-between`}>
                <span>{col.label}</span>
                <span className="text-xs bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <div className="p-3 space-y-2 min-h-[100px]">
                {colTasks.length === 0 && <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-6">暂无</p>}
                {colTasks.map(task => (
                  <div key={task.id} className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-3 text-sm space-y-1.5 group">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{task.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority === "high" ? "高" : task.priority === "medium" ? "中" : "低"}
                      </span>
                    </div>
                    {task.project && <div className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1"><FolderKanban size={12} />{task.project.name}</div>}
                    <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                      {task.dueDate && <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(task.dueDate)}</span>}
                      {task.estimatedMinutes ? <span className="flex items-center gap-1"><Clock size={12} />{task.estimatedMinutes}分钟</span> : null}
                    </div>
                    <div className="flex items-center gap-1 pt-1 border-t border-[hsl(var(--border))] opacity-0 group-hover:opacity-100 transition-opacity">
                      {col.key !== "todo" && <button onClick={() => moveTask(task, col.key === "done" ? "in_progress" : "todo")} className="p-0.5 rounded hover:bg-[hsl(var(--accent))]" title="左移"><ArrowLeft size={14} /></button>}
                      {col.key !== "done" && <button onClick={() => moveTask(task, col.key === "todo" ? "in_progress" : "done")} className="p-0.5 rounded hover:bg-[hsl(var(--accent))]" title="右移"><ArrowRight size={14} /></button>}
                      <button onClick={() => openEdit(task)} className="p-0.5 rounded hover:bg-[hsl(var(--accent))] ml-auto"><Edit3 size={14} /></button>
                      <button onClick={() => { if (confirm("确定删除？")) del.mutate(task.id); }} className="p-0.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Modal open={modal} onClose={close} title={edit ? "编辑任务" : "添加任务"}>
        <div className="space-y-4">
          <div><label className="block text-sm mb-1">标题</label><input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm mb-1">描述</label><textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1">项目</label><select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"><option value="">无</option>{projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div><label className="block text-sm mb-1">优先级</label><select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"><option value="high">高</option><option value="medium">中</option><option value="low">低</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1">状态</label><select value={status} onChange={e => setStatus(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"><option value="todo">待办</option><option value="in_progress">进行中</option><option value="done">已完成</option></select></div>
            <div><label className="block text-sm mb-1">截止日期</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm mb-1">预估时长（分钟）</label><input type="number" value={estimated} onChange={e => setEstimated(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          <button onClick={submit} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium">保存</button>
        </div>
      </Modal>
    </>
  );
}

// ====== Work Logs ======
function LogsTab() {
  const qc = useQueryClient();
  const { data: logs, isLoading } = useQuery({ queryKey: ["workLogs"], queryFn: () => api.workLogs.list() });
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => api.projects.list() });
  const { data: tasks } = useQuery({ queryKey: ["tasks"], queryFn: () => api.tasks.list() });
  const [modal, setModal] = useState(false);
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [duration, setDuration] = useState("30");
  const [filterProject, setFilterProject] = useState("");

  const create = useMutation({ mutationFn: (d: Partial<WorkLog>) => api.workLogs.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["workLogs"] }); close(); } });
  const del = useMutation({ mutationFn: (id: string) => api.workLogs.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["workLogs"] }) });

  function close() { setModal(false); setContent(""); setDate(new Date().toISOString().slice(0, 10)); setProjectId(""); setTaskId(""); setDuration("30"); }
  function submit() { create.mutate({ content, date: new Date(date).toISOString(), projectId: projectId || null, taskId: taskId || null, durationMinutes: parseInt(duration) || 0 }); }

  const today = new Date().toISOString().slice(0, 10);
  const todayTotal = logs?.filter(l => l.date.slice(0, 10) === today).reduce((s, l) => s + l.durationMinutes, 0) || 0;
  const filtered = filterProject ? logs?.filter(l => l.projectId === filterProject) : logs;
  const filteredTasks = projectId ? tasks?.filter(t => t.projectId === projectId) : tasks;

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Timer size={20} className="text-[hsl(var(--primary))]" />
          <span className="text-sm text-[hsl(var(--muted-foreground))]">今日工作时长：</span>
          <span className="text-xl font-bold">{todayTotal} 分钟</span>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">({Math.round(todayTotal / 60 * 10) / 10}h)</span>
        </div>
        <button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />添加日志</button>
      </div>

      <div className="flex gap-2 mb-4">
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm">
          <option value="">全部项目</option>
          {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {!filtered?.length ? <EmptyState message="暂无工作日志" /> : (
        <div className="space-y-2">
          {filtered.map(l => (
            <div key={l.id} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 flex items-start gap-3 group">
              <div className="flex-1 min-w-0">
                <div className="text-sm">{l.content}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(l.date)}</span>
                  {l.project && <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600">{l.project.name}</span>}
                  {l.task && <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">{l.task.title}</span>}
                  <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1"><Clock size={12} />{l.durationMinutes}分钟</span>
                </div>
              </div>
              <button onClick={() => { if (confirm("确定删除？")) del.mutate(l.id); }} className="p-1 rounded hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={close} title="添加工作日志">
        <div className="space-y-4">
          <div><label className="block text-sm mb-1">内容</label><textarea value={content} onChange={e => setContent(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1">日期</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm mb-1">时长（分钟）</label><input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm mb-1">项目</label><select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"><option value="">无</option>{projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label className="block text-sm mb-1">任务</label><select value={taskId} onChange={e => setTaskId(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"><option value="">无</option>{filteredTasks?.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></div>
          <button onClick={submit} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium">保存</button>
        </div>
      </Modal>
    </>
  );
}
