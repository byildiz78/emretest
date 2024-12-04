"use client";

import * as React from "react";
import {
    AudioWaveform,
    Command,
    GalleryVerticalEnd,
    BarChart3,
    ShoppingCart,
    PieChart,
    Smartphone,
    Calendar,
    DollarSign,
    XCircle,
    Bot,
    LayoutDashboard,
    FileText,
    ClipboardList,
    LucideIcon
} from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/components/team-switcher";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { useReport } from "@/hooks/use-reportlist";
import { WebReportGroup } from "@/types/tables";
import * as AllIcons from "lucide-react";

interface NavItem {
    title: string;
    icon: LucideIcon;
    isActive?: boolean;
    expanded?: boolean;
    securityLevel?: string;
    displayOrder?: number;
    url?: string;
    items?: NavItem[];
    onClick?: () => void;
}

interface RawReportData {
    GroupAutoID: number;
    GroupName: string;
    GroupSecurityLevel: string | number;
    GroupDisplayOrderID: number;
    GroupIcon: string;
    ReportAutoID: number;
    ReportID: string | number;
    ReportName: string;
    ReportSecurityLevel: string | number;
    ReportDisplayOrderID: number;
}

const getDynamicIcon = (iconName: string): LucideIcon => {
    // @ts-expect-error - Dynamic icon import from lucide-react
    return AllIcons[iconName];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: reportData, isLoading, execute } = useReport<RawReportData[]>();

    const baseData = React.useMemo(() => ({
        user: {
            name: "shadcn",
            email: "m@example.com",
            avatar: "/avatars/shadcn.jpg",
        },
        teams: [
            {
                name: "robotPOS Enterprise",
                logo: GalleryVerticalEnd,
                plan: "data manager",
                className: "bg-blue-200",
            },
            {
                name: "robotPOS Operation",
                logo: AudioWaveform,
                plan: "operation manager",
                className: "bg-blue-200",
            },
        ],
        projects: [],
    }), []);

    const staticNavItems: NavItem[] = React.useMemo(() => [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            isActive: true,
            expanded: true,
            items: [
                {
                    title: "Ürün Satış Analizleri",
                    url: "users",
                    icon: BarChart3,
                },
                {
                    title: "Ürün Bazlı Satış Dashboard",
                    url: "userList",
                    icon: ShoppingCart,
                },
                {
                    title: "Cirolar Özet",
                    url: "userList",
                    icon: PieChart,
                },
                {
                    title: "Mobil",
                    url: "userList",
                    icon: Smartphone,
                },
                {
                    title: "Günlük-Haftalık-Aylık Satış Analizi",
                    url: "userList",
                    icon: Calendar,
                },
                {
                    title: "Kazanç Raporları",
                    url: "userList",
                    icon: DollarSign,
                },
                {
                    title: "İptal İşlemleri",
                    url: "userList",
                    icon: XCircle,
                },
            ],
        },
        {
            title: "AI",
            icon: Bot,
            isActive: true,
            expanded: true,
            items: [
                {
                    title: "Chatbot",
                    url: "userList",
                    icon: Command,
                },
            ],
        },
    ], []);

    React.useEffect(() => {
        execute();
    }, [execute]);

    const processReports = React.useCallback((rawData: RawReportData[]): WebReportGroup[] => {
        if (!Array.isArray(rawData) || !rawData.length) return [];

        const groupedData = rawData.reduce<{ [key: number]: WebReportGroup }>((acc, item) => {
            if (!acc[item.GroupAutoID]) {
                const IconComponent = getDynamicIcon(item.GroupIcon);
                acc[item.GroupAutoID] = {
                    GroupAutoID: item.GroupAutoID,
                    GroupName: item.GroupName,
                    GroupSecurityLevel: String(item.GroupSecurityLevel),
                    GroupDisplayOrderID: item.GroupDisplayOrderID,
                    GroupIcon: IconComponent,
                    reports: []
                };
            }

            acc[item.GroupAutoID].reports.push({
                ReportAutoID: item.ReportAutoID,
                ReportID: String(item.ReportID),
                ReportName: item.ReportName,
                ReportSecurityLevel: String(item.ReportSecurityLevel),
                ReportDisplayOrderID: item.ReportDisplayOrderID
            });

            return acc;
        }, {});

        return Object.values(groupedData)
            .filter(group => group.reports.length > 0)
            .map(group => ({
                ...group,
                reports: [...group.reports].sort((a, b) => a.ReportDisplayOrderID - b.ReportDisplayOrderID)
            }))
            .sort((a, b) => a.GroupDisplayOrderID - b.GroupDisplayOrderID);
    }, []);

    const getReportNavItems = React.useCallback((rawData: RawReportData[]): NavItem[] => {
        if (!rawData?.length) return [];
    
        const groups = processReports(rawData);
        
        return [{
            title: "Raporlar",
            icon: ClipboardList,
            isActive: true,
            expanded: false,
            items: groups.map(group => ({
                title: group.GroupName,
                icon: group.GroupIcon,
                isActive: true,
                expanded: false,
                securityLevel: group.GroupSecurityLevel,
                displayOrder: group.GroupDisplayOrderID,
                items: group.reports.map(report => ({
                    title: report.ReportName,
                    icon: FileText,
                    url: `reports/${report.ReportID}`,
                    securityLevel: report.ReportSecurityLevel,
                    displayOrder: report.ReportDisplayOrderID
                }))
            }))
        }];
    }, [processReports]);

    const navMain = React.useMemo(() => {
        if (!reportData) return staticNavItems;
        
        const reportNavItems = getReportNavItems(reportData);
        return [...staticNavItems, ...reportNavItems];
    }, [reportData, staticNavItems, getReportNavItems]);

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="border-b">
                <TeamSwitcher teams={baseData.teams} />
            </SidebarHeader>
            <SidebarContent className="space-y-8">
                {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                        <div className="text-sm text-muted-foreground">Yükleniyor...</div>
                    </div>
                ) : (
                    <>
                        <NavMain 
                            items={navMain} 
                        />
                        {baseData.projects.length > 0 && (
                            <NavProjects projects={baseData.projects} />
                        )}
                    </>
                )}
            </SidebarContent>
            <SidebarFooter className="border-t">
                <NavUser user={baseData.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}