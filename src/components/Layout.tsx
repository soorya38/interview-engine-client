import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, FileText, User, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/test-practice', label: 'Test/Practice', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary border-b-4 border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground uppercase">
              AI Interview Hub
            </h1>
          </Link>

          {isAuthenticated && (
            <>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-primary-foreground"
              >
                <Menu size={32} />
              </button>

              <nav className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 border-4 font-bold uppercase flex items-center gap-2 ${
                      isActive(item.path)
                        ? 'bg-accent text-accent-foreground border-accent'
                        : 'bg-primary-foreground text-primary border-primary-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border-4 border-destructive bg-destructive text-destructive-foreground font-bold uppercase flex items-center gap-2 hover:bg-destructive-foreground hover:text-destructive"
                >
                  <LogOut size={20} />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </nav>
            </>
          )}
        </div>

        {mobileMenuOpen && isAuthenticated && (
          <nav className="md:hidden border-t-4 border-border bg-primary">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 border-4 font-bold uppercase flex items-center gap-2 ${
                    isActive(item.path)
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-primary-foreground text-primary border-primary-foreground'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="px-4 py-3 border-4 border-destructive bg-destructive text-destructive-foreground font-bold uppercase flex items-center gap-2 text-left"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-primary border-t-4 border-border">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-primary-foreground font-bold">
            © 2025 AI Interview Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
