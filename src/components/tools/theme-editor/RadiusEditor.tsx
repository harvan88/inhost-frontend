/**
 * RadiusEditor - Editor de Border Radius
 */

import React from 'react';
import { useTheme } from '@/theme';
import type { Radius } from '@/theme/types';

interface RadiusEditorProps {
  radius: Radius;
  onChange: (radius: Radius) => void;
}

export default function RadiusEditor({ radius, onChange }: RadiusEditorProps) {
  const { theme } = useTheme();

  const handleChange = (key: keyof Radius, value: number | string) => {
    onChange({
      ...radius,
      [key]: typeof value === 'number' ? `${value}px` : value,
    });
  };

  const radiusKeys: (keyof Radius)[] = ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'];

  return (
    <div style={{ maxWidth: '800px' }}>
      <h3
        style={{
          fontSize: theme.typography.sizes['2xl'],
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.neutral[900],
          marginBottom: theme.spacing[2],
        }}
      >
        ⭕ Editor de Border Radius
      </h3>
      <p
        style={{
          fontSize: theme.typography.sizes.base,
          color: theme.colors.neutral[600],
          marginBottom: theme.spacing[6],
          lineHeight: theme.typography.lineHeights.relaxed,
        }}
      >
        Ajusta los valores de border-radius para esquinas redondeadas.
      </p>

      <div style={{ display: 'grid', gap: theme.spacing[4] }}>
        {radiusKeys.map((key) => {
          const currentValue = key === 'full' ? 9999 : parseInt(radius[key]);
          const isNone = key === 'none';
          const isFull = key === 'full';

          return (
            <div
              key={key}
              style={{
                padding: theme.spacing[4],
                backgroundColor: theme.colors.neutral[50],
                borderRadius: theme.radius.lg,
                border: `1px solid ${theme.colors.neutral[200]}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing[3] }}>
                <div>
                  <div
                    style={{
                      fontSize: theme.typography.sizes.base,
                      fontWeight: theme.typography.weights.semibold,
                      color: theme.colors.neutral[900],
                    }}
                  >
                    radius.{key}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      color: theme.colors.neutral[600],
                      fontFamily: theme.typography.fontFamily.mono,
                    }}
                  >
                    {isFull ? '9999px (full)' : `${currentValue}px`}
                  </div>
                </div>

                {/* Visual preview */}
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: theme.colors.primary[100],
                    borderRadius: radius[key],
                    border: `3px solid ${theme.colors.primary[400]}`,
                  }}
                />
              </div>

              {/* Slider (disabled for 'none' and 'full') */}
              {!isFull && !isNone && (
                <input
                  type="range"
                  min="0"
                  max="48"
                  step="2"
                  value={currentValue}
                  onChange={(e) => handleChange(key, parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: theme.radius.full,
                    background: `linear-gradient(to right, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[500]} ${(currentValue / 48) * 100}%, ${theme.colors.neutral[200]} ${(currentValue / 48) * 100}%, ${theme.colors.neutral[200]} 100%)`,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              )}

              {(isFull || isNone) && (
                <div
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    color: theme.colors.neutral[500],
                    fontStyle: 'italic',
                    textAlign: 'center',
                  }}
                >
                  {isFull ? 'Valor fijo: 9999px' : 'Valor fijo: 0px'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
