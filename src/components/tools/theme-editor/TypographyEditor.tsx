/**
 * TypographyEditor - Editor de Tipografía
 */

import React from 'react';
import { useTheme } from '@/theme';
import type { Typography } from '@/theme/types';

interface TypographyEditorProps {
  typography: Typography;
  onChange: (typography: Typography) => void;
}

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

  const sizes: (keyof Typography['sizes'])[] = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];

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
        📝 Editor de Tipografía
      </h3>
      <p
        style={{
          fontSize: theme.typography.sizes.base,
          color: theme.colors.neutral[600],
          marginBottom: theme.spacing[6],
          lineHeight: theme.typography.lineHeights.relaxed,
        }}
      >
        Ajusta los tamaños de fuente. Se aplican en todos los textos de la aplicación.
      </p>

      <div style={{ display: 'grid', gap: theme.spacing[4] }}>
        {sizes.map((key) => {
          const currentValue = parseInt(typography.sizes[key]);

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
                    sizes.{key}
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

              {/* Slider */}
              <input
                type="range"
                min="8"
                max="64"
                step="1"
                value={currentValue}
                onChange={(e) => handleSizeChange(key, parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: theme.radius.full,
                  background: `linear-gradient(to right, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[500]} ${((currentValue - 8) / 56) * 100}%, ${theme.colors.neutral[200]} ${((currentValue - 8) / 56) * 100}%, ${theme.colors.neutral[200]} 100%)`,
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
