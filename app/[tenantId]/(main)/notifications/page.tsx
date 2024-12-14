"use client";

import { motion } from "framer-motion";
import { Bell, MessageSquare, Calendar, Clock, Users, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTab } from "@/hooks/use-tab";
import { SettingsMenu } from "@/components/notifications/settings-menu";

export default function NotificationsPage() {

  const { handleTabOpen } = useTab();

  
  const notifications = [
    {
      title: "Sistem Bildirimleri",
      description: "Sistemle ilgili önemli güncellemeler ve bildirimler",
      icon: Bell,
      color: "bg-blue-500 dark:bg-blue-600",
      url: "notifications",
      count: 3
    },
    {
      title: "Mesajlar",
      description: "Diğer kullanıcılardan gelen mesajlar",
      icon: MessageSquare,
      color: "bg-green-500 dark:bg-green-600",
      url: "notifications",
      count: 5
    },
    {
      title: "Takvim Hatırlatmaları",
      description: "Yaklaşan toplantılar ve etkinlikler",
      icon: Calendar,
      color: "bg-purple-500 dark:bg-purple-600",
      url: "notifications",
      count: 2
    },
    {
      title: "Görev Takibi",
      description: "Yaklaşan ve geciken görevler",
      icon: Clock,
      color: "bg-yellow-500 dark:bg-yellow-600",
      url: "notifications",
      count: 4
    },
    {
      title: "Kullanıcı Aktiviteleri",
      description: "Diğer kullanıcıların sistem aktiviteleri",
      icon: Users,
      color: "bg-pink-500 dark:bg-pink-600",
      url: "notifications",
      count: 8
    },
    {
      title: "Uyarılar",
      description: "Önemli sistem uyarıları ve hatalar",
      icon: AlertTriangle,
      color: "bg-red-500 dark:bg-red-600",
      url: "notifications",
      count: 1
    },
    {
      title: "Tamamlanan İşlemler",
      description: "Başarıyla tamamlanan işlem bildirimleri",
      icon: CheckCircle,
      color: "bg-indigo-500 dark:bg-indigo-600",
      url: "notifications",
      count: 6
    },
    {
      title: "Duyurular",
      description: "Genel sistem duyuruları",
      icon: Info,
      color: "bg-cyan-500 dark:bg-cyan-600",
      url: "notifications/announce",
      count: 2
    }
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bildirimler</h2>
          <p className="text-muted-foreground">
            Tüm bildirimlerinizi buradan yönetebilirsiniz
          </p>
        </div>
        <SettingsMenu />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notifications.map((notification, index) => {
          const Icon = notification.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className={`p-3 rounded-lg ${notification.color} transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {notification.count > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notification.count}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                </div>
                <Button 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300" 
                  variant="outline"
                  onClick={() => handleTabOpen(notification.url, notification.title)}
                >
                  Görüntüle
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
