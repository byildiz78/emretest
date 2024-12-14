'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoadingOverlayProps {
  currentStep?: number;
}

const steps = [
  'Rapor Verileri Hazırlanıyor',
  'Tablolar Düzenleniyor',
  'Hesaplamalar Yapılıyor',
  'Sonuçlar İşleniyor'
];

export function LoadingOverlay({ currentStep = 0 }: LoadingOverlayProps) {
  const getProgressValue = (step: number) => {
    switch (step) {
      case 0:
        return 25;
      case 1:
        return 50;
      case 2:
        return 75;
      case 3:
        return 99;
      default:
        return 0;
    }
  };

  const progress = getProgressValue(currentStep);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-xl shadow-2xl border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center pb-6 relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/2 to-transparent rounded-t-lg" />
            
            <div className="relative">
              {/* Animated Logo */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative"
                  >
                    <Loader2 className="h-16 w-16 text-primary" />
                  </motion.div>
                  {/* Decorative circles */}
                  <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-pulse" />
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-primary/30 blur-[2px]"
                  />
                  <motion.div
                    animate={{ scale: [1.1, 1, 1.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -left-1 -bottom-1 w-2 h-2 rounded-full bg-primary/20 blur-[1px]"
                  />
                </div>
              </div>

              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Rapor Hazırlanıyor
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Lütfen bekleyin, verileriniz işleniyor
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-2 relative rounded-full overflow-hidden bg-secondary/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">İşlem Durumu</span>
                <span className="text-primary font-medium">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                        index < currentStep && "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20",
                        index === currentStep && "border-primary text-primary animate-pulse",
                        index > currentStep && "border-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {index < currentStep ? (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-medium transition-colors",
                          index <= currentStep ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {step}
                        </span>
                        {index === currentStep && (
                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-xs text-primary mt-0.5"
                          >
                            İşleniyor...
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="absolute left-5 top-10 h-8 w-[2px] bg-gradient-to-b from-border to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}