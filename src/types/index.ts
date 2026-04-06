export type Category =
  | "SKIN_CARE"
  | "SLEEP"
  | "MEDICINE"
  | "FOOD"
  | "SUPPLEMENT"
  | "WORK"
  | "OTHER";

export type Frequency = "DAILY" | "WEEKLY" | "CUSTOM";

export type LogStatus = "PENDING" | "DONE" | "SKIPPED";

export const CATEGORIES: { value: Category; label: string; emoji: string; color: string }[] = [
  { value: "SKIN_CARE", label: "Skin Care", emoji: "✨", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { value: "SLEEP", label: "Sono", emoji: "😴", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "MEDICINE", label: "Remédio", emoji: "💊", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "FOOD", label: "Alimentação", emoji: "🍽️", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "SUPPLEMENT", label: "Bomba", emoji: "💪", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "WORK", label: "Trabalho", emoji: "💼", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "OTHER", label: "Outros", emoji: "📌", color: "bg-gray-100 text-gray-800 border-gray-200" },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

export interface RoutineWithLogs {
  id: string;
  name: string;
  description: string | null;
  category: Category;
  targetValue: number | null;
  unit: string | null;
  isActive: boolean;
  frequency: Frequency;
  days: string | null;
  times: string;
  notifyBefore: number;
  snoozeMinutes: number;
  googleEventId: string | null;
  createdAt: string;
  updatedAt: string;
  logs: RoutineLog[];
}

export interface RoutineLog {
  id: string;
  routineId: string;
  scheduledAt: string;
  completedAt: string | null;
  targetValue: number | null;
  actualValue: number | null;
  unit: string | null;
  status: LogStatus;
  notes: string | null;
  createdAt: string;
}
