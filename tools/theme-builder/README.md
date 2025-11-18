# Theme Builder / Palette Inspector

**Purpose**: Herramienta visual para diseñar y previsualizar paletas de colores para INHOST.

## ¿Qué es esto?

Esta es una **herramienta de desarrollo independiente** (NO es parte del frontend principal de INHOST).

Su función es permitir diseñar y validar paletas de colores donde **`themes.json` es la única fuente de verdad**.

## Diferencia con el Frontend Principal

- **Este directorio (`/tools/theme-builder`)**: Tool visual para diseñadores
- **`/src`**: Frontend principal de INHOST (chat multi-canal)

## Cómo usar

1. Abrir `index.html` directamente en el navegador
2. Editar `themes.json` para crear/modificar paletas
3. Recargar para ver cambios en vivo

## Archivos

- `index.html` - Interfaz de la tool
- `themes.json` - Fuente de verdad de las paletas
- `/scripts` - Lógica de la tool
- `/styles` - CSS de la tool (no del frontend principal)

## Nota

Esta tool NO comparte código con el frontend principal. Es standalone.
