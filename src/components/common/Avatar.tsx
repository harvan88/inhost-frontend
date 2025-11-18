/**
 * Avatar.tsx - Componente de Avatar
 *
 * Componente reutilizable para mostrar avatares con soporte para:
 * - Imágenes (src)
 * - Texto fallback (initials)
 * - Indicador de estado (online/offline/away)
 *
 * ## Ejemplo de uso:
 * ```tsx
 * <Avatar src="https://..." alt="John Doe" size="md" />
 * <Avatar alt="Jane Smith" fallbackText="JS" size="lg" statusIndicator="online" />
 * <Avatar src="..." alt="User" size="sm" statusIndicator="away" />
 * ```
 */

import React, { CSSProperties, ImgHTMLAttributes } from 'react';
import { useTheme } from '@/theme';
import { StatusIndicator } from './StatusIndicator';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
  statusIndicator?: 'online' | 'offline' | 'away' | null;
  className?: string;
}

export function Avatar({
  src,
  alt,
  size = 'md',
  fallbackText,
  statusIndicator = null,
  className,
  ...imgProps
}: AvatarProps) {
  const { theme } = useTheme();

  // Get size from theme
  const avatarSize = theme.componentSizes.avatar[size];

  // Container styles with position: relative for status indicator
  const containerStyles: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: avatarSize,
    height: avatarSize,
  };

  // Avatar image/fallback styles
  const avatarStyles: CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.full,
    objectFit: 'cover',
    backgroundColor: theme.colors.primary[100],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.typography.fontFamily.base,
    fontSize:
      size === 'sm'
        ? theme.typography.sizes.xs
        : size === 'md'
          ? theme.typography.sizes.sm
          : size === 'lg'
            ? theme.typography.sizes.base
            : theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary[700],
  };

  return (
    <div style={containerStyles} className={className}>
      {src ? (
        <img
          src={src}
          alt={alt}
          style={avatarStyles}
          {...imgProps}
        />
      ) : (
        <div style={avatarStyles}>{fallbackText || '?'}</div>
      )}

      {statusIndicator && (
        <StatusIndicator status={statusIndicator} position="corner" />
      )}
    </div>
  );
}
