import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { Account, Transaction, Budget } from "../types";
import StatCard from "../components/StatCard";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import { formatCurrency, formatDate, CATEGORIES, ACCOUNT_TYPES } from "../lib/utils";
import {
  Plus, Edit3, Trash2, TrendingUp, TrendingDown, Wallet, PiggyBank, Landmark,
  Smartphone, MessageCircle, Banknote, PieChart, ArrowUpDown, Target, X,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart as RPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  bank: <Landmark size={24} />, alipay: <Smartphone size={24} />, wechat: <MessageCircle size={24} />,
  cash: <Banknote size={24} />, other: <Wallet size={24} />,
};

type Tab = "accounts" | "transactions" | "budgets";

export default function AssetsPage() {
  const [tab, setTab] = useState<Tab>("accounts");
  const qc = useQueryClient();

  const { data: accounts, isLoading: al } = useQuery({ queryKey: ["accounts"], queryFn: () => api.accounts.list() });
  const { data: transactions, isLoading: tl } = useQuery({ queryKey: ["transactions"], queryFn: () => api.transactions.list() });
  const { data: budgets, isLoading: bl } = useQuery({ queryKey: ["budgets"], queryFn: () => api.budgets.list() });

  const totalBalance = accounts?.reduce((s, a) => s + a.balance, 0) ?? 0;
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthlyTxs = transactions?.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }) ?? [];
  const monthlyIncome = monthlyTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = monthlyTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // Monthly chart data
  const monthChart = React.useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    transactions?.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { income: 0, expense: 0 };
      if (t.type === "income") map[key].income += t.amount;
      else map[key].expense += t.amount;
    });
    return Object.entries(map).sort().slice(-12).map(([k, v]) => ({ month: k, ...v }));
  }, [transactions]);

  const categoryChart = React.useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTxs.filter(t => t.type === "expense").forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [monthlyTxs]);

  const tabs = [
    { key: "accounts" as Tab, label: "账户", count: accounts?.length },
    { key: "transactions" as Tab, label: "收支记录", count: transactions?.length },
    { key: "budgets" as Tab, label: "预算", count: budgets?.length },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">资产管理</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="总资产" value={al ? "..." : formatCurrency(totalBalance)} icon={<Wallet size={18} />} />
        <StatCard title="本月收入" value={tl ? "..." : formatCurrency(monthlyIncome)} icon={<TrendingUp size={18} />} trend="up" />
        <StatCard title="本月支出" value={tl ? "..." : formatCurrency(monthlyExpense)} icon={<TrendingDown size={18} />} trend="down" />
        <StatCard title="账户数量" value={accounts?.length ?? "..."} icon={<PiggyBank size={18} />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[hsl(var(--muted))] rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-[hsl(var(--card))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "accounts" && <AccountsTab accounts={accounts} isLoading={al} />}
      {tab === "transactions" && <TransactionsTab transactions={transactions} isLoading={tl} accounts={accounts} monthChart={monthChart} categoryChart={categoryChart} />}
      {tab === "budgets" && <BudgetsTab budgets={budgets} isLoading={bl} />}
    </div>
  );
}

// ====== Accounts Tab ======
function AccountsTab({ accounts, isLoading }: { accounts?: Account[]; isLoading: boolean }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Account | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [balance, setBalance] = useState("0");
  const [color, setColor] = useState("#3b82f6");

  const create = useMutation({ mutationFn: (d: Partial<Account>) => api.accounts.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts"] }); closeModal(); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<Account> }) => api.accounts.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts"] }); closeModal(); } });
  const del = useMutation({ mutationFn: (id: string) => api.accounts.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }) });

  function openEdit(a: Account) { setEdit(a); setName(a.name); setType(a.type); setBalance(String(a.balance)); setColor(a.color); setModal(true); }
  function closeModal() { setModal(false); setEdit(null); setName(""); setType("bank"); setBalance("0"); setColor("#3b82f6"); }
  function submit() {
    const d = { name, type, balance: parseFloat(balance) || 0, color };
    edit ? update.mutate({ id: edit.id, d }) : create.mutate(d);
  }

  if (isLoading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  if (!accounts?.length) return <><EmptyState message="暂无账户" /><div className="text-center mt-4"><button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />添加账户</button></div><AccountModal {...{ modal, closeModal, name, setName, type, setType, balance, setBalance, color, setColor, submit, edit }} /></>;

  return (
    <>
      <div className="flex justify-end mb-4"><button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />添加账户</button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(a => (
          <div key={a.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 relative group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: a.color + "20", color: a.color }}>{TYPE_ICONS[a.type] || <Wallet size={24} />}</div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(a)} className="p-1 rounded hover:bg-[hsl(var(--accent))]"><Edit3 size={14} /></button>
                <button onClick={() => { if (confirm("确定删除？")) del.mutate(a.id); }} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="text-lg font-bold">{formatCurrency(a.balance)}</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{a.name}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{ACCOUNT_TYPES.find(t => t.value === a.type)?.label}</div>
          </div>
        ))}
      </div>
      <AccountModal {...{ modal, closeModal, name, setName, type, setType, balance, setBalance, color, setColor, submit, edit }} />
    </>
  );
}

function AccountModal({ modal, closeModal, name, setName, type, setType, balance, setBalance, color, setColor, submit, edit }: any) {
  return (
    <Modal open={modal} onClose={closeModal} title={edit ? "编辑账户" : "添加账户"}>
      <div className="space-y-4">
        <div><label className="block text-sm mb-1">名称</label><input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
        <div><label className="block text-sm mb-1">类型</label><select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm">{ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
        <div><label className="block text-sm mb-1">初始余额</label><input type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
        <div><label className="block text-sm mb-1">颜色</label><input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-full rounded-lg border border-[hsl(var(--border))]" /></div>
        <button onClick={submit} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium">保存</button>
      </div>
    </Modal>
  );
}

// ====== Transactions Tab ======
function TransactionsTab({ transactions, isLoading, accounts, monthChart, categoryChart }: { transactions?: Transaction[]; isLoading: boolean; accounts?: Account[]; monthChart: any[]; categoryChart: any[] }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Transaction | null>(null);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [desc, setDesc] = useState("");

  const create = useMutation({ mutationFn: (d: Partial<Transaction>) => api.transactions.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); qc.invalidateQueries({ queryKey: ["accounts"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); closeModal(); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<Transaction> }) => api.transactions.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); qc.invalidateQueries({ queryKey: ["accounts"] }); closeModal(); } });
  const del = useMutation({ mutationFn: (id: string) => api.transactions.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); qc.invalidateQueries({ queryKey: ["accounts"] }); } });

  function openEdit(t: Transaction) { setEdit(t); setAmount(String(t.amount)); setType(t.type); setCategory(t.category); setAccountId(t.accountId); setDate(t.date.slice(0, 10)); setDesc(t.description); setModal(true); }
  function closeModal() { setModal(false); setEdit(null); setAmount(""); setType("expense"); setCategory(CATEGORIES[0]); setAccountId(""); setDate(new Date().toISOString().slice(0, 10)); setDesc(""); }
  function submit() {
    const d = { amount: parseFloat(amount) || 0, type, category, accountId, date: new Date(date).toISOString(), description: desc };
    edit ? update.mutate({ id: edit.id, d }) : create.mutate(d);
  }

  if (isLoading) return <TableSkeleton rows={5} />;

  return (
    <>
      <div className="flex justify-end mb-4"><button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />添加记录</button></div>

      {!transactions?.length ? <EmptyState message="暂无收支记录" /> : (
        <>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[hsl(var(--border))] text-left text-[hsl(var(--muted-foreground))]">
                  <th className="px-4 py-3 font-medium">日期</th><th className="px-4 py-3 font-medium">类别</th><th className="px-4 py-3 font-medium">账户</th><th className="px-4 py-3 font-medium">备注</th><th className="px-4 py-3 font-medium text-right">金额</th><th className="px-4 py-3 font-medium w-20"></th>
                </tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))]/50 transition-colors">
                      <td className="px-4 py-3">{formatDate(t.date)}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-[hsl(var(--muted))]">{t.category}</span></td>
                      <td className="px-4 py-3">{t.account?.name}</td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] truncate max-w-[120px]">{t.description || "-"}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${t.type === "income" ? "text-green-500" : "text-red-500"}`}>{t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1"><button onClick={() => openEdit(t)} className="p-1 rounded hover:bg-[hsl(var(--accent))]"><Edit3 size={14} /></button><button onClick={() => { if (confirm("确定删除？")) del.mutate(t.id); }} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          {monthChart.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                <h3 className="font-semibold mb-4 text-sm">收支趋势</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthChart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="收入" /><Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="支出" /></LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                <h3 className="font-semibold mb-4 text-sm">本月支出分类</h3>
                {categoryChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RPieChart><Pie data={categoryChart} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ¥${value}`}><Tooltip />{categoryChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie></RPieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">本月暂无支出数据</p>}
              </div>
            </div>
          )}
        </>
      )}

      <TransactionModal {...{ modal, closeModal, amount, setAmount, type, setType, category, setCategory, accountId, setAccountId, date, setDate, desc, setDesc, submit, edit, accounts }} />
    </>
  );
}

function TransactionModal({ modal, closeModal, amount, setAmount, type, setType, category, setCategory, accountId, setAccountId, date, setDate, desc, setDesc, submit, edit, accounts }: any) {
  return (
    <Modal open={modal} onClose={closeModal} title={edit ? "编辑记录" : "添加收支记录"}>
      <div className="space-y-4">
        <div className="flex gap-2"><button onClick={() => setType("expense")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === "expense" ? "bg-red-500 text-white" : "bg-[hsl(var(--muted))]"}`}>支出</button><button onClick={() => setType("income")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === "income" ? "bg-green-500 text-white" : "bg-[hsl(var(--muted))]"}`}>收入</button></div>
        <div><label className="block text-sm mb-1">金额</label><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
        <div><label className="block text-sm mb-1">分类</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className="block text-sm mb-1">账户</label><select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"><option value="">选择账户</option>{accounts?.map((a: Account) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        <div><label className="block text-sm mb-1">日期</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
        <div><label className="block text-sm mb-1">备注</label><input value={desc} onChange={e => setDesc(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
        <button onClick={submit} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium">保存</button>
      </div>
    </Modal>
  );
}

// ====== Budgets Tab ======
function BudgetsTab({ budgets, isLoading }: { budgets?: Budget[]; isLoading: boolean }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Budget | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  const create = useMutation({ mutationFn: (d: Partial<Budget>) => api.budgets.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["budgets"] }); closeModal(); } });
  const update = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<Budget> }) => api.budgets.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["budgets"] }); closeModal(); } });
  const del = useMutation({ mutationFn: (id: string) => api.budgets.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }) });

  function openEdit(b: Budget) { setEdit(b); setCategory(b.category); setAmount(String(b.amount)); setPeriod(b.period); setModal(true); }
  function closeModal() { setModal(false); setEdit(null); setCategory(CATEGORIES[0]); setAmount(""); setPeriod("monthly"); }
  function submit() { const d = { category, amount: parseFloat(amount) || 0, period, startDate: new Date().toISOString() }; edit ? update.mutate({ id: edit.id, d }) : create.mutate(d); }

  if (isLoading) return <TableSkeleton rows={3} />;

  return (
    <>
      <div className="flex justify-end mb-4"><button onClick={() => setModal(true)} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Plus size={16} />添加预算</button></div>
      {!budgets?.length ? <EmptyState message="暂无预算" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => (
            <div key={b.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 relative group">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-1 rounded-full text-xs bg-[hsl(var(--muted))]">{b.category}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(b)} className="p-1 rounded hover:bg-[hsl(var(--accent))]"><Edit3 size={14} /></button>
                  <button onClick={() => { if (confirm("确定删除？")) del.mutate(b.id); }} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(b.amount)}</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{b.period === "monthly" ? "每月预算" : "年度预算"}</div>
              <div className="w-full h-1.5 rounded-full bg-[hsl(var(--muted))] mt-3"><div className="h-1.5 rounded-full bg-[hsl(var(--primary))]" style={{ width: "60%" }} /></div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={closeModal} title={edit ? "编辑预算" : "添加预算"}>
        <div className="space-y-4">
          <div><label className="block text-sm mb-1">分类</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-sm mb-1">预算金额</label><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm mb-1">周期</label><select value={period} onChange={e => setPeriod(e.target.value as any)} className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"><option value="monthly">每月</option><option value="yearly">每年</option></select></div>
          <button onClick={submit} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2 text-sm font-medium">保存</button>
        </div>
      </Modal>
    </>
  );
}

function TableSkeleton({ rows }: { rows: number }) {
  return <div className="space-y-3">{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
}
