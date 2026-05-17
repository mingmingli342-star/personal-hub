export interface Account {
  id: string; name: string; type: string; balance: number;
  color: string; icon: string; createdAt: string; updatedAt: string;
  transactions?: Transaction[];
}
export interface Transaction {
  id: string; amount: number; type: "income" | "expense"; category: string;
  description: string; date: string; accountId: string;
  account?: Account; createdAt: string; updatedAt: string;
}
export interface Budget {
  id: string; category: string; amount: number; period: "monthly" | "yearly";
  startDate: string; createdAt: string; updatedAt: string;
}
export interface Project {
  id: string; name: string; description: string; status: string;
  color: string; createdAt: string; updatedAt: string;
  _count?: { tasks: number };
}
export interface Task {
  id: string; title: string; description: string; status: "todo" | "in_progress" | "done";
  priority: "high" | "medium" | "low"; dueDate: string | null; projectId: string | null;
  estimatedMinutes: number | null; project?: Project; createdAt: string; updatedAt: string;
}
export interface WorkLog {
  id: string; content: string; date: string; durationMinutes: number;
  projectId: string | null; taskId: string | null;
  project?: Project; task?: Task; createdAt: string; updatedAt: string;
}
export interface BodyRecord {
  id: string; date: string; weight: number | null; bodyFat: number | null;
  bmi: number | null; waist: number | null; note: string;
  createdAt: string; updatedAt: string;
}
export interface ExerciseRecord {
  id: string; date: string; type: string; durationMinutes: number;
  calories: number | null; intensity: "low" | "medium" | "high";
  note: string; createdAt: string; updatedAt: string;
}
export interface Goal {
  id: string; title: string; description: string; category: string;
  startDate: string; targetDate: string | null; progress: number;
  status: string; color: string; createdAt: string; updatedAt: string;
}
export interface Habit {
  id: string; name: string; description: string; frequency: "daily" | "weekly" | "monthly";
  targetCount: number; color: string; icon: string;
  todayDone?: boolean; createdAt: string; updatedAt: string;
}
export interface HabitLog {
  id: string; date: string; habitId: string;
  completed: boolean; note: string; createdAt: string;
}
export interface CalendarEvent {
  id: string; title: string; startTime: string; endTime: string;
  allDay: boolean; color: string; note: string;
  createdAt: string; updatedAt: string;
}
export interface DashboardData {
  totalBalance: number; monthlyIncome: number; monthlyExpense: number;
  recentTransactions: Transaction[]; pendingTasks: number;
  activeProjects: number; recentWorkLogs: WorkLog[];
  latestBodyRecord: BodyRecord | null; weeklyExerciseMinutes: number;
  activeGoals: Goal[]; todayHabits: { habit: Habit; done: boolean }[];
  upcomingEvents: CalendarEvent[];
}
