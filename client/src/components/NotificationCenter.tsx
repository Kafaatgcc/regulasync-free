import { useState } from "react";
import { Bell, X, AlertTriangle, Clock, CheckCircle, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface Notification {
  id: string;
  type: 'deadline' | 'alert' | 'update' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  actionUrl?: string;
}

// Demo notifications for regulatory deadlines
const demoNotifications: Notification[] = [
  {
    id: '1',
    type: 'deadline',
    title: 'FCA Filing Due in 5 Days',
    message: 'Q4 Financial Compliance Report submission deadline is January 31, 2026. Ensure all documentation is prepared.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    read: false,
    priority: 'critical',
    actionUrl: '/compliance?demo=true'
  },
  {
    id: '2',
    type: 'alert',
    title: 'Policy Review Required',
    message: 'Anti-Money Laundering Policy requires update due to new FCA guidance.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    priority: 'high',
    actionUrl: '/policies?demo=true'
  },
  {
    id: '3',
    type: 'deadline',
    title: 'Annual Risk Assessment Due',
    message: 'Annual Risk Assessment submission deadline is January 31, 2026.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: false,
    priority: 'high',
    actionUrl: '/compliance?demo=true'
  },
  {
    id: '4',
    type: 'update',
    title: 'New Regulatory Update',
    message: 'ICO has issued new UK GDPR AI Accountability Framework guidance.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    priority: 'medium',
    actionUrl: '/regulatory-updates?demo=true'
  },
  {
    id: '5',
    type: 'success',
    title: 'Compliance Training Completed',
    message: '85% of employees have completed mandatory compliance training.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    read: true,
    priority: 'low'
  },
  {
    id: '6',
    type: 'deadline',
    title: 'Security Audit Scheduled',
    message: 'Security audit scheduled for March 1, 2026. Prepare documentation.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    read: true,
    priority: 'medium',
    actionUrl: '/compliance?demo=true'
  },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Fetch real notifications from DB when logged in
  const { data: dbNotifications, refetch: refetchNotifications } = trpc.notifications.list.useQuery(
    { limit: 20 },
    { enabled: isLoggedIn }
  );

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => refetchNotifications(),
  });
  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => refetchNotifications(),
  });

  // Map DB notifications to local Notification type; fallback to demo when not logged in
  const notifications: Notification[] = isLoggedIn && dbNotifications && dbNotifications.length > 0
    ? dbNotifications.map((n: any) => ({
        id: String(n.id),
        type: (n.type === 'reminder' ? 'deadline' : n.type === 'warning' ? 'alert' : n.type === 'info' ? 'update' : n.type) as Notification['type'],
        title: n.title,
        message: n.message,
        timestamp: new Date(n.createdAt),
        read: !!n.readAt,
        priority: (n.type === 'alert' || n.type === 'warning' ? 'high' : n.type === 'reminder' ? 'critical' : 'medium') as Notification['priority'],
        actionUrl: n.actionUrl,
      }))
    : demoNotifications;

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => !n.read && n.priority === 'critical').length;

  const markAsRead = (id: string) => {
    if (isLoggedIn && dbNotifications && dbNotifications.length > 0) {
      markReadMutation.mutate({ notificationId: parseInt(id) });
    }
  };

  const markAllAsRead = () => {
    if (isLoggedIn && dbNotifications && dbNotifications.length > 0) {
      markAllReadMutation.mutate();
    }
  };

  const dismissNotification = (id: string) => {
    markAsRead(id);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'update':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

    return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${criticalCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-[#b87333]'}`}>
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount} unread {criticalCount > 0 && `• ${criticalCount} critical`}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-muted/30' : ''}`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-[#b87333]" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t bg-muted/30">
          <Button variant="outline" size="sm" className="w-full" onClick={() => {
            window.location.href = '/regulatory-updates?demo=true';
          }}>
            View All Regulatory Updates
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
