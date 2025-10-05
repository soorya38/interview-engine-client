import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, FileText, User, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from 'react-oidc-context';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const auth = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      console.log('Auth state before logout:', { 
        isAuthenticated: auth.isAuthenticated, 
        user: auth.user,
        isLoading: auth.isLoading,
        localAuth: isAuthenticated
      });
      
      // Clear local auth store first
      logout();
      console.log('Local auth store cleared');
      
      // Set a flag to prevent auto-login after logout
      sessionStorage.setItem('logout_initiated', 'true');
      
      // Clear OIDC session completely
      if (auth.isAuthenticated) {
        console.log('Clearing OIDC session...');
        try {
          // Clear the OIDC session by removing user data
          await auth.removeUser();
          console.log('OIDC user data cleared');
        } catch (error) {
          console.log('Failed to clear OIDC user data:', error);
        }
      }
      
      // Force clear any remaining OIDC state
      try {
        // Clear OIDC user manager state
        if (auth.userManager) {
          await auth.userManager.clearStaleState();
          console.log('OIDC stale state cleared');
        }
      } catch (error) {
        console.log('Failed to clear OIDC stale state:', error);
      }
      
      console.log('Performing local logout redirect...');
      navigate('/login?logout=true');
      
    } catch (error) {
      console.error('Logout error:', error);
      console.log('Falling back to local logout due to error');
      navigate('/login?logout=true');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/summaries', label: 'Summaries', icon: BarChart3 },
    { path: '/test-practice', label: 'Test/Practice', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="luxury-glass-nav sticky top-0 z-50">
        <div className="responsive-container py-4 sm:py-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-2xl mr-2 sm:mr-4 flex items-center justify-center shadow-2xl luxury-glow">
              <BarChart3 className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-medium text-white">
              Interview Hub
            </h1>
          </Link>

          {isAuthenticated && (
            <>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden luxury-glass-button p-4 text-white hover:bg-white/20"
              >
                <Menu size={20} />
              </button>

              <nav className="hidden md:flex items-center gap-2 lg:gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`luxury-glass-button px-3 py-2 lg:px-6 lg:py-3 flex items-center gap-2 lg:gap-3 transition-all ${
                      isActive(item.path)
                        ? 'bg-violet-500/20 text-violet-100 border-violet-500/30 luxury-neon-violet'
                        : 'hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    <item.icon size={16} className="lg:w-[18px] lg:h-[18px]" />
                    <span className="hidden lg:inline text-xs lg:text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="luxury-glass-button px-3 py-2 lg:px-6 lg:py-3 bg-rose-500/20 text-rose-100 border-rose-500/30 flex items-center gap-2 lg:gap-3 hover:bg-rose-500/30 luxury-neon-rose"
                >
                  <LogOut size={16} className="lg:w-[18px] lg:h-[18px]" />
                  <span className="hidden lg:inline text-xs lg:text-sm font-medium">Logout</span>
                </button>
              </nav>
            </>
          )}
        </div>

        {mobileMenuOpen && isAuthenticated && (
          <nav className="md:hidden luxury-glass-nav border-t border-white/20">
            <div className="responsive-container py-4 sm:py-6 flex flex-col gap-3 sm:gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`luxury-glass-button px-6 py-4 flex items-center gap-4 ${
                    isActive(item.path)
                      ? 'bg-violet-500/20 text-violet-100 border-violet-500/30 luxury-neon-violet'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="luxury-glass-button px-6 py-4 bg-rose-500/20 text-rose-100 border-rose-500/30 flex items-center gap-4 text-left hover:bg-rose-500/30 luxury-neon-rose"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="luxury-glass-nav border-t border-white/20">
        <div className="responsive-container py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-xl luxury-glow flex items-center justify-center">
              <BarChart3 className="text-white w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <p className="text-center text-white/80 font-medium text-sm sm:text-base">
              © 2025 AI Interview Hub. All rights reserved.
            </p>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-rose-500 rounded-xl luxury-glow flex items-center justify-center">
              <BarChart3 className="text-white w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
