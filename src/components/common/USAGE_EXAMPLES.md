# Common Components - Ejemplos de Uso

Este directorio contiene 3 componentes genéricos reutilizables que utilizan exclusivamente theme tokens del sistema de diseño.

## 1. Badge Component

Componente de badge genérico con soporte para múltiples variantes y colores.

### Props

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'compact' | 'loose';  // Default: 'default'
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'channel';  // Default: 'primary'
  channel?: 'whatsapp' | 'telegram' | 'web' | 'sms';  // Default: 'whatsapp'
  className?: string;
}
```

### Ejemplos de Uso

```tsx
import { Badge } from '@/components/common';

// Badge primario por defecto
<Badge>Default</Badge>

// Variante compact (menos padding)
<Badge variant="compact" color="success">Success</Badge>

// Variante loose (más padding)
<Badge variant="loose" color="warning">Warning</Badge>

// Color danger
<Badge color="danger">Error</Badge>

// Color neutral
<Badge color="neutral">Neutral</Badge>

// Color channel (requiere prop channel)
<Badge color="channel" channel="whatsapp">WhatsApp</Badge>
<Badge color="channel" channel="telegram">Telegram</Badge>
<Badge color="channel" channel="web">Web</Badge>
<Badge color="channel" channel="sms">SMS</Badge>
```

### Características

- **Padding dinámico**: Parseado desde `theme.componentSpacing.badge[variant]`
- **Border radius**: `theme.radius.sm` (4px)
- **Colores**: Derivan del theme (100 para bg, 700 para text)
- **Tipografía**: 14px, medium, line-height normal
- **Sin hardcoding**: 100% basado en theme tokens

---

## 2. StatusIndicator Component

Dot visual que indica estado online/offline/away. Soporta posicionamiento absoluto (corner) e inline.

### Props

```typescript
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'away';
  position?: 'corner' | 'inline';  // Default: 'corner'
  size?: string;  // Default: theme.componentSizes.statusIndicator (10px)
  className?: string;
}
```

### Ejemplos de Uso

```tsx
import { StatusIndicator } from '@/components/common';

// Online status en corner (bottom-right)
<StatusIndicator status="online" />

// Away status inline
<StatusIndicator status="away" position="inline" />

// Offline status con tamaño custom
<StatusIndicator status="offline" position="inline" size="14px" />

// Corner positioning (posicionamiento absoluto)
<div style={{ position: 'relative', width: '40px', height: '40px' }}>
  <img src="avatar.jpg" />
  <StatusIndicator status="online" position="corner" />
</div>
```

### Características

- **Colores según status**:
  - `online` → `theme.colors.semantic.success` (verde)
  - `away` → `theme.colors.semantic.warning` (amarillo)
  - `offline` → `theme.colors.neutral[400]` (gris)
- **Size**: Configurable, default `10px` del theme
- **Border radius**: Completamente circular (`theme.radius.full`)
- **Box shadow**: Borde blanco interno para contraste
- **Posicionamiento**: Corner (absoluto bottom-right) o inline

---

## 3. Avatar Component

Componente de avatar que soporta imágenes, fallback text (initials) e indicador de estado.

### Props

```typescript
interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';  // Default: 'md'
  fallbackText?: string;  // Initials si no hay src
  statusIndicator?: 'online' | 'offline' | 'away' | null;  // Default: null
  className?: string;
}
```

### Ejemplos de Uso

```tsx
import { Avatar } from '@/components/common';

// Avatar con imagen
<Avatar
  src="https://example.com/avatar.jpg"
  alt="John Doe"
  size="md"
/>

// Avatar con fallback (initials)
<Avatar
  alt="Jane Smith"
  fallbackText="JS"
  size="lg"
/>

// Avatar con indicador de estado
<Avatar
  src="https://example.com/avatar.jpg"
  alt="User"
  size="md"
  statusIndicator="online"
/>

// Avatar offline con fallback
<Avatar
  alt="Offline User"
  fallbackText="OU"
  size="sm"
  statusIndicator="offline"
/>

// Diferentes tamaños
<Avatar alt="User" fallbackText="SM" size="sm" />  {/* 32px */}
<Avatar alt="User" fallbackText="MD" size="md" />  {/* 40px */}
<Avatar alt="User" fallbackText="LG" size="lg" />  {/* 48px */}
<Avatar alt="User" fallbackText="XL" size="xl" />  {/* 64px */}
```

### Características

- **Tamaños desde theme**: sm (32px), md (40px), lg (48px), xl (64px)
- **Border radius**: Circular perfecto (`theme.radius.full`)
- **Fallback**: Muestra initials si no hay `src`
- **Indicador de estado**: StatusIndicator integrado en corner
- **Object fit**: Cover para mantener proporciones de imagen
- **Tipografía adaptive**: Tamaño de texto varía según tamaño del avatar
- **Background**: Primary[100] cuando no hay imagen

---

## Patrón de Arquitectura

Todos los componentes siguen estos principios:

1. **Theme First**: Cero valores hardcodeados. Todo viene del theme.
2. **Reutilizable**: Props genéricos que permiten múltiples casos de uso
3. **TypeScript Strict**: Todos los tipos definidos explícitamente
4. **Composable**: Avatar incluye StatusIndicator, componentes pueden anidarse
5. **Accesible**: Estructura semántica, contraste WCAG válido del theme

---

## Importación

```tsx
// Importar componentes individuales
import { Badge, StatusIndicator, Avatar } from '@/components/common';

// Importar types
import type { BadgeProps, StatusIndicatorProps, AvatarProps } from '@/components/common';

// Utilidad para parsear spacing
import { parseSpacing } from '@/components/common';
```

---

## Testing

Los componentes están diseñados para ser fáciles de testear:

```tsx
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/common';
import { ThemeProvider } from '@/theme';

describe('Badge', () => {
  it('renders with correct styling from theme', () => {
    render(
      <ThemeProvider>
        <Badge color="success">Success Badge</Badge>
      </ThemeProvider>
    );

    const badge = screen.getByText('Success Badge');
    expect(badge).toHaveStyle({
      backgroundColor: theme.colors.semantic.successLight,
      color: theme.colors.semantic.success,
    });
  });
});
```
