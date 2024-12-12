import { Calendar, Building2, ListFilter } from 'lucide-react'

export default function WelcomeScreen() {
    return (
        <div className="p-4 space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                    Yapay Zeka Analizine Hoş Geldiniz
                </h2>
                <p className="text-muted-foreground">
                    Analiz başlatmak için lütfen aşağıdaki adımları takip edin
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-card rounded-lg border hover:border-primary/50 transition-all">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-lg">1. Tarih Aralığı</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Üst menüden analiz yapmak istediğiniz tarih aralığını seçin
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-card rounded-lg border hover:border-primary/50 transition-all">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-lg">2. Şube Seçimi</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Üst menüden analiz yapmak istediğiniz şubeleri seçin
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-card rounded-lg border hover:border-primary/50 transition-all">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <ListFilter className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-lg">3. Analiz Türü</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Analiz türünü seçerek yapay zeka analizini başlatın
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
