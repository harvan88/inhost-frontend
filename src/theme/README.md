# Sistema de Tema y Design Tokens - FluxCore

## Sección 8: Sistema de Tema y Design Tokens en FluxCore

El sistema visual de FluxCore se fundamenta en una arquitectura de **Design Tokens centralizados**, cuyo propósito es garantizar consistencia estética, escalabilidad transversal y compatibilidad entre plataformas.

---

## 8.1 Introducción

Bajo este enfoque, todos los valores visuales —colores, tipografías, espaciados, radios, elevaciones y propiedades derivadas— son gestionados desde una **única fuente de verdad**, representada mediante el archivo `theme.json`.

Este modelo sigue las recomendaciones del **W3C Design Tokens Community Group**, así como las prácticas consolidadas en sistemas de diseño modernos como Material Design, Salesforce Lightning, IBM Carbon y Shopify Polaris.

---

## 8.2 Principios Fundamentales

### 8.2.1 Single Source of Truth (SSOT)

Todos los componentes del sistema consumen sus valores visuales desde `theme.json`. Ninguna característica visual se define localmente dentro de un módulo.

### 8.2.2 Portabilidad y neutralidad tecnológica

El formato JSON permite que el sistema de tema sea independiente de frameworks (React, Vue, Web Components, HTMX, motores nativos, etc.).

### 8.2.3 Consistencia determinista

La apariencia de cada componente deviene completamente del tema, lo que elimina discrepancias visuales entre módulos, plugins o herramientas externas.

### 8.2.4 Escalabilidad y automatización

El uso de JSON favorece:
- Generación automática de temas por IA
- Tooling transversal
- Integración con pipelines de diseño
- Validaciones automáticas (accesibilidad, contraste, variantes de color)

---

## 8.3 Estructura del archivo de tema

El archivo `theme.json` contiene los tokens base y sus derivados. Su estructura responde a convenciones establecidas por el W3C y por sistemas de diseño corporativos.

### Tokens principales

```json
{
  "name": "Professional Light",
  "type": "light",
  "colors": {
    "primary": { "50": "#f0f9ff", "500": "#0ea5e9", "900": "#0c4a6e" },
    "neutral": { "0": "#ffffff", "500": "#737373", "900": "#171717" },
    "semantic": {
      "success": "#10b981",
      "warning": "#f59e0b",
      "danger": "#ef4444",
      "info": "#3b82f6"
    }
  },
  "typography": {
    "fontFamily": { "base": "Inter, sans-serif", "mono": "JetBrains Mono" },
    "sizes": { "xs": "12px", "sm": "14px", "base": "16px", "xl": "20px" },
    "weights": { "normal": "400", "medium": "500", "bold": "700" }
  },
  "spacing": { "1": "4px", "2": "8px", "4": "16px", "8": "32px" },
  "radius": { "sm": "4px", "md": "8px", "lg": "12px", "full": "9999px" },
  "elevation": {
    "base": "0px 4px 6px rgba(0, 0, 0, 0.07)",
    "md": "0px 10px 15px rgba(0, 0, 0, 0.1)"
  },
  "transitions": { "fast": "150ms", "base": "200ms", "slow": "300ms" },
  "zIndex": { "dropdown": "10", "modal": "20", "tooltip": "40" },
  "componentStyles": {
    "heading": {
      "h1": { "fontSize": "24px", "fontWeight": "700", "margin": "16px", "lineHeight": "1.25" }
    },
    "button": {
      "primary": { "fontSize": "14px", "fontWeight": "500", "padding": "12px 24px" }
    },
    "input": {
      "default": { "fontSize": "14px", "fontWeight": "400", "padding": "12px 16px", "height": "44px" }
    }
  }
}
```

### 8.3.1 Component Styles (Nuevo)

La sección `componentStyles` define estilos completos y reutilizables para cada tipo de componente, combinando tamaño, peso, espaciado y line-height en una única definición. Estos estilos son **independientes del tema de color** y solo definen estructura y jerarquía.

**Principios:**
- **Separación de roles**: Color solo determina apariencia visual; tipografía y espaciado son independientes
- **Unicidad**: Cada tipo de componente tiene UNA sola definición de estilo
- **Consistencia**: Reutilizable en todos los temas (light/dark)

**Ejemplo de uso:**
```tsx
const { theme } = useTheme();

// Título H1 con estilo completo del tema
<h1 style={{
  fontSize: theme.componentStyles.heading.h1.fontSize,      // 24px
  fontWeight: theme.componentStyles.heading.h1.fontWeight,  // 700
  margin: theme.componentStyles.heading.h1.margin,          // 16px
  lineHeight: theme.componentStyles.heading.h1.lineHeight,  // 1.25
  color: theme.colors.neutral[900]                           // Color desde theme.colors
}}>
  Título Principal
</h1>

// Botón primario con estilos estructurales + colores del tema
<button style={{
  ...theme.componentStyles.button.primary,                   // fontSize, fontWeight, padding
  backgroundColor: theme.colors.primary[600],                 // Color desde theme.colors
  color: theme.colors.neutral[0]
}}>
  Acción Principal
</button>
```

Ver [COMPONENT_STYLES.md](./COMPONENT_STYLES.md) para el inventario completo de componentes y guía de uso detallada.

---

## 8.4 Ciclo de consumo del tema

### 8.4.1 Theme Pipeline

1. **Carga del JSON** al iniciar FluxCore
2. **Validación de tokens**
   - Estructura
   - Tipos
   - Contraste mínimo (WCAG 2.1 AA/AAA)
3. **Normalización y caching** en memoria
4. **Exposición** a toda la aplicación mediante ThemeProvider

### 8.4.2 Consumo por componentes

Los componentes siguen una regla estricta:

> **"Ningún componente puede definir colores, tipografía o radios propios. Todo debe provenir del tema."**

**Ejemplo:**

```tsx
import { useTheme } from '@/theme';

const ChatHeader = () => {
  const { theme } = useTheme();

  return (
    <header style={{
      background: theme.colors.primary[500],
      color: theme.colors.neutral[0],
      borderRadius: theme.radius.md,
      padding: theme.spacing[4]
    }}>
      Chat Header
    </header>
  );
};
```

---

## 8.5 Aplicación del tema en los módulos de FluxCore

### 8.5.1 Barra de Actividad

- Iconografía unificada a partir del color `primary-500`
- Hover operado por tokens semánticos (`neutral-800`)
- Accesibilidad garantizada mediante contraste automatizado

### 8.5.2 Barra Lateral Contextual

- Fondo derivado del token `neutral-0` o `neutral-100`
- Estado seleccionado basado en `primary-100`
- Filtros, badges y contadores generados desde tokens semánticos

### 8.5.3 Lienzo Dinámico

- Adopta el color base del tema (`neutral-0`)
- Particiones y bordes derivados del sistema de elevación

### 8.5.4 Contenedores Dinámicos

- Barra de pestañas estilizada completamente a partir de tokens
- Controles internos (cerrar, expandir, duplicar) basados en tokens semánticos

### 8.5.5 ChatArea

- Burbujas inbound/outbound generadas únicamente por `primary` y `neutral`
- Ajustes automáticos según modo claro/oscuro

---

## 8.6 Contraste y Accesibilidad

FluxCore incorpora validadores automáticos basados en criterios **WCAG 2.1**:

- Contraste mínimo **4.5:1** para texto normal
- Contraste **3:1** para UI non-text
- Alertas automáticas ante combinaciones inválidas
- Ajustes dinámicos en modo oscuro/claro

La accesibilidad se evalúa directamente desde el JSON de tema antes de que el usuario visualice la interfaz.

### Funciones de validación

```ts
import { validateContrast, getContrastRatio } from '@/theme';

// Validar contraste entre dos colores
const validation = validateContrast('#0ea5e9', '#ffffff');
console.log(validation.passAA); // true si cumple WCAG AA

// Obtener ratio de contraste
const ratio = getContrastRatio('#0ea5e9', '#ffffff');
console.log(ratio); // 3.24 (ejemplo)
```

---

## 8.7 Ventajas del modelo para FluxCore

| Ventaja | Descripción |
|---------|-------------|
| **Consistencia absoluta** | Ningún módulo puede introducir variaciones ad hoc. |
| **Extensibilidad** | Nuevos dominios consumen el mismo sistema sin configuraciones adicionales. |
| **Multi-tenant** | Cada workspace puede proveer su propio JSON sin reconfigurar el sistema. |
| **Internacionalización visual** | Temas específicos para culturas, idiomas y contextos. |
| **Integración con IA** | Los modelos pueden generar temas completos siguiendo la estructura del JSON. |

---

## 8.8 Ejemplos de flujos visuales utilizando temas

### Flujo A – Cambio de tema

1. El usuario abre la herramienta de Apariencia
2. Selecciona "Professional Dark"
3. FluxCore carga el JSON correspondiente
4. El lienzo y todos los contenedores se re-renderizan inmediatamente mediante tokens
5. Las burbujas del ChatArea cambian a sus equivalentes del modo oscuro

### Flujo B – Tema aplicado a un Plugin

1. El usuario abre un plugin de analítica
2. El plugin solicita acceso a los tokens mediante `useTheme()`
3. Renderiza sus gráficos usando `theme.colors.primary[500]`
4. El plugin luce nativo sin necesidad de personalización manual

---

## 8.9 Uso del sistema

### Instalación

El sistema de tema ya está integrado en FluxCore. No requiere instalación adicional.

### Configuración inicial

El `ThemeProvider` debe envolver la aplicación en `main.tsx`:

```tsx
import { ThemeProvider } from '@/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

### Consumo en componentes

```tsx
import { useTheme } from '@/theme';

function MyComponent() {
  const { theme } = useTheme();

  return (
    <div style={{
      backgroundColor: theme.colors.neutral[0],
      color: theme.colors.neutral[900],
      borderRadius: theme.radius.md,
      padding: theme.spacing[4],
      boxShadow: theme.elevation.base
    }}>
      Contenido
    </div>
  );
}
```

### Cambiar tema dinámicamente

```tsx
import { useTheme } from '@/theme';
import darkTheme from './dark-theme.json';

function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(darkTheme)}>
      Cambiar a modo oscuro
    </button>
  );
}
```

---

## 8.10 Estructura de archivos

```
src/theme/
├── theme.json              # Tema por defecto (Professional Light)
├── dark-theme.json         # Tema oscuro (Professional Dark)
├── types.ts                # Definiciones de tipos TypeScript
├── utils.ts                # Utilidades (validación de contraste WCAG)
├── ThemeProvider.tsx       # Proveedor de tema global
├── index.ts                # Exportaciones públicas
├── README.md               # Esta documentación
└── COMPONENT_STYLES.md     # Guía de Estilos de Componentes FluxCore
```

---

## 8.11 Validación de temas

Antes de aplicar un tema, FluxCore ejecuta validaciones automáticas:

### Validación de estructura

```ts
import { validateThemeStructure } from '@/theme';

const isValid = validateThemeStructure(myTheme);
// Verifica que existan todas las claves requeridas
```

### Validación de accesibilidad

```ts
import { validateThemeAccessibility } from '@/theme';

const warnings = validateThemeAccessibility(myTheme);
// Retorna array de advertencias de contraste WCAG
```

---

## 8.12 Conclusión

El sistema de tema basado en Design Tokens centralizados constituye un elemento estructural dentro de la arquitectura de FluxCore. Provee coherencia estética, estabilidad técnica y capacidad de expansión hacia escenarios complejos, incluyendo multi-tenant, plugins externos, tooling avanzado y generación automática por IA.

Su implementación en un formato JSON único asegura interoperabilidad, previsibilidad en el render y una experiencia visual profesional y consistente en todo el ecosistema.
