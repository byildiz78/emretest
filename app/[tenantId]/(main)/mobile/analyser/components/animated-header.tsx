import { Bot, Calendar, Building2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AnimatedHeaderProps {
    step: 'welcome' | 'filter' | 'analysis' | 'result';
    selectedFilter: {
        date: { from: Date; to: Date };
        selectedBranches: any[];
        branches: any[];
    };
}

export function AnimatedHeader({ step, selectedFilter }: AnimatedHeaderProps) {
    const router = useRouter();

    const getHeaderContent = () => {
        switch (step) {
            case 'welcome':
                return {
                    icon: <Bot className="w-6 h-6" />,
                    title: 'Yapay Zeka Analizi',
                    subtitle: 'İşletmenizi yapay zeka ile analiz edin'
                };
            case 'filter':
                return {
                    icon: <Calendar className="w-6 h-6" />,
                    title: 'Filtre Seçimi',
                    subtitle: 'Analiz için tarih ve şube seçin'
                };
            case 'analysis':
                return {
                    icon: <Bot className="w-6 h-6" />,
                    title: 'Analiz Türü',
                    subtitle: 'Yapmak istediğiniz analizi seçin'
                };
            case 'result':
                return {
                    icon: <Bot className="w-6 h-6" />,
                    title: 'Analiz Sonucu',
                    subtitle: 'Yapay zeka analiz sonuçları'
                };
        }
    };

    const content = getHeaderContent();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            {/* Background with gradient and pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-blue-400/5 to-blue-500/5" />
            <div className="absolute inset-0 bg-grid-black/[0.2] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

            {/* Main Content */}
            <div className="relative px-4 py-3 space-y-4">
                {/* Back Button and Title Row */}
                <div className="flex items-center justify-between">
                    <motion.button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </motion.button>
                    
                    <motion.div 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Yapay Zeka Aktif
                        </span>
                    </motion.div>
                </div>

                {/* Header Content */}
                <div className="flex items-start gap-4">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="p-3 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    >
                        {content.icon}
                    </motion.div>

                    <div className="flex-1">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl font-bold text-gray-900 dark:text-white"
                        >
                            {content.title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm text-gray-500 dark:text-gray-400"
                        >
                            {content.subtitle}
                        </motion.p>
                    </div>
                </div>

                {/* Filter Info */}
                {step !== 'welcome' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap items-center gap-2 pt-2"
                    >
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-gray-700">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {format(selectedFilter.date.from, 'dd MMM', { locale: tr })} - {format(selectedFilter.date.to, 'dd MMM', { locale: tr })}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-gray-700">
                            <Building2 className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {selectedFilter.selectedBranches.length > 0
                                    ? `${selectedFilter.selectedBranches.length} şube seçili`
                                    : `${selectedFilter.branches.length} şube seçili`}
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
