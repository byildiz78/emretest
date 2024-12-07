"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  BarChart2, 
  Database, 
  Settings2, 
  Users2, 
  Workflow, 
  FileSearch,
  GitBranch,
  Boxes,
  Share2,
  Shield,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function FunctionsPage() {
  const functions = [
    {
      title: "Rapor Oluşturma",
      description: "Özelleştirilmiş raporlar oluşturun ve yönetin",
      icon: FileText,
      color: "bg-blue-500 dark:bg-blue-600",
      action: "Rapor Oluştur"
    },
    {
      title: "Veri Analizi",
      description: "Detaylı veri analizi ve görselleştirme araçları",
      icon: BarChart2,
      color: "bg-green-500 dark:bg-green-600",
      action: "Analiz Et"
    },
    {
      title: "Veritabanı Yönetimi",
      description: "Veritabanı yapılandırma ve optimizasyon",
      icon: Database,
      color: "bg-purple-500 dark:bg-purple-600",
      action: "Yönet"
    },
    {
      title: "Sistem Ayarları",
      description: "Temel sistem ayarları ve yapılandırma",
      icon: Settings2,
      color: "bg-yellow-500 dark:bg-yellow-600",
      action: "Ayarla"
    },
    {
      title: "Kullanıcı Yönetimi",
      description: "Kullanıcı rolleri ve izinleri yönetimi",
      icon: Users2,
      color: "bg-pink-500 dark:bg-pink-600",
      action: "Düzenle"
    },
    {
      title: "İş Akışları",
      description: "Özelleştirilmiş iş akışları oluşturma",
      icon: Workflow,
      color: "bg-red-500 dark:bg-red-600",
      action: "Oluştur"
    },
    {
      title: "Dosya Arama",
      description: "Gelişmiş dosya arama ve filtreleme",
      icon: FileSearch,
      color: "bg-indigo-500 dark:bg-indigo-600",
      action: "Ara"
    },
    {
      title: "Branch Yönetimi",
      description: "Git branch yapılandırması ve yönetimi",
      icon: GitBranch,
      color: "bg-cyan-500 dark:bg-cyan-600",
      action: "Yönet"
    },
    {
      title: "Modül Yönetimi",
      description: "Sistem modüllerini yapılandırma",
      icon: Boxes,
      color: "bg-orange-500 dark:bg-orange-600",
      action: "Yapılandır"
    },
    {
      title: "Entegrasyonlar",
      description: "Harici sistem entegrasyonları",
      icon: Share2,
      color: "bg-teal-500 dark:bg-teal-600",
      action: "Entegre Et"
    },
    {
      title: "Güvenlik",
      description: "Güvenlik ayarları ve denetimi",
      icon: Shield,
      color: "bg-rose-500 dark:bg-rose-600",
      action: "Kontrol Et"
    },
    {
      title: "Terminal",
      description: "Sistem komut satırı erişimi",
      icon: Terminal,
      color: "bg-slate-500 dark:bg-slate-600",
      action: "Başlat"
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
          <h1 className="text-3xl font-bold text-foreground">Fonksiyonlar</h1>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {functions.map((func, index) => {
            const Icon = func.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${func.color} transform group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{func.title}</h3>
                        <p className="text-sm text-muted-foreground">{func.description}</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300" 
                      variant="outline"
                    >
                      {func.action}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
