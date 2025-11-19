import React from 'react';
import { ChevronDown, User, Package, Zap, Phone, Mail, Tag } from 'lucide-react';
import { useWorkspaceStore, useActiveTab } from '@/store/workspace';
import { useConversation, useContact } from '@/store';
import { useTheme } from '@/theme';
import { Text } from '@/components/ui';
import { Avatar, StatusIndicator, Badge } from '@/components/common';

/**
 * ToolPanels - Paneles de herramientas contextuales (derecha)
 *
 * Muestra información relevante según la tab activa:
 * - Conversation tab → Customer Info, Recent Orders, Quick Actions
 * - Order tab → Order Details, Customer Info
 * - Customer tab → Full customer profile
 */
export default function ToolPanels() {
  const { panelVisible, panelWidth } = useWorkspaceStore();
  const activeTab = useActiveTab();
  const { theme } = useTheme();

  if (!panelVisible) return null;

  // Si no hay tab activa, no mostrar paneles
  if (!activeTab) return null;

  return (
    <div
      className="overflow-y-auto"
      style={{
        width: `${panelWidth}px`,
        backgroundColor: theme.colors.neutral[50],
        borderLeft: `1px solid ${theme.colors.neutral[200]}`,
      }}
    >
      {activeTab.type === 'conversation' && (
        <ConversationToolPanels conversationId={activeTab.entityId} />
      )}
      {activeTab.type === 'analytics' && (
        <div
          style={{
            padding: theme.spacing[4],
          }}
        >
          <Text color="muted">
            Analytics tools - Coming Soon
          </Text>
        </div>
      )}
    </div>
  );
}

/**
 * ConversationToolPanels - Paneles para cuando hay una conversación activa
 */
function ConversationToolPanels({ conversationId }: { conversationId: string }) {
  const conversation = useConversation(conversationId);
  const contact = useContact(conversation?.endUserId ?? null);
  const { theme } = useTheme();

  return (
    <div>
      {contact && <CustomerInfoPanel contact={contact} theme={theme} />}
      <RecentOrdersPanel theme={theme} />
      <QuickActionsPanel theme={theme} />
    </div>
  );
}

/**
 * CustomerInfoPanel - Información del cliente/contacto
 */
function CustomerInfoPanel({ contact, theme }: { contact: NonNullable<ReturnType<typeof useContact>>, theme: any }) {
  const { collapsedTools, toggleTool } = useWorkspaceStore();
  const isCollapsed = collapsedTools.has('customer-info');

  return (
    <ToolPanel
      id="customer-info"
      title="Información del Cliente"
      icon={<User size={theme.iconSizes.base} />}
      isCollapsed={isCollapsed}
      onToggle={() => toggleTool('customer-info')}
      theme={theme}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
        {/* Avatar & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[3] }}>
          <Avatar
            src={contact.avatar}
            alt={contact.name}
            size="lg"
            fallbackText={contact.name}
          />
          <div>
            <Text style={{ fontWeight: 500 }}>{contact.name}</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[1] }}>
              <StatusIndicator
                status={contact.status as 'online' | 'offline' | 'away'}
                position="inline"
              />
              <Text variant="metadata" color="muted" style={{ textTransform: 'capitalize' }}>
                {contact.status}
              </Text>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        {contact.metadata?.phoneNumber && (
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
            <Phone size={theme.iconSizes.sm} style={{ color: theme.colors.neutral[400] }} />
            <Text>{contact.metadata.phoneNumber}</Text>
          </div>
        )}

        {contact.metadata?.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
            <Mail size={theme.iconSizes.sm} style={{ color: theme.colors.neutral[400] }} />
            <Text>{contact.metadata.email}</Text>
          </div>
        )}

        {/* Channel Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
          <Tag size={theme.iconSizes.sm} style={{ color: theme.colors.neutral[400] }} />
          <Badge variant="default" color="primary">
            {contact.channel.toUpperCase()}
          </Badge>
        </div>
      </div>
    </ToolPanel>
  );
}

/**
 * RecentOrdersPanel - Pedidos recientes (mock)
 */
function RecentOrdersPanel({ theme }: { theme: any }) {
  const { collapsedTools, toggleTool } = useWorkspaceStore();
  const isCollapsed = collapsedTools.has('recent-orders');

  // Mock orders data
  const mockOrders = [
    { id: '1', number: '#1234', total: 500, status: 'completed' },
    { id: '2', number: '#1235', total: 320, status: 'pending' },
    { id: '3', number: '#1236', total: 180, status: 'processing' },
  ];

  return (
    <ToolPanel
      id="recent-orders"
      title="Pedidos Recientes"
      icon={<Package size={theme.iconSizes.base} />}
      isCollapsed={isCollapsed}
      onToggle={() => toggleTool('recent-orders')}
      theme={theme}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
        {mockOrders.map((order) => {
          const [borderColor, setBorderColor] = React.useState(theme.colors.neutral[200]);
          return (
            <div
              key={order.id}
              style={{
                padding: theme.spacing[3],
                backgroundColor: theme.colors.neutral[0],
                borderRadius: theme.radius.lg,
                border: `1px solid ${borderColor}`,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={() => setBorderColor(theme.colors.primary[300])}
              onMouseLeave={() => setBorderColor(theme.colors.neutral[200])}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[1] }}>
                <Text style={{ fontWeight: 500 }}>{order.number}</Text>
                <Text style={{ fontWeight: 500 }}>
                  ${order.total}
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                <Badge
                  variant="compact"
                  color={
                    order.status === 'completed'
                      ? 'success'
                      : order.status === 'pending'
                      ? 'warning'
                      : 'primary'
                  }
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </ToolPanel>
  );
}

/**
 * QuickActionsPanel - Acciones rápidas
 */
function QuickActionsPanel({ theme }: { theme: any }) {
  const { collapsedTools, toggleTool } = useWorkspaceStore();
  const isCollapsed = collapsedTools.has('quick-actions');

  const actions = [
    { id: 'send-invoice', label: 'Enviar Factura', icon: '📄' },
    { id: 'schedule-followup', label: 'Programar Seguimiento', icon: '📅' },
    { id: 'add-note', label: 'Agregar Nota', icon: '📝' },
    { id: 'assign-team', label: 'Asignar a Equipo', icon: '👥' },
  ];

  return (
    <ToolPanel
      id="quick-actions"
      title="Acciones Rápidas"
      icon={<Zap size={theme.iconSizes.base} />}
      isCollapsed={isCollapsed}
      onToggle={() => toggleTool('quick-actions')}
      theme={theme}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
        {actions.map((action) => {
          const [borderColor, setBorderColor] = React.useState(theme.colors.neutral[200]);
          const [bgColor, setBgColor] = React.useState(theme.colors.neutral[0]);
          return (
            <button
              key={action.id}
              style={{
                width: '100%',
                padding: theme.spacing[3],
                backgroundColor: bgColor,
                borderRadius: theme.radius.lg,
                border: `1px solid ${borderColor}`,
                transition: 'border-color 0.2s, background-color 0.2s',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[3],
              }}
              onMouseEnter={() => {
                setBorderColor(theme.colors.primary[300]);
                setBgColor(theme.colors.primary[50]);
              }}
              onMouseLeave={() => {
                setBorderColor(theme.colors.neutral[200]);
                setBgColor(theme.colors.neutral[0]);
              }}
            >
              <span style={{ fontSize: theme.typography.sizes.xl }}>{action.icon}</span>
              <Text style={{ fontWeight: 500, color: theme.colors.neutral[700] }}>
                {action.label}
              </Text>
            </button>
          );
        })}
      </div>
    </ToolPanel>
  );
}

/**
 * ToolPanel - Panel colapsable genérico
 */
interface ToolPanelProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  theme: any;
}

function ToolPanel({ title, icon, isCollapsed, onToggle, children, theme }: ToolPanelProps) {
  const [bgHover, setBgHover] = React.useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${theme.colors.neutral[200]}` }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          paddingLeft: theme.spacing[4],
          paddingRight: theme.spacing[4],
          paddingTop: theme.spacing[3],
          paddingBottom: theme.spacing[3],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: bgHover ? theme.colors.neutral[50] : theme.colors.neutral[0],
          transition: 'background-color 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setBgHover(true)}
        onMouseLeave={() => setBgHover(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
          {icon}
          <Text style={{ fontWeight: 500 }}>
            {title}
          </Text>
        </div>
        <ChevronDown
          size={theme.iconSizes.md}
          style={{
            color: theme.colors.neutral[500],
            transition: 'transform 0.2s',
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {!isCollapsed && (
        <div
          style={{
            padding: theme.spacing[4],
            backgroundColor: theme.colors.neutral[50],
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
