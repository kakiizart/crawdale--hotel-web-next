import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { createRoom, updateRoom, deleteRoom } from "./actions";

type RoomStatus = "available" | "maintenance" | "out_of_service";

function centsToDollars(cents: number) {
  return (cents / 100).toFixed(2);
}

export default async function AdminRoomsPage() {
  await requireRole(["admin", "staff"], "/admin/rooms");

  const supabase = await createClient();

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("id, hotel_id, room_number, room_type, capacity, base_price_cents, status, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Rooms</h1>
        <p style={{ color: "crimson" }}>Failed to load rooms: {error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, display: "grid", gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Rooms</h1>
        <p style={{ opacity: 0.75 }}>Create, edit, and deactivate rooms (RLS enforced).</p>
      </header>

      {/* Create Room */}
      <section style={{ border: "1px solid #3333", borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Create a room</h2>

        <form action={createRoom} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
          <label>
            Hotel ID (optional)
            <input name="hotel_id" placeholder="uuid (optional)" style={{ width: "100%", padding: 8 }} />
          </label>

          <label>
            Room number *
            <input name="room_number" required placeholder="e.g. 101" style={{ width: "100%", padding: 8 }} />
          </label>

          <label>
            Room type *
            <input name="room_type" required placeholder="e.g. Deluxe King" style={{ width: "100%", padding: 8 }} />
          </label>

          <label>
            Capacity
            <input name="capacity" type="number" defaultValue={2} min={1} style={{ width: "100%", padding: 8 }} />
          </label>

          <label>
            Base price (USD) *
            <input name="base_price" required placeholder="e.g. 149.99" style={{ width: "100%", padding: 8 }} />
          </label>

          <label>
            Status
            <select name="status" defaultValue="available" style={{ width: "100%", padding: 8 }}>
              <option value="available">available</option>
              <option value="maintenance">maintenance</option>
              <option value="out_of_service">out_of_service</option>
            </select>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input name="is_active" type="checkbox" defaultChecked />
            Active (public can see if true)
          </label>

          <button type="submit" style={{ padding: 10, fontWeight: 600 }}>
            Create Room
          </button>
        </form>
      </section>

      {/* Rooms List */}
      <section style={{ border: "1px solid #3333", borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          Existing rooms ({rooms?.length ?? 0})
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          {rooms?.map((r) => (
            <div key={r.id} style={{ border: "1px solid #3333", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {r.room_number} — {r.room_type}
                  </div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>
                    Capacity: {r.capacity} • ${centsToDollars(r.base_price_cents)} • Status:{" "}
                    <b>{r.status as RoomStatus}</b> • Active: <b>{String(r.is_active)}</b>
                  </div>
                  <div style={{ opacity: 0.6, fontSize: 12 }}>id: {r.id}</div>
                </div>

                {/* Delete */}
                <form action={deleteRoom}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" style={{ padding: 10 }}>
                    Delete
                  </button>
                </form>
              </div>

              {/* Update */}
              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: "pointer" }}>Edit room</summary>

                <form action={updateRoom} style={{ display: "grid", gap: 10, marginTop: 10, maxWidth: 520 }}>
                  <input type="hidden" name="id" value={r.id} />

                  <label>
                    Hotel ID (optional)
                    <input name="hotel_id" defaultValue={r.hotel_id ?? ""} style={{ width: "100%", padding: 8 }} />
                  </label>

                  <label>
                    Room number
                    <input name="room_number" defaultValue={r.room_number} style={{ width: "100%", padding: 8 }} />
                  </label>

                  <label>
                    Room type
                    <input name="room_type" defaultValue={r.room_type} style={{ width: "100%", padding: 8 }} />
                  </label>

                  <label>
                    Capacity
                    <input name="capacity" type="number" defaultValue={r.capacity} min={1} style={{ width: "100%", padding: 8 }} />
                  </label>

                  <label>
                    Base price (USD)
                    <input
                      name="base_price"
                      defaultValue={centsToDollars(r.base_price_cents)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </label>

                  <label>
                    Status
                    <select name="status" defaultValue={r.status as RoomStatus} style={{ width: "100%", padding: 8 }}>
                      <option value="available">available</option>
                      <option value="maintenance">maintenance</option>
                      <option value="out_of_service">out_of_service</option>
                    </select>
                  </label>

                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input name="is_active" type="checkbox" defaultChecked={!!r.is_active} />
                    Active
                  </label>

                  <button type="submit" style={{ padding: 10, fontWeight: 600 }}>
                    Save changes
                  </button>
                </form>
              </details>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
