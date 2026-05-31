"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { getUnreadNotifications, markAsRead } from "@/actions/notifications";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getUnreadNotifications().then(setNotifications);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIconColor = (type: string) => {
    switch(type) {
      case "ALERT": return "text-destructive";
      case "WARNING": return "text-yellow-500";
      default: return "text-primary";
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-muted/50 transition-colors relative"
      >
        <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-background border border-border shadow-2xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-semibold mb-3 flex items-center justify-between">
              Notificações
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {notifications.length} novas
              </span>
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma notificação nova.
                </p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-3 bg-muted/30 rounded-xl flex gap-3 items-start group">
                    <div className={`mt-0.5 ${getIconColor(n.type)}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleMarkAsRead(n.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                      title="Marcar como lida"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
