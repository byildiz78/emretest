import { Bot, Database, Sparkles } from 'lucide-react';

type AnalysisStage = 'preparing' | 'querying' | 'analyzing' | 'complete';

interface AnalysisStagesProps {
    currentStage: AnalysisStage;
}

export function AnalysisStages({ currentStage }: AnalysisStagesProps) {
    const stages = [
        {
            id: 'preparing',
            title: 'Hazırlanıyor',
            description: 'Analiz için veriler hazırlanıyor...',
            icon: Bot,
        },
        {
            id: 'querying',
            title: 'Veri Çekiliyor',
            description: 'Veritabanından veriler alınıyor...',
            icon: Database,
        },
        {
            id: 'analyzing',
            title: 'Analiz Ediliyor',
            description: 'Yapay zeka verileri analiz ediyor...',
            icon: Sparkles,
        },
    ];

    const getStageStatus = (stageId: string) => {
        const stageOrder = ['preparing', 'querying', 'analyzing', 'complete'];
        const currentIndex = stageOrder.indexOf(currentStage);
        const stageIndex = stageOrder.indexOf(stageId);

        if (currentIndex === -1) return 'waiting';
        if (stageIndex < currentIndex) return 'complete';
        if (stageIndex === currentIndex) return 'active';
        return 'waiting';
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 space-y-4">
            {stages.map((stage, index) => {
                const status = getStageStatus(stage.id);
                const Icon = stage.icon;

                return (
                    <div key={stage.id} className="relative">
                        {/* Connection Line */}
                        {index < stages.length - 1 && (
                            <div className={`absolute left-6 top-12 w-0.5 h-12 
                                ${status === 'complete' 
                                    ? 'bg-blue-500' 
                                    : 'bg-gray-200 dark:bg-gray-700'}`} 
                            />
                        )}

                        {/* Stage Content */}
                        <div className={`relative flex items-start gap-4 p-4 rounded-lg border transition-all
                            ${status === 'active' 
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-md' 
                                : status === 'complete'
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'}`}>
                            
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                                ${status === 'active' 
                                    ? 'bg-blue-500 text-white animate-pulse' 
                                    : status === 'complete'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                <Icon className="w-4 h-4" />
                            </div>

                            {/* Text Content */}
                            <div className="flex-grow">
                                <h3 className={`font-medium ${status === 'active' 
                                    ? 'text-blue-700 dark:text-blue-300' 
                                    : status === 'complete'
                                        ? 'text-green-700 dark:text-green-300'
                                        : 'text-gray-700 dark:text-gray-300'}`}>
                                    {stage.title}
                                </h3>
                                <p className={`text-sm mt-1 ${status === 'active'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : status === 'complete'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-500 dark:text-gray-400'}`}>
                                    {stage.description}
                                </p>
                            </div>

                            {/* Status Indicator */}
                            {status === 'complete' && (
                                <div className="absolute -right-1 -top-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
