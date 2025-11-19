import { useTheme } from '@/theme';
import { Heading, Text, Tag } from '@/components/ui';

interface IntegrationsAreaProps {
  settingId: string;
}

/**
 * IntegrationsArea - Vista de integraciones (vive en Contenedor Dinámico)
 *
 * Permite conectar canales como WhatsApp, Instagram, etc.
 */
export default function IntegrationsArea({ settingId }: IntegrationsAreaProps) {
  const { theme } = useTheme();

  const integrations = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Conecta tu cuenta de WhatsApp Business',
      icon: '💬',
      status: 'available',
      category: 'Messaging',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Gestiona mensajes directos de Instagram',
      icon: '📸',
      status: 'available',
      category: 'Social Media',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Conecta tu bot de Telegram',
      icon: '✈️',
      status: 'available',
      category: 'Messaging',
    },
    {
      id: 'sms',
      name: 'SMS',
      description: 'Envía y recibe mensajes SMS',
      icon: '📱',
      status: 'available',
      category: 'Messaging',
    },
  ];

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
          Integrations
        </Heading>
        <Text variant="metadata" color="muted">
          Conectar WhatsApp, Instagram y otros canales
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: theme.spacing[4],
          }}
        >
          {integrations.map((integration) => (
            <div
              key={integration.id}
              style={{
                padding: theme.spacing[5],
                backgroundColor: theme.colors.neutral[0],
                border: `1px solid ${theme.colors.neutral[200]}`,
                borderRadius: theme.radius.lg,
                cursor: 'pointer',
                transition: `all ${theme.transitions.base}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary[300];
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = theme.elevation.base;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.neutral[200];
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  fontSize: theme.typography.sizes['3xl'],
                  marginBottom: theme.spacing[3],
                }}
              >
                {integration.icon}
              </div>
              <Heading level={3} noMargin>
                {integration.name}
              </Heading>
              <Text
                variant="metadata"
                color="muted"
                style={{
                  marginTop: theme.spacing[2],
                  marginBottom: theme.spacing[3],
                }}
              >
                {integration.description}
              </Text>
              <Tag size="small">{integration.category}</Tag>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div
          style={{
            marginTop: theme.spacing[6],
            padding: theme.spacing[4],
            backgroundColor: theme.colors.primary[50],
            border: `1px solid ${theme.colors.primary[200]}`,
            borderRadius: theme.radius.lg,
          }}
        >
          <Text variant="label" color="muted">
            <strong>Coming soon:</strong> Connect and configure integrations directly
            from the workspace. Backend integration pending.
          </Text>
        </div>
      </div>
    </div>
  );
}
