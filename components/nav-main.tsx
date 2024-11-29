"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useParams } from "next/navigation"
import { useTabStore } from "@/stores/tab-store"
import { useState, useMemo } from "react"

interface NavItem {
    title: string
    url?: string
    icon?: LucideIcon
    isActive?: boolean
    expanded?: boolean
    items?: NavItem[]
}

const ReportItemWithTooltip = ({ title, icon: Icon }: { title: string; icon?: LucideIcon }) => (
    <TooltipProvider>
        <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-2 w-full">
                    {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                        <span className="truncate">{title}</span>
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[300px] break-words">
                {title}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
)

const RecursiveMenuItem = ({
    item,
    level = 0,
    handleTabChange,
}: {
    item: NavItem;
    level?: number;
    handleTabChange: (id: string, title: string, url?: string) => void;
}) => {
    const params = useParams();
    const tenantId = params?.tenantId;
    const hasSubItems = item.items && item.items.length > 0;
    const isInitiallyOpen = typeof item.expanded !== 'undefined' ? item.expanded : item.isActive;

    if (!hasSubItems) {
        return (
            <SidebarMenuItem>
                <div
                    onClick={() => handleTabChange(item.title, item.title, `/${tenantId}/${item.url}`)}
                    className="w-full"
                >
                    <SidebarMenuButton className="w-full group hover:bg-accent hover:text-accent-foreground">
                        {level > 0 ? (
                            <ReportItemWithTooltip title={item.title} icon={item.icon} />
                        ) : (
                            <>
                                {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                                <span className="flex-1 truncate">{item.title}</span>
                            </>
                        )}
                    </SidebarMenuButton>
                </div>
            </SidebarMenuItem>
        );
    }

    return (
        <Collapsible asChild defaultOpen={isInitiallyOpen} className="group/collapsible w-full">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} className="w-full">
                        {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                        <span className="flex-1 truncate">{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent className="w-full">
                    <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title} className="w-full">
                                <RecursiveMenuItem
                                    item={subItem}
                                    level={level + 1}
                                    handleTabChange={handleTabChange}
                                />
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
};

export const NavMain = ({ items }: { items: NavItem[] }) => {
    const { addTab, setActiveTab, tabs } = useTabStore()
    const [searchQuery, setSearchQuery] = useState("");

    const handleTabChange = (id: string, title: string, url?: string) => {
        if (tabs.some(tab => tab.id === id)) {
            setActiveTab(id);
        } else {
            addTab({
                id,
                title,
                url,
                lazyComponent: () => import(`@/app/[tenantId]/(main)/${url}/page`)
            });
        }
    }

    const searchItems = (items: NavItem[], query: string): NavItem[] => {
        return items.map(item => {
            const matchesSearch = item.title.toLowerCase().includes(query.toLowerCase());
            const hasMatchingChildren = item.items && searchItems(item.items, query).length > 0;

            if (matchesSearch || hasMatchingChildren) {
                return {
                    ...item,
                    items: item.items ? searchItems(item.items, query) : undefined,
                    expanded: query ? true : item.expanded
                };
            }
            return null;
        }).filter(Boolean) as NavItem[];
    };

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items;
        return searchItems(items, searchQuery);
    }, [items, searchQuery]);

    return (
        <SidebarGroup>
            <div className="px-2 mb-4">
                <input
                    type="text"
                    placeholder="Menüde ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md bg-muted/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-colors"
                />
            </div>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu className="w-full">
                {filteredItems.map((item) => (
                    <RecursiveMenuItem
                        key={item.title}
                        item={item}
                        handleTabChange={handleTabChange}
                    />
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
};

NavMain.displayName = 'NavMain';