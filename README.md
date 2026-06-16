# Mis Finanzas 💰

App personal de control de finanzas — HTML + CSS + JS puro, convertible a app de escritorio con Electron.

---

## Estructura del proyecto

```
finanzas/
├── index.html          ← Estructura HTML completa
├── electron.js         ← Proceso principal de Electron (desktop)
├── package.json        ← Configuración npm + Electron Builder
│
├── css/
│   ├── reset.css       ← Normalización base
│   ├── variables.css   ← DESIGN TOKENS — edita colores y tipografía aquí
│   ├── layout.css      ← Estructura de pantalla (sidebar + main)
│   ├── components.css  ← Cards, botones, forms, modals, etc.
│   └── charts.css      ← Estilos de gráficos
│
└── js/
    ├── data.js         ← Modelo de datos + localStorage (CRUD)
    ├── utils.js        ← Formato de moneda, cálculos, exportar Excel
    ├── charts.js       ← Dibujo de gráficos con Canvas
    ├── ui.js           ← Funciones de renderizado del DOM
    └── app.js          ← Controlador principal, eventos
```

---

## Usar como página web

Simplemente abre `index.html` en tu navegador. No requiere servidor.

---

## Convertir en app de escritorio (Electron)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Probar en modo desarrollo
```bash
npm start
```

### 3. Compilar instalador

**Windows (.exe):**
```bash
npm run build-win
```

**Mac (.dmg):**
```bash
npm run build-mac
```

**Linux (.AppImage):**
```bash
npm run build-linux
```

El instalador queda en la carpeta `dist/`.

---

## Personalizar

### Cambiar colores
Edita `css/variables.css` — todos los colores están definidos como variables CSS al principio del archivo.

### Agregar categorías
Edita el array `CATEGORIES` en `js/data.js` y agrega el color correspondiente en `CATEGORY_COLORS`.

### Cambiar moneda
En `js/utils.js`, función `formatCLP`, cambia `'CLP'` por `'USD'`, `'EUR'`, etc.

### Activar modo oscuro
En `css/variables.css`, descomenta el bloque `@media (prefers-color-scheme: dark)`.

---

## Funcionalidades

- ✅ Dashboard con métricas del mes (ingresos, gastos, balance, tasa de ahorro)
- ✅ Gráfico de barras por categoría
- ✅ Gráfico de evolución mensual (últimos 6 meses)
- ✅ Registro de transacciones con categoría, mes y año
- ✅ Filtros por tipo y categoría
- ✅ Editar y eliminar transacciones
- ✅ Metas de ahorro con progreso visual
- ✅ Exportar a Excel (4 hojas: transacciones, resumen, categorías, metas)
- ✅ Persistencia con localStorage (los datos se guardan aunque cierres)
- ✅ Responsive para pantallas pequeñas
