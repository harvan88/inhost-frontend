/**
 * ColorScaleEditor - Editor de Escalas de Color
 *
 * Permite editar:
 * - Primary colors (50-900)
 * - Neutral colors (0-950)
 * - Semantic colors (success, warning, danger, info)
 * - Channel colors (whatsapp, telegram, web, sms)
 *
 * Con color pickers nativos + validación WCAG
 */

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import type { ThemeColors } from '@/theme/types';
import { validateContrast } from '@/theme/utils';
import { ChevronDown, ChevronRight, AlertCircle, Check } from 'lucide-react';

interface ColorScaleEditorProps {
  theme: { colors: ThemeColors };
  onChange: (colors: ThemeColors) => void;
}

type ColorSection = 'primary' | 'neutral' | 'semantic' | 'channels';

export default function ColorScaleEditor({ theme: editedTheme, onChange }: ColorScaleEditorProps) {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<ColorSection>>(new Set(['primary']));

  const toggleSection = (section: ColorSection) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

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
          gap: theme.spacing[3],
          padding: theme.spacing[2],
          backgroundColor: theme.colors.neutral[50],
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.neutral[200]}`,
        }}
      >
        {/* Color preview swatch */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: theme.radius.md,
            backgroundColor: value,
            border: `2px solid ${theme.colors.neutral[300]}`,
            cursor: 'pointer',
            position: 'relative',
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
        <div style={{ flex: 1 }}>
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
            padding: theme.spacing[2],
            border: `1px solid ${theme.colors.neutral[300]}`,
            borderRadius: theme.radius.sm,
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fontFamily.mono,
            color: theme.colors.neutral[900],
            backgroundColor: theme.colors.neutral[0],
          }}
        />
      </div>
    );
  };

  const renderSection = (
    section: ColorSection,
    title: string,
    description: string,
    renderContent: () => React.ReactNode
  ) => {
    const isExpanded = expandedSections.has(section);

    return (
      <div
        style={{
          marginBottom: theme.spacing[4],
          border: `1px solid ${theme.colors.neutral[200]}`,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
          backgroundColor: theme.colors.neutral[0],
        }}
      >
        {/* Header */}
        <button
          onClick={() => toggleSection(section)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing[4],
            backgroundColor: theme.colors.neutral[50],
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: theme.typography.sizes.lg,
                fontWeight: theme.typography.weights.semibold,
                color: theme.colors.neutral[900],
                marginBottom: theme.spacing[1],
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: theme.typography.sizes.sm,
                color: theme.colors.neutral[600],
              }}
            >
              {description}
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown size={theme.iconSizes.lg} color={theme.colors.neutral[600]} />
          ) : (
            <ChevronRight size={theme.iconSizes.lg} color={theme.colors.neutral[600]} />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div style={{ padding: theme.spacing[4] }}>
            {renderContent()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div
        style={{
          marginBottom: theme.spacing[6],
        }}
      >
        <h3
          style={{
            fontSize: theme.typography.sizes['2xl'],
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing[2],
          }}
        >
          Editor de Colores
        </h3>
        <p
          style={{
            fontSize: theme.typography.sizes.base,
            color: theme.colors.neutral[600],
            lineHeight: theme.typography.lineHeights.relaxed,
          }}
        >
          Modifica las escalas de color del tema. Los cambios se aplican en tiempo real si el preview está activado.
        </p>
      </div>

      {/* Primary Colors */}
      {renderSection(
        'primary',
        '🎨 Colores Primarios',
        'Escala de azul principal (50-900)',
        () => (
          <div style={{ display: 'grid', gap: theme.spacing[2] }}>
            {Object.entries(editedTheme.colors.primary).map(([key, value]) =>
              renderColorInput(`primary-${key}`, value, ['primary', key], key === '500' || key === '600')
            )}
          </div>
        )
      )}

      {/* Neutral Colors */}
      {renderSection(
        'neutral',
        '⚫ Colores Neutrales',
        'Escala de grises (0-950)',
        () => (
          <div style={{ display: 'grid', gap: theme.spacing[2] }}>
            {Object.entries(editedTheme.colors.neutral).map(([key, value]) =>
              renderColorInput(`neutral-${key}`, value, ['neutral', key], key === '900')
            )}
          </div>
        )
      )}

      {/* Semantic Colors */}
      {renderSection(
        'semantic',
        '✅ Colores Semánticos',
        'Success, Warning, Danger, Info',
        () => (
          <div style={{ display: 'grid', gap: theme.spacing[2] }}>
            {Object.entries(editedTheme.colors.semantic).map(([key, value]) =>
              renderColorInput(key, value, ['semantic', key], key === 'success' || key === 'warning' || key === 'danger' || key === 'info')
            )}
          </div>
        )
      )}

      {/* Channel Colors */}
      {renderSection(
        'channels',
        '💬 Colores de Canales',
        'WhatsApp, Telegram, Web, SMS',
        () => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
            {Object.entries(editedTheme.colors.channels).map(([channelName, scale]) => (
              <div key={channelName}>
                <h4
                  style={{
                    fontSize: theme.typography.sizes.base,
                    fontWeight: theme.typography.weights.semibold,
                    color: theme.colors.neutral[800],
                    marginBottom: theme.spacing[3],
                    textTransform: 'capitalize',
                  }}
                >
                  {channelName}
                </h4>
                <div style={{ display: 'grid', gap: theme.spacing[2] }}>
                  {Object.entries(scale).map(([key, value]) =>
                    renderColorInput(`${channelName}-${key}`, value, ['channels', channelName, key], key === '500')
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
