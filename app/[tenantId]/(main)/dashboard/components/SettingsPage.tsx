"use client";

import { motion } from "framer-motion";
import { Home, Users, Store, FileText, Bell, Shield, Settings, Database, List } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const settings = [
    {
      title: "Kullanıcı Listesi",
      description: "Kullanıcı ekleme ve güncelleme işlemlerini yapabilirsiniz",
      icon: Users,
      color: "bg-blue-500 dark:bg-blue-600",
    },
    {
      title: "Şube Listesi",
      description: "Şube ekleme ve güncelleme işlemlerini yapabilirsiniz",
      icon: Store,
      color: "bg-green-500 dark:bg-green-600",
    },
    {
      title: "Rapor Listesi",
      description: "Rapor ekleme ve düzenleme işlemlerini yapabilirsiniz",
      icon: FileText,
      color: "bg-purple-500 dark:bg-purple-600",
    },
    {
      title: "Duyuru İşlemleri",
      description: "Sistem genelinde duyuru yayınlama yapabilirsiniz",
      icon: Bell,
      color: "bg-yellow-500 dark:bg-yellow-600",
    },
    {
      title: "Widget Listesi",
      description: "Widgetlara yeni ekleyebilir, mevcut olanları güncelleyebilirsiniz",
      icon: List,
      color: "bg-pink-500 dark:bg-pink-600",
    },
    {
      title: "Güvenlik Ayarları",
      description: "Şifre ve diğer kontrolleri tanımlayabilirsiniz",
      icon: Shield,
      color: "bg-red-500 dark:bg-red-600",
    },
    {
      title: "Rapor Kolon Özellikleri",
      description: "Raporların kolonlarını şekillendirebilirsiniz",
      icon: Database,
      color: "bg-indigo-500 dark:bg-indigo-600",
    },
    {
      title: "Denetim Formu Yetkileri",
      description: "Denetim formunu kimlerin yapabileceğini seçebilirsiniz",
      icon: Settings,
      color: "bg-cyan-500 dark:bg-cyan-600",
    },
    {
      title: "Proje Ayarları",
      description: "Proje Ayarlarını görebilirsiniz",
      icon: Settings,
      color: "bg-orange-500 dark:bg-orange-600",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 dark:via-purple-950/30 to-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                size="icon"
                className="bg-background hover:bg-accent"
              >
                <Home className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Ayarlar</h1>
          </div>
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
          {settings.map((setting, index) => {
            const Icon = setting.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${setting.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{setting.title}</h3>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    Giriş yap
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