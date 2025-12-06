import { db } from "./db.js";
import { supabase } from "./supabaseClient.js";

/* ============================================================
   🔄 1. DESCARGA COMPLETA DESDE SUPABASE
   (solo con internet)
   ============================================================ */
export async function downloadFullData() {
  if (!navigator.onLine) return;

  console.log("⬇ Descargando datos desde Supabase…");

  const tablas = ["equipos", "actividades", "puntajes"];

  for (const t of tablas) {
    const { data, error } = await supabase.from(t).select("*");
    if (!error && data) {
      await db.clear(t);
      for (const item of data) await db.put(t, item);
    }
  }

  console.log("✔ Descarga completa lista");
}

/* ============================================================
   🔁 2. SINCRONIZAR OPERACIONES PENDIENTES
   insert/update → upsert
   delete → delete
   ============================================================ */
export async function syncPending() {
  const ops = await db.getAll("pending_operations");
  if (!ops.length) return;

  console.log("🔄 Sincronizando cambios pendientes…", ops);

  for (const op of ops) {
    const { table, type, data } = op;

    if (type === "upsert") {
      // combina insert + update
      await supabase.from(table).upsert(data);
    }

    if (type === "delete") {
      await supabase.from(table).delete().eq("id", data.id);
    }
  }

  await db.clear("pending_operations");
  console.log("✔ Sincronización finalizada");
}
