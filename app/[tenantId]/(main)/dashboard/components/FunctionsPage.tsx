"use client";

import { motion } from "framer-motion";
import { Home, Mail, MessageSquare, Settings, Languages, TrendingUp, Key, Download, FileDown, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function FunctionsPage() {
  const functions = [
    {
      title: "Rapor Mail Listesi",
      description: "Sistem raporlarını mail olarak gitmesi için ayarlayabilirsiniz",
      icon: Mail,
      color: "bg-blue-500 dark:bg-blue-600",
    },
    {
      title: "Şubelere Mesaj Gönder",
      description: "Şube otomasyonunda görünmesi için mesaj gönderebilirsiniz",
      icon: MessageSquare,
      color: "bg-green-500 dark:bg-green-600",
    },
    {
      title: "Otomatik Bildirim",
      description: "Dashboard Olay görüntüleme ayarlarını yapabilirsiniz",
      icon: Settings,
      color: "bg-purple-500 dark:bg-purple-600",
    },
    {
      title: "Dil Editörü",
      description: "Proje içindeki terimler için farklı dil tanımlamaları yapabilirsiniz",
      icon: Languages,
      color: "bg-yellow-500 dark:bg-yellow-600",
    },
    {
      title: "Basit Maliyet Hes.",
      description: "Ürünlerle alakalı maliyet fiyatlarını buradan değiştirebilirsiniz",
      icon: TrendingUp,
      color: "bg-pink-500 dark:bg-pink-600",
    },
    {
      title: "Gün Sonu Şifresi Oluştur",
      description: "Gün sonu şifresini oluşturabilirsiniz",
      icon: Key,
      color: "bg-red-500 dark:bg-red-600",
    },
    {
      title: "Denetim Formları",
      description: "Şube denetimleri sonrası form doldurabilirsiniz",
      icon: FileDown,
      color: "bg-indigo-500 dark:bg-indigo-600",
    },
    {
      title: "Masraf Listesi",
      description: "Masraflarına dair kayıtlarını bu sayfadan girebilirsiniz",
      icon: Download,
      color: "bg-cyan-500 dark:bg-cyan-600",
    },
    {
      title: "Hedef Bütçe",
      description: "Yıl ve ay bazında hedef bütçelerinizi excel dosyasıyla yükleyebilirsiniz",
      icon: Target,
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
            <h1 className="text-3xl font-bold text-foreground">Fonksiyonlar</h1>
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
          {functions.map((func, index) => {
            const Icon = func.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${func.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{func.title}</h3>
                      <p className="text-sm text-muted-foreground">{func.description}</p>
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