export interface FileItem {
  name: string;
  type: string;
  data: string;
  size: number;
}

export interface FieldError {
  name?: string;
  phone?: string;
  email?: string;
  inn?: string;
}

export interface DadataSuggestion {
  value: string;
  data?: Record<string, unknown>;
}

export interface InnInfo {
  name: string;
  type: string;
  kpp?: string;
  ogrn?: string;
  address?: string;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const d = digits.startsWith("8") ? "7" + digits.slice(1) : digits.startsWith("7") ? digits : "7" + digits;
  const n = d.slice(0, 11);
  let result = "+7";
  if (n.length > 1) result += " (" + n.slice(1, 4);
  if (n.length >= 4) result += ") " + n.slice(4, 7);
  if (n.length >= 7) result += "-" + n.slice(7, 9);
  if (n.length >= 9) result += "-" + n.slice(9, 11);
  return result;
}

export function validateName(v: string): string | undefined {
  if (!v.trim()) return "Введите имя";
  if (v.trim().length < 2) return "Имя слишком короткое";
  return undefined;
}

export function validatePhone(v: string): string | undefined {
  const digits = v.replace(/\D/g, "");
  if (!digits) return "Введите телефон";
  if (digits.length < 11) return "Неполный номер телефона";
  return undefined;
}

export function validateEmail(v: string): string | undefined {
  if (!v.trim()) return "Введите email";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Некорректный email";
  return undefined;
}

export function validateInn(v: string): string | undefined {
  if (!v.trim()) return undefined;
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 10 && digits.length !== 12) return "ИНН должен содержать 10 или 12 цифр";
  return undefined;
}

export const INPUT_BASE = "w-full px-4 py-3 rounded text-sm outline-none transition-all font-body";

export const DADATA_TOKEN = import.meta.env.VITE_DADATA_API_KEY || "";