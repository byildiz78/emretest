"use client";

import {

    ChevronsUpDown,
    LogOut,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";

export function NavUser({
    user,
}: {
    user: {
        name: string;
        email: string;
        avatar: string;
    };
}) {
    const { isMobile } = useSidebar();
    const router = useRouter()
    const pathname = usePathname();

    const Logout = async () => {
        // Önce storage'ları temizle
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Hemen yönlendir
        const tenantId = pathname?.split('/')[1];
        window.location.href = `/${tenantId}/login`;

        // Arka planda API'yi çağır
        try {
            await axios.get('/api/auth/logout', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    return (
        <SidebarMenu>
            <SidebarMenuItem className="!bg-sky-100/80 dark:!bg-indigo-500/20 hover:!bg-sky-200/90 dark:hover:!bg-indigo-500/30 !rounded-xl !transition-all !duration-200">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage
                                    src={user.avatar}
                                    alt={user.name}
                                />
                                <AvatarFallback className="rounded-lg">
                                    RB
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {user.name}
                                </span>
                                <span className="truncate text-xs">
                                    {user.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={user.avatar}
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        RB
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {user.name}
                                    </span>
                                    <span className="truncate text-xs">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={Logout}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
/*
    <DropdownMenuGroup>
        <DropdownMenuItem>
            <Sparkles />
            Upgrade to Pro
        </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
        <DropdownMenuItem>
            <BadgeCheck />
            Account
        </DropdownMenuItem>
        <DropdownMenuItem>
            <CreditCard />
            Billing
        </DropdownMenuItem>
        <DropdownMenuItem>
            <Bell />
            Notifications
        </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
*/
