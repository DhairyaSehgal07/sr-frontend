import { useRouterState } from '@tanstack/react-router';
import { Loader2, LogOut, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLogout } from '@/features/auth/api/use-logout';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { cn } from '@/lib/utils';

const routeTitles: Record<string, string> = {
  '/daybook': 'Daybook',
  '/people': 'People',
  '/analytics': 'Analytics',
  '/incoming/edit-history': 'Incoming edit history',
  '/storage/edit-history': 'Storage edit history',
  '/grading/edit-history': 'Grading edit history',
  '/booking/edit-history': 'Booking edit history',
  '/additional': 'Additional',
  '/additional/temperature': 'Temperature',
  '/incoming/report': 'Incoming report',
  '/grading/report': 'Grading report',
  '/storage/report': 'Storage report',
  '/transfer/report': 'Transfer stock report',
  '/dispatch/report': 'Dispatch report',
  '/dispatch/': 'Dispatch',
  '/dispatch-post-storage/report': 'Booking report',
  '/booking': 'Booking',
  '/outgoing': 'Outgoing',
  '/transfer': 'Transfer stock',
};

function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function useResolvedThemeMode() {
  const { theme, resolvedTheme } = useTheme();

  if (theme === 'light' || theme === 'dark') {
    return theme;
  }

  return resolvedTheme === 'dark' ? 'dark' : 'light';
}

function ThemeToggle() {
  const { setTheme } = useTheme();
  const isClient = useIsClient();
  const resolvedMode = useResolvedThemeMode();

  if (!isClient) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Theme">
        <Sun className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  const isDark = resolvedMode === 'dark';

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Change theme"
            >
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={resolvedMode} onValueChange={(value) => setTheme(value)}>
          <DropdownMenuRadioItem value="light">
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppTopbar() {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pageTitle =
    routeTitles[pathname] ??
    (/^\/dispatch\/[a-f0-9]{24}$/i.test(pathname)
      ? 'Edit dispatch gate pass'
      : (user?.coldStorageId.name ?? 'Dashboard'));

  return (
    <header className={cn('flex h-14 shrink-0 items-center border-b bg-background px-4')}>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <SidebarTrigger className="-ml-1" />
        <div
          role="separator"
          aria-orientation="vertical"
          className="mx-2 h-6 w-px shrink-0 rounded-full bg-muted-foreground/25"
        />
        <h1 className="truncate text-lg font-semibold tracking-tight" title={pageTitle}>
          {pageTitle}
        </h1>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-2 rounded-md px-2 hover:bg-accent hover:text-accent-foreground"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-24 truncate text-sm font-medium lg:inline">
                {user?.name ?? 'User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user?.name ?? 'User'}</p>
                <p className="text-xs text-muted-foreground tabular-nums">{user?.mobileNumber}</p>
                <p
                  className="truncate text-xs text-muted-foreground"
                  title={user?.coldStorageId.name}
                >
                  {user?.coldStorageId.name}
                </p>
                <Badge variant="secondary" className="w-fit mt-1">
                  {user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isLoggingOut}
              onClick={() => logout()}
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {isLoggingOut ? 'Signing out…' : 'Log out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
