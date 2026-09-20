export type {
  AidRequest,
  User,
  AidRequestHistory,
  Document,
  Notification,
} from "@/types/database";

export interface ActionResult {
  success?: string | boolean;
  error?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  pages: number;
  page: number;
}
