import { Heart, LayoutDashboard, FileText, Upload, MessageCircle, Users, BarChart3, Settings, Search, Activity, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const patientNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Upload Report', url: '/upload', icon: Upload },
  { title: 'My Reports', url: '/reports', icon: FileText },
  { title: 'AI Chat', url: '/chat', icon: MessageCircle },
  { title: 'Insights', url: '/insights', icon: BarChart3 },
];

const doctorNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Patients', url: '/patients', icon: Users },
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'AI Assistant', url: '/chat', icon: MessageCircle },
  { title: 'Search', url: '/search', icon: Search },
];

const adminNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Patients', url: '/patients', icon: Users },
  { title: 'Doctors', url: '/doctors', icon: Activity },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'System', url: '/system', icon: Settings },
];

export function AppSidebar() {
  const { currentUser, setRole } = useApp();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();

  const navItems = currentUser?.role === 'doctor' ? doctorNav : currentUser?.role === 'admin' ? adminNav : patientNav;

  const handleLogout = () => {
    setRole('patient');
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="px-2">
        {/* ── Logo ──────────────────────────── */}
        <div className="flex items-center gap-2.5 px-2 pt-4 pb-3">
          <div className="h-9 w-9 rounded-xl bg-sidebar-accent flex items-center justify-center ring-2 ring-sidebar-primary/30 shrink-0">
            <Heart className="h-5 w-5 text-sidebar-primary fill-sidebar-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-base leading-tight font-display font-bold text-sidebar-foreground block">HridaySetu</span>
              <p className="text-[11px] text-sidebar-foreground/50 leading-none mt-0.5">AI Healthcare Platform</p>
            </div>
          )}
        </div>

        {/* ── Navigation ────────────────────── */}
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold !border-l-2 !border-sidebar-primary"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3 pt-0">
        {currentUser && !collapsed && (
          <>
            <Separator className="mb-2 bg-sidebar-border/50" />
            <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-lg bg-sidebar-accent/50">
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                {currentUser.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate leading-none">{currentUser.name}</p>
                <div className="mt-1.5">
                  <Badge className="capitalize text-[10px] px-1.5 py-0 bg-sidebar-primary/15 text-sidebar-primary border border-sidebar-primary/25 hover:bg-sidebar-primary/15">
                    {currentUser.role}
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}
        <SidebarMenu className="gap-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-sm">Switch Role</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
