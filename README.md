# TributarioCL — Simulador de Optimización Tributaria

App web para asesores tributarios chilenos. Simula el Global Complementario, optimiza APV y gestiona cartera de clientes.

## Funcionalidades

- **Simulador** — Calcula impuesto con y sin plan de optimización
  - Tramos AT2025 actualizados
  - APV Régimen A (crédito 15%) y Régimen B (descuento base)
  - DFL-2, intereses hipotecarios, crédito por hijos, PPM, retenciones
  - Crédito integración de empresas (retiros/dividendos)
  - Exportación PDF profesional

- **Optimizador APV** — Calcula automáticamente el monto de APV ideal para bajar un tramo marginal

- **Cartera de clientes** — Dashboard con todos los clientes
  - Búsqueda por nombre o RUT
  - Exportación Excel completa con resumen por cliente
  - KPIs de la cartera: ahorro total, devoluciones/pagos

- **Calendario tributario** — Vencimientos F22, PPM mensuales y fechas clave del SII con días restantes

## Instalación

### Requisitos
- Node.js 18 o superior
- npm o yarn

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/tributario-app.git
cd tributario-app

# 2. Instalar dependencias
npm install

# 3. Iniciar en modo desarrollo
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173) en el navegador.

## Construcción para producción

```bash
npm run build
```

Los archivos listos para subir quedan en la carpeta `dist/`.

## Instalar como app (PWA)

La app es una Progressive Web App — funciona offline y se puede instalar en cualquier dispositivo sin App Store ni Google Play.

### En Android (Chrome)
1. Abre la app en Chrome
2. Aparece el banner "Instalar TributarioCL"
3. Toca **Instalar** → queda en la pantalla de inicio como app nativa

### En iPhone / iPad (Safari)
1. Abre la app en Safari
2. Toca el botón **Compartir** (⎙)
3. Selecciona **"Agregar a pantalla de inicio"**

### En PC (Chrome / Edge)
1. Abre la app en el navegador
2. Clic en el ícono de instalación en la barra de dirección

### Offline
- Todos los cálculos y cartera funcionan sin internet
- PDF y Excel se generan localmente
- Actualización automática al reconectarse

## Despliegue gratuito (recomendado)

### Vercel (más fácil)
1. Crear cuenta en [vercel.com](https://vercel.com)
2. Conectar el repositorio de GitHub
3. Vercel detecta Vite automáticamente — clic en Deploy

### Netlify
1. Crear cuenta en [netlify.com](https://netlify.com)
2. Arrastrar la carpeta `dist/` al panel de Netlify
3. O conectar el repositorio para deploy automático

### GitHub Pages
```bash
npm install --save-dev gh-pages
# Agregar en package.json: "deploy": "gh-pages -d dist"
npm run build && npm run deploy
```

## Estructura del proyecto

```
src/
├── data/
│   └── tramos.js          # Tramos AT2025, constantes, calendario
├── utils/
│   ├── calculos.js        # Lógica tributaria central
│   ├── pdf.js             # Exportación PDF (jsPDF)
│   ├── excel.js           # Exportación Excel (xlsx)
│   └── rut.js             # Validación y formato RUT
├── hooks/
│   └── useClientes.js     # Persistencia en localStorage
├── components/
│   ├── Navbar.jsx
│   ├── ClienteForm.jsx    # Formulario de datos del cliente
│   ├── ResultadoPanel.jsx # Panel de resultados comparativos
│   └── OptimizadorAPV.jsx # Optimizador automático
└── pages/
    ├── Simulador.jsx      # Página principal
    ├── Dashboard.jsx      # Cartera de clientes
    └── Calendario.jsx     # Vencimientos tributarios
```

## Actualización anual (AT2026 en adelante)

Solo editar `src/data/tramos.js`:
- Actualizar `AÑO_TRIBUTARIO`
- Actualizar los valores de `TRAMOS` según resolución del SII
- Actualizar `UF_REF` con el valor de UF de diciembre
- Actualizar `CREDITO_HIJO` si hay cambios
- Actualizar `CALENDARIO` con las nuevas fechas

## Tecnologías

- React 18 + Vite
- React Router v6
- jsPDF + jspdf-autotable (PDF)
- xlsx / SheetJS (Excel)
- lucide-react (íconos)
- localStorage (persistencia local, sin backend)

## Nota legal

Esta aplicación tiene fines informativos y de apoyo al asesor tributario. Los resultados son estimaciones basadas en los datos ingresados. Los valores definitivos dependen de la declaración en sii.cl. Consulte siempre con un profesional habilitado.
