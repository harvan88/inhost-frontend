/**
 * SpacingEditor - Editor de Espaciado
 *
 * Sliders para ajustar spacing scale (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24)
 */

import React from 'react';
import { useTheme } from '@/theme';
import type { Spacing } from '@/theme/types';

interface SpacingEditorProps {
  spacing: Spacing;
  onChange: (spacing: Spacing) => void;
}

export default function SpacingEditor({ spacing, onChange }: SpacingEditorProps) {
  const { theme } = useTheme();

  const handleChange = (key: keyof Spacing, value: number) => {
    onChange({
      ...spacing,
      [key]: `${value}px`,
    });
  };

  const spacingKeys: (keyof Spacing)[] = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24'];

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
        📏 Editor de Espaciado
      </h3>
      <p
        style={{
          fontSize: theme.typography.sizes.base,
          color: theme.colors.neutral[600],
          marginBottom: theme.spacing[6],
          lineHeight: theme.typography.lineHeights.relaxed,
        }}
      >
        Ajusta los valores de spacing. Usados para padding, margin, gap, etc.
      </p>

      <div style={{ display: 'grid', gap: theme.spacing[4] }}>
        {spacingKeys.map((key) => {
          const currentValue = parseInt(spacing[key]);

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
                    spacing[{key}]
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.sizes.sm,
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
                    height: '40px',
                    backgroundColor: theme.colors.primary[200],
                    borderRadius: theme.radius.sm,
                    border: `2px solid ${theme.colors.primary[400]}`,
                  }}
                  title={`${currentValue}px`}
                />
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="128"
                step="4"
                value={currentValue}
                onChange={(e) => handleChange(key, parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: theme.radius.full,
                  background: `linear-gradient(to right, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[500]} ${(currentValue / 128) * 100}%, ${theme.colors.neutral[200]} ${(currentValue / 128) * 100}%, ${theme.colors.neutral[200]} 100%)`,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
