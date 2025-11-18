/**
 * IconSizesEditor - Editor de Tamaños de Iconos
 */

import React from 'react';
import { useTheme } from '@/theme';
import type { IconSizes } from '@/theme/types';
import { Star } from 'lucide-react';

interface IconSizesEditorProps {
  iconSizes: IconSizes;
  onChange: (iconSizes: IconSizes) => void;
}

export default function IconSizesEditor({ iconSizes, onChange }: IconSizesEditorProps) {
  const { theme } = useTheme();

  const handleChange = (key: keyof IconSizes, value: number) => {
    onChange({
      ...iconSizes,
      [key]: value,
    });
  };

  const sizes: (keyof IconSizes)[] = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl'];

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
        🔷 Editor de Tamaños de Iconos
      </h3>
      <p
        style={{
          fontSize: theme.typography.sizes.base,
          color: theme.colors.neutral[600],
          marginBottom: theme.spacing[6],
          lineHeight: theme.typography.lineHeights.relaxed,
        }}
      >
        Define los tamaños estándar para iconos en toda la aplicación.
      </p>

      <div style={{ display: 'grid', gap: theme.spacing[4] }}>
        {sizes.map((key) => {
          const currentValue = iconSizes[key];

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
                    iconSizes.{key}
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

                {/* Icon preview */}
                <Star size={currentValue} color={theme.colors.primary[500]} fill={theme.colors.primary[200]} />
              </div>

              {/* Slider */}
              <input
                type="range"
                min="8"
                max="48"
                step="2"
                value={currentValue}
                onChange={(e) => handleChange(key, parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: theme.radius.full,
                  background: `linear-gradient(to right, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[500]} ${((currentValue - 8) / 40) * 100}%, ${theme.colors.neutral[200]} ${((currentValue - 8) / 40) * 100}%, ${theme.colors.neutral[200]} 100%)`,
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
