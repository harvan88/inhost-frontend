import { ChevronDown, User, Package, Zap, Phone, Mail, Tag } from 'lucide-react';
import { useWorkspaceStore, useActiveTab } from '@/store/workspace';
import { useConversation, useContact } from '@/store';

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

  if (!panelVisible) return null;

  // Si no hay tab activa, no mostrar paneles
  if (!activeTab) return null;

  return (
    <div
      className="bg-gray-50 border-l border-gray-200 overflow-y-auto"
      style={{ width: `${panelWidth}px` }}
    >
      {activeTab.type === 'conversation' && (
        <ConversationToolPanels conversationId={activeTab.entityId} />
      )}
      {activeTab.type === 'analytics' && (
        <div className="p-4 text-sm text-gray-500">Analytics tools - Coming Soon</div>
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

  return (
    <div>
      {contact && <CustomerInfoPanel contact={contact} />}
      <RecentOrdersPanel />
      <QuickActionsPanel />
    </div>
  );
}

/**
 * CustomerInfoPanel - Información del cliente/contacto
 */
function CustomerInfoPanel({ contact }: { contact: NonNullable<ReturnType<typeof useContact>> }) {
  const { collapsedTools, toggleTool } = useWorkspaceStore();
  const isCollapsed = collapsedTools.has('customer-info');

  return (
    <ToolPanel
      id="customer-info"
      title="Información del Cliente"
      icon={<User size={16} />}
      isCollapsed={isCollapsed}
      onToggle={() => toggleTool('customer-info')}
    >
      <div className="space-y-3">
        {/* Avatar & Name */}
        <div className="flex items-center gap-3">
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <User size={24} className="text-gray-600" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{contact.name}</h3>
            <span
              className={`inline-block w-2 h-2 rounded-full mr-1 ${
                contact.status === 'online'
                  ? 'bg-green-500'
                  : contact.status === 'away'
                  ? 'bg-yellow-500'
                  : 'bg-gray-400'
              }`}
            />
            <span className="text-xs text-gray-500 capitalize">{contact.status}</span>
          </div>
        </div>

        {/* Contact Details */}
        {contact.metadata?.phoneNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Phone size={14} className="text-gray-400" />
            <span className="text-gray-700">{contact.metadata.phoneNumber}</span>
          </div>
        )}

        {contact.metadata?.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail size={14} className="text-gray-400" />
            <span className="text-gray-700">{contact.metadata.email}</span>
          </div>
        )}

        {/* Channel Badge */}
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-gray-400" />
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 uppercase font-medium">
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
function RecentOrdersPanel() {
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
      icon={<Package size={16} />}
      isCollapsed={isCollapsed}
      onToggle={() => toggleTool('recent-orders')}
    >
      <div className="space-y-2">
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-900">{order.number}</span>
              <span className="text-sm font-medium text-gray-900">${order.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  order.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ToolPanel>
  );
}

/**
 * QuickActionsPanel - Acciones rápidas
 */
function QuickActionsPanel() {
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
      icon={<Zap size={16} />}
      isCollapsed={isCollapsed}
      onToggle={() => toggleTool('quick-actions')}
    >
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left flex items-center gap-3"
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
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
}

function ToolPanel({ title, icon, isCollapsed, onToggle, children }: ToolPanelProps) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm text-gray-900">{title}</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-500 transition-transform duration-200 ${
            isCollapsed ? '-rotate-90' : ''
          }`}
        />
      </button>
      {!isCollapsed && <div className="p-4 bg-gray-50">{children}</div>}
    </div>
  );
}
