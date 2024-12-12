import { MenuItem } from '../types';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnalysisTypeGridProps {
    menuItems: MenuItem[];
    selectedMenu: string | null;
    onSelect: (id: string) => void;
    isLoading: boolean;
}

export function AnalysisTypeGrid({ menuItems, selectedMenu, onSelect, isLoading }: AnalysisTypeGridProps) {
    // Group items into pairs for the grid
    const itemPairs = menuItems.reduce<MenuItem[][]>((pairs, item, index) => {
        if (index % 2 === 0) {
            pairs.push([item]);
        } else {
            pairs[pairs.length - 1].push(item);
        }
        return pairs;
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            className="p-4 grid gap-4"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {itemPairs.map((pair, pairIndex) => (
                <div key={pairIndex} className="grid grid-cols-2 gap-4">
                    {pair.map((menuItem) => (
                        <motion.div
                            key={menuItem.id}
                            variants={item}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <button
                                onClick={() => onSelect(menuItem.id)}
                                disabled={isLoading}
                                className={`w-full h-full p-4 rounded-xl border transition-all duration-200 ease-in-out
                                    ${selectedMenu === menuItem.id
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 shadow-md'
                                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md'
                                    }
                                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    group relative overflow-hidden`}
                            >
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-10 dark:opacity-5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                                    <div className="absolute inset-0 bg-grid-black/[0.2] [mask-image:linear-gradient(to_bottom_right,white,transparent,white)]" />
                                </div>

                                {/* Content */}
                                <div className="relative flex flex-col items-center text-center space-y-3">
                                    {/* Icon Container */}
                                    <div className={`p-3 rounded-lg transition-colors
                                        ${selectedMenu === menuItem.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white'
                                        }`}>
                                        {menuItem.icon}
                                    </div>

                                    {/* Title */}
                                    <h3 className={`font-medium transition-colors
                                        ${selectedMenu === menuItem.id
                                            ? 'text-blue-700 dark:text-blue-300'
                                            : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {menuItem.title}
                                    </h3>

                                    {/* Selection Indicator */}
                                    {selectedMenu === menuItem.id && (
                                        <div className="absolute top-2 right-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        </motion.div>
                    ))}
                </div>
            ))}
        </motion.div>
    );
}
