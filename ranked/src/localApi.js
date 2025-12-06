import { db } from "./db.js";

/* -------------------------------- EQUIPOS -------------------------------- */

export async function saveEquipo(equipo) {
  await db.put("equipos", equipo);
  await db.add("pending_operations", {
    type: "upsert",
    table: "equipos",
    data: equipo,
  });
}

export async function deleteEquipo(id) {
  await db.delete("equipos", id);
  await db.add("pending_operations", {
    type: "delete",
    table: "equipos",
    data: { id },
  });
}

export async function getEquipos() {
  return await db.getAll("equipos");
}

/* ------------------------------ ACTIVIDADES ------------------------------ */

export async function saveActividad(act) {
  await db.put("actividades", act);
  await db.add("pending_operations", {
    type: "upsert",
    table: "actividades",
    data: act,
  });
}

export async function deleteActividad(id) {
  await db.delete("actividades", id);
  await db.add("pending_operations", {
    type: "delete",
    table: "actividades",
    data: { id },
  });
}

export async function getActividades() {
  return await db.getAll("actividades");
}

/* -------------------------------- PUNTAJES -------------------------------- */

export async function savePuntaje(p) {
  await db.put("puntajes", p);
  await db.add("pending_operations", {
    type: "upsert",
    table: "puntajes",
    data: p,
  });
}

export async function deletePuntaje(id) {
  await db.delete("puntajes", id);
  await db.add("pending_operations", {
    type: "delete",
    table: "puntajes",
    data: { id },
  });
}

export async function getPuntajes() {
  return await db.getAll("puntajes");
}
