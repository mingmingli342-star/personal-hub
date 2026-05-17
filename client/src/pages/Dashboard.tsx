import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import StatCard from "../components/StatCard";
import { CardSkeleton } from "../components/Skeleton";
import { formatCurrency, formatDate, PRIORITY_COLORS } from "../lib/utils";
import { Wallet, TrendingUp, TrendingDown, Briefcase, Activity, Target, Dumbbell, CheckCircle2, Circle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => api.dashboard.get() });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">仪表盘</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (<CardSkeleton key={i} />))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const incomePercent = data.monthlyIncome + data.monthlyExpense > 0
    ? Math.round((data.monthlyIncome / (data.monthlyIncome + data.monthlyExpense)) * 100) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">仪表盘</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="总资产"
          value={formatCurrency(data.totalBalance)}
          sub={data.totalBalance >= 0 ? "资产状况良好" : "净值资产"}
          icon={<Wallet size={18} />}
        />
        <StatCard
          title="本月收入"
          value={formatCurrency(data.monthlyIncome)}
          icon={<TrendingUp size={18} />}
          trend="up"
        />
        <StatCard
          title="本月支出"
          value={formatCurrency(data.monthlyExpense)}
          sub={data.monthlyIncome > 0 ? `收支比 ${incomePercent}%` : undefined}
          icon={<TrendingDown size={18} />}
          trend="down"
        />
        <StatCard
          title="本周运动"
          value={`${data.weeklyExerciseMinutes} 分钟`}
          sub={data.weeklyExerciseMinutes >= 150 ? "达标！" : "继续加油"}
          icon={<Dumbbell size={18} />}
          trend={data.weeklyExerciseMinutes >= 150 ? "up" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Transactions */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h3 className="font-semibold mb-4">最近交易</h3>
          {data.recentTransactions.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] py-4 text-center">暂无交易记录</p>
          ) : (
            <div className="space-y-2">
              {data.recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0">
                  <div>
                    <div className="text-sm font-medium">{t.category}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(t.date)} · {t.account?.name}</div>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === "income" ? "text-green-500" : "text-red-500"}`}>
                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks & Work */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h3 className="font-semibold mb-4">工作概览</h3>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{data.pendingTasks}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">待办任务</div>
            </div>
            <div className="flex-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{data.activeProjects}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">进行中项目</div>
            </div>
          </div>
          {data.recentWorkLogs.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] py-2 text-center">暂无工作日志</p>
          ) : (
            <div className="space-y-2">
              {data.recentWorkLogs.slice(0, 3).map((l) => (
                <div key={l.id} className="text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="flex-1 truncate">{l.content}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{l.durationMinutes}分钟</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Habits & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h3 className="font-semibold mb-4">今日习惯打卡</h3>
          {data.todayHabits.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] py-4 text-center">暂无习惯，去规划页面创建吧</p>
          ) : (
            <div className="space-y-2">
              {data.todayHabits.map(({ habit, done }) => (
                <div key={habit.id} className="flex items-center gap-3 py-2">
                  {done
                    ? <CheckCircle2 size={20} className="text-green-500" />
                    : <Circle size={20} className="text-[hsl(var(--muted-foreground))]" />
                  }
                  <span className={`text-sm flex-1 ${done ? "line-through text-[hsl(var(--muted-foreground))]" : ""}`}>
                    {habit.name}
                  </span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{habit.frequency === "daily" ? "每日" : habit.frequency === "weekly" ? "每周" : "每月"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h3 className="font-semibold mb-4">进行中的目标</h3>
          {data.activeGoals.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] py-4 text-center">暂无目标</p>
          ) : (
            <div className="space-y-3">
              {data.activeGoals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[hsl(var(--muted))]">
                    <div className="h-2 rounded-full bg-[hsl(var(--primary))] transition-all" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
