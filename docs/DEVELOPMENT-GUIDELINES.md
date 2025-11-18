# Guía de Desarrollo - FluxCore UI Components

**Objetivo**: Implementar componentes UI consistentes usando Design Tokens
**Audiencia**: Desarrolladores Frontend
**Última actualización**: 2025-11-18

---

## Reglas de Oro

### ✅ SIEMPRE HACER

```tsx
// 1. Usar componentStyles del tema
const { theme } = useTheme();
<h1 style={{
  ...theme.componentStyles.heading.h1,
  color: theme.colors.neutral[900]
}}>

// 2. Usar theme tokens para colores
backgroundColor: theme.colors.primary[600]

// 3. Usar theme.spacing para espaciado
padding: theme.spacing[4]
gap: theme.spacing[2]

// 4. Usar theme.transitions para animaciones
transitionDuration: theme.transitions.fast
```

### ❌ NUNCA HACER

```tsx
// ❌ Valores hardcodeados
fontSize: '14px'
padding: '12px 24px'
backgroundColor: '#3B82F6'

// ❌ Tailwind para valores visuales
className="px-6 py-4 text-lg bg-blue-500"

// ❌ Acceder a typography directamente (usar componentStyles)
fontSize: theme.typography.sizes.lg  // ❌ MAL

// ❌ Reimplementar componentes existentes
// Si existe <Button>, úsalo. No crees otro.
```

---

## Patrones de Implementación

### Patrón 1: Heading (Títulos)

```tsx
// ✅ CORRECTO - Usando componentStyles
import { useTheme } from '@/theme';

export function MyComponent() {
  const { theme } = useTheme();

  return (
    <>
      <h1 style={{
        fontSize: theme.componentStyles.heading.h1.fontSize,
        fontWeight: theme.componentStyles.heading.h1.fontWeight,
        margin: theme.componentStyles.heading.h1.margin,
        lineHeight: theme.componentStyles.heading.h1.lineHeight,
        color: theme.colors.neutral[900],
      }}>
        Título Principal
      </h1>

      <h2 style={{
        ...theme.componentStyles.heading.h2,
        color: theme.colors.neutral[900],
      }}>
        Subtítulo
      </h2>
    </>
  );
}
```

**Cuando usar cada nivel**:
- `h1`: Título principal de página (1 por vista)
- `h2`: Secciones principales
- `h3`: Subsecciones

---

### Patrón 2: Texto Normal

```tsx
// ✅ CORRECTO - Para contenido principal
<p style={{
  fontSize: theme.componentStyles.text.normal.fontSize,
  fontWeight: theme.componentStyles.text.normal.fontWeight,
  lineHeight: theme.componentStyles.text.normal.lineHeight,
  color: theme.colors.neutral[700],
}}>
  Contenido normal
</p>

// ✅ CORRECTO - Para metadata/info secundaria
<span style={{
  fontSize: theme.componentStyles.text.metadata.fontSize,
  fontWeight: theme.componentStyles.text.metadata.fontWeight,
  lineHeight: theme.componentStyles.text.metadata.lineHeight,
  color: theme.colors.neutral[500],
}}>
  Hace 5 minutos
</span>
```

---

### Patrón 3: Botones

```tsx
// ✅ CORRECTO - Implementación manual hasta que exista <Button>
function PrimaryButton({ children, onClick }: ButtonProps) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        fontSize: theme.componentStyles.button.primary.fontSize,
        fontWeight: theme.componentStyles.button.primary.fontWeight,
        padding: theme.componentStyles.button.primary.padding,
        backgroundColor: isHovered
          ? theme.colors.primary[700]
          : theme.colors.primary[600],
        color: theme.colors.neutral[0],
        border: 'none',
        borderRadius: theme.radius.md,
        cursor: 'pointer',
        transitionDuration: theme.transitions.fast,
        transitionProperty: 'background-color',
      }}
    >
      {children}
    </button>
  );
}
```

---

### Patrón 4: Inputs

```tsx
// ✅ CORRECTO
function TextInput({ value, onChange, placeholder }: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        fontSize: theme.componentStyles.input.default.fontSize,
        fontWeight: theme.componentStyles.input.default.fontWeight,
        padding: theme.componentStyles.input.default.padding,
        height: theme.componentStyles.input.default.height,
        backgroundColor: theme.colors.neutral[0],
        color: theme.colors.neutral[900],
        border: `1px solid ${isFocused
          ? theme.colors.primary[500]
          : theme.colors.neutral[300]
        }`,
        borderRadius: theme.radius.md,
        outline: 'none',
        transitionDuration: theme.transitions.fast,
      }}
    />
  );
}
```

---

### Patrón 5: Cards

```tsx
// ✅ CORRECTO
function Card({ children }: CardProps) {
  const { theme } = useTheme();

  return (
    <div style={{
      padding: theme.spacing[4],  // O theme.componentSpacing.card.md
      backgroundColor: theme.colors.neutral[0],
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.neutral[200]}`,
      boxShadow: theme.elevation.sm,
    }}>
      {children}
    </div>
  );
}
```

---

### Patrón 6: Listas en Sidebar (SIN rectángulos)

```tsx
// ✅ CORRECTO - Estilo unificado de listas
function SidebarListItem({ isActive, onClick, children }: ListItemProps) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: theme.componentStyles.sidebarListItem.padding,
        borderBottom: `${theme.componentStyles.sidebarListItem.borderBottomWidth} solid ${theme.colors.neutral[200]}`,
        borderLeft: isActive
          ? `${theme.componentStyles.sidebarListItem.activeIndicatorWidth} solid ${theme.colors.primary[500]}`
          : 'none',
        backgroundColor: isActive
          ? theme.colors.primary[50]
          : isHovered
          ? theme.colors.neutral[100]
          : 'transparent',
        cursor: 'pointer',
        transitionDuration: theme.transitions.fast,
      }}
    >
      {children}
    </div>
  );
}
```

---

## Estados Interactivos

### Estados Básicos

```tsx
function InteractiveElement() {
  const { theme } = useTheme();
  const [state, setState] = useState<'idle' | 'hover' | 'active'>('idle');

  const getBackgroundColor = () => {
    switch (state) {
      case 'hover':
        return theme.colors.primary[700];
      case 'active':
        return theme.colors.primary[800];
      default:
        return theme.colors.primary[600];
    }
  };

  return (
    <button
      onMouseEnter={() => setState('hover')}
      onMouseLeave={() => setState('idle')}
      onMouseDown={() => setState('active')}
      onMouseUp={() => setState('hover')}
      style={{
        backgroundColor: getBackgroundColor(),
        transitionDuration: theme.transitions.fast,
      }}
    >
      Botón
    </button>
  );
}
```

### Focus States (Accesibilidad)

```tsx
function AccessibleButton() {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <button
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        // ... otros estilos
        outline: isFocused
          ? `2px solid ${theme.colors.primary[500]}`
          : 'none',
        outlineOffset: '2px',
      }}
    >
      Botón
    </button>
  );
}
```

---

## Espaciado y Layout

### Espaciado Interno (Padding)

```tsx
// ✅ CORRECTO - Usar theme.spacing
<div style={{
  padding: theme.spacing[4],           // 16px todos los lados
  paddingLeft: theme.spacing[6],       // 24px izquierda
  paddingTop: theme.spacing[3],        // 12px arriba
}}>

// ✅ CORRECTO - String para múltiples valores
<div style={{
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,  // "12px 16px"
}}>

// ❌ INCORRECTO
<div className="px-6 py-4">  // Hardcoded en Tailwind
```

### Espaciado Entre Elementos (Gap)

```tsx
// ✅ CORRECTO - Flexbox con gap
<div style={{
  display: 'flex',
  gap: theme.spacing[3],
  alignItems: 'center',
}}>

// ✅ CORRECTO - Grid con gap
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing[4],
}}>
```

---

## Colores

### Colores de Texto

```tsx
// ✅ Texto principal
color: theme.colors.neutral[900]  // Oscuro en light theme

// ✅ Texto secundario
color: theme.colors.neutral[600]  // Gris medio

// ✅ Texto deshabilitado/placeholder
color: theme.colors.neutral[400]  // Gris claro

// ✅ Texto sobre fondo oscuro
color: theme.colors.neutral[0]    // Blanco
```

### Colores de Fondo

```tsx
// ✅ Fondo principal
backgroundColor: theme.colors.neutral[0]    // Blanco

// ✅ Fondo secundario (secciones, headers)
backgroundColor: theme.colors.neutral[50]   // Gris muy claro

// ✅ Fondo hover
backgroundColor: theme.colors.neutral[100]  // Gris claro

// ✅ Fondo activo
backgroundColor: theme.colors.primary[50]   // Azul muy claro
```

### Colores Semánticos

```tsx
// ✅ Success
backgroundColor: theme.colors.semantic.successLight
color: theme.colors.semantic.successDark

// ✅ Warning
backgroundColor: theme.colors.semantic.warningLight
color: theme.colors.semantic.warningDark

// ✅ Danger/Error
backgroundColor: theme.colors.semantic.dangerLight
color: theme.colors.semantic.dangerDark

// ✅ Info
backgroundColor: theme.colors.semantic.infoLight
color: theme.colors.semantic.infoDark
```

---

## Transiciones y Animaciones

### Transiciones Básicas

```tsx
// ✅ CORRECTO - Transición rápida (hover, focus)
<button style={{
  transitionDuration: theme.transitions.fast,  // 150ms
  transitionProperty: 'background-color, border-color',
}}>

// ✅ CORRECTO - Transición media (estados complejos)
<div style={{
  transitionDuration: theme.transitions.base,  // 200ms
  transitionProperty: 'all',
}}>

// ✅ CORRECTO - Transición lenta (modals, slides)
<div style={{
  transitionDuration: theme.transitions.slow,  // 300ms
}}>
```

### Ejemplo Completo con Múltiples Estados

```tsx
function ComplexButton() {
  const { theme } = useTheme();
  const [state, setState] = useState<'idle' | 'hover' | 'active' | 'disabled'>('idle');

  const getStyles = () => {
    const base = {
      ...theme.componentStyles.button.primary,
      border: 'none',
      borderRadius: theme.radius.md,
      cursor: state === 'disabled' ? 'not-allowed' : 'pointer',
      opacity: state === 'disabled' ? 0.5 : 1,
      transitionDuration: theme.transitions.fast,
      transitionProperty: 'background-color, transform, box-shadow',
    };

    const stateStyles = {
      idle: {
        backgroundColor: theme.colors.primary[600],
        color: theme.colors.neutral[0],
        transform: 'scale(1)',
        boxShadow: 'none',
      },
      hover: {
        backgroundColor: theme.colors.primary[700],
        color: theme.colors.neutral[0],
        transform: 'scale(1.02)',
        boxShadow: theme.elevation.sm,
      },
      active: {
        backgroundColor: theme.colors.primary[800],
        color: theme.colors.neutral[0],
        transform: 'scale(0.98)',
        boxShadow: 'none',
      },
      disabled: {
        backgroundColor: theme.colors.neutral[300],
        color: theme.colors.neutral[500],
        transform: 'scale(1)',
        boxShadow: 'none',
      },
    };

    return { ...base, ...stateStyles[state] };
  };

  return (
    <button
      style={getStyles()}
      onMouseEnter={() => state !== 'disabled' && setState('hover')}
      onMouseLeave={() => state !== 'disabled' && setState('idle')}
      onMouseDown={() => state !== 'disabled' && setState('active')}
      onMouseUp={() => state !== 'disabled' && setState('hover')}
      disabled={state === 'disabled'}
    >
      Botón Complejo
    </button>
  );
}
```

---

## Checklist antes de Commit

```markdown
### Antes de hacer commit de un componente nuevo/modificado:

- [ ] ¿Usa `theme.componentStyles` para tipografía?
- [ ] ¿Usa `theme.colors` para todos los colores?
- [ ] ¿Usa `theme.spacing` para padding/margin/gap?
- [ ] ¿Usa `theme.radius` para border-radius?
- [ ] ¿Usa `theme.transitions` para animaciones?
- [ ] ¿Tiene estados de hover/focus/active implementados?
- [ ] ¿El focus es visible (outline o box-shadow)?
- [ ] ¿Tiene contraste mínimo 4.5:1 para texto? (usar browser devtools)
- [ ] ¿Usa componentes atómicos si existen (Button, Heading, etc.)?
- [ ] ¿Evita valores hardcodeados (px, rem, hex colors)?
- [ ] ¿Evita Tailwind classes para valores visuales (px-*, bg-*, text-*)?
- [ ] ¿Está documentado con comentarios si es complejo?
```

---

## Ejemplos Completos

### Ejemplo 1: Modal Dialog

```tsx
function ModalDialog({ title, children, onClose }: ModalProps) {
  const { theme } = useTheme();

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: theme.zIndex.modal,
      }} onClick={onClose} />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: theme.colors.neutral[0],
        borderRadius: theme.radius.lg,
        boxShadow: theme.elevation.xl,
        zIndex: theme.zIndex.modal,
        minWidth: '400px',
        maxWidth: '90vw',
      }}>
        {/* Header */}
        <div style={{
          padding: theme.spacing[6],
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
        }}>
          <h2 style={{
            ...theme.componentStyles.heading.h2,
            margin: 0,
            color: theme.colors.neutral[900],
          }}>
            {title}
          </h2>
        </div>

        {/* Content */}
        <div style={{
          padding: theme.spacing[6],
        }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{
          padding: theme.spacing[6],
          borderTop: `1px solid ${theme.colors.neutral[200]}`,
          display: 'flex',
          gap: theme.spacing[3],
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              ...theme.componentStyles.button.secondary,
              backgroundColor: theme.colors.neutral[100],
              color: theme.colors.neutral[700],
              border: 'none',
              borderRadius: theme.radius.md,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            style={{
              ...theme.componentStyles.button.primary,
              backgroundColor: theme.colors.primary[600],
              color: theme.colors.neutral[0],
              border: 'none',
              borderRadius: theme.radius.md,
              cursor: 'pointer',
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </>
  );
}
```

---

### Ejemplo 2: Notification Toast

```tsx
function Toast({ message, type = 'info' }: ToastProps) {
  const { theme } = useTheme();

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: theme.colors.semantic.successLight,
          text: theme.colors.semantic.successDark,
          border: theme.colors.semantic.success,
        };
      case 'error':
        return {
          bg: theme.colors.semantic.dangerLight,
          text: theme.colors.semantic.dangerDark,
          border: theme.colors.semantic.danger,
        };
      case 'warning':
        return {
          bg: theme.colors.semantic.warningLight,
          text: theme.colors.semantic.warningDark,
          border: theme.colors.semantic.warning,
        };
      default:
        return {
          bg: theme.colors.semantic.infoLight,
          text: theme.colors.semantic.infoDark,
          border: theme.colors.semantic.info,
        };
    }
  };

  const colors = getColors();

  return (
    <div style={{
      position: 'fixed',
      top: theme.spacing[4],
      right: theme.spacing[4],
      padding: theme.spacing[4],
      backgroundColor: colors.bg,
      color: colors.text,
      borderLeft: `4px solid ${colors.border}`,
      borderRadius: theme.radius.md,
      boxShadow: theme.elevation.lg,
      zIndex: theme.zIndex.notification,
      minWidth: '300px',
      maxWidth: '500px',
    }}>
      <p style={{
        ...theme.componentStyles.text.normal,
        margin: 0,
        color: colors.text,
      }}>
        {message}
      </p>
    </div>
  );
}
```

---

## Debugging

### Verificar Contraste de Colores

```tsx
// En navegador DevTools:
// 1. Inspeccionar elemento
// 2. En Styles panel, ver "Contrast ratio"
// 3. Debe ser ≥ 4.5:1 para texto normal
// 4. Debe ser ≥ 3:1 para texto grande (≥18px o ≥14px bold)

// Programáticamente (útil para tests):
import { getContrastRatio } from '@/theme/utils';

const ratio = getContrastRatio(
  theme.colors.neutral[900],  // Texto
  theme.colors.neutral[0]     // Fondo
);

console.log(`Contrast ratio: ${ratio}:1`);
// Debe ser ≥ 4.5 para pasar WCAG AA
```

### Verificar Valores del Tema

```tsx
// En componente, imprimir theme completo:
const { theme } = useTheme();
console.log('Theme:', theme);

// Verificar token específico:
console.log('Button primary styles:', theme.componentStyles.button.primary);

// Verificar todos los spacing:
console.log('Spacing:', theme.spacing);
```

---

## FAQ

### ¿Puedo usar Tailwind?

**Sí, pero solo para utilities de layout**:

```tsx
// ✅ PERMITIDO
className="flex flex-col items-center justify-between"
className="relative absolute fixed"
className="overflow-auto hidden"

// ❌ NO PERMITIDO
className="px-6 py-4"       // Usar theme.spacing
className="text-lg"         // Usar theme.componentStyles
className="bg-blue-500"     // Usar theme.colors
className="rounded-lg"      // Usar theme.radius
```

---

### ¿Cuándo crear un componente reutilizable?

**Regla de 3**: Si vas a usar el mismo patrón ≥3 veces, créalo como componente.

**Ejemplos**:
- Botón usado en 10 lugares → Crear `<Button>`
- Modal usado en 5 lugares → Crear `<Modal>`
- Lista item usada en 3 listas → Crear `<ListItem>`

---

### ¿Cómo manejar responsive?

**Actualmente**: No hay breakpoints en el tema.

**Workaround temporal**:

```tsx
function ResponsiveComponent() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{
      padding: isMobile ? theme.spacing[3] : theme.spacing[6],
    }}>
      ...
    </div>
  );
}
```

**Solución futura**: Agregar breakpoints al tema (ver UI-UX-ANALYSIS.md).

---

## Recursos

- [COMPONENT_STYLES.md](../src/theme/COMPONENT_STYLES.md) - Inventario de estilos
- [UI-UX-ANALYSIS.md](./UI-UX-ANALYSIS.md) - Análisis completo del sistema
- [theme/README.md](../src/theme/README.md) - Documentación del sistema de temas

---

**Última actualización**: 2025-11-18
**Mantenedor**: Equipo Frontend FluxCore
