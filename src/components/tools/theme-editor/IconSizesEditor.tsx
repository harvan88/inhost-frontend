/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "C:\Users\harva\Documents\Trabajos\meetgar\FluxCoreChat\inhost-frontend\src\components\tools\theme-editor\IconSizesEditor.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Editor component for icon sizes"
 *
 * DEPENDENCIES:
 *   internal: ["@/theme"]
 *   external: ["lucide-react","react"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["function"]
 *   inputs: "IconSizesEditorProps, IconSizesEditorProps"
 *   outputs: "JSX.Element"
 *   errors: "None"
 *
 * INTEGRATION:
 *   data_flow: "Input → Processing → Output"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: "To be determined via dependency analysis"
 *   uses: ["@/theme","lucide-react","react"]
 *   critical: false
 *
 * === DOC_END :: IconSizesEditor.tsx ===
 */

/**
 * IconSizesEditor - Editor de Tamaños de Iconos (Compacto)
 *
 * Solo muestra tamaños críticos realmente usados: sm, base, lg
 * Con sliders + input numérico auxiliar
 */

import React from 'react';
import { useTheme } from '@/theme';
import type { IconSizes } from '@/theme/types';
import { Star } from 'lucide-react';

interface IconSizesEditorProps {
  iconSizes: IconSizes;
  onChange: (iconSizes: IconSizes) => void;
}

// Solo mostramos los tamaños críticos realmente usados
const ICON_SIZES: (keyof IconSizes)[] = ['sm', 'base', 'lg'];

export default function IconSizesEditor({ iconSizes, onChange }: IconSizesEditorProps) {
  const { theme } = useTheme();

  const handleChange = (key: keyof IconSizes, value: number) => {
    onChange({
      ...iconSizes,
      [key]: value,
    });
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h3
        style={{
          fontSize: theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.neutral[900],
          marginBottom: theme.spacing[1],
        }}
      >
        🔷 Editor de Tamaños de Iconos
      </h3>
      <p
        style={{
          fontSize: theme.typography.sizes.sm,
          color: theme.colors.neutral[600],
          marginBottom: theme.spacing[3],
          lineHeight: theme.typography.lineHeights.normal,
        }}
      >
        Solo tamaños críticos: sm, base, lg
      </p>

      <div style={{ display: 'grid', gap: theme.spacing[2] }}>
        {ICON_SIZES.map((key) => {
          const currentValue = iconSizes[key];

          return (
            <div
              key={key}
              style={{
                padding: theme.componentSpacing.card.sm,
                backgroundColor: theme.colors.neutral[50],
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.neutral[200]}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[2] }}>
                <div>
                  <div
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      fontWeight: theme.typography.weights.semibold,
                      color: theme.colors.neutral[900],
                    }}
                  >
                    iconSizes.{key}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.sizes.xs,
                      color: theme.colors.neutral[600],
                      fontFamily: theme.typography.fontFamily.mono,
                    }}
                  >
                    {currentValue}px
                  </div>
                </div>

                {/* Icon preview */}
                <Star size={currentValue} color={theme.colors.primary[500]} fill={theme.colors.primary[200]} />
              </div>

              {/* Slider + Input numérico */}
              <div style={{ display: 'flex', gap: theme.spacing[2], alignItems: 'center' }}>
                <input
                  type="range"
                  min="8"
                  max="48"
                  step="2"
                  value={currentValue}
                  onChange={(e) => handleChange(key, parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: theme.radius.full,
                    background: `linear-gradient(to right, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[500]} ${((currentValue - 8) / 40) * 100}%, ${theme.colors.neutral[200]} ${((currentValue - 8) / 40) * 100}%, ${theme.colors.neutral[200]} 100%)`,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="number"
                  value={currentValue}
                  onChange={(e) => handleChange(key, parseInt(e.target.value) || 8)}
                  style={{
                    width: '60px',
                    padding: theme.spacing[1],
                    border: `1px solid ${theme.colors.neutral[300]}`,
                    borderRadius: theme.radius.sm,
                    fontSize: theme.typography.sizes.sm,
                    textAlign: 'center',
                    color: theme.colors.neutral[900],
                    backgroundColor: theme.colors.neutral[0],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
