/**
 * DevTools - Development tools floating panel
 * Only visible in development mode
 */

import { useState } from 'react';
import { Settings, Database, Trash2, RotateCw } from 'lucide-react';
import { seedDatabase, clearDatabase, resetDatabase } from '@/utils/seedDatabase';
import { useTheme } from '@/theme';

export default function DevTools() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Only show in development
  if (import.meta.env.PROD) return null;

  const handleSeed = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await seedDatabase();
      setMessage(`✅ Seeded: ${result.contacts} contacts, ${result.conversations} conversations, ${result.messages} messages`);
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Clear all data?')) return;
    setIsLoading(true);
    setMessage(null);
    try {
      await clearDatabase();
      setMessage('✅ Database cleared');
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset database (clear + seed)?')) return;
    setIsLoading(true);
    setMessage(null);
    try {
      await resetDatabase();
      setMessage('✅ Database reset');
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: theme.spacing[4],
          right: theme.spacing[4],
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: theme.colors.neutral[800],
          color: theme.colors.neutral[0],
          border: `2px solid ${theme.colors.primary[500]}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: theme.elevation.lg,
          zIndex: 9999,
          transition: `all ${theme.transitions.base}`,
        }}
        title="Dev Tools"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.backgroundColor = theme.colors.neutral[900];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = theme.colors.neutral[800];
        }}
      >
        <Settings size={20} />
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: theme.spacing[20],
            right: theme.spacing[4],
            width: '320px',
            backgroundColor: theme.colors.neutral[0],
            borderRadius: theme.radius.lg,
            boxShadow: theme.elevation.xl,
            border: `1px solid ${theme.colors.neutral[200]}`,
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: theme.spacing[4],
              backgroundColor: theme.colors.neutral[100],
              borderBottom: `1px solid ${theme.colors.neutral[200]}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: theme.typography.sizes.base,
                fontWeight: theme.typography.weights.semibold,
                color: theme.colors.neutral[900],
              }}
            >
              🛠️ Dev Tools
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: theme.spacing[1],
                color: theme.colors.neutral[600],
                fontSize: theme.typography.sizes.lg,
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: theme.spacing[4] }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
              <button
                onClick={handleSeed}
                disabled={isLoading}
                style={{
                  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                  backgroundColor: theme.colors.primary[500],
                  color: theme.colors.neutral[0],
                  border: 'none',
                  borderRadius: theme.radius.md,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: theme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <Database size={16} />
                Seed Database
              </button>

              <button
                onClick={handleClear}
                disabled={isLoading}
                style={{
                  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                  backgroundColor: theme.colors.semantic.danger,
                  color: theme.colors.neutral[0],
                  border: 'none',
                  borderRadius: theme.radius.md,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: theme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <Trash2 size={16} />
                Clear Database
              </button>

              <button
                onClick={handleReset}
                disabled={isLoading}
                style={{
                  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                  backgroundColor: theme.colors.semantic.warning,
                  color: theme.colors.neutral[900],
                  border: 'none',
                  borderRadius: theme.radius.md,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: theme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <RotateCw size={16} />
                Reset Database
              </button>
            </div>

            {/* Message */}
            {message && (
              <div
                style={{
                  marginTop: theme.spacing[3],
                  padding: theme.spacing[3],
                  backgroundColor: theme.colors.neutral[50],
                  borderRadius: theme.radius.md,
                  fontSize: theme.typography.sizes.xs,
                  color: theme.colors.neutral[700],
                  wordWrap: 'break-word',
                }}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
