/**
 * TypographyEditor - Editor de Tipografía (Compacto)
 *
 * Solo muestra tamaños críticos realmente usados: xs, sm, base, lg, xl
 * Con sliders + input numérico auxiliar
 */

import React from 'react';
import { useTheme } from '@/theme';
import type { Typography } from '@/theme/types';

interface TypographyEditorProps {
  typography: Typography;
  onChange: (typography: Typography) => void;
}

// Solo mostramos los tamaños críticos realmente usados
const FONT_SIZES: (keyof Typography['sizes'])[] = ['xs', 'sm', 'base', 'lg', 'xl'];

export default function TypographyEditor({ typography, onChange }: TypographyEditorProps) {
  const { theme } = useTheme();

  const handleSizeChange = (key: keyof Typography['sizes'], value: number) => {
    onChange({
      ...typography,
      sizes: {
        ...typography.sizes,
        [key]: `${value}px`,
      },
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
        📝 Editor de Tipografía
      </h3>
      <p
        style={{
          fontSize: theme.typography.sizes.sm,
          color: theme.colors.neutral[600],
          marginBottom: theme.spacing[3],
          lineHeight: theme.typography.lineHeights.normal,
        }}
      >
        Solo tamaños críticos: xs, sm, base, lg, xl
      </p>

      <div style={{ display: 'grid', gap: theme.spacing[2] }}>
        {FONT_SIZES.map((key) => {
          const currentValue = parseInt(typography.sizes[key]);

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
                    sizes.{key}
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

                {/* Text preview */}
                <div
                  style={{
                    fontSize: `${currentValue}px`,
                    fontWeight: theme.typography.weights.medium,
                    color: theme.colors.neutral[900],
                  }}
                >
                  Aa
                </div>
              </div>

              {/* Slider + Input numérico */}
              <div style={{ display: 'flex', gap: theme.spacing[2], alignItems: 'center' }}>
                <input
                  type="range"
                  min="8"
                  max="64"
                  step="1"
                  value={currentValue}
                  onChange={(e) => handleSizeChange(key, parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: theme.radius.full,
                    background: `linear-gradient(to right, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[500]} ${((currentValue - 8) / 56) * 100}%, ${theme.colors.neutral[200]} ${((currentValue - 8) / 56) * 100}%, ${theme.colors.neutral[200]} 100%)`,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="number"
                  value={currentValue}
                  onChange={(e) => handleSizeChange(key, parseInt(e.target.value) || 8)}
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
