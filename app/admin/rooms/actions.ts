// app/admin/rooms/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

// helpers
function toInt(value: FormDataEntryValue | null, fallback = 0) {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toString(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function dollarsToCents(value: FormDataEntryValue | null) {
  const s = toString(value);
  const n = Number(s);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export async function createRoom(formData: FormData) {
  await requireRole(["admin", "staff"], "/admin/rooms");

  const supabase = await createClient();

  const room_number = toString(formData.get("room_number"));
  const room_type = toString(formData.get("room_type"));
  const capacity = toInt(formData.get("capacity"), 2);
  const base_price_cents = dollarsToCents(formData.get("base_price"));
  const status = toString(formData.get("status")) || "available";

  if (!room_number || !room_type) {
    throw new Error("room_number and room_type are required.");
  }
  if (base_price_cents <= 0) {
    throw new Error("base price must be > 0.");
  }

  // NOTE: hotel_id is nullable in your schema.
  // If you want single-hotel behavior later, we’ll wire hotel_id automatically.
  const { error } = await supabase.from("rooms").insert({
    room_number,
    room_type,
    capacity,
    base_price_cents,
    status,
    is_active: true,
  });

  if (error) throw error;

  revalidatePath("/admin/rooms");
}

export async function updateRoom(formData: FormData) {
  await requireRole(["admin", "staff"], "/admin/rooms");

  const supabase = await createClient();

  const id = toString(formData.get("id"));
  const room_type = toString(formData.get("room_type"));
  const capacity = toInt(formData.get("capacity"), 2);
  const base_price_cents = dollarsToCents(formData.get("base_price"));
  const status = toString(formData.get("status"));

  if (!id) throw new Error("Missing room id.");

  const patch: Record<string, any> = {};
  if (room_type) patch.room_type = room_type;
  if (Number.isFinite(capacity) && capacity > 0) patch.capacity = capacity;
  if (Number.isFinite(base_price_cents) && base_price_cents > 0)
    patch.base_price_cents = base_price_cents;
  if (status) patch.status = status;

  const { error } = await supabase.from("rooms").update(patch).eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/rooms");
}

export async function toggleRoomActive(formData: FormData) {
  await requireRole(["admin", "staff"], "/admin/rooms");

  const supabase = await createClient();

  const id = toString(formData.get("id"));
  const is_active = toString(formData.get("is_active")) === "true";

  if (!id) throw new Error("Missing room id.");

  const { error } = await supabase
    .from("rooms")
    .update({ is_active: !is_active })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/rooms");
}

export async function deleteRoom(formData: FormData) {
  await requireRole(["admin", "staff"], "/admin/rooms");

  const supabase = await createClient();

  const id = toString(formData.get("id"));
  if (!id) throw new Error("Missing room id.");

  const { error } = await supabase.from("rooms").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/rooms");
}
