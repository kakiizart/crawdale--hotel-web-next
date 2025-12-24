// app/admin/rooms/page.tsx
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createRoom, deleteRoom, toggleRoomActive, updateRoom } from "./actions";

// ✅ RetroUI Table component you added
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/retroui/Table";

export default async function AdminRoomsPage() {
  await requireRole(["admin", "staff"], "/admin/rooms");

  const supabase = await createClient();

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select(
      "id, room_number, room_type, capacity, base_price_cents, status, is_active, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border p-4">
        <div className="font-semibold">Rooms</div>
        <p className="text-sm text-red-600 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-head">Rooms</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Staff/Admin CRUD (RLS enforced).
        </p>
      </div>

      {/* Create */}
      <div className="rounded-xl border p-4">
        <h2 className="font-semibold font-head">Create room</h2>

        <form
          action={createRoom}
          className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          <input
            name="room_number"
            placeholder="Room # (e.g. 101)"
            className="rounded-md border px-3 py-2"
            required
          />
          <input
            name="room_type"
            placeholder="Type (e.g. queen)"
            className="rounded-md border px-3 py-2"
            required
          />
          <input
            name="capacity"
            type="number"
            min={1}
            defaultValue={2}
            className="rounded-md border px-3 py-2"
          />
          <input
            name="base_price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Base price ($)"
            className="rounded-md border px-3 py-2"
            required
          />
          <select
            name="status"
            className="rounded-md border px-3 py-2"
            defaultValue="available"
          >
            <option value="available">available</option>
            <option value="maintenance">maintenance</option>
            <option value="out_of_service">out_of_service</option>
          </select>

          <button className="md:col-span-5 rounded-md border px-3 py-2">
            Create
          </button>
        </form>
      </div>

      {/* List */}
      <div className="rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold font-head">
          All rooms
        </div>

        <div className="overflow-x-auto p-2">
          <Table>
            <TableCaption className="text-muted-foreground">
              {rooms?.length ? "Latest rooms first." : "No rooms yet."}
            </TableCaption>

            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cap</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(rooms ?? []).map((r) => {
                const dollars = (r.base_price_cents / 100).toFixed(2);

                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.room_number}
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <form
                        action={updateRoom}
                        className="flex gap-2 items-center"
                      >
                        <input type="hidden" name="id" value={r.id} />
                        <input
                          name="room_type"
                          defaultValue={r.room_type}
                          className="w-32 rounded-md border px-2 py-1"
                        />
                        <button className="rounded-md border px-2 py-1">
                          Save
                        </button>
                      </form>
                    </TableCell>

                    {/* Capacity */}
                    <TableCell>
                      <form
                        action={updateRoom}
                        className="flex gap-2 items-center"
                      >
                        <input type="hidden" name="id" value={r.id} />
                        <input
                          name="capacity"
                          type="number"
                          min={1}
                          defaultValue={r.capacity}
                          className="w-20 rounded-md border px-2 py-1"
                        />
                        <button className="rounded-md border px-2 py-1">
                          Save
                        </button>
                      </form>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <form
                        action={updateRoom}
                        className="flex gap-2 items-center"
                      >
                        <input type="hidden" name="id" value={r.id} />
                        <input
                          name="base_price"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={dollars}
                          className="w-24 rounded-md border px-2 py-1"
                        />
                        <button className="rounded-md border px-2 py-1">
                          Save
                        </button>
                      </form>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <form
                        action={updateRoom}
                        className="flex gap-2 items-center"
                      >
                        <input type="hidden" name="id" value={r.id} />
                        <select
                          name="status"
                          defaultValue={r.status}
                          className="rounded-md border px-2 py-1"
                        >
                          <option value="available">available</option>
                          <option value="maintenance">maintenance</option>
                          <option value="out_of_service">out_of_service</option>
                        </select>
                        <button className="rounded-md border px-2 py-1">
                          Save
                        </button>
                      </form>
                    </TableCell>

                    {/* Active */}
                    <TableCell>
                      <form action={toggleRoomActive}>
                        <input type="hidden" name="id" value={r.id} />
                        <input
                          type="hidden"
                          name="is_active"
                          value={String(r.is_active)}
                        />
                        <button className="rounded-md border px-2 py-1">
                          {r.is_active ? "true" : "false"}
                        </button>
                      </form>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <form action={deleteRoom}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="rounded-md border px-2 py-1">
                          Delete
                        </button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })}

              {rooms?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No rooms yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
