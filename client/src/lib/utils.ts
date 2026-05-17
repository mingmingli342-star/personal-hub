export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(n);
}

export function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("zh-CN");
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const CATEGORIES = [
  "餐饮", "交通", "购物", "薪资", "投资", "房租", "娱乐", "医疗", "教育", "其他",
];

export const ACCOUNT_TYPES = [
  { value: "bank", label: "银行卡", icon: "Landmark" },
  { value: "alipay", label: "支付宝", icon: "Smartphone" },
  { value: "wechat", label: "微信", icon: "MessageCircle" },
  { value: "cash", label: "现金", icon: "Banknote" },
  { value: "other", label: "其他", icon: "Wallet" },
];

export const EXERCISE_TYPES = [
  "跑步", "游泳", "骑行", "健身", "瑜伽", "散步", "篮球", "足球", "网球", "其他",
];

export const GOAL_CATEGORIES = [
  "个人", "职业", "健康", "财务", "学习", "其他",
];

export const PRIORITY_COLORS = {
  high: "text-red-500 bg-red-50",
  medium: "text-yellow-500 bg-yellow-50",
  low: "text-gray-500 bg-gray-50",
};

export const STATUS_COLORS: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-600",
  done: "bg-green-100 text-green-600",
  active: "bg-green-100 text-green-600",
  completed: "bg-blue-100 text-blue-600",
  paused: "bg-yellow-100 text-yellow-600",
};

export function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}
