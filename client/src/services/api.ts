import type {
  Account, Transaction, Budget, Project, Task, WorkLog,
  BodyRecord, ExerciseRecord, Goal, Habit, HabitLog,
  CalendarEvent, DashboardData,
} from "../types";

const BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const api = {
  accounts: {
    list: () => request<Account[]>("/accounts"),
    get: (id: string) => request<Account>(`/accounts/${id}`),
    create: (data: Partial<Account>) => request<Account>("/accounts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Account>) => request<Account>(`/accounts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/accounts/${id}`, { method: "DELETE" }),
  },
  transactions: {
    list: (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<Transaction[]>("/transactions" + q);
    },
    get: (id: string) => request<Transaction>(`/transactions/${id}`),
    create: (data: Partial<Transaction>) => request<Transaction>("/transactions", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Transaction>) => request<Transaction>(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/transactions/${id}`, { method: "DELETE" }),
  },
  budgets: {
    list: () => request<Budget[]>("/budgets"),
    create: (data: Partial<Budget>) => request<Budget>("/budgets", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Budget>) => request<Budget>(`/budgets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/budgets/${id}`, { method: "DELETE" }),
  },
  projects: {
    list: () => request<Project[]>("/projects"),
    get: (id: string) => request<Project>(`/projects/${id}`),
    create: (data: Partial<Project>) => request<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Project>) => request<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/projects/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<Task[]>("/tasks" + q);
    },
    create: (data: Partial<Task>) => request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Task>) => request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
  },
  workLogs: {
    list: (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<WorkLog[]>("/work-logs" + q);
    },
    create: (data: Partial<WorkLog>) => request<WorkLog>("/work-logs", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/work-logs/${id}`, { method: "DELETE" }),
  },
  bodyRecords: {
    list: (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<BodyRecord[]>("/body-records" + q);
    },
    create: (data: Partial<BodyRecord>) => request<BodyRecord>("/body-records", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<BodyRecord>) => request<BodyRecord>(`/body-records/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/body-records/${id}`, { method: "DELETE" }),
  },
  exerciseRecords: {
    list: (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<ExerciseRecord[]>("/exercise-records" + q);
    },
    create: (data: Partial<ExerciseRecord>) => request<ExerciseRecord>("/exercise-records", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ExerciseRecord>) => request<ExerciseRecord>(`/exercise-records/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/exercise-records/${id}`, { method: "DELETE" }),
  },
  goals: {
    list: () => request<Goal[]>("/goals"),
    create: (data: Partial<Goal>) => request<Goal>("/goals", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Goal>) => request<Goal>(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/goals/${id}`, { method: "DELETE" }),
  },
  habits: {
    list: () => request<Habit[]>("/habits"),
    create: (data: Partial<Habit>) => request<Habit>("/habits", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Habit>) => request<Habit>(`/habits/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/habits/${id}`, { method: "DELETE" }),
  },
  habitLogs: {
    toggle: (habitId: string, date?: string) => request<{ deleted?: boolean; id: string }>("/habit-logs", { method: "POST", body: JSON.stringify({ habitId, date }) }),
    list: (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<HabitLog[]>("/habit-logs" + q);
    },
  },
  events: {
    list: (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<CalendarEvent[]>("/events" + q);
    },
    create: (data: Partial<CalendarEvent>) => request<CalendarEvent>("/events", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CalendarEvent>) => request<CalendarEvent>(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/events/${id}`, { method: "DELETE" }),
  },
  dashboard: {
    get: () => request<DashboardData>("/dashboard"),
  },
};
