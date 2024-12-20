"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/components/team-switcher";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { RawReportData } from "@/types/tables";
import { SupersetDashboard } from "@/types/tables";
import SupersetDashboardComponent from "@/app/[tenantId]/(main)/superset/dashboard";
import axios from "axios";
import { getLucideIcon } from "@/lib/utils";
import { ReportPage } from "@/app/[tenantId]/(main)/reports/page";
import { usePathname } from "next/navigation";

interface NavItem {
    title: string;
    icon?: LucideIcons.LucideIcon;
    isActive?: boolean;
    expanded?: boolean;
    url?: string;
    component?: React.ComponentType<any>;
    items?: NavItem[];
    onClick?: () => void;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [supersetMenuItems, setSupersetMenuItems] = React.useState<SupersetDashboard[]>([]);
    const [webreportMenuItems, setWebreportMenuItems] = React.useState<RawReportData[]>([]);
    const pathname = usePathname();
    const tenantId = pathname?.split("/")[1] || "";
    const [userData, setUserData] = React.useState({ name: "", email: "" });

    const fetchSupersetMenuItems = React.useCallback(async () => {
        try {
            const response = await axios.get<SupersetDashboard[]>('/api/superset/superset_menu_items');
            setSupersetMenuItems(response.data);
        } catch (error) {
            console.error('Error fetching superset menu items:', error);
        }
    }, []);

    const fetchReportMenuItems = React.useCallback(async () => {
        try {
            const response = await axios.get<RawReportData[]>('/api/webreportlist');
            setWebreportMenuItems(response.data);
        } catch (error) {
            console.error('Error fetching superset menu items:', error);
        }
    }, []);

    const getSupersetNavItems = React.useCallback((items: SupersetDashboard[]): NavItem[] => {
        return items
            .filter(item => item.DashboardID)
            .map(item => ({
                title: item.Title,
                icon: getLucideIcon(item.Icon),
                component: () => (
                    <SupersetDashboardComponent dashboardId={item.DashboardID} standalone={item.Standalone} extraParams={item.ExtraParams} />
                )
            }));
    }, []);

    const getReportNavItems = React.useCallback((reportData: RawReportData[]): NavItem[] => {
        if (!reportData?.length) return [];

        return reportData.map(reportGroup => ({
            title: reportGroup.Group.GroupName || '',
            icon: getLucideIcon(reportGroup.Group.GroupIcon, LucideIcons.FileText),
            isActive: true,
            expanded: false,
            items: reportGroup.Reports.map(rawReport => ({
                title: rawReport.ReportName || '',
                icon: getLucideIcon(rawReport.ReportIcon, LucideIcons.FileText),
                isActive: true,
                expanded: false,
                component: () => (
                    <ReportPage report={rawReport} reportGroup={reportGroup.Group} />
                )
            }))
        }));

    }, []);

    React.useEffect(() => {
        const storedUserData = localStorage.getItem(`userData_${tenantId}`);
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        }
    }, [tenantId]);

    const baseData = React.useMemo(() => ({
        user: {
            name: userData.name,
            email: userData.email,
            avatar: "/images/avatar.png",
        },
        teams: [
            {
                name: "robotPOS Enterprise",
                logo: "/images/Data.png",
                plan: "Data Manager",
                className: "bg-blue-200",
            },
            {
                name: "robotPOS Operation Manager",
                logo: "/images/Audit.png",
                plan: "Operation Manager",
                className: "bg-blue-200",
            },
            {
                name: "robotPOS Franchise Manager",
                logo: "/images/Franchise.png",
                plan: "Franchise Manager",
                className: "bg-blue-200",
            },
        ],
        projects: [],
    }), [userData]);

    const navItems = React.useMemo(() => [
        {
            title: "Dashboard",
            icon: LucideIcons.LayoutDashboard,
            isActive: true,
            expanded: true,
            items: getSupersetNavItems(supersetMenuItems),
        },
        {
            title: "AI (Yapay Zeka)",
            icon: LucideIcons.Bot,
            isActive: true,
            expanded: true,
            items: [
                {
                    title: "Veritabanı ile konuşun",
                    url: "ai-chatbot",
                    icon: LucideIcons.Bot,
                },
                /*{
                    title: "Veri tabanı ile konuşun",
                    url: "ai-askdatabase",
                    icon: LucideIcons.Bot,
                },*/
                {
                    title: "Analizci",
                    url: "ai-analyser",
                    icon: LucideIcons.Command,
                }


            ],
        },
        {
            title: "Raporlar",
            icon: LucideIcons.ScrollText,
            isActive: true,
            expanded: false,
            items: getReportNavItems(webreportMenuItems)
        },
    ], [supersetMenuItems, webreportMenuItems, getSupersetNavItems, getReportNavItems]);



    React.useEffect(() => {
        fetchReportMenuItems();
        fetchSupersetMenuItems();
    }, [fetchReportMenuItems, fetchSupersetMenuItems]);

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={baseData.teams} />
            </SidebarHeader>
            <SidebarContent>
                <nav className="flex flex-col gap-4">
                    <NavMain items={navItems} />
                </nav>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={baseData.user} />
            </SidebarFooter>
        </Sidebar>
    );
}