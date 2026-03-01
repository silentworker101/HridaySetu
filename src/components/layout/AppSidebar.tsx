import { Heart, LayoutDashboard, FileText, Upload, MessageCircle, Users, BarChart3, Settings, Search, Activity, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

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
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = currentUser?.role === 'doctor' ? doctorNav : currentUser?.role === 'admin' ? adminNav : patientNav;

  const handleLogout = () => {
    setRole('patient'); // reset
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-sidebar-primary fill-sidebar-primary" />
              {!collapsed && <span className="text-lg font-display font-bold text-sidebar-foreground">HridaySetu</span>}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {currentUser && !collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              {currentUser.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
              <p className="text-xs text-sidebar-foreground/50 capitalize">{currentUser.role}</p>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sidebar-foreground/50 hover:text-sidebar-foreground">
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Switch Role</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
