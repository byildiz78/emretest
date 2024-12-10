import React from 'react';
import { OrderDetail, OrderHeader, OrderPayment, OrderTransaction } from '@/types/tables';
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
import { Clock, User, Users, Receipt, CreditCard, AlertCircle, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { PulseLoader } from "react-spinners";

// Interface definitions remain the same...

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
        <PulseLoader color="#6366f1" size={18} margin={4} speedMultiplier={0.8} />
        <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">Sipariş detayları yükleniyor...</p>
    </div>
);

const ErrorState = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Sipariş detayları alınamadı</p>
        <p className="text-xs text-slate-500 dark:text-slate-500">Lütfen daha sonra tekrar deneyin</p>
    </div>
);

export function OrderDetailDialog({ isOpen, onOpenChange, orderDetail, loading }: OrderDetailDialogProps) {
    const [parsedData, setParsedData] = React.useState<{
        header: ParsedOrderHeader | null;
        payments: ParsedPayment[];
        transactions: ParsedTransaction[][];
    }>({
        header: null,
        payments: [],
        transactions: []
    });

    const [isDataLoading, setIsDataLoading] = React.useState(true);
    const [parseError, setParseError] = React.useState(false);

    React.useEffect(() => {
        if (!orderDetail) {
            setIsDataLoading(false);
            return;
        }

        const parseData = async () => {
            setIsDataLoading(true);
            setParseError(false);
            
            try {
                // Önce string olarak geçerli JSON mu kontrol et
                const headerStr = orderDetail.header?.toString() || "{}";
                const paymentsStr = orderDetail.payments?.toString() || "[]";
                const transactionsStr = orderDetail.transactions?.toString() || "[]";

                // Parse işlemlerini yap
                const header = JSON.parse(headerStr);
                const payments = JSON.parse(paymentsStr);
                const transactions = formatTransactions(transactionsStr);

                // Veriyi kontrol et
                if (!header || typeof header !== 'object') {
                    throw new Error('Invalid header data');
                }

                setParsedData({
                    header: header as ParsedOrderHeader,
                    payments: Array.isArray(payments) ? payments : [],
                    transactions: Array.isArray(transactions) ? transactions : []
                });

                setParseError(false);
            } catch (error) {
                console.error('Error parsing order detail:', error);
                setParseError(true);
            } finally {
                setIsDataLoading(false);
            }
        };

        // Immediate invocation
        parseData();
    }, [orderDetail]);

    // Dialog açık değilse hiçbir şey render etme
    if (!isOpen) return null;

    // İçerik render fonksiyonu
    const renderContent = () => {
        if (loading || isDataLoading) {
            return <LoadingState />;
        }

        if (parseError || !parsedData.header) {
            return <LoadingState />;  // Hata durumunda da loading göster
        }

        return (
            <div className="max-h-[85vh] flex flex-col">
                <DialogHeader className="space-y-2 pb-8 relative">
                    <div className="absolute -top-6 -left-6 -right-6 h-32 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-xl" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                                    {`Sipariş #${parsedData.header?.OrderID || ''}`}
                                </DialogTitle>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <span className="font-medium text-slate-600 dark:text-slate-300">{parsedData.header?.OrderKey}</span>
                                    <span className="text-slate-400 dark:text-slate-500">•</span>
                                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20">
                                        {parsedData.header?.["Masa No"] ? `Masa ${parsedData.header["Masa No"]}` : 'Masa Bilgisi Yok'}
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
                            {/* Date Card */}
                            <Card className="group bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/10 hover:shadow-xl hover:shadow-violet-200/20 dark:hover:shadow-violet-800/20 transition-all duration-500 border border-violet-100/50 dark:border-violet-700/30">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-violet-500/10 ring-2 ring-violet-500/20 group-hover:ring-violet-500/40 group-hover:bg-violet-500/20 transition-all duration-300">
                                            <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-violet-600/70 dark:text-violet-400/70 mb-1">Tarih</p>
                                            <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">{parsedData.header?.TarihText}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Employee Card */}
                            <Card className="group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10 hover:shadow-xl hover:shadow-blue-200/20 dark:hover:shadow-blue-800/20 transition-all duration-500 border border-blue-100/50 dark:border-blue-700/30">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-blue-500/10 ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 group-hover:bg-blue-500/20 transition-all duration-300">
                                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70 mb-1">Personel</p>
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{parsedData.header?.EmployeeName}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Guest Count Card */}
                            <Card className="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 hover:shadow-xl hover:shadow-emerald-200/20 dark:hover:shadow-emerald-800/20 transition-all duration-500 border border-emerald-100/50 dark:border-emerald-700/30">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-emerald-500/10 ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/40 group-hover:bg-emerald-500/20 transition-all duration-300">
                                            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70 mb-1">Kişi Sayısı</p>
                                            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">{parsedData.header?.GuestNumber} Kişi</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Products */}
                        <Card className="border border-indigo-200/50 dark:border-indigo-700/30 shadow-lg shadow-indigo-100/20 dark:shadow-indigo-900/20">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-center gap-4 pb-2">
                                    <div className="p-3 rounded-xl bg-indigo-500/10 ring-2 ring-indigo-500/20">
                                        <Receipt className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100">Ürünler</h3>
                                </div>

                                <div className="space-y-4">
                                    {parsedData.transactions.map((group, groupIndex) => (
                                        <div key={groupIndex} className="space-y-3">
                                            {group.map((transaction) => (
                                                <div
                                                    key={transaction.TransactionID}
                                                    className={cn(
                                                        "group flex items-start justify-between p-5 rounded-xl transition-all duration-500",
                                                        transaction.ParentLineID
                                                            ? "ml-8 bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50"
                                                            : "bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 hover:shadow-lg hover:shadow-indigo-200/10 dark:hover:shadow-indigo-900/20 border border-indigo-100/30 dark:border-indigo-800/30",
                                                        transaction.Status === 'İptal' && "opacity-60"
                                                    )}
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                                                {transaction.MenuItemText}
                                                            </span>
                                                            {transaction.Status === 'İptal' && (
                                                                <Badge variant="destructive" className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">
                                                                    İptal
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {transaction.SaatText}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                                                            {new Intl.NumberFormat('tr-TR', {
                                                                style: 'currency',
                                                                currency: 'TRY'
                                                            }).format(transaction.ExtendedPrice)}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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

                        {parsedData.payments && parsedData.payments.length > 0 && (
                            <Card className="border border-emerald-200/50 dark:border-emerald-700/30 shadow-lg shadow-emerald-100/20 dark:shadow-emerald-900/20 overflow-hidden">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-center gap-4 pb-2">
                                        <div className="p-3 rounded-xl bg-emerald-500/10 ring-2 ring-emerald-500/20">
                                            <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100">Ödemeler</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {parsedData.payments.map((payment, index) => (
                                            <div
                                                key={index}
                                                className="group flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-900/10 hover:shadow-lg hover:shadow-emerald-200/20 dark:hover:shadow-emerald-900/20 transition-all duration-500 border border-emerald-100/30 dark:border-emerald-800/30"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/50 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/70 transition-colors">
                                                        {payment.PaymentMethodName.toLowerCase().includes('kredi') ? (
                                                            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                        ) : (
                                                            <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                                                            {payment.PaymentMethodName}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {payment.SaatText}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                                                        {new Intl.NumberFormat('tr-TR', {
                                                            style: 'currency',
                                                            currency: 'TRY'
                                                        }).format(payment.AmountPaid)}
                                                    </div>
                                                    {payment.AmountChange > 0 && (
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md inline-block">
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
                    </div>
                </ScrollArea>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] lg:max-w-[800px] bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}