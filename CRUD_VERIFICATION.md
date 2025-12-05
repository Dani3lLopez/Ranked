# ✅ VERIFICACIÓN COMPLETA DE CRUD

## 📋 Tabla: EQUIPOS

### ✏️ CREATE (Crear)
- **Ubicación**: Tab "Inicio" → Formulario "Nuevo Equipo"
- **Campos**: Nombre, Color
- **Prueba**: 
  - [ ] Ingresa nombre y selecciona color
  - [ ] Haz clic en "Crear equipo"
  - [ ] Verifica que aparezca en Tab "Equipos"
  - [ ] Verifica que se actualice el selector en "Registrar Puntaje"

### 📖 READ (Leer)
- **Ubicación**: Tab "Equipos"
- **Prueba**:
  - [ ] Abre Tab "Equipos"
  - [ ] Verifica que se cargen todos los equipos creados
  - [ ] Verifica que se muestren nombre y color
  - [ ] Verifica el botón "🔄 Actualizar"

### ✏️ UPDATE (Actualizar)
- **Ubicación**: Tab "Equipos" → Botón "✏️ Editar" en cada equipo
- **Prueba**:
  - [ ] Haz clic en "✏️ Editar"
  - [ ] Cambia el nombre y/o color
  - [ ] Haz clic en "Guardar"
  - [ ] Verifica que se actualicen los cambios
  - [ ] Verifica que se actualice el ranking

### 🗑️ DELETE (Eliminar)
- **Ubicación**: Tab "Equipos" → Botón "🗑️ Eliminar"
- **Prueba**:
  - [ ] Haz clic en "🗑️ Eliminar"
  - [ ] Aparecerá modal de confirmación
  - [ ] Haz clic en "Eliminar"
  - [ ] Verifica que desaparezca del listado
  - [ ] Verifica que se actualice el ranking y stats

---

## 📋 Tabla: ACTIVIDADES

### ✏️ CREATE (Crear)
- **Ubicación**: Tab "Inicio" → Formulario "Nueva Actividad"
- **Campos**: Nombre, Puntuación máxima
- **Prueba**:
  - [ ] Ingresa nombre y puntuación máxima
  - [ ] Haz clic en "Crear actividad"
  - [ ] Verifica que aparezca en Tab "Actividades"
  - [ ] Verifica que se actualice el selector en "Registrar Puntaje"

### 📖 READ (Leer)
- **Ubicación**: Tab "Actividades"
- **Prueba**:
  - [ ] Abre Tab "Actividades"
  - [ ] Verifica que se carguen todas las actividades
  - [ ] Verifica que se muestre nombre y puntuación máxima
  - [ ] Verifica el botón "🔄 Actualizar"

### ✏️ UPDATE (Actualizar)
- **Ubicación**: Tab "Actividades" → Botón "✏️ Editar" en cada actividad
- **Prueba**:
  - [ ] Haz clic en "✏️ Editar"
  - [ ] Cambia el nombre y/o puntuación máxima
  - [ ] Haz clic en "Guardar"
  - [ ] Verifica que se actualicen los cambios
  - [ ] Verifica que se actualicen los puntajes existentes

### 🗑️ DELETE (Eliminar)
- **Ubicación**: Tab "Actividades" → Botón "🗑️ Eliminar"
- **Prueba**:
  - [ ] Haz clic en "🗑️ Eliminar"
  - [ ] Aparecerá modal de confirmación
  - [ ] Haz clic en "Eliminar"
  - [ ] Verifica que desaparezca del listado
  - [ ] Verifica que se actualice el stats

---

## 📋 Tabla: PUNTAJES

### ✏️ CREATE (Crear)
- **Ubicación**: Tab "Inicio" → Formulario "Registrar Puntaje"
- **Campos**: Equipo, Actividad, Puntos
- **Prueba**:
  - [ ] Selecciona un equipo
  - [ ] Selecciona una actividad
  - [ ] Ingresa puntos
  - [ ] Haz clic en "Guardar puntaje"
  - [ ] Verifica que aparezca en Tab "Puntajes"
  - [ ] Verifica que se actualice el ranking

### 📖 READ (Leer)
- **Ubicación**: Tab "Puntajes"
- **Prueba**:
  - [ ] Abre Tab "Puntajes"
  - [ ] Verifica que se muestren las actividades como categorías
  - [ ] Verifica que dentro de cada actividad estén los equipos y puntos
  - [ ] Verifica que los puntajes estén ordenados de mayor a menor
  - [ ] Verifica el botón "🔄 Actualizar"

### ✏️ UPDATE (Actualizar)
- **Ubicación**: Tab "Puntajes" → Botón "✏️ Editar" en cada puntaje
- **Prueba**:
  - [ ] Haz clic en "✏️ Editar"
  - [ ] Cambia los puntos
  - [ ] Haz clic en "Guardar"
  - [ ] Verifica que se actualicen los puntos
  - [ ] Verifica que se reordenen si la puntuación cambió
  - [ ] Verifica que se actualice el ranking

### 🗑️ DELETE (Eliminar)
- **Ubicación**: Tab "Puntajes" → Botón "🗑️ Eliminar" en cada puntaje
- **Prueba**:
  - [ ] Haz clic en "🗑️ Eliminar"
  - [ ] Aparecerá modal de confirmación
  - [ ] Haz clic en "Eliminar"
  - [ ] Verifica que desaparezca del listado
  - [ ] Verifica que se actualice el ranking

---

## 📊 TESTING DE INTEGRACIÓN

### Flujo Completo:
1. [ ] Crea 3 equipos con colores diferentes
2. [ ] Crea 3 actividades con diferentes puntos máximos
3. [ ] Registra puntajes para cada equipo en cada actividad
4. [ ] Verifica que el ranking se calcule correctamente
5. [ ] Verifica que el total de puntajes sea correcto
6. [ ] Edita algunos puntajes
7. [ ] Verifica que el ranking se actualice
8. [ ] Elimina un puntaje
9. [ ] Verifica que el ranking se actualice
10. [ ] Edita un equipo
11. [ ] Verifica que se actualice en puntajes y ranking
12. [ ] Edita una actividad
13. [ ] Verifica que se actualice en puntajes y ranking

---

## 🐛 BUGS O ERRORES A REPORTAR

Si encuentras algún error, escribe aquí:

- [ ] Equipos CREATE: ________________
- [ ] Equipos READ: ________________
- [ ] Equipos UPDATE: ________________
- [ ] Equipos DELETE: ________________
- [ ] Actividades CREATE: ________________
- [ ] Actividades READ: ________________
- [ ] Actividades UPDATE: ________________
- [ ] Actividades DELETE: ________________
- [ ] Puntajes CREATE: ________________
- [ ] Puntajes READ: ________________
- [ ] Puntajes UPDATE: ________________
- [ ] Puntajes DELETE: ________________

---

## ✅ RESUMEN

Todo CRUD implementado:
- ✅ Equipos: CREATE, READ, UPDATE, DELETE
- ✅ Actividades: CREATE, READ, UPDATE, DELETE
- ✅ Puntajes: CREATE, READ, UPDATE, DELETE
- ✅ Modal de confirmación para todas las eliminaciones
- ✅ Event listeners en lugar de onclick inline (más seguro)
- ✅ Validaciones de entrada
- ✅ Notificaciones de éxito/error
- ✅ Actualización automática de selects y rankings
