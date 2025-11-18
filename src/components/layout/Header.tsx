import { useTheme } from '@/theme';

export default function Header() {
  const { theme } = useTheme();

  return (
    <header style={{
      backgroundColor: theme.colors.neutral[0],
      borderBottomColor: theme.colors.neutral[200],
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      boxShadow: theme.elevation.sm
    }} className="shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span style={{ color: theme.colors.neutral[0] }} className="font-bold text-xl">IH</span>
            </div>
            <div>
              <h1 style={{ color: theme.colors.neutral[900] }} className="text-2xl font-bold">INHOST</h1>
              <p style={{ color: theme.colors.neutral[500] }} className="text-sm">Multi-Channel Messaging Platform</p>
            </div>
          </div>

          <nav className="flex items-center space-x-6">
            <a href="#" style={{ color: theme.colors.neutral[600] }} className="hover:text-primary transition">
              Dashboard
            </a>
            <a href="#" style={{ color: theme.colors.neutral[600] }} className="hover:text-primary transition">
              Channels
            </a>
            <a href="#" style={{ color: theme.colors.neutral[600] }} className="hover:text-primary transition">
              Settings
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
