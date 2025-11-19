import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { useTheme } from '@/theme';
import { adminAPI } from '@/lib/api/admin-client';

interface MessageFeedbackProps {
  messageId: string;
  extensionId?: string;
  onFeedbackGiven?: () => void;
}

/**
 * MessageFeedback - Botones de feedback para mensajes de extensiones
 *
 * Permite dar feedback rápido (thumbs up/down) o abrir modal para feedback detallado.
 * Solo se muestra para mensajes generados por extensiones.
 */
export default function MessageFeedback({ messageId, extensionId, onFeedbackGiven }: MessageFeedbackProps) {
  const { theme } = useTheme();
  const [selectedRating, setSelectedRating] = useState<'positive' | 'negative' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickFeedback = async (rating: 'positive' | 'negative') => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSelectedRating(rating);

      await adminAPI.createOrUpdateMessageFeedback(messageId, { rating });

      onFeedbackGiven?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSelectedRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedFeedback = () => {
    // TODO: Abrir modal para feedback detallado con comentario y corrección sugerida
    console.log('Open detailed feedback modal for message:', messageId);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing[2],
        marginTop: theme.spacing[2],
      }}
    >
      {/* Thumbs Up */}
      <button
        onClick={() => handleQuickFeedback('positive')}
        disabled={isSubmitting}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing[1],
          backgroundColor: selectedRating === 'positive'
            ? theme.colors.semantic.successLight
            : 'transparent',
          border: `1px solid ${selectedRating === 'positive'
            ? theme.colors.semantic.success
            : theme.colors.neutral[300]}`,
          borderRadius: theme.radius.md,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          color: selectedRating === 'positive'
            ? theme.colors.semantic.successDark
            : theme.colors.neutral[600],
          opacity: isSubmitting ? 0.5 : 1,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting && selectedRating !== 'positive') {
            e.currentTarget.style.backgroundColor = theme.colors.neutral[50];
          }
        }}
        onMouseLeave={(e) => {
          if (selectedRating !== 'positive') {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
        aria-label="Feedback positivo"
      >
        <ThumbsUp size={14} />
      </button>

      {/* Thumbs Down */}
      <button
        onClick={() => handleQuickFeedback('negative')}
        disabled={isSubmitting}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing[1],
          backgroundColor: selectedRating === 'negative'
            ? theme.colors.semantic.dangerLight
            : 'transparent',
          border: `1px solid ${selectedRating === 'negative'
            ? theme.colors.semantic.danger
            : theme.colors.neutral[300]}`,
          borderRadius: theme.radius.md,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          color: selectedRating === 'negative'
            ? theme.colors.semantic.dangerDark
            : theme.colors.neutral[600],
          opacity: isSubmitting ? 0.5 : 1,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting && selectedRating !== 'negative') {
            e.currentTarget.style.backgroundColor = theme.colors.neutral[50];
          }
        }}
        onMouseLeave={(e) => {
          if (selectedRating !== 'negative') {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
        aria-label="Feedback negativo"
      >
        <ThumbsDown size={14} />
      </button>

      {/* Detailed Feedback Button */}
      <button
        onClick={handleDetailedFeedback}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[1],
          padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
          backgroundColor: 'transparent',
          border: `1px solid ${theme.colors.neutral[300]}`,
          borderRadius: theme.radius.md,
          cursor: 'pointer',
          color: theme.colors.neutral[600],
          fontSize: theme.typography.sizes.xs,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.neutral[50];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Dar feedback detallado"
      >
        <MessageSquare size={14} />
        <span>Detalles</span>
      </button>
    </div>
  );
}
