import React from 'react';
import { ChevronDown, User, Package, Zap, Phone, Mail, Tag } from 'lucide-react';
import { useWorkspaceStore, useActiveTab } from '@/store/workspace';
import { useConversation, useContact } from '@/store';
import { useTheme } from '@/hooks/useTheme';

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
            fontSize: '0.875rem',
            color: theme.colors.neutral[500],
          }}
        >
          Analytics tools - Coming Soon
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
  const contact = useContact(conversation?.entityId ?? null);
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
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: theme.radius.full,
              }}
            />
          ) : (
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.neutral[300],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={theme.iconSizes.xl} style={{ color: theme.colors.neutral[600] }} />
            </div>
          )}
          <div>
            <h3 style={{ fontWeight: 500, color: theme.colors.neutral[900] }}>{contact.name}</h3>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: theme.radius.full,
                marginRight: '4px',
                backgroundColor:
                  contact.status === 'online'
                    ? '#10b981'
                    : contact.status === 'away'
                    ? '#eab308'
                    : theme.colors.neutral[400],
              }}
            />
            <span style={{ fontSize: '0.75rem', color: theme.colors.neutral[500], textTransform: 'capitalize' }}>
              {contact.status}
            </span>
          </div>
        </div>

        {/* Contact Details */}
        {contact.metadata?.phoneNumber && (
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], fontSize: '0.875rem' }}>
            <Phone size={theme.iconSizes.sm} style={{ color: theme.colors.neutral[400] }} />
            <span style={{ color: theme.colors.neutral[700] }}>{contact.metadata.phoneNumber}</span>
          </div>
        )}

        {contact.metadata?.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], fontSize: '0.875rem' }}>
            <Mail size={theme.iconSizes.sm} style={{ color: theme.colors.neutral[400] }} />
            <span style={{ color: theme.colors.neutral[700] }}>{contact.metadata.email}</span>
          </div>
        )}

        {/* Channel Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
          <Tag size={theme.iconSizes.sm} style={{ color: theme.colors.neutral[400] }} />
          <span
            style={{
              fontSize: '0.75rem',
              paddingLeft: theme.spacing[2],
              paddingRight: theme.spacing[2],
              paddingTop: '4px',
              paddingBottom: '4px',
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.primary[100],
              color: theme.colors.primary[700],
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            {contact.channel}
          </span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 500, color: theme.colors.neutral[900] }}>{order.number}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: theme.colors.neutral[900] }}>
                  ${order.total}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    paddingLeft: theme.spacing[2],
                    paddingRight: theme.spacing[2],
                    paddingTop: '2px',
                    paddingBottom: '2px',
                    borderRadius: theme.radius.full,
                    backgroundColor:
                      order.status === 'completed'
                        ? '#dcfce7'
                        : order.status === 'pending'
                        ? '#fef3c7'
                        : theme.colors.primary[100],
                    color:
                      order.status === 'completed'
                        ? '#166534'
                        : order.status === 'pending'
                        ? '#b45309'
                        : theme.colors.primary[700],
                  }}
                >
                  {order.status}
                </span>
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
              <span style={{ fontSize: '1.25rem' }}>{action.icon}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: theme.colors.neutral[700] }}>
                {action.label}
              </span>
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
          <span style={{ fontWeight: 500, fontSize: '0.875rem', color: theme.colors.neutral[900] }}>
            {title}
          </span>
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
