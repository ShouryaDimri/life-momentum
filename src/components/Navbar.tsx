import { motion } from 'framer-motion';
import { Target, Sun, Moon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

interface NavbarProps {
  activeView: 'today' | 'goals' | 'milestones';
  setActiveView: (view: 'today' | 'goals' | 'milestones') => void;
}

const Navbar = ({ activeView, setActiveView }: NavbarProps) => {
  const { signOut } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50 shadow-sm"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Momentum
            </span>
          </div>

          <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-1">
            {(['today', 'goals', 'milestones'] as const).map((view) => (
              <motion.button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize relative ${
                  activeView === view
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeView === view && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-primary rounded-lg"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{view}</span>
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl"
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </motion.div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="rounded-xl"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
