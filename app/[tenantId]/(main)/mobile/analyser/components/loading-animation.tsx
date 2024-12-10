export function LoadingAnimation() {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="flex space-x-4">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            </div>
            <p className="text-sm text-muted-foreground">
                Yapay zeka analiz yapıyor...
            </p>
        </div>
    );
}
