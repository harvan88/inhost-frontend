import { useTheme } from '@/theme';
import { useAuthStore } from '@/store/auth-store';
import { Heading, Text, Input } from '@/components/ui';

interface AccountSettingsAreaProps {
  settingId: string;
}

/**
 * AccountSettingsArea - Vista de configuración de cuenta (vive en Contenedor Dinámico)
 *
 * Permite gestionar configuración de cuenta, perfil y tenant
 */
export default function AccountSettingsArea({ settingId }: AccountSettingsAreaProps) {
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: theme.spacing[6],
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          backgroundColor: theme.colors.neutral[0],
        }}
      >
        <Heading level={1} noMargin>
          Account Settings
        </Heading>
        <Text variant="metadata" color="muted">
          Configuración de cuenta y preferencias
        </Text>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: theme.spacing[6],
        }}
      >
        {/* Tenant Settings */}
        <div
          style={{
            marginBottom: theme.spacing[6],
            padding: theme.spacing[6],
            backgroundColor: theme.colors.neutral[0],
            border: `1px solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.radius.lg,
          }}
        >
          <Heading level={2}>Tenant Information</Heading>
          <div
            style={{
              marginTop: theme.spacing[4],
              display: 'grid',
              gap: theme.spacing[4],
            }}
          >
            <div>
              <Text variant="label" color="muted">
                Company Name
              </Text>
              <div style={{ marginTop: theme.spacing[2] }}>
                <Input
                  type="text"
                  value={user?.tenantName || ''}
                  disabled
                />
              </div>
            </div>
            <div>
              <Text variant="label" color="muted">
                Tenant ID
              </Text>
              <div style={{ marginTop: theme.spacing[2], fontFamily: 'monospace' }}>
                <Input
                  type="text"
                  value={user?.tenantId || ''}
                  disabled
                />
              </div>
            </div>
            <div>
              <Text variant="label" color="muted">
                Tenant Slug
              </Text>
              <div style={{ marginTop: theme.spacing[2], fontFamily: 'monospace' }}>
                <Input
                  type="text"
                  value={user?.tenantSlug || ''}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div
          style={{
            marginBottom: theme.spacing[6],
            padding: theme.spacing[6],
            backgroundColor: theme.colors.neutral[0],
            border: `1px solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.radius.lg,
          }}
        >
          <Heading level={2}>Profile Settings</Heading>
          <div
            style={{
              marginTop: theme.spacing[4],
              display: 'grid',
              gap: theme.spacing[4],
            }}
          >
            <div>
              <Text variant="label" color="muted">
                Name
              </Text>
              <div style={{ marginTop: theme.spacing[2] }}>
                <Input
                  type="text"
                  value={user?.name || ''}
                  disabled
                />
              </div>
            </div>
            <div>
              <Text variant="label" color="muted">
                Email
              </Text>
              <div style={{ marginTop: theme.spacing[2] }}>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                />
              </div>
            </div>
            <div>
              <Text variant="label" color="muted">
                Role
              </Text>
              <div style={{ marginTop: theme.spacing[2], textTransform: 'capitalize' }}>
                <Input
                  type="text"
                  value={user?.role || ''}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div
          style={{
            padding: theme.spacing[4],
            backgroundColor: theme.colors.info[50],
            border: `1px solid ${theme.colors.info[200]}`,
            borderRadius: theme.radius.lg,
          }}
        >
          <Text variant="label" color="muted">
            <strong>Coming soon:</strong> Edit tenant settings, update profile
            information, and configure notifications.
          </Text>
        </div>
      </div>
    </div>
  );
}
