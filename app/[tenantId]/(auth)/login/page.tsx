"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
} from "@/components/ui/card";
import { useRouter, usePathname } from "next/navigation";
import {
    LockKeyhole,
    User,
    Loader2,
    ShieldCheck,
    BarChart3,
    Globe2,
    Sun,
    Moon,
    Database,
    AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme-provider"
import { Efr_Branches } from "@/types/tables";
import { useFilterStore } from "@/stores/filters-store";

export default function LoginPage() {
    const router = useRouter();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [tenantName, setTenantName] = useState<string>("");
    const [showPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState<string>("");
    const [shake, setShake] = useState(false);

    const { setBranchs } = useFilterStore();

    const features = [
        {
            icon: BarChart3,
            title: "Gerçek Zamanlı Analitik",
            description: "Anlık veri analizi ve raporlama",
        },
        {
            icon: ShieldCheck,
            title: "Güvenli Altyapı",
            description: "End-to-end şifrelenmiş veri güvenliği",
        },
        {
            icon: Globe2,
            title: "Global Erişim",
            description: "Her yerden güvenli erişim imkanı",
        },
    ];

    const getUserBranches = () => {
        axios.get<Efr_Branches[]>("/api/efr_branches", {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((branches) => {
                setBranchs(branches.data);
            });
    };

    const setReduxStates = async () => {
        try {
            const promises = [getUserBranches()];
            await Promise.all(promises);
            router.push(`/${pathname?.split("/")[1]}`);
        } catch (error) {
            console.error("Bir hata oluştu:", error);
        }
    };

    useEffect(() => {
        const pathSegments = pathname?.split("/") || [];
        if (pathSegments.length > 1) {
            const tenant = pathSegments[1];
            const formattedName = tenant
                .split(/(?=[A-Z])|(?=[0-9])/)
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join(" ");
            setTenantName(formattedName);
            document.title = `${formattedName} - Web Rapor Sistemi`;
        }
    }, [pathname]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await axios.post("https://pm01.robotpos.com/api/auth/login", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 200) {
                setReduxStates();
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
            } else {
                setError("Bir hata oluştu. Lütfen tekrar deneyin.");
            }
            setShake(true);
            setTimeout(() => setShake(false), 650);
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted/30">
            {/* Noise Overlay */}
            <div className="fixed inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay" />

            {/* Gradient Orbs */}
            <div className="fixed -left-20 -top-20 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow" />
            <div className="fixed -bottom-20 -right-20 h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[120px] animate-pulse-slow" />
            <div className="fixed left-1/3 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px] animate-pulse" />

            {/* Theme Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed right-4 top-4 h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-transform duration-500 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform duration-500 dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Logo */}
            <div className="absolute left-4 top-4 lg:left-8 lg:top-8">
                <div className="relative h-12 w-48 transition-all duration-300 hover:scale-105">
                    <Image
                        src="/images/robotpos-logo.png"
                        alt="RobotPOS Logo"
                        fill
                        priority
                        className="object-contain dark:brightness-110 dark:contrast-125"
                    />
                </div>
            </div>

            <div className="container relative mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8 md:px-8 lg:py-12">
                <div className="flex w-full flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 max-w-6xl">
                    {/* Left Side - Content */}
                    <div className="w-full lg:w-1/2 space-y-6 order-2 lg:order-1 mt-8 lg:mt-0">
                        {/* Headings */}
                        <div className="text-center lg:text-left space-y-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                                {tenantName}
                            </h1>
                            <div className="flex items-center justify-center lg:justify-start gap-3 text-2xl sm:text-3xl text-muted-foreground/90 font-semibold">
                                <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm ring-1 ring-primary/20">
                                    <Database className="h-7 w-7 text-primary" />
                                </div>
                                <h2 className="bg-gradient-to-r from-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                                    Data Manager
                                </h2>
                            </div>
                        </div>

                        {/* Features Section - Hidden on mobile */}
                        <div className="hidden lg:block w-full mt-8 lg:mt-12">
                            <div className="grid grid-cols-3 gap-4">
                                {features.map((feature, index) => (
                                    <Card
                                        key={index}
                                        className="group border border-border/5 bg-background/60 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-border/10"
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex flex-col items-center text-center space-y-3">
                                                <div className="rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-110">
                                                    <feature.icon className="h-6 w-6 text-primary transition-colors duration-300" />
                                                </div>
                                                <h3 className="font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full lg:w-1/2 max-w-md order-1 lg:order-2">
                        <Card className={cn(
                            "border border-border/5 bg-background/60 shadow-lg backdrop-blur-sm transition-all duration-500",
                            shake && "animate-shake"
                        )}>
                            <CardHeader className="space-y-1 text-center pb-4">
                                <h2 className="text-2xl font-semibold tracking-tight transition-all duration-300 hover:scale-105">
                                    Hoş Geldiniz
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Devam etmek için giriş yapın
                                </p>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-5 px-4 sm:px-6">
                                    {error && (
                                        <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-1">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                    {/* Username Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-sm font-medium block">
                                            Kullanıcı Adı
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors duration-300" />
                                            <Input
                                                id="username"
                                                name="username"
                                                type="text"
                                                inputMode="text"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                autoComplete="username"
                                                enterKeyHint="next"
                                                placeholder="Kullanıcı adınızı girin"
                                                value={formData.username}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        username: e.target.value,
                                                    })
                                                }
                                                className="pl-10 h-12 text-base transition-all duration-300 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium block">
                                            Şifre
                                        </Label>
                                        <div className="relative">
                                            <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-colors duration-300" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                inputMode="text"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                autoComplete="current-password"
                                                enterKeyHint="done"
                                                placeholder="Şifrenizi girin"
                                                value={formData.password}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        password: e.target.value,
                                                    })
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSubmit(e as any);
                                                    }
                                                }}
                                                className="pl-10 pr-12 h-12 text-base transition-all duration-300 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Forgot Password */}
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="h-auto p-0 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
                                        >
                                            Şifremi Unuttum
                                        </Button>
                                    </div>
                                </CardContent>

                                <CardFooter className="px-4 sm:px-6 pb-6">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base transition-all duration-300 hover:scale-[1.02]"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Giriş yapılıyor...
                                            </>
                                        ) : (
                                            "Giriş Yap"
                                        )}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                </div>

                {/* Badges - Hidden on mobile */}
                <div className="hidden lg:flex flex-wrap gap-3 justify-center mt-8">
                    <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium transition-all duration-300 hover:bg-secondary/70 hover:scale-105 cursor-pointer backdrop-blur-sm">
                        ISO 27001
                    </Badge>
                    <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium transition-all duration-300 hover:bg-secondary/70 hover:scale-105 cursor-pointer backdrop-blur-sm">
                        KVKK Uyumlu
                    </Badge>
                    <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium transition-all duration-300 hover:bg-secondary/70 hover:scale-105 cursor-pointer backdrop-blur-sm">
                        %99.9 Uptime
                    </Badge>
                </div>
            </div>
        </div>
    );
}
