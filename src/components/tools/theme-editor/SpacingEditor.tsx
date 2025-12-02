/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "C:\Users\harva\Documents\Trabajos\meetgar\FluxCoreChat\inhost-frontend\src\components\tools\theme-editor\SpacingEditor.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Editor component for spacing"
 *
 * DEPENDENCIES:
 *   internal: ["@/theme"]
 *   external: ["react"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["function"]
 *   inputs: "SpacingEditorProps, SpacingEditorProps"
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
 *   uses: ["@/theme","react"]
 *   critical: false
 *
 * === DOC_END :: SpacingEditor.tsx ===
 */

/**
 * SpacingEditor - Editor de Espaciado (Compacto)
 *
 * Solo muestra valores críticos realmente usados: 2, 3, 4, 6
 * Con sliders + input numérico auxiliar
 */

import React from 'react';
import { useTheme } from '@/theme';
import type { Spacing } from '@/theme/types';

interface SpacingEditorProps {
  spacing: Spacing;
  onChange: (spacing: Spacing) => void;
}

// Solo mostramos los valores críticos realmente usados
const SPACING_KEYS: (keyof Spacing)[] = ['2', '3', '4', '6'];

export default function SpacingEditor({ spacing, onChange }: SpacingEditorProps) {
  const { theme } = useTheme();

  const handleChange = (key: keyof Spacing, value: number) => {
    onChange({
      ...spacing,
      [key]: `${value}px`,
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
        📏 Editor de Espaciado
      </h3>
      <p
        style={{
          fontSize: theme.typography.sizes.sm,
          color: theme.colors.neutral[600],
          marginBottom: theme.spacing[3],
          lineHeight: theme.typography.lineHeights.normal,
        }}
      >
        Solo valores críticos: 2, 3, 4, 6
      </p>

      <div style={{ display: 'grid', gap: theme.spacing[2] }}>
        {SPACING_KEYS.map((key) => {
          const currentValue = parseInt(spacing[key]);

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
                    spacing[{key}]
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

                {/* Visual preview */}
                <div
                  style={{
                    width: `${Math.min(currentValue, 96)}px`,
                    height: '32px',
                    backgroundColor: theme.colors.primary[200],
                    borderRadius: theme.radius.sm,
                    border: `2px solid ${theme.colors.primary[400]}`,
                  }}
                  title={`${currentValue}px`}
                />
              </div>

              {/* Slider + Input numérico */}
              <div style={{ display: 'flex', gap: theme.spacing[2], alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="128"
                  step="4"
                  value={currentValue}
                  onChange={(e) => handleChange(key, parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: theme.radius.full,
                    background: `linear-gradient(to right, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[500]} ${(currentValue / 128) * 100}%, ${theme.colors.neutral[200]} ${(currentValue / 128) * 100}%, ${theme.colors.neutral[200]} 100%)`,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="number"
                  value={currentValue}
                  onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
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
