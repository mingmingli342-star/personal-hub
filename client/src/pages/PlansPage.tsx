import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { Goal, Habit, CalendarEvent } from "../types";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import { formatDate, GOAL_CATEGORIES, STATUS_COLORS } from "../lib/utils";
import {
  Plus, Edit3, Trash2, Target, CheckCircle2, Circle, Flag, Calendar, Clock,
  Heart, GraduationCap, Briefcase, Star, TrendingUp, Zap, X,
} from "lucide-react";

const CAT_ICONS: Record<string, React.ReactNode> = {
  personal: <Star size={20} />, career: <Briefcase size={20} />, health: <Heart size={20} />,
  finance: <TrendingUp size={20} />, learning: <GraduationCap size={20} />, other: <Target size={20} />,
};

type Tab = "goals" | "habits" | "events";

export default function PlansPage() {
  const [tab, setTab] = useState<Tab>("goals");
  const tabs = [
    { key: "goals" as Tab, label: "目标" },
    { key: "habits" as Tab, label: "习惯打卡" },
    { key: "events" as Tab, label: "日程" },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">规划管理</h2>
      <div className="flex gap-1 mb-6 bg-[hsl(var(--muted))] rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-[hsl(var(--card))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"}`}>{t.label}</button>
        ))}
      </div>
      {tab === "goals" && <GoalsTab />}
      {tab === "habits" && <HabitsTab />}
      {tab === "events" && <EventsTab />}
    </div>
  );
}

// ====== Goals ======
function GoalsTab() {
  const qc = useQueryClient();
  const { data: goals, isLoading } = useQuery({ queryKey: ["goals"], queryFn: () => api.goals.list() });
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Goal | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("personal");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [targetDate, setTargetDate] = useState("");
  const [progress, setProgress] = useState("0");
  const [status, setStatus] = useState("active");
  const [color, setColor] = useState("#3b82f6");

  const create = useMutation({ mutationFn: (d: Partial<Goal>) => api.goals.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["goals"] }); close(); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<Goal> }) => api.goals.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["goals"] }); close(); } });
  const del = useMutation({ mutationFn: (id: string) => api.goals.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }) });

  function openEdit(g: Goal) { setEdit(g); setTitle(g.title); setDesc(g.description); setCategory(g.category); setStartDate(g.startDate.slice(0, 10)); setTargetDate(g.targetDate?.slice(0, 10) || ""); setProgress(String(g.progress)); setStatus(g.status); setColor(g.color); setModal(true); }
  function close() { setModal(false); setEdit(null); setTitle(""); setDesc(""); setCategory("personal"); setStartDate(new Date().toISOString().slice(0, 10)); setTargetDate(""); setProgress("0"); setStatus("active"); setColor("#3b82f6"); }
  function submit() {
    const d: Partial<Goal> = { title, description: desc, category, startDate: new Date(startDate).toISOString(), targetDate: targetDate ? new Date(targetDate).toISOString() : null, progress: parseFloat(progress) || 0, status, color };
    edit ? update.mutate({ id: edit.id, d }) : create.mutate(d);
  }

  if (isLoading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>;

  const catIcon = CAT_ICONS[category] || <Target size={20} />;

  return (
    <>
      <div className="flex justify-end mb-4"><button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />添加目标</button></div>
      {!goals?.length ? <EmptyState message="还没有目标，添加一个吧！" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(g => (
            <div key={g.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 relative group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: g.color + "20", color: g.color }}>{CAT_ICONS[g.category] || <Target size={20} />}</div>
                  <div>
                    <h3 className="font-semibold text-sm">{g.title}</h3>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{GOAL_CATEGORIES.find(c => c === g.category) || g.category}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(g)} className="p-1 rounded hover:bg-[hsl(var(--accent))]"><Edit3 size={14} /></button>
                  <button onClick={() => { if (confirm("确定删除？")) del.mutate(g.id); }} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              {g.description && <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3 line-clamp-2">{g.description}</p>}
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1"><span className="text-xs text-[hsl(var(--muted-foreground))]">进度</span><span className="text-xs font-medium">{g.progress}%</span></div>
                <div className="w-full h-2 rounded-full bg-[hsl(var(--muted))]"><div className="h-2 rounded-full transition-all" style={{ width: `${g.progress}%`, backgroundColor: g.color }} /></div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <Calendar size={12} />{formatDate(g.startDate)}{g.targetDate ? ` → ${formatDate(g.targetDate)}` : ""}
              </div>
              <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[g.status]}`}>{g.status === "active" ? "进行中" : g.status === "completed" ? "已完成" : "已暂停"}</span>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={close} title={edit ? "编辑目标" : "添加目标"}>
        <div className="space-y-4">
          <div><label className="block text-sm mb-1">标题</label><input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm mb-1">描述</label><textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1">分类</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm">{GOAL_CATEGORIES.map(c => <option key={c} value={c === "个人" ? "personal" : c === "职业" ? "career" : c === "健康" ? "health" : c === "财务" ? "finance" : c === "学习" ? "learning" : "other"}>{c}</option>)}</select></div>
            <div><label className="block text-sm mb-1">状态</label><select value={status} onChange={e => setStatus(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"><option value="active">进行中</option><option value="completed">已完成</option><option value="paused">已暂停</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1">开始日期</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm mb-1">目标日期</label><input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm mb-1">进度 (%)</label><input type="range" min="0" max="100" value={progress} onChange={e => { setProgress(e.target.value); }} className="w-full" /><div className="text-center text-sm mt-1">{progress}%</div></div>
          <div><label className="block text-sm mb-1">颜色</label><input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-full rounded-lg border border-[hsl(var(--border))]" /></div>
          <button onClick={submit} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium">保存</button>
        </div>
      </Modal>
    </>
  );
}

// ====== Habits ======
function HabitsTab() {
  const qc = useQueryClient();
  const { data: habits, isLoading } = useQuery({ queryKey: ["habits"], queryFn: () => api.habits.list() });
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Habit | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [targetCount, setTargetCount] = useState("1");
  const [color, setColor] = useState("#22c55e");
  const [icon, setIcon] = useState("check");

  const toggle = useMutation({
    mutationFn: (id: string) => api.habitLogs.toggle(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["habits"] });
      const prev = qc.getQueryData<Habit[]>(["habits"]);
      qc.setQueryData<Habit[]>(["habits"], old => old?.map(h => h.id === id ? { ...h, todayDone: !h.todayDone } : h));
      return { prev };
    },
    onSettled: () => { qc.invalidateQueries({ queryKey: ["habits"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
  const create = useMutation({ mutationFn: (d: Partial<Habit>) => api.habits.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["habits"] }); close(); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<Habit> }) => api.habits.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["habits"] }); close(); } });
  const del = useMutation({ mutationFn: (id: string) => api.habits.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }) });

  function openEdit(h: Habit) { setEdit(h); setName(h.name); setDesc(h.description); setFrequency(h.frequency); setTargetCount(String(h.targetCount)); setColor(h.color); setIcon(h.icon); setModal(true); }
  function close() { setModal(false); setEdit(null); setName(""); setDesc(""); setFrequency("daily"); setTargetCount("1"); setColor("#22c55e"); setIcon("check"); }
  function submit() { const d: Partial<Habit> = { name, description: desc, frequency: frequency as "daily" | "weekly" | "monthly", targetCount: parseInt(targetCount) || 1, color, icon }; edit ? update.mutate({ id: edit.id, d }) : create.mutate(d); }

  if (isLoading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36" />)}</div>;

  return (
    <>
      <div className="flex justify-end mb-4"><button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />添加习惯</button></div>
      {!habits?.length ? <EmptyState message="还没有习惯，从今天开始养成一个好习惯吧！" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map(h => (
            <div key={h.id} className={`rounded-xl border border-[hsl(var(--border))] p-5 relative group transition-colors ${h.todayDone ? "bg-green-50/30 dark:bg-green-900/10 border-green-200" : "bg-[hsl(var(--card))]"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: h.color + "20", color: h.color }}><CheckCircle2 size={20} /></div>
                  <div>
                    <h3 className="font-semibold text-sm">{h.name}</h3>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{h.frequency === "daily" ? "每日" : h.frequency === "weekly" ? `每周${h.targetCount}次` : `每月${h.targetCount}次`}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(h)} className="p-1 rounded hover:bg-[hsl(var(--accent))]"><Edit3 size={14} /></button>
                  <button onClick={() => { if (confirm("确定删除？")) del.mutate(h.id); }} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              {h.description && <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">{h.description}</p>}
              <div className="flex justify-center">
                <button
                  onClick={() => toggle.mutate(h.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    h.todayDone ? "bg-green-500 text-white shadow-lg shadow-green-200" : "border-2 border-[hsl(var(--border))] hover:border-green-400 hover:bg-green-50"
                  }`}
                >
                  {h.todayDone ? <CheckCircle2 size={24} /> : <Circle size={24} className="text-[hsl(var(--muted-foreground))]" />}
                </button>
              </div>
              <p className="text-xs text-center mt-2 text-[hsl(var(--muted-foreground))]">{h.todayDone ? "今日已完成" : "点击打卡"}</p>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={close} title={edit ? "编辑习惯" : "添加习惯"}>
        <div className="space-y-4">
          <div><label className="block text-sm mb-1">名称</label><input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm mb-1">描述</label><textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1">频率</label><select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"><option value="daily">每天</option><option value="weekly">每周</option><option value="monthly">每月</option></select></div>
            <div><label className="block text-sm mb-1">目标次数</label><input type="number" value={targetCount} onChange={e => setTargetCount(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm mb-1">颜色</label><input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-full rounded-lg border border-[hsl(var(--border))]" /></div>
          <button onClick={submit} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium">保存</button>
        </div>
      </Modal>
    </>
  );
}

// ====== Events ======
function EventsTab() {
  const qc = useQueryClient();
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: events, isLoading } = useQuery({ queryKey: ["events"], queryFn: () => api.events.list({ startDate: now.toISOString(), endDate: thirtyDays }) });
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<CalendarEvent | null>(null);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState("#3b82f6");
  const [note, setNote] = useState("");

  const create = useMutation({ mutationFn: (d: Partial<CalendarEvent>) => api.events.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["events"] }); close(); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<CalendarEvent> }) => api.events.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["events"] }); close(); } });
  const del = useMutation({ mutationFn: (id: string) => api.events.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }) });

  function openEdit(e: CalendarEvent) {
    setEdit(e); setTitle(e.title); setStartTime(e.startTime.slice(0, 16));
    setEndTime(e.endTime.slice(0, 16)); setAllDay(e.allDay); setColor(e.color); setNote(e.note); setModal(true);
  }
  function close() { setModal(false); setEdit(null); setTitle(""); setStartTime(""); setEndTime(""); setAllDay(false); setColor("#3b82f6"); setNote(""); }
  function submit() {
    const d: Partial<CalendarEvent> = { title, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString(), allDay, color, note };
    edit ? update.mutate({ id: edit.id, d }) : create.mutate(d);
  }

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-[hsl(var(--muted-foreground))]">未来30天</span>
        <button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />添加日程</button>
      </div>
      {!events?.length ? <EmptyState message="暂无日程安排" /> : (
        <div className="space-y-2">
          {events.map(e => (
            <div key={e.id} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex items-start gap-3 group relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: e.color }} />
              <div className="flex-1 min-w-0 pl-2">
                <div className="font-medium text-sm">{e.title}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {e.allDay ? <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600">全天</span> : (
                    <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(e.startTime).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} → {new Date(e.endTime).toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  {e.note && <span className="text-xs text-[hsl(var(--muted-foreground))]">{e.note}</span>}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openEdit(e)} className="p-1 rounded hover:bg-[hsl(var(--accent))]"><Edit3 size={14} /></button>
                <button onClick={() => { if (confirm("确定删除？")) del.mutate(e.id); }} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={close} title={edit ? "编辑日程" : "添加日程"}>
        <div className="space-y-4">
          <div><label className="block text-sm mb-1">标题</label><input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} className="rounded" /><label className="text-sm">全天事件</label></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1">开始时间</label><input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm mb-1">结束时间</label><input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm mb-1">颜色</label><input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-full rounded-lg border border-[hsl(var(--border))]" /></div>
          <div><label className="block text-sm mb-1">备注</label><textarea value={note} onChange={e => setNote(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" rows={2} /></div>
          <button onClick={submit} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium">保存</button>
        </div>
      </Modal>
    </>
  );
}
