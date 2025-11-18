/**
 * ThemeEditorArea - Editor Visual de Temas (Primer Plugin de FluxCore)
 *
 * Editor profesional estilo Photoshop para modificar theme.json en tiempo real.
 *
 * Features:
 * - Color pickers para todas las escalas de colores
 * - Sliders para spacing, radius, iconSizes
 * - Preview en vivo en toda la aplicación
 * - Exportación a JSON
 * - Validación WCAG automática
 * - Presets (light/dark)
 *
 * ID-based: Recibe themeId (opcional) para editar tema específico
 */

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import type { Theme } from '@/theme/types';
import { Copy, Download, Eye, EyeOff, RotateCcw } from 'lucide-react';
import ColorScaleEditor from './theme-editor/ColorScaleEditor';
import SpacingEditor from './theme-editor/SpacingEditor';
import TypographyEditor from './theme-editor/TypographyEditor';
import IconSizesEditor from './theme-editor/IconSizesEditor';
import RadiusEditor from './theme-editor/RadiusEditor';
import defaultTheme from '@/theme/theme.json';
import darkTheme from '@/theme/dark-theme.json';

interface ThemeEditorAreaProps {
  themeId?: string; // ID-based architecture
}

type TabType = 'colors' | 'typography' | 'spacing' | 'radius' | 'iconSizes' | 'export';

export default function ThemeEditorArea({ themeId }: ThemeEditorAreaProps) {
  const { theme, setTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('colors');
  const [editedTheme, setEditedTheme] = useState<Theme>(theme);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  // Aplicar cambios en tiempo real
  const handleThemeChange = (updates: Partial<Theme>) => {
    const newTheme = { ...editedTheme, ...updates };
    setEditedTheme(newTheme);

    if (previewEnabled) {
      setTheme(newTheme);
    }
  };

  // Exportar JSON
  const handleExportJSON = () => {
    const json = JSON.stringify(editedTheme, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Descargar como archivo
  const handleDownload = () => {
    const json = JSON.stringify(editedTheme, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editedTheme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset al tema original
  const handleReset = () => {
    const resetTheme = isDark ? darkTheme : defaultTheme;
    setEditedTheme(resetTheme as Theme);
    if (previewEnabled) {
      setTheme(resetTheme as Theme);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'colors', label: 'Colores', icon: '🎨' },
    { id: 'typography', label: 'Tipografía', icon: '📝' },
    { id: 'spacing', label: 'Espaciado', icon: '📏' },
    { id: 'radius', label: 'Bordes', icon: '⭕' },
    { id: 'iconSizes', label: 'Iconos', icon: '🔷' },
    { id: 'export', label: 'Exportar', icon: '💾' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.colors.neutral[0],
        color: theme.colors.neutral[900],
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: theme.spacing[3],
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.neutral[50],
          height: theme.componentSizes.toolbar,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: theme.typography.sizes.lg,
                fontWeight: theme.typography.weights.semibold,
                color: theme.colors.neutral[900],
              }}
            >
              🎨 Theme Editor
            </h2>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: theme.spacing[2] }}>
            <button
              onClick={() => setPreviewEnabled(!previewEnabled)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[1],
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                backgroundColor: previewEnabled ? theme.colors.semantic.success : theme.colors.neutral[200],
                color: previewEnabled ? theme.colors.neutral[0] : theme.colors.neutral[700],
                border: 'none',
                borderRadius: theme.radius.sm,
                fontSize: theme.typography.sizes.sm,
                fontWeight: theme.typography.weights.medium,
                cursor: 'pointer',
                transition: `all ${theme.transitions.base}`,
              }}
            >
              {previewEnabled ? <Eye size={theme.iconSizes.sm} /> : <EyeOff size={theme.iconSizes.sm} />}
              Preview {previewEnabled ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[1],
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                backgroundColor: theme.colors.neutral[0],
                color: theme.colors.neutral[500],
                border: `1px solid ${theme.colors.neutral[300]}`,
                borderRadius: theme.radius.sm,
                fontSize: theme.typography.sizes.sm,
                cursor: 'pointer',
                transition: `all ${theme.transitions.base}`,
              }}
            >
              <RotateCcw size={theme.iconSizes.sm} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: theme.spacing[1],
          padding: theme.spacing[2],
          backgroundColor: theme.colors.neutral[50],
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[1],
              padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
              backgroundColor: activeTab === tab.id ? theme.colors.neutral[0] : 'transparent',
              color: activeTab === tab.id ? theme.colors.primary[600] : theme.colors.neutral[600],
              border: activeTab === tab.id ? `1px solid ${theme.colors.neutral[300]}` : '1px solid transparent',
              borderRadius: theme.radius.sm,
              fontSize: theme.typography.sizes.sm,
              fontWeight: activeTab === tab.id ? theme.typography.weights.semibold : theme.typography.weights.normal,
              cursor: 'pointer',
              transition: `all ${theme.transitions.base}`,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: theme.typography.sizes.sm }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: theme.spacing[4],
        }}
      >
        {activeTab === 'colors' && (
          <ColorScaleEditor
            theme={editedTheme}
            onChange={(colors) => handleThemeChange({ colors })}
          />
        )}

        {activeTab === 'typography' && (
          <TypographyEditor
            typography={editedTheme.typography}
            onChange={(typography) => handleThemeChange({ typography })}
          />
        )}

        {activeTab === 'spacing' && (
          <SpacingEditor
            spacing={editedTheme.spacing}
            onChange={(spacing) => handleThemeChange({ spacing })}
          />
        )}

        {activeTab === 'radius' && (
          <RadiusEditor
            radius={editedTheme.radius}
            onChange={(radius) => handleThemeChange({ radius })}
          />
        )}

        {activeTab === 'iconSizes' && (
          <IconSizesEditor
            iconSizes={editedTheme.iconSizes}
            onChange={(iconSizes) => handleThemeChange({ iconSizes })}
          />
        )}

        {activeTab === 'export' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3
              style={{
                fontSize: theme.typography.sizes.lg,
                fontWeight: theme.typography.weights.semibold,
                color: theme.colors.neutral[900],
                marginBottom: theme.spacing[3],
              }}
            >
              Exportar Tema
            </h3>

            <div
              style={{
                display: 'flex',
                gap: theme.spacing[2],
                marginBottom: theme.spacing[4],
              }}
            >
              <button
                onClick={handleExportJSON}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  backgroundColor: copied ? theme.colors.semantic.success : theme.colors.primary[500],
                  color: theme.colors.neutral[0],
                  border: 'none',
                  borderRadius: theme.radius.sm,
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: theme.typography.weights.semibold,
                  cursor: 'pointer',
                  transition: `all ${theme.transitions.base}`,
                }}
              >
                <Copy size={theme.iconSizes.sm} />
                {copied ? '¡Copiado!' : 'Copiar JSON'}
              </button>

              <button
                onClick={handleDownload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  backgroundColor: theme.colors.primary[500],
                  color: theme.colors.neutral[0],
                  border: 'none',
                  borderRadius: theme.radius.sm,
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: theme.typography.weights.semibold,
                  cursor: 'pointer',
                  transition: `all ${theme.transitions.base}`,
                }}
              >
                <Download size={theme.iconSizes.sm} />
                Descargar .json
              </button>
            </div>

            {/* JSON Preview */}
            <div>
              <h4
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: theme.typography.weights.semibold,
                  color: theme.colors.neutral[700],
                  marginBottom: theme.spacing[2],
                }}
              >
                Vista previa del JSON:
              </h4>
              <pre
                style={{
                  padding: theme.componentSpacing.card.sm,
                  backgroundColor: theme.colors.neutral[900],
                  color: theme.colors.neutral[0],
                  borderRadius: theme.radius.md,
                  fontSize: theme.typography.sizes.xs,
                  fontFamily: theme.typography.fontFamily.mono,
                  lineHeight: theme.typography.lineHeights.relaxed,
                  overflow: 'auto',
                  maxHeight: '500px',
                }}
              >
                {JSON.stringify(editedTheme, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
