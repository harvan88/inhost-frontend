import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useTheme } from '@/theme';
import { adminAPI } from '@/lib/api/admin-client';
import { Badge } from '@/components/common';

interface MentionsBadgeProps {
  onClick?: () => void;
}

/**
 * MentionsBadge - Badge con contador de menciones no leídas
 *
 * Muestra un icono de campana con badge de contador cuando hay menciones pendientes.
 * Se actualiza automáticamente cada 30 segundos.
 */
export default function MentionsBadge({ onClick }: MentionsBadgeProps) {
  const { theme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getMentionsUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching mentions count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch inicial
    fetchUnreadCount();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing[2],
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: theme.radius.md,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        color: theme.colors.neutral[700],
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.neutral[100];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      aria-label={`Menciones: ${unreadCount} no leídas`}
    >
      <Bell size={theme.iconSizes.lg} />

      {unreadCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: theme.spacing[1],
            right: theme.spacing[1],
          }}
        >
          <Badge variant="compact" color="danger">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        </div>
      )}
    </button>
  );
}
