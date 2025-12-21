"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";

type RoomStatus = "available" | "maintenance" | "out_of_service";

function parseIntSafe(value: FormDataEntryValue | null, fallback?: number) {
  if (value === null) return fallback;
  const n = Number(String(value));
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

/**
 * Accepts "150" (dollars) or "150.50" and converts to cents.
 * If you type "15000" intending cents, that's also valid (just type dollars usually).
 */
function parseMoneyToCents(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  // If it contains a decimal, treat as dollars
  if (raw.includes(".")) {
    const dollars = Number(raw);
    if (!Number.isFinite(dollars)) return null;
    return Math.round(dollars * 100);
  }

  // If no decimal, treat as dollars (friendlier for admins)
  const dollars = Number(raw);
  if (!Number.isFinite(dollars)) return null;
  return Math.round(dollars * 100);
}

function cleanText(value: FormDataEntryValue | null) {
  const s = String(value ?? "").trim();
  return s.length ? s : null;
}

export async function createRoom(formData: FormData) {
  await requireRole(["admin", "staff"], "/admin/rooms");

  const supabase = await createClient();

  const hotel_id = cleanText(formData.get("hotel_id")); // optional
  const room_number = cleanText(formData.get("room_number"));
  const room_type = cleanText(formData.get("room_type"));
  const capacity = parseIntSafe(formData.get("capacity"), 2);
  const base_price_cents = parseMoneyToCents(formData.get("base_price"));
  const status = (cleanText(formData.get("status")) ?? "available") as RoomStatus;
  const is_active = formData.get("is_active") === "on";

  if (!room_number || !room_type || base_price_cents === null) {
    throw new Error("Missing required fields: room_number, room_type, base_price");
  }

  const { error } = await supabase.from("rooms").insert({
    hotel_id: hotel_id || null,
    room_number,
    room_type,
    capacity,
    base_price_cents,
    status,
    is_active,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/rooms");
}

export async function updateRoom(formData: FormData) {
  await requireRole(["admin", "staff"], "/admin/rooms");

  const supabase = await createClient();

  const id = cleanText(formData.get("id"));
  if (!id) throw new Error("Missing room id");

  const patch: Record<string, any> = {};

  const hotel_id = cleanText(formData.get("hotel_id"));
  const room_number = cleanText(formData.get("room_number"));
  const room_type = cleanText(formData.get("room_type"));
  const capacity = parseIntSafe(formData.get("capacity"));
  const base_price_cents = parseMoneyToCents(formData.get("base_price"));
  const status = cleanText(formData.get("status")) as RoomStatus | null;

  // Only set fields present (so you can submit partial updates)
  if (hotel_id !== null) patch.hotel_id = hotel_id || null;
  if (room_number !== null) patch.room_number = room_number;
  if (room_type !== null) patch.room_type = room_type;
  if (capacity !== undefined) patch.capacity = capacity;
  if (base_price_cents !== null) patch.base_price_cents = base_price_cents;
  if (status) patch.status = status;

  // checkbox comes only when included in form
  if (formData.has("is_active")) patch.is_active = formData.get("is_active") === "on";

  const { error } = await supabase.from("rooms").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/rooms");
}

export async function deleteRoom(formData: FormData) {
  await requireRole(["admin", "staff"], "/admin/rooms");

  const supabase = await createClient();
  const id = cleanText(formData.get("id"));
  if (!id) throw new Error("Missing room id");

  const { error } = await supabase.from("rooms").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/rooms");
}
