'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Pill,
  Calendar,
  History,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  HelpCircle,
  LogOut,
  User,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockUser } from '@/data/mockData';
import { HelpAssistant } from '@/components/HelpAssistant';
import { useMedication } from '@/contexts/MedicationContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/components/ui/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { logs } = useMedication();
  const pathname = usePathname();

  const pendingNotifications = logs.filter(
    (log) => log.status === 'pending' && new Date(log.scheduledTime) <= new Date()
  ).length;

  const navigation = [
    { href: '/', name: 'Dashboard', icon: LayoutDashboard },
    { href: '/medicamentos', name: 'Medicamentos', icon: Pill },
    { href: '/calendario', name: 'Calendário', icon: Calendar },
    { href: '/historico', name: 'Histórico', icon: History },
    { href: '/relatorios', name: 'Relatórios', icon: BarChart3 },
    { href: '/config', name: 'Configurações', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname !== '/') return false;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-dvh w-full bg-background overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {/* Help Assistant */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-4 bottom-4 z-50"
          >
            <HelpAssistant onClose={() => setShowHelp(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop (Glassmorphism) */}
      <aside className="hidden lg:flex w-72 flex-col h-full z-10 p-4">
        <div className="glass-panel h-full rounded-2xl flex flex-col overflow-hidden">
          <div className="flex h-20 items-center gap-3 px-6 border-b border-border/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary-foreground">
                MediCare
              </span>
              <p className="text-xs text-muted-foreground font-medium">Saúde Inteligente</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="grid gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                      active
                        ? "text-primary-foreground shadow-md shadow-primary/25"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className={cn("h-5 w-5 z-10 relative transition-transform group-hover:scale-110", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                    <span className="z-10 relative">{item.name}</span>
                    {active && <ChevronRight className="ml-auto h-4 w-4 z-10 relative opacity-50" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-border/10 bg-muted/20">
            <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-background/50 cursor-pointer group">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:border-primary/20 transition-colors">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${mockUser.name}&background=random`} />
                <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">{mockUser.name}</span>
                <span className="truncate text-xs text-muted-foreground">{mockUser.email}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full overflow-hidden relative z-10">
        {/* Header (Floating & Glass) */}
        <header className="flex h-20 items-center justify-between px-6 lg:px-8 pt-4 pb-2">
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="glass-panel p-2 rounded-xl text-foreground hover:text-primary transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary-foreground">
              MediCare
            </span>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-2xl font-bold text-foreground">
              {navigation.find(n => isActive(n.href))?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHelp(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-medium hover:bg-white/50 transition-colors text-muted-foreground hover:text-primary"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Ajuda</span>
            </motion.button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full glass-panel hover:bg-white/50 transition-colors"
                >
                  <Bell className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  {pendingNotifications > 0 && (
                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-destructive border-2 border-background animate-pulse" />
                  )}
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 glass-panel border-0">
                <div className="p-4 border-b border-border/10">
                  <h4 className="font-semibold">Notificações</h4>
                  <p className="text-xs text-muted-foreground">Você tem {pendingNotifications} doses pendentes</p>
                </div>
                {pendingNotifications > 0 ? (
                  <div className="p-2">
                    {logs
                      .filter(log => log.status === 'pending')
                      .slice(0, 3)
                      .map(log => (
                        <div key={log.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                          <div className="h-2 w-2 mt-2 rounded-full bg-destructive shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Hora da Medicação</p>
                            <p className="text-xs text-muted-foreground">Dose agendada para {new Date(log.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Nenhuma notificação nova
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 glass-panel z-50 lg:hidden flex flex-col p-4 border-r-0"
            >
              <div className="flex items-center justify-between mb-8 px-2">
                <span className="text-xl font-bold text-primary">MediCare</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <nav className="grid gap-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-8">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    // Add logout logic here
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
