import { useTheme } from '@/theme';
import { useAuthStore } from '@/store/auth-store';
import { Heading, Text } from '@/components/ui';
import { useState } from 'react';

interface TeamAreaProps {
  settingId: string;
}

/**
 * TeamArea - Vista de gestión de equipo (vive en Contenedor Dinámico)
 *
 * Permite gestionar miembros del equipo, roles e invitaciones
 */
export default function TeamArea({ settingId }: TeamAreaProps) {
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const [teamMembers] = useState([
    {
      id: user?.id || '1',
      name: user?.name || 'Usuario',
      email: user?.email || 'usuario@example.com',
      role: user?.role || 'owner',
    },
  ]);

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
          Team Management
        </Heading>
        <Text variant="metadata" color="muted">
          Gestionar miembros del equipo e invitaciones
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
        {/* Team Members List */}
        <div
          style={{
            marginBottom: theme.spacing[6],
          }}
        >
          <Heading level={2}>Team Members</Heading>
          <div
            style={{
              marginTop: theme.spacing[4],
            }}
          >
            {teamMembers.map((member) => (
              <div
                key={member.id}
                style={{
                  padding: theme.spacing[4],
                  marginBottom: theme.spacing[3],
                  backgroundColor: theme.colors.neutral[0],
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  borderRadius: theme.radius.lg,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <Text variant="label">{member.name}</Text>
                    <Text variant="metadata" color="muted">
                      {member.email}
                    </Text>
                  </div>
                  <div
                    style={{
                      padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                      backgroundColor: theme.colors.primary[50],
                      color: theme.colors.primary[700],
                      borderRadius: theme.radius.md,
                      fontSize: theme.typography.sizes.sm,
                      fontWeight: theme.typography.weights.medium,
                      textTransform: 'capitalize',
                    }}
                  >
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite New Member */}
        <div
          style={{
            padding: theme.spacing[6],
            backgroundColor: theme.colors.neutral[50],
            borderRadius: theme.radius.lg,
            border: `1px solid ${theme.colors.neutral[200]}`,
          }}
        >
          <Heading level={3}>Invite Team Member</Heading>
          <Text variant="metadata" color="muted">
            Coming soon: Invite new members to your team
          </Text>
        </div>
      </div>
    </div>
  );
}
