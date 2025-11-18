# Guía de Estilos de Componentes - FluxCore

## Principios Fundamentales

### 1. Separación de Roles

**Color**: Solo determina apariencia visual (claro/oscuro, primarios, secundarios)
**Tipografía y Espaciado**: Independientes del tema de color

**Regla de oro**: Un estilo de componente tiene UNA SOLA definición de tamaño, peso y espaciado, reutilizable en todos los temas.

### 2. Single Source of Truth (SSOT)

Todos los estilos visuales provienen de `theme.componentStyles`. NUNCA definir valores hardcodeados en componentes.

### 3. Consistencia y Unicidad

Cada tipo de componente tiene UNA definición única. Evitar duplicados entre módulos.

---

## Inventario de Estilos de Componentes

### Tipografía y Títulos

#### H1 - Título Principal
```tsx
const { theme } = useTheme();
const h1Style = {
  fontSize: theme.componentStyles.heading.h1.fontSize,      // 24px
  fontWeight: theme.componentStyles.heading.h1.fontWeight,  // 700 (bold)
  margin: theme.componentStyles.heading.h1.margin,          // 16px
  lineHeight: theme.componentStyles.heading.h1.lineHeight   // 1.25
};
```

**Uso**: Cabeceras de secciones principales

#### H2 - Subtítulo
```tsx
const h2Style = {
  fontSize: theme.componentStyles.heading.h2.fontSize,      // 20px
  fontWeight: theme.componentStyles.heading.h2.fontWeight,  // 600 (semibold)
  margin: theme.componentStyles.heading.h2.margin,          // 12px
  lineHeight: theme.componentStyles.heading.h2.lineHeight   // 1.25
};
```

**Uso**: Subdivisión de secciones

#### H3 - Título Terciario
```tsx
const h3Style = {
  fontSize: theme.componentStyles.heading.h3.fontSize,      // 18px
  fontWeight: theme.componentStyles.heading.h3.fontWeight,  // 600 (semibold)
  margin: theme.componentStyles.heading.h3.margin,          // 12px
  lineHeight: theme.componentStyles.heading.h3.lineHeight   // 1.25
};
```

### Texto

#### Texto Normal
```tsx
const normalTextStyle = {
  fontSize: theme.componentStyles.text.normal.fontSize,      // 14px
  fontWeight: theme.componentStyles.text.normal.fontWeight,  // 400 (regular)
  lineHeight: theme.componentStyles.text.normal.lineHeight   // 1.5
};
```

**Uso**: Contenido principal, párrafos

#### Texto Metadata / Referencial
```tsx
const metadataStyle = {
  fontSize: theme.componentStyles.text.metadata.fontSize,      // 12px
  fontWeight: theme.componentStyles.text.metadata.fontWeight,  // 400 (regular)
  lineHeight: theme.componentStyles.text.metadata.lineHeight   // 1.4
};
```

**Uso**: Información secundaria, timestamps, ayudas

#### Label
```tsx
const labelStyle = {
  fontSize: theme.componentStyles.text.label.fontSize,      // 14px
  fontWeight: theme.componentStyles.text.label.fontWeight,  // 500 (medium)
  lineHeight: theme.componentStyles.text.label.lineHeight   // 1.5
};
```

**Uso**: Etiquetas de formularios, descripciones

### Botones

#### Botón Primario
```tsx
const primaryButtonStyle = {
  fontSize: theme.componentStyles.button.primary.fontSize,      // 14px
  fontWeight: theme.componentStyles.button.primary.fontWeight,  // 500 (medium)
  padding: theme.componentStyles.button.primary.padding,        // 12px 24px
  // Colores desde theme.colors
  backgroundColor: theme.colors.primary[600],
  color: theme.colors.neutral[0]
};
```

**Uso**: Acción principal destacada

#### Botón Secundario
```tsx
const secondaryButtonStyle = {
  fontSize: theme.componentStyles.button.secondary.fontSize,      // 14px
  fontWeight: theme.componentStyles.button.secondary.fontWeight,  // 500 (medium)
  padding: theme.componentStyles.button.secondary.padding,        // 10px 20px
  backgroundColor: theme.colors.neutral[100],
  color: theme.colors.neutral[900]
};
```

**Uso**: Acción complementaria

#### Botón Small
```tsx
const smallButtonStyle = {
  fontSize: theme.componentStyles.button.small.fontSize,      // 12px
  fontWeight: theme.componentStyles.button.small.fontWeight,  // 500 (medium)
  padding: theme.componentStyles.button.small.padding         // 8px 16px
};
```

**Uso**: Acciones en espacios reducidos

### Inputs y Formularios

#### Input Default
```tsx
const inputStyle = {
  fontSize: theme.componentStyles.input.default.fontSize,      // 14px
  fontWeight: theme.componentStyles.input.default.fontWeight,  // 400 (regular)
  padding: theme.componentStyles.input.default.padding,        // 12px 16px
  height: theme.componentStyles.input.default.height,          // 44px
  backgroundColor: theme.colors.neutral[0],
  border: `1px solid ${theme.colors.neutral[300]}`
};
```

**Uso**: Campos de texto, compositor de mensajes

#### Input Small
```tsx
const smallInputStyle = {
  fontSize: theme.componentStyles.input.small.fontSize,      // 12px
  fontWeight: theme.componentStyles.input.small.fontWeight,  // 400 (regular)
  padding: theme.componentStyles.input.small.padding,        // 8px 12px
  height: theme.componentStyles.input.small.height           // 36px
};
```

**Uso**: Campos en espacios compactos

### Tags y Badges

#### Tag Default
```tsx
const tagStyle = {
  fontSize: theme.componentStyles.tag.default.fontSize,      // 12px
  fontWeight: theme.componentStyles.tag.default.fontWeight,  // 500 (medium)
  padding: theme.componentStyles.tag.default.padding,        // 4px 8px
  backgroundColor: theme.colors.primary[100],
  color: theme.colors.primary[700],
  borderRadius: theme.radius.sm
};
```

**Uso**: Etiquetas, tags, micro-información

#### Tag Small
```tsx
const smallTagStyle = {
  fontSize: theme.componentStyles.tag.small.fontSize,      // 11px
  fontWeight: theme.componentStyles.tag.small.fontWeight,  // 500 (medium)
  padding: theme.componentStyles.tag.small.padding         // 2px 6px
};
```

**Uso**: Tags muy compactos

---

## Componentes de Layout

### Barra de Actividad

```tsx
const activityBarStyle = {
  width: theme.componentSizes.sidebar.activityBar,            // 64px
  iconSize: theme.componentStyles.layout.activityBar.iconSize, // 24px
  gap: theme.componentStyles.layout.activityBar.spacing,       // 16px vertical
  backgroundColor: theme.colors.neutral[900]
};
```

**Reglas**:
- Ocupa todo el alto del Lienzo Dinámico
- Iconos fijos: 24px
- Espaciado vertical entre iconos: 16px
- Tooltip al hover con nombre del dominio

### Barra Lateral Contextual

```tsx
const sidebarStyle = {
  width: theme.componentStyles.layout.sidebar.width,          // 300px
  itemSpacing: theme.componentStyles.layout.sidebar.itemSpacing, // 8px
  backgroundColor: theme.colors.neutral[50]
};
```

**Reglas**:
- Aparece solo al hacer clic en un ícono de la Barra de Actividad
- Altura completa del Lienzo Dinámico
- Ancho estándar: 280-320px
- Items en filas únicas, evitar cajas innecesarias

### Contenedor Dinámico

```tsx
const containerStyle = {
  headerHeight: theme.componentStyles.layout.container.headerHeight,     // 48px
  footerHeight: theme.componentStyles.layout.container.footerHeight,     // 40px
  contentPadding: theme.componentStyles.layout.container.contentPadding, // 16px
  backgroundColor: theme.colors.neutral[0]
};
```

**Reglas**:
- Ocupa 100% si es único
- Proporciones 50/50 si hay dos (ajustable manualmente)
- Todos los elementos internos deben usar estilos del inventario
- Permitir arrastrar pestañas entre contenedores

---

## Ejemplos de Uso

### Ejemplo 1: Card de Usuario

```tsx
import { useTheme } from '@/theme';

export default function UserCard({ name, status }: UserCardProps) {
  const { theme } = useTheme();

  return (
    <div style={{
      padding: theme.componentSpacing.card.md,
      backgroundColor: theme.colors.neutral[0],
      borderRadius: theme.radius.md,
      boxShadow: theme.elevation.sm
    }}>
      <h3 style={{
        fontSize: theme.componentStyles.heading.h3.fontSize,
        fontWeight: theme.componentStyles.heading.h3.fontWeight,
        margin: theme.componentStyles.heading.h3.margin,
        lineHeight: theme.componentStyles.heading.h3.lineHeight,
        color: theme.colors.neutral[900]
      }}>
        {name}
      </h3>
      <p style={{
        fontSize: theme.componentStyles.text.metadata.fontSize,
        fontWeight: theme.componentStyles.text.metadata.fontWeight,
        lineHeight: theme.componentStyles.text.metadata.lineHeight,
        color: theme.colors.neutral[600]
      }}>
        {status}
      </p>
    </div>
  );
}
```

### Ejemplo 2: Botón Primario

```tsx
import { useTheme } from '@/theme';

export default function PrimaryButton({ children, onClick }: ButtonProps) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      style={{
        fontSize: theme.componentStyles.button.primary.fontSize,
        fontWeight: theme.componentStyles.button.primary.fontWeight,
        padding: theme.componentStyles.button.primary.padding,
        backgroundColor: theme.colors.primary[600],
        color: theme.colors.neutral[0],
        border: 'none',
        borderRadius: theme.radius.md,
        cursor: 'pointer',
        transition: `all ${theme.transitions.fast} ease`
      }}
    >
      {children}
    </button>
  );
}
```

### Ejemplo 3: Input de Formulario

```tsx
import { useTheme } from '@/theme';

export default function TextInput({ value, onChange, placeholder }: InputProps) {
  const { theme } = useTheme();

  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        fontSize: theme.componentStyles.input.default.fontSize,
        fontWeight: theme.componentStyles.input.default.fontWeight,
        padding: theme.componentStyles.input.default.padding,
        height: theme.componentStyles.input.default.height,
        backgroundColor: theme.colors.neutral[0],
        color: theme.colors.neutral[900],
        border: `1px solid ${theme.colors.neutral[300]}`,
        borderRadius: theme.radius.md,
        outline: 'none',
        transition: `border-color ${theme.transitions.fast} ease`
      }}
    />
  );
}
```

---

## Reglas de Oro

### ✅ HACER

1. **Siempre usar tokens del tema**
   ```tsx
   fontSize: theme.componentStyles.text.normal.fontSize
   ```

2. **Combinar estilos de estructura con colores del tema**
   ```tsx
   {
     ...theme.componentStyles.button.primary,
     backgroundColor: theme.colors.primary[600],
     color: theme.colors.neutral[0]
   }
   ```

3. **Importar useTheme desde la ubicación correcta**
   ```tsx
   import { useTheme } from '@/theme';
   ```

4. **Usar componentes reutilizables**
   - Avatar, Badge, StatusIndicator ya siguen estos estándares

### ❌ NO HACER

1. **NUNCA valores hardcodeados**
   ```tsx
   // ❌ MAL
   fontSize: '14px'
   padding: '12px 24px'
   ```

2. **NUNCA duplicar definiciones de estilos**
   ```tsx
   // ❌ MAL - Crear múltiples versiones del mismo componente
   const MyButton1 = ...
   const MyButton2 = ...
   ```

3. **NUNCA valores de color directos**
   ```tsx
   // ❌ MAL
   backgroundColor: '#3B82F6'
   ```

4. **NUNCA imports incorrectos**
   ```tsx
   // ❌ MAL
   import { useTheme } from '@/hooks/useTheme';
   ```

---

## Migración de Código Existente

### Antes (valores hardcodeados)
```tsx
<div style={{
  fontSize: '0.875rem',
  fontWeight: '500',
  padding: '12px 24px',
  backgroundColor: '#3B82F6',
  color: '#ffffff'
}}>
  Button
</div>
```

### Después (usando tokens del tema)
```tsx
const { theme } = useTheme();

<div style={{
  fontSize: theme.componentStyles.button.primary.fontSize,
  fontWeight: theme.componentStyles.button.primary.fontWeight,
  padding: theme.componentStyles.button.primary.padding,
  backgroundColor: theme.colors.primary[600],
  color: theme.colors.neutral[0]
}}>
  Button
</div>
```

---

## Ventajas de Este Sistema

1. **Consistencia total**: Todos los componentes usan los mismos estilos
2. **Mantenibilidad**: Cambiar un estilo en theme.json actualiza toda la app
3. **Temas múltiples**: Light/Dark automáticos sin cambiar código
4. **Type-safe**: TypeScript valida todos los tokens
5. **Accesibilidad**: Validación WCAG 2.1 automática
6. **Escalabilidad**: Fácil agregar nuevos temas o variantes

---

## Próximos Pasos

1. Migrar componentes existentes para usar `theme.componentStyles`
2. Eliminar todos los valores hardcodeados
3. Corregir imports de `useTheme`
4. Crear componentes reutilizables siguiendo estos estándares
5. Documentar componentes específicos del proyecto

---

**Última actualización**: 2025-11-18
**Versión**: 1.0.0
**Basado en**: Guía de Estándares de Estilo y Comportamiento de Componentes en FluxCore
