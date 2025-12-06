import { getEquipos, getPuntajes } from "./localApi.js";

export async function rankingLocal() {
  const equipos = await getEquipos();
  const puntajes = await getPuntajes();

  return equipos
    .map((e) => {
      const pts = puntajes.filter((p) => p.equipo_id === e.id);

      return {
        id: e.id,
        nombre: e.nombre,
        color: e.color,
        total_puntos: pts.reduce((a, b) => a + b.puntos, 0),
        actividades_participadas: pts.length,
      };
    })
    .sort((a, b) => b.total_puntos - a.total_puntos);
}
