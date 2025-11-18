import { useState } from 'react';
import { useTheme } from '@/theme';
import { Heading, Text, Button } from '@/components/ui';
import { seedDatabase, clearDatabase, resetDatabase } from '@/utils/seedDatabase';
import { Database, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface DatabaseDevToolsAreaProps {
  toolId: string;
}

/**
 * DatabaseDevToolsArea - Herramienta de gestión de datos de desarrollo
 *
 * Permite realizar operaciones CRUD sobre IndexedDB durante desarrollo:
 * - Seed: Poblar base de datos con datos mock
 * - Clear: Limpiar toda la base de datos
 * - Reset: Clear + Seed en una sola operación
 *
 * Solo disponible en modo desarrollo (import.meta.env.DEV)
 */
export default function DatabaseDevToolsArea({ toolId }: DatabaseDevToolsAreaProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await seedDatabase();
      setMessage({
        type: 'success',
        text: `✅ Seeded: ${result.contacts} contactos, ${result.conversations} conversaciones, ${result.messages} mensajes`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error seeding database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar TODOS los datos?')) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const result = await clearDatabase();
      setMessage({
        type: 'success',
        text: `🗑️ Cleared: ${result.contacts} contactos, ${result.conversations} conversaciones, ${result.messages} mensajes eliminados`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error clearing database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('¿Estás seguro de que quieres resetear la base de datos?')) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const result = await resetDatabase();
      setMessage({
        type: 'success',
        text: `🔄 Reset completo: ${result.contacts} contactos, ${result.conversations} conversaciones, ${result.messages} mensajes`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error resetting database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-full overflow-auto"
      style={{
        padding: theme.spacing[6],
        backgroundColor: theme.colors.neutral[0],
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: theme.spacing[6],
          paddingBottom: theme.spacing[4],
          borderBottom: `2px solid ${theme.colors.neutral[200]}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[3], marginBottom: theme.spacing[2] }}>
          <Database size={theme.iconSizes.xl} style={{ color: theme.colors.primary[500] }} />
          <Heading level={1} noMargin>
            Database Dev Tools
          </Heading>
        </div>
        <Text variant="metadata" color="muted">
          Gestión de datos de desarrollo (IndexedDB)
        </Text>
      </div>

      {/* Warning Banner */}
      <div
        style={{
          padding: theme.spacing[4],
          marginBottom: theme.spacing[6],
          backgroundColor: theme.colors.semantic.warningLight,
          border: `1px solid ${theme.colors.semantic.warning}`,
          borderRadius: theme.radius.lg,
          display: 'flex',
          gap: theme.spacing[3],
        }}
      >
        <AlertCircle size={theme.iconSizes.lg} style={{ color: theme.colors.semantic.warning, flexShrink: 0 }} />
        <div>
          <Text variant="label" style={{ color: theme.colors.semantic.warning, marginBottom: theme.spacing[1] }}>
            ⚠️ Herramienta de Desarrollo
          </Text>
          <Text variant="normal" style={{ color: theme.colors.neutral[700] }}>
            Esta herramienta modifica directamente IndexedDB. Solo debe usarse en desarrollo para probar
            funcionalidad backend con datos mock.
          </Text>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: theme.spacing[4],
          marginBottom: theme.spacing[6],
        }}
      >
        {/* Seed Database Card */}
        <div
          style={{
            padding: theme.spacing[5],
            backgroundColor: theme.colors.neutral[50],
            border: `1px solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.radius.lg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[3] }}>
            <Database size={theme.iconSizes.lg} style={{ color: theme.colors.semantic.success }} />
            <Heading level={3} noMargin>
              Seed Database
            </Heading>
          </div>
          <Text variant="normal" color="muted" style={{ marginBottom: theme.spacing[4] }}>
            Poblar base de datos con datos mock: 4 contactos, 4 conversaciones, 10 mensajes con diferentes estados.
          </Text>
          <Button
            variant="primary"
            onClick={handleSeed}
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {isLoading ? 'Seeding...' : '🌱 Seed Database'}
          </Button>
        </div>

        {/* Clear Database Card */}
        <div
          style={{
            padding: theme.spacing[5],
            backgroundColor: theme.colors.neutral[50],
            border: `1px solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.radius.lg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[3] }}>
            <Trash2 size={theme.iconSizes.lg} style={{ color: theme.colors.semantic.danger }} />
            <Heading level={3} noMargin>
              Clear Database
            </Heading>
          </div>
          <Text variant="normal" color="muted" style={{ marginBottom: theme.spacing[4] }}>
            Eliminar TODOS los datos de IndexedDB: contactos, conversaciones y mensajes. Esta acción NO se puede deshacer.
          </Text>
          <Button
            variant="danger"
            onClick={handleClear}
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {isLoading ? 'Clearing...' : '🗑️ Clear Database'}
          </Button>
        </div>

        {/* Reset Database Card */}
        <div
          style={{
            padding: theme.spacing[5],
            backgroundColor: theme.colors.neutral[50],
            border: `1px solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.radius.lg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[3] }}>
            <RefreshCw size={theme.iconSizes.lg} style={{ color: theme.colors.primary[500] }} />
            <Heading level={3} noMargin>
              Reset Database
            </Heading>
          </div>
          <Text variant="normal" color="muted" style={{ marginBottom: theme.spacing[4] }}>
            Limpiar y poblar: elimina todos los datos existentes y luego seed con datos mock frescos. Clear + Seed en una operación.
          </Text>
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {isLoading ? 'Resetting...' : '🔄 Reset Database'}
          </Button>
        </div>
      </div>

      {/* Feedback Message */}
      {message && (
        <div
          style={{
            padding: theme.spacing[4],
            backgroundColor: message.type === 'success' ? theme.colors.semantic.successLight : theme.colors.semantic.dangerLight,
            border: `1px solid ${message.type === 'success' ? theme.colors.semantic.success : theme.colors.semantic.danger}`,
            borderRadius: theme.radius.lg,
            display: 'flex',
            gap: theme.spacing[3],
            alignItems: 'flex-start',
          }}
        >
          {message.type === 'success' ? (
            <CheckCircle size={theme.iconSizes.lg} style={{ color: theme.colors.semantic.success, flexShrink: 0 }} />
          ) : (
            <AlertCircle size={theme.iconSizes.lg} style={{ color: theme.colors.semantic.danger, flexShrink: 0 }} />
          )}
          <Text variant="normal" style={{ color: theme.colors.neutral[900] }}>
            {message.text}
          </Text>
        </div>
      )}

      {/* Info Section */}
      <div
        style={{
          marginTop: theme.spacing[8],
          paddingTop: theme.spacing[6],
          borderTop: `1px solid ${theme.colors.neutral[200]}`,
        }}
      >
        <Heading level={2} style={{ marginBottom: theme.spacing[4] }}>
          📚 Información
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
          <div>
            <Text variant="label" style={{ marginBottom: theme.spacing[1] }}>
              Mock Data Incluido:
            </Text>
            <ul style={{ marginLeft: theme.spacing[5], color: theme.colors.neutral[700] }}>
              <li>4 contactos: Juan Pérez, María González, Carlos Rodríguez, Ana López</li>
              <li>4 conversaciones con diferentes canales (WhatsApp, Telegram, Web)</li>
              <li>10 mensajes con varios estados (sending, sent, delivered, read, failed)</li>
            </ul>
          </div>
          <div>
            <Text variant="label" style={{ marginBottom: theme.spacing[1] }}>
              Uso recomendado:
            </Text>
            <Text variant="normal" color="muted">
              1. Click en "Seed Database" para poblar datos mock
              <br />
              2. Navega a Mensajes en Activity Bar para ver conversaciones
              <br />
              3. Prueba la funcionalidad del backend
              <br />
              4. Click en "Reset" cuando necesites datos frescos
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
