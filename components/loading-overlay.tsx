'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Cpu, Database, GitBranch, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoadingOverlayProps {
  currentStep?: number;
  message?: string;
}

const steps = [
  {
    title: 'Rapor Verileri Hazırlanıyor',
    icon: Database,
    description: 'Veri kaynakları senkronize ediliyor'
  },
  {
    title: 'Tablolar Düzenleniyor',
    icon: GitBranch,
    description: 'Veri yapıları optimize ediliyor'
  },
  {
    title: 'Hesaplamalar Yapılıyor',
    icon: Cpu,
    description: 'Analitik işlemler gerçekleştiriliyor'
  },
  {
    title: 'Sonuçlar İşleniyor',
    icon: Sparkles,
    description: 'Rapor sonuçları derleniyor'
  }
];

const floatingParticles = Array(6).fill(null);

export function LoadingOverlay({ currentStep = 0, message }: LoadingOverlayProps) {
  const getProgressValue = (step: number) => (step + 1) * 25;
  const progress = getProgressValue(currentStep);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-lg z-10 flex items-center justify-center p-4"
      >
        {/* Floating Particles */}
        {floatingParticles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{
              y: [null, Math.random() * -100],
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          >
            <Sparkles className="text-primary/30 w-4 h-4" />
          </motion.div>
        ))}

        <Card className="w-full max-w-2xl shadow-2xl border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />

          <CardHeader className="space-y-4 text-center pb-6 relative">
            {message && (
              <CardTitle className="text-lg font-medium text-foreground/80">
                {message}
              </CardTitle>
            )}
            <div className="relative">
              {/* Central Loading Animation */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Multiple rotating circles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 3 - i * 0.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="absolute inset-0"
                    >
                      <div className={cn(
                        "h-20 w-20 rounded-full border-2 border-primary/20",
                        "border-t-primary border-l-primary",
                        i === 1 && "h-16 w-16 m-2",
                        i === 2 && "h-12 w-12 m-4"
                      )} />
                    </motion.div>
                  ))}
                  
                  {/* Center icon */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Loader2 className="h-8 w-8 text-primary" />
                  </motion.div>
                </div>
              </div>

              <CardTitle className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary">
                Rapor Hazırlanıyor
              </CardTitle>
              <motion.p 
                className="text-sm text-muted-foreground mt-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Lütfen bekleyin, verileriniz işleniyor
              </motion.p>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            {/* Advanced Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 relative rounded-full overflow-hidden bg-secondary/20">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
                  initial={{ x: '-100%' }}
                  animate={{ x: `${progress - 100}%` }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ x: ['0%', '100%'] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">İşlem Durumu</span>
                <span className="text-primary font-medium">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Enhanced Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2",
                          "transition-all duration-300 relative",
                          index < currentStep && "border-primary bg-primary text-primary-foreground",
                          index === currentStep && "border-primary text-primary",
                          index > currentStep && "border-muted-foreground/20 text-muted-foreground"
                        )}
                        whileHover={{ scale: 1.05 }}
                      >
                        {index < currentStep ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-6 h-6" />
                        )}
                        
                        {index === currentStep && (
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-primary"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.div>

                      <div className="flex-1">
                        <div className="flex flex-col">
                          <span className={cn(
                            "font-medium transition-colors",
                            index <= currentStep ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {step.title}
                          </span>
                          {index === currentStep ? (
                            <motion.span
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-primary mt-0.5"
                            >
                              {step.description}
                            </motion.span>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 mt-0.5">
                              {step.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {index < steps.length - 1 && (
                      <div className="absolute left-6 top-12 h-8 w-[2px]">
                        <div className={cn(
                          "h-full w-full",
                          index < currentStep 
                            ? "bg-primary" 
                            : "bg-gradient-to-b from-border to-transparent"
                        )} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}