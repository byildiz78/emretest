import { ReactElement } from 'react'

export interface MenuItem {
    id: string;
    title: string;
    icon: ReactElement;
    bgColor: string;
    textColor: string;
}

export interface Balance {
    is_available: boolean;
    balance_infos: Array<{
        currency: string;
        total_balance: string;
        granted_balance: string;
        topped_up_balance: string;
    }>;
}
