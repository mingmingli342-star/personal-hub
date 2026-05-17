import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { BodyRecord, ExerciseRecord } from "../types";
import StatCard from "../components/StatCard";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import { formatDate, EXERCISE_TYPES } from "../lib/utils";
import { Plus, Edit3, Trash2, Weight, Ruler, Activity, Flame, Timer, Calendar, Heart, Dumbbell } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts";

const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"];

export default function HealthPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">身体与运动</h2>
      <BodySection />
      <div className="my-8" />
      <ExerciseSection />
    </div>
  );
}

// ====== Body Records ======
function BodySection() {
  const qc = useQueryClient();
  const { data: records, isLoading } = useQuery({ queryKey: ["bodyRecords"], queryFn: () => api.bodyRecords.list() });
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<BodyRecord | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [waist, setWaist] = useState("");
  const [note, setNote] = useState("");

  const create = useMutation({ mutationFn: (d: Partial<BodyRecord> & { height?: number }) => api.bodyRecords.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["bodyRecords"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); close(); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<BodyRecord> }) => api.bodyRecords.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["bodyRecords"] }); close(); } });
  const del = useMutation({ mutationFn: (id: string) => api.bodyRecords.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["bodyRecords"] }) });

  function openEdit(r: BodyRecord) { setEdit(r); setDate(r.date.slice(0, 10)); setWeight(r.weight != null ? String(r.weight) : ""); setHeight(""); setBodyFat(r.bodyFat != null ? String(r.bodyFat) : ""); setWaist(r.waist != null ? String(r.waist) : ""); setNote(r.note); setModal(true); }
  function close() { setModal(false); setEdit(null); setDate(new Date().toISOString().slice(0, 10)); setWeight(""); setHeight(""); setBodyFat(""); setWaist(""); setNote(""); }
  function submit() {
    const d: any = { date: new Date(date).toISOString(), weight: weight ? parseFloat(weight) : null, bodyFat: bodyFat ? parseFloat(bodyFat) : null, waist: waist ? parseFloat(waist) : null, note };
    if (height && weight) d.height = parseFloat(height);
    edit ? update.mutate({ id: edit.id, d }) : create.mutate(d);
  }

  const latest = records?.[0];
  const chartData = useMemo(() => [...(records || [])].reverse().map(r => ({ date: formatDate(r.date), weight: r.weight, bodyFat: r.bodyFat })), [records]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Heart size={20} className="text-red-500" />身体记录</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard title="最近体重" value={isLoading ? "..." : latest?.weight ? `${latest.weight} kg` : "-"} icon={<Weight size={18} />} />
        <StatCard title="最近 BMI" value={isLoading ? "..." : latest?.bmi ? String(latest.bmi) : "-"} icon={<Ruler size={18} />} />
        <StatCard title="最近体脂率" value={isLoading ? "..." : latest?.bodyFat ? `${latest.bodyFat}%` : "-"} icon={<Activity size={18} />} />
        <StatCard title="记录次数" value={isLoading ? "..." : records?.length || 0} icon={<Calendar size={18} />} />
      </div>

      <div className="flex justify-end mb-4"><button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />添加记录</button></div>

      {isLoading ? <Skeleton className="h-64" /> : !records?.length ? <EmptyState message="暂无身体记录" /> : (
        <>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[hsl(var(--border))] text-left text-[hsl(var(--muted-foreground))]">
                  <th className="px-4 py-3 font-medium">日期</th><th className="px-4 py-3 font-medium">体重(kg)</th><th className="px-4 py-3 font-medium">BMI</th><th className="px-4 py-3 font-medium">体脂率(%)</th><th className="px-4 py-3 font-medium">腰围(cm)</th><th className="px-4 py-3 font-medium">备注</th><th className="px-4 py-3 font-medium w-20"></th>
                </tr></thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))]/50 transition-colors">
                      <td className="px-4 py-3">{formatDate(r.date)}</td>
                      <td className="px-4 py-3">{r.weight ?? "-"}</td>
                      <td className="px-4 py-3">{r.bmi ?? "-"}</td>
                      <td className="px-4 py-3">{r.bodyFat != null ? `${r.bodyFat}%` : "-"}</td>
                      <td className="px-4 py-3">{r.waist ?? "-"}</td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] truncate max-w-[100px]">{r.note || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(r)} className="p-1 rounded hover:bg-[hsl(var(--accent))]"><Edit3 size={14} /></button>
                          <button onClick={() => { if (confirm("确定删除？")) del.mutate(r.id); }} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {chartData.length > 1 && (
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
              <h4 className="font-semibold mb-4 text-sm">体重趋势</h4>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="weight" stroke="#3b82f6" fill="#3b82f620" name="体重(kg)" strokeWidth={2} />
                  {chartData.some(d => d.bodyFat) && <Line type="monotone" dataKey="bodyFat" stroke="#f59e0b" strokeWidth={2} name="体脂率(%)" />}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      <Modal open={modal} onClose={close} title={edit ? "编辑身体记录" : "添加身体记录"}>
        <div className="space-y-4">
          <div><label className="block text-sm mb-1">日期</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1">体重 (kg)</label><input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" placeholder="70" /></div>
            <div><label className="block text-sm mb-1">身高 (cm)</label><input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" placeholder="170" /></div>
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">输入身高和体重后自动计算 BMI</div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1">体脂率 (%)</label><input type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" placeholder="20" /></div>
            <div><label className="block text-sm mb-1">腰围 (cm)</label><input type="number" step="0.1" value={waist} onChange={e => setWaist(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" placeholder="80" /></div>
          </div>
          <div><label className="block text-sm mb-1">备注</label><input value={note} onChange={e => setNote(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          <button onClick={submit} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium">保存</button>
        </div>
      </Modal>
    </div>
  );
}

// ====== Exercise Records ======
function ExerciseSection() {
  const qc = useQueryClient();
  const { data: records, isLoading } = useQuery({ queryKey: ["exerciseRecords"], queryFn: () => api.exerciseRecords.list() });
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<ExerciseRecord | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState(EXERCISE_TYPES[0]);
  const [duration, setDuration] = useState("30");
  const [calories, setCalories] = useState("");
  const [intensity, setIntensity] = useState("medium");
  const [note, setNote] = useState("");

  const create = useMutation({ mutationFn: (d: Partial<ExerciseRecord>) => api.exerciseRecords.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["exerciseRecords"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); close(); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<ExerciseRecord> }) => api.exerciseRecords.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["exerciseRecords"] }); close(); } });
  const del = useMutation({ mutationFn: (id: string) => api.exerciseRecords.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["exerciseRecords"] }) });

  function openEdit(r: ExerciseRecord) { setEdit(r); setDate(r.date.slice(0, 10)); setType(r.type); setDuration(String(r.durationMinutes)); setCalories(r.calories != null ? String(r.calories) : ""); setIntensity(r.intensity); setNote(r.note); setModal(true); }
  function close() { setModal(false); setEdit(null); setDate(new Date().toISOString().slice(0, 10)); setType(EXERCISE_TYPES[0]); setDuration("30"); setCalories(""); setIntensity("medium"); setNote(""); }
  function submit() {
    const d: Partial<ExerciseRecord> = { date: new Date(date).toISOString(), type, durationMinutes: parseInt(duration) || 0, calories: calories ? parseFloat(calories) : null, intensity: intensity as "low" | "medium" | "high", note };
    edit ? update.mutate({ id: edit.id, d }) : create.mutate(d);
  }

  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1); weekStart.setHours(0, 0, 0, 0);
  const weekRecords = records?.filter(r => new Date(r.date) >= weekStart) || [];
  const weekMinutes = weekRecords.reduce((s, r) => s + r.durationMinutes, 0);
  const weekCalories = weekRecords.reduce((s, r) => s + (r.calories || 0), 0);

  // Weekly chart
  const weekChart = useMemo(() => {
    const weeks: { label: string; [k: string]: number | string }[] = [];
    for (let w = 3; w >= 0; w--) {
      const ws = new Date(now); ws.setDate(now.getDate() - now.getDay() + 1 - w * 7); ws.setHours(0, 0, 0, 0);
      const we = new Date(ws); we.setDate(ws.getDate() + 6); we.setHours(23, 59, 59);
      const label = `${ws.getMonth() + 1}/${ws.getDate()}`;
      const entry: any = { label };
      const weekRecs = records?.filter(r => { const d = new Date(r.date); return d >= ws && d <= we; }) || [];
      weekRecs.forEach(r => { entry[r.type] = (entry[r.type] || 0) + r.durationMinutes; });
      weeks.push(entry);
    }
    return weeks;
  }, [records]);
  const allTypes = [...new Set(records?.map(r => r.type) || EXERCISE_TYPES.slice(0, 3))];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Dumbbell size={20} className="text-blue-500" />运动记录</h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard title="本周运动时长" value={isLoading ? "..." : `${weekMinutes} 分钟`} icon={<Timer size={18} />} />
        <StatCard title="本周次数" value={isLoading ? "..." : weekRecords.length} icon={<Activity size={18} />} />
        <StatCard title="消耗卡路里" value={isLoading ? "..." : `${Math.round(weekCalories)} kcal`} icon={<Flame size={18} />} />
      </div>

      <div className="flex justify-end mb-4"><button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />添加记录</button></div>

      {isLoading ? <Skeleton className="h-64" /> : !records?.length ? <EmptyState message="暂无运动记录" /> : (
        <>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[hsl(var(--border))] text-left text-[hsl(var(--muted-foreground))]">
                  <th className="px-4 py-3 font-medium">日期</th><th className="px-4 py-3 font-medium">类型</th><th className="px-4 py-3 font-medium">时长(分)</th><th className="px-4 py-3 font-medium">卡路里</th><th className="px-4 py-3 font-medium">强度</th><th className="px-4 py-3 font-medium">备注</th><th className="px-4 py-3 font-medium w-20"></th>
                </tr></thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))]/50 transition-colors">
                      <td className="px-4 py-3">{formatDate(r.date)}</td>
                      <td className="px-4 py-3">{r.type}</td>
                      <td className="px-4 py-3">{r.durationMinutes}</td>
                      <td className="px-4 py-3">{r.calories != null ? `${r.calories}` : "-"}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${r.intensity === "high" ? "bg-red-100 text-red-600" : r.intensity === "medium" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>{r.intensity === "high" ? "高强度" : r.intensity === "medium" ? "中等" : "低强度"}</span></td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] truncate max-w-[100px]">{r.note || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(r)} className="p-1 rounded hover:bg-[hsl(var(--accent))]"><Edit3 size={14} /></button>
                          <button onClick={() => { if (confirm("确定删除？")) del.mutate(r.id); }} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h4 className="font-semibold mb-4 text-sm">每周运动统计（分钟）</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weekChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                {allTypes.map((t, i) => <Bar key={t} dataKey={t} fill={CHART_COLORS[i % CHART_COLORS.length]} name={t} stackId="a" />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <Modal open={modal} onClose={close} title={edit ? "编辑运动记录" : "添加运动记录"}>
        <div className="space-y-4">
          <div><label className="block text-sm mb-1">日期</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm mb-1">运动类型</label><select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm">{EXERCISE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1">时长（分钟）</label><input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm mb-1">消耗卡路里</label><input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" placeholder="可选" /></div>
          </div>
          <div><label className="block text-sm mb-1">强度</label><select value={intensity} onChange={e => setIntensity(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"><option value="low">低</option><option value="medium">中等</option><option value="high">高</option></select></div>
          <div><label className="block text-sm mb-1">备注</label><input value={note} onChange={e => setNote(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          <button onClick={submit} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium">保存</button>
        </div>
      </Modal>
    </div>
  );
}
