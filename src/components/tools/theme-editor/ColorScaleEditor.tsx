/**
 * ColorScaleEditor - Editor de Escalas de Color (Compacto)
 *
 * Solo muestra colores realmente usados en la interfaz:
 * - Primary: 100, 500, 600
 * - Neutral: 0, 100, 200, 600, 700, 900
 * - Semantic: success, warning, danger, info
 * - Channels: solo 500 de cada canal
 *
 * Con color pickers nativos + validación WCAG
 */

import React from 'react';
import { useTheme } from '@/theme';
import type { ThemeColors } from '@/theme/types';
import { validateContrast } from '@/theme/utils';
import { AlertCircle, Check } from 'lucide-react';

interface ColorScaleEditorProps {
  theme: { colors: ThemeColors };
  onChange: (colors: ThemeColors) => void;
}

// Solo mostramos los colores realmente usados en la interfaz
const PRIMARY_KEYS = ['100', '500', '600'] as const;
const NEUTRAL_KEYS = ['0', '100', '200', '600', '700', '900'] as const;
const SEMANTIC_KEYS = ['success', 'warning', 'danger', 'info'] as const;
const CHANNEL_NAMES = ['whatsapp', 'telegram', 'web', 'sms'] as const;

export default function ColorScaleEditor({ theme: editedTheme, onChange }: ColorScaleEditorProps) {
  const { theme } = useTheme();

  const handleColorChange = (path: string[], value: string) => {
    const newColors = { ...editedTheme.colors };
    let current: any = newColors;

    // Navigate to the nested property
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    onChange(newColors);
  };

  const renderColorInput = (label: string, value: string, path: string[], showWCAG = false) => {
    // Validación WCAG contra neutral-0
    const contrast = showWCAG ? validateContrast(value, editedTheme.colors.neutral[0]) : null;

    return (
      <div
        key={path.join('.')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[2],
          padding: theme.spacing[2],
          backgroundColor: theme.colors.neutral[50],
          borderRadius: theme.radius.sm,
          border: `1px solid ${theme.colors.neutral[200]}`,
        }}
      >
        {/* Color preview swatch */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: theme.radius.sm,
            backgroundColor: value,
            border: `2px solid ${theme.colors.neutral[300]}`,
            cursor: 'pointer',
            position: 'relative',
            flexShrink: 0,
          }}
          title="Click para cambiar color"
        >
          <input
            type="color"
            value={value}
            onChange={(e) => handleColorChange(path, e.target.value)}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: 'pointer',
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.medium,
              color: theme.colors.neutral[900],
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.neutral[600],
              fontFamily: theme.typography.fontFamily.mono,
            }}
          >
            {value}
          </div>
        </div>

        {/* WCAG indicator */}
        {showWCAG && contrast && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[1],
              padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
              backgroundColor: contrast.passAA ? theme.colors.semantic.successLight : theme.colors.semantic.dangerLight,
              color: contrast.passAA ? theme.colors.semantic.success : theme.colors.semantic.danger,
              borderRadius: theme.radius.sm,
              fontSize: theme.typography.sizes.xs,
              fontWeight: theme.typography.weights.semibold,
              flexShrink: 0,
            }}
          >
            {contrast.passAA ? (
              <Check size={12} />
            ) : (
              <AlertCircle size={12} />
            )}
            {contrast.ratio.toFixed(2)}:1 {contrast.passAAA ? 'AAA' : contrast.passAA ? 'AA' : 'FAIL'}
          </div>
        )}

        {/* Text input */}
        <input
          type="text"
          value={value}
          onChange={(e) => handleColorChange(path, e.target.value)}
          style={{
            width: '90px',
            padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
            border: `1px solid ${theme.colors.neutral[300]}`,
            borderRadius: theme.radius.sm,
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fontFamily.mono,
            color: theme.colors.neutral[900],
            backgroundColor: theme.colors.neutral[0],
            flexShrink: 0,
          }}
        />
      </div>
    );
  };

  const renderSection = (title: string, description: string, content: React.ReactNode) => {
    return (
      <div
        style={{
          marginBottom: theme.spacing[3],
          border: `1px solid ${theme.colors.neutral[200]}`,
          borderRadius: theme.radius.md,
          overflow: 'hidden',
          backgroundColor: theme.colors.neutral[0],
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: theme.componentSpacing.card.sm,
            backgroundColor: theme.colors.neutral[50],
            borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          }}
        >
          <div
            style={{
              fontSize: theme.typography.sizes.base,
              fontWeight: theme.typography.weights.semibold,
              color: theme.colors.neutral[900],
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.neutral[600],
              marginTop: theme.spacing[1],
            }}
          >
            {description}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: theme.componentSpacing.card.sm }}>
          {content}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div
        style={{
          marginBottom: theme.spacing[3],
        }}
      >
        <h3
          style={{
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing[1],
          }}
        >
          Editor de Colores
        </h3>
        <p
          style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.neutral[600],
            lineHeight: theme.typography.lineHeights.normal,
          }}
        >
          Solo colores realmente usados en la interfaz
        </p>
      </div>

      {/* Primary Colors - Solo 100, 500, 600 */}
      {renderSection(
        '🎨 Colores Primarios',
        'Primary 100, 500, 600',
        <div style={{ display: 'grid', gap: theme.spacing[2] }}>
          {PRIMARY_KEYS.map((key) =>
            renderColorInput(
              `primary-${key}`,
              editedTheme.colors.primary[key],
              ['primary', key],
              key === '500' || key === '600'
            )
          )}
        </div>
      )}

      {/* Neutral Colors - Solo 0, 100, 200, 600, 700, 900 */}
      {renderSection(
        '⚫ Colores Neutrales',
        'Neutral 0, 100, 200, 600, 700, 900',
        <div style={{ display: 'grid', gap: theme.spacing[2] }}>
          {NEUTRAL_KEYS.map((key) =>
            renderColorInput(
              `neutral-${key}`,
              editedTheme.colors.neutral[key],
              ['neutral', key],
              key === '900'
            )
          )}
        </div>
      )}

      {/* Semantic Colors - Solo success, warning, danger, info */}
      {renderSection(
        '✅ Colores Semánticos',
        'Success, Warning, Danger, Info',
        <div style={{ display: 'grid', gap: theme.spacing[2] }}>
          {SEMANTIC_KEYS.map((key) =>
            renderColorInput(
              key,
              editedTheme.colors.semantic[key],
              ['semantic', key],
              true
            )
          )}
        </div>
      )}

      {/* Channel Colors - Solo 500 de cada canal */}
      {renderSection(
        '💬 Colores de Canales',
        'Solo el color 500 de cada canal',
        <div style={{ display: 'grid', gap: theme.spacing[2] }}>
          {CHANNEL_NAMES.map((channelName) =>
            renderColorInput(
              `${channelName}-500`,
              editedTheme.colors.channels[channelName]['500'],
              ['channels', channelName, '500'],
              true
            )
          )}
        </div>
      )}
    </div>
  );
}
