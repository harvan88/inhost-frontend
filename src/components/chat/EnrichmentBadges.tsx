/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "src/components/chat/EnrichmentBadges.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "ui"
 *   purpose: "Muestra badges de enrichments (sentimiento, keywords) para mensajes procesados por Extension Host"
 *
 * DEPENDENCIES:
 *   internal: ["@/store", "@/theme", "@/types"]
 *   external: ["react", "lucide-react"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: ["EnrichmentBadges"]
 *   inputs: ["messageId: string"]
 *   outputs: ["JSX.Element | null"]
 *   errors: []
 *
 * INTEGRATION:
 *   data_flow: "[Zustand store] → [getEnrichments] → [render badges]"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: ["components/chat/MessageList"]
 *   uses: ["store/index.ts", "theme"]
 *   critical: false
 *
 * === DOC_END :: EnrichmentBadges.tsx ===
 */

import { memo } from 'react';
import { useStore } from '@/store';
import { useTheme } from '@/theme';
import { Smile, Frown, Meh, Tag } from 'lucide-react';
import type { Enrichment, SentimentPayload, KeywordsPayload } from '@/types';

interface EnrichmentBadgesProps {
  messageId: string;
}

/**
 * EnrichmentBadges - Muestra badges de sentimiento y keywords
 * 
 * Solo muestra si hay enrichments para el mensaje.
 * Optimizado con memo para evitar re-renders innecesarios.
 */
const EnrichmentBadges = memo(function EnrichmentBadges({ messageId }: EnrichmentBadgesProps) {
  const enrichments = useStore((s) => s.entities.enrichments.get(messageId) || []);
  const { theme } = useTheme();

  if (enrichments.length === 0) {
    return null;
  }

  // Encontrar enrichments de sentimiento y keywords
  const sentimentEnrichment = enrichments.find((e) => e.type === 'sentiment');
  const keywordsEnrichment = enrichments.find((e) => e.type === 'keywords');

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing[2],
        marginTop: theme.spacing[2],
      }}
    >
      {/* Sentiment Badge */}
      {sentimentEnrichment && (
        <SentimentBadge 
          enrichment={sentimentEnrichment} 
          theme={theme} 
        />
      )}

      {/* Keywords Badge */}
      {keywordsEnrichment && (
        <KeywordsBadge 
          enrichment={keywordsEnrichment} 
          theme={theme} 
        />
      )}
    </div>
  );
});

/**
 * SentimentBadge - Muestra el sentimiento detectado
 */
function SentimentBadge({ enrichment, theme }: { enrichment: Enrichment; theme: any }) {
  const payload = enrichment.payload as SentimentPayload;
  const { label, score } = payload;

  // Determinar icono y color basado en label
  const getSentimentStyle = () => {
    switch (label) {
      case 'positive':
        return {
          icon: <Smile size={12} />,
          bgColor: theme.colors.semantic.successBg || '#dcfce7',
          textColor: theme.colors.semantic.success || '#16a34a',
          displayLabel: 'Positivo',
        };
      case 'negative':
        return {
          icon: <Frown size={12} />,
          bgColor: theme.colors.semantic.dangerBg || '#fee2e2',
          textColor: theme.colors.semantic.danger || '#dc2626',
          displayLabel: 'Negativo',
        };
      default:
        return {
          icon: <Meh size={12} />,
          bgColor: theme.colors.neutral[100],
          textColor: theme.colors.neutral[600],
          displayLabel: 'Neutral',
        };
    }
  };

  const style = getSentimentStyle();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing[1],
        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
        borderRadius: theme.radius.full,
        backgroundColor: style.bgColor,
        color: style.textColor,
        fontSize: theme.typography.sizes.xs,
        fontWeight: theme.typography.weights.medium,
      }}
      title={`Sentimiento: ${style.displayLabel} (score: ${score.toFixed(2)})`}
    >
      {style.icon}
      <span>{style.displayLabel}</span>
      <span style={{ opacity: 0.7 }}>
        {(Math.abs(score) * 100).toFixed(0)}%
      </span>
    </div>
  );
}

/**
 * KeywordsBadge - Muestra las keywords detectadas
 */
function KeywordsBadge({ enrichment, theme }: { enrichment: Enrichment; theme: any }) {
  const payload = enrichment.payload as KeywordsPayload;
  const { keywords } = payload;

  if (!keywords || keywords.length === 0) {
    return null;
  }

  // Mostrar solo las primeras 3 keywords
  const displayKeywords = keywords.slice(0, 3);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing[1],
        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primary[50] || '#eff6ff',
        color: theme.colors.primary[700] || '#1d4ed8',
        fontSize: theme.typography.sizes.xs,
        fontWeight: theme.typography.weights.medium,
      }}
      title={`Keywords: ${keywords.join(', ')}`}
    >
      <Tag size={12} />
      {displayKeywords.map((kw, i) => (
        <span key={kw}>
          {kw}
          {i < displayKeywords.length - 1 && ', '}
        </span>
      ))}
      {keywords.length > 3 && (
        <span style={{ opacity: 0.7 }}>+{keywords.length - 3}</span>
      )}
    </div>
  );
}

export default EnrichmentBadges;
