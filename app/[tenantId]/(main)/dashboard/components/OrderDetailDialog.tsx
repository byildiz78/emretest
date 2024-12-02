import React from 'react';

import { OrderHeader, OrderPayment, OrderTransaction } from '@/types/tables';

import {

    Dialog,

    DialogContent,

    DialogHeader,

    DialogTitle,

} from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Separator } from "@/components/ui/separator";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";

import { Clock, User, Users, Receipt, CreditCard, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

 

interface OrderDetailDialogProps {

    isOpen: boolean;

    onOpenChange: (open: boolean) => void;

    orderDetail: Array<{

        header: string;

        payments: string;

        transactions: string;

    }> | null;

    loading: boolean;

}

 

interface ParsedOrderHeader extends OrderHeader {

    OrderID: string;

    EmployeeName: string;

    GuestNumber: number;

    SubTotal: number;

    AmountDue: number;

}

 

interface ParsedTransaction extends Omit<OrderTransaction, 'ProductName' | 'UnitPrice' | 'ParentLineID'> {

    TransactionID: string;

    MenuItemText: string;

    MenuItemUnitPrice: number;

    ExtendedPrice: number;

    ParentLineID: string | null;

}

 

interface ParsedPayment extends Omit<OrderPayment, 'Amount'> {

    PaymentMethodName: string;

    AmountPaid: number;

    AmountChange: number;

}

 

const formatTransactions = (transactions: string): ParsedTransaction[][] => {

    try {

        const parsedTransactions = JSON.parse(transactions) as ParsedTransaction[];

        const result: ParsedTransaction[][] = [];

        const transactionMap = new Map<string, ParsedTransaction[]>();

 

        parsedTransactions.forEach((transaction) => {

            if (!transaction.ParentLineID) {

                transactionMap.set(transaction.TransactionID, []);

                result.push([transaction]);

            }

        });

 

        parsedTransactions.forEach((transaction) => {

            if (transaction.ParentLineID) {

                const parentGroup = transactionMap.get(transaction.ParentLineID);

                if (parentGroup) {

                    parentGroup.push(transaction);

                }

            }

        });

 

        return result;

    } catch (error) {

        console.error('Transaction parse error:', error);

        return [];

    }

};

 

const LoadingState = () => (

    <div className="flex flex-col items-center justify-center h-64 space-y-4">

        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />

        <p className="text-sm text-muted-foreground">Sipariş detayları yükleniyor...</p>

    </div>

);

 

const ErrorState = () => (

    <div className="flex flex-col items-center justify-center h-64 space-y-4">

        <AlertCircle className="h-8 w-8 text-destructive" />

        <p className="text-sm text-muted-foreground">Sipariş detayları alınamadı</p>

        <p className="text-xs text-muted-foreground">Lütfen daha sonra tekrar deneyin</p>

    </div>

);

 

export function OrderDetailDialog({ isOpen, onOpenChange, orderDetail, loading }: OrderDetailDialogProps) {

    if (!isOpen) return null;

 

    return (

        <Dialog open={isOpen} onOpenChange={onOpenChange}>

            <DialogContent className="sm:max-w-[600px] lg:max-w-[800px]">

                {loading || !orderDetail ? (

                    <LoadingState />

                ) : (() => {

                    try {

                        const orderData = orderDetail[0];

                        if (!orderData) {

                            return <ErrorState />;

                        }

 

                        const header = JSON.parse(orderData.header) as ParsedOrderHeader;

                        const payments = orderData.payments ? JSON.parse(orderData.payments) as ParsedPayment[] : [];

                        const formattedTransactions = formatTransactions(orderData.transactions);

 

                        return (

                            <div className="max-h-[85vh] flex flex-col">

                                <DialogHeader className="space-y-2 pb-8 relative">

                                    <div className="absolute -top-6 -left-6 -right-6 h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-xl" />

                                    <div className="relative">

                                        <div className="flex items-center justify-between">

                                            <div>

                                                <DialogTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent">

                                                    Sipariş #{header.OrderID}

                                                </DialogTitle>

                                                <div className="flex items-center gap-2 mt-2 text-sm">

                                                    <span className="font-medium text-muted-foreground/90">{header.OrderKey}</span>

                                                    <span className="text-muted-foreground/60">•</span>

                                                    <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">

                                                        {header.SatisTuru}

                                                    </Badge>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </DialogHeader>

 

                                <ScrollArea className="flex-1 pr-4 -mr-4">

                                    <div className="space-y-8">

                                        {/* Info Cards */}

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                            <Card className="group bg-gradient-to-br from-background to-muted/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border border-border/50">

                                                <CardContent className="p-5">

                                                    <div className="flex items-center gap-4">

                                                        <div className="p-3 rounded-xl bg-primary/10 ring-1 ring-primary/20 group-hover:ring-primary/30 group-hover:bg-primary/15 transition-all duration-300">

                                                            <Clock className="h-5 w-5 text-primary" />

                                                        </div>

                                                        <div>

                                                            <p className="text-xs font-medium text-muted-foreground/70 mb-1">Tarih</p>

                                                            <p className="text-sm font-semibold">{header.TarihText}</p>

                                                        </div>

                                                    </div>

                                                </CardContent>

                                            </Card>

                                            <Card className="group bg-gradient-to-br from-background to-muted/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border border-border/50">

                                                <CardContent className="p-5">

                                                    <div className="flex items-center gap-4">

                                                        <div className="p-3 rounded-xl bg-primary/10 ring-1 ring-primary/20 group-hover:ring-primary/30 group-hover:bg-primary/15 transition-all duration-300">

                                                            <User className="h-5 w-5 text-primary" />

                                                        </div>

                                                        <div>

                                                            <p className="text-xs font-medium text-muted-foreground/70 mb-1">Personel</p>

                                                            <p className="text-sm font-semibold">{header.EmployeeName}</p>

                                                        </div>

                                                    </div>

                                                </CardContent>

                                            </Card>

                                            <Card className="group bg-gradient-to-br from-background to-muted/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border border-border/50">

                                                <CardContent className="p-5">

                                                    <div className="flex items-center gap-4">

                                                        <div className="p-3 rounded-xl bg-primary/10 ring-1 ring-primary/20 group-hover:ring-primary/30 group-hover:bg-primary/15 transition-all duration-300">

                                                            <Users className="h-5 w-5 text-primary" />

                                                        </div>

                                                        <div>

                                                            <p className="text-xs font-medium text-muted-foreground/70 mb-1">Kişi Sayısı</p>

                                                            <p className="text-sm font-semibold">{header.GuestNumber} Kişi</p>

                                                       </div>

                                                    </div>

                                                </CardContent>

                                            </Card>

                                        </div>

 

                                        {/* Products */}

                                        <Card className="border border-border/50 shadow-md">

                                            <CardContent className="p-8 space-y-6">

                                                <div className="flex items-center gap-4 pb-2">

                                                    <div className="p-3 rounded-xl bg-primary/10 ring-1 ring-primary/20">

                                                        <Receipt className="h-5 w-5 text-primary" />

                                                    </div>

                                                    <h3 className="text-xl font-semibold">Ürünler</h3>

                                                </div>

                                                <div className="space-y-4">

                                                    {formattedTransactions.map((group, groupIndex) => (

                                                        <div key={groupIndex} className="space-y-3">

                                                            {group.map((transaction) => (

                                                                <div

                                                                    key={transaction.TransactionID}

                                                                    className={cn(

                                                                        "group flex items-start justify-between p-5 rounded-xl transition-all duration-300",

                                                                        transaction.ParentLineID

                                                                            ? "ml-8 bg-muted/30 hover:bg-muted/40 border border-border/30"

                                                                            : "bg-gradient-to-br from-background to-muted/20 hover:shadow-md hover:shadow-primary/5 border border-border/50",

                                                                        transaction.Status === 'İptal' && "opacity-60"

                                                                    )}

                                                                >

                                                                    <div className="space-y-2">

                                                                        <div className="flex items-center gap-3">

                                                                            <span className="font-medium text-foreground/90">

                                                                                {transaction.MenuItemText}

                                                                            </span>

                                                                            {transaction.Status === 'İptal' && (

                                                                                <Badge variant="destructive" className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">

                                                                                    İptal

                                                                                </Badge>

                                                                            )}

                                                                        </div>

                                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground/70">

                                                                            <Clock className="h-3.5 w-3.5" />

                                                                            {transaction.SaatText}

                                                                        </div>

                                                                    </div>

                                                                    <div className="text-right">

                                                                        <div className="font-semibold text-lg text-primary group-hover:scale-105 transition-transform">

                                                                            {new Intl.NumberFormat('tr-TR', {

                                                                                style: 'currency',

                                                                                currency: 'TRY'

                                                                            }).format(transaction.ExtendedPrice)}

                                                                        </div>

                                                                        <div className="text-xs text-muted-foreground/70 mt-1">

                                                                            {transaction.Quantity} x {new Intl.NumberFormat('tr-TR', {

                                                                                style: 'currency',

                                                                                currency: 'TRY'

                                                                            }).format(transaction.MenuItemUnitPrice)}

                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            ))}

                                                        </div>

                                                    ))}

                                                </div>

                                            </CardContent>

                                        </Card>

 

                                        {/* Payments */}

                                        {payments && payments.length > 0 && (

                                            <Card className="border border-border/50 shadow-md">

                                                <CardContent className="p-8 space-y-6">

                                                    <div className="flex items-center gap-4 pb-2">

                                                        <div className="p-3 rounded-xl bg-primary/10 ring-1 ring-primary/20">

                                                            <CreditCard className="h-5 w-5 text-primary" />

                                                        </div>

                                                        <h3 className="text-xl font-semibold">Ödemeler</h3>

                                                    </div>

                                                    <div className="space-y-4">

                                                        {payments.map((payment, index) => (

                                                            <div

                                                                key={index}

                                                                className="group flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 border border-border/50"

                                                            >

                                                                <div>

                                                                    <div className="font-medium text-foreground/90">{payment.PaymentMethodName}</div>

                                                                    <div className="text-xs text-muted-foreground/70 mt-2">

                                                                        {payment.SaatText}

                                                                    </div>

                                                                </div>

                                                                <div className="text-right">

                                                                    <div className="font-semibold text-lg text-primary group-hover:scale-105 transition-transform">

                                                                        {new Intl.NumberFormat('tr-TR', {

                                                                            style: 'currency',

                                                                            currency: 'TRY'

                                                                        }).format(payment.AmountPaid)}

                                                                    </div>

                                                                    {payment.AmountChange > 0 && (

                                                                        <div className="text-xs text-muted-foreground/70 mt-2">

                                                                            Para Üstü: {new Intl.NumberFormat('tr-TR', {

                                                                                style: 'currency',

                                                                                currency: 'TRY'

                                                                            }).format(payment.AmountChange)}

                                                                        </div>

                                                                    )}

                                                                </div>

                                                            </div>

                                                        ))}

                                                    </div>

                                                </CardContent>

                                            </Card>

                                        )}

 

                                        {/* Totals */}

                                        <Card className="border border-border/50 shadow-md">

                                            <CardContent className="p-8 space-y-5">

                                                <div className="flex justify-between text-sm">

                                                    <span className="font-medium text-muted-foreground/90">Ara Toplam</span>

                                                    <span className="font-semibold">

                                                        {new Intl.NumberFormat('tr-TR', {

                                                            style: 'currency',

                                                            currency: 'TRY'

                                                        }).format(header.SubTotal)}

                                                    </span>

                                                </div>

                                                <Separator className="bg-border/50" />

                                                <div className="flex justify-between items-center">

                                                    <span className="font-semibold text-lg">Toplam</span>

                                                    <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent">

                                                        {new Intl.NumberFormat('tr-TR', {

                                                            style: 'currency',

                                                            currency: 'TRY'

                                                        }).format(header.AmountDue)}

                                                    </span>

                                                </div>

                                            </CardContent>

                                        </Card>

                                    </div>

                                </ScrollArea>

                            </div>

                        );

                    } catch (error) {

                        console.error('Dialog render error:', error);

                        return <ErrorState />;

                    }

                })()}

            </DialogContent>

        </Dialog>

    );

}