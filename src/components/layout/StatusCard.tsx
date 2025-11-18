import { useTheme } from '@/theme';

interface StatusCardProps {
  title: string;
  value: string;
  color: 'success' | 'warning' | 'danger' | 'info';
}

export default function StatusCard({ title, value, color }: StatusCardProps) {
  const { theme } = useTheme();

  // Map color prop to semantic theme colors
  const colorMap = {
    success: {
      bg: theme.colors.semantic.successLight,
      border: theme.colors.semantic.success,
      text: theme.colors.semantic.success,
    },
    warning: {
      bg: theme.colors.semantic.warningLight,
      border: theme.colors.semantic.warning,
      text: theme.colors.semantic.warning,
    },
    danger: {
      bg: theme.colors.semantic.dangerLight,
      border: theme.colors.semantic.danger,
      text: theme.colors.semantic.danger,
    },
    info: {
      bg: theme.colors.semantic.infoLight,
      border: theme.colors.semantic.info,
      text: theme.colors.semantic.info,
    },
  };

  const colors = colorMap[color];

  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: theme.radius.lg,
        border: `2px solid ${colors.border}`,
        backgroundColor: colors.bg,
      }}
    >
      <h3
        className="text-sm font-semibold uppercase tracking-wide opacity-75 mb-2"
        style={{
          color: colors.text,
        }}
      >
        {title}
      </h3>
      <p
        className="text-3xl font-bold"
        style={{
          color: colors.text,
        }}
      >
        {value}
      </p>
    </div>
  );
}
