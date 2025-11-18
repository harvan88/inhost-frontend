/**
 * RadiusEditor - Editor de Border Radius (Compacto)
 *
 * Solo muestra tamaños críticos realmente usados: sm, md, lg
 * Con sliders + input numérico auxiliar
 */

import React from 'react';
import { useTheme } from '@/theme';
import type { Radius } from '@/theme/types';

interface RadiusEditorProps {
  radius: Radius;
  onChange: (radius: Radius) => void;
}

// Solo mostramos los tamaños críticos realmente usados
const RADIUS_KEYS: (keyof Radius)[] = ['sm', 'md', 'lg'];

export default function RadiusEditor({ radius, onChange }: RadiusEditorProps) {
  const { theme } = useTheme();

  const handleChange = (key: keyof Radius, value: number) => {
    onChange({
      ...radius,
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
        ⭕ Editor de Border Radius
      </h3>
      <p
        style={{
          fontSize: theme.typography.sizes.sm,
          color: theme.colors.neutral[600],
          marginBottom: theme.spacing[3],
          lineHeight: theme.typography.lineHeights.normal,
        }}
      >
        Solo tamaños críticos: sm, md, lg
      </p>

      <div style={{ display: 'grid', gap: theme.spacing[2] }}>
        {RADIUS_KEYS.map((key) => {
          const currentValue = parseInt(radius[key]);

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
                    radius.{key}
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
                    width: '60px',
                    height: '60px',
                    backgroundColor: theme.colors.primary[100],
                    borderRadius: radius[key],
                    border: `3px solid ${theme.colors.primary[400]}`,
                  }}
                />
              </div>

              {/* Slider + Input numérico */}
              <div style={{ display: 'flex', gap: theme.spacing[2], alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="48"
                  step="2"
                  value={currentValue}
                  onChange={(e) => handleChange(key, parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: theme.radius.full,
                    background: `linear-gradient(to right, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[500]} ${(currentValue / 48) * 100}%, ${theme.colors.neutral[200]} ${(currentValue / 48) * 100}%, ${theme.colors.neutral[200]} 100%)`,
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
