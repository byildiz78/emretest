"use client";

import { motion } from "framer-motion";
import { Bell, MessageSquare, Calendar, Clock, Users, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotificationsPage() {
  const notifications = [
    {
      title: "Sistem Bildirimleri",
      description: "Sistemle ilgili önemli güncellemeler ve bildirimler",
      icon: Bell,
      color: "bg-blue-500 dark:bg-blue-600",
      count: 3
    },
    {
      title: "Mesajlar",
      description: "Diğer kullanıcılardan gelen mesajlar",
      icon: MessageSquare,
      color: "bg-green-500 dark:bg-green-600",
      count: 5
    },
    {
      title: "Takvim Hatırlatmaları",
      description: "Yaklaşan toplantılar ve etkinlikler",
      icon: Calendar,
      color: "bg-purple-500 dark:bg-purple-600",
      count: 2
    },
    {
      title: "Görev Takibi",
      description: "Yaklaşan ve geciken görevler",
      icon: Clock,
      color: "bg-yellow-500 dark:bg-yellow-600",
      count: 4
    },
    {
      title: "Kullanıcı Aktiviteleri",
      description: "Diğer kullanıcıların sistem aktiviteleri",
      icon: Users,
      color: "bg-pink-500 dark:bg-pink-600",
      count: 8
    },
    {
      title: "Uyarılar",
      description: "Önemli sistem uyarıları ve hatalar",
      icon: AlertTriangle,
      color: "bg-red-500 dark:bg-red-600",
      count: 1
    },
    {
      title: "Tamamlanan İşlemler",
      description: "Başarıyla tamamlanan işlem bildirimleri",
      icon: CheckCircle,
      color: "bg-indigo-500 dark:bg-indigo-600",
      count: 6
    },
    {
      title: "Duyurular",
      description: "Genel sistem duyuruları",
      icon: Info,
      color: "bg-cyan-500 dark:bg-cyan-600",
      count: 2
    }
  ];

  return (
    <div className="h-full w-full bg-gradient-to-br from-background via-purple-50/30 dark:via-purple-950/30 to-background">
      <div className="p-8 w-full space-y-8">
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Bildirimler</h1>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </motion.div>

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
                  >
                    Görüntüle
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
