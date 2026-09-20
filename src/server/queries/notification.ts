import { supabase } from "@/lib/supabase";
import type { Notification } from "@/types/database";

export async function getUserNotifications(
  userId: string,
  options?: { onlyUnread?: boolean; limit?: number }
): Promise<Notification[]> {
  const { onlyUnread = false, limit = 50 } = options ?? {};

  let query = supabase.from("notifications").select("*").eq("userId", userId);
  if (onlyUnread) query = query.eq("isRead", false);

  const { data, error } = await query
    .order("createdAt", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Supabase: ${error.message}`);
  return (data ?? []) as Notification[];
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("userId", userId)
    .eq("isRead", false);

  if (error) throw new Error(`Supabase: ${error.message}`);
  return count ?? 0;
}
