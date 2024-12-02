"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Receipt, Users, Package2, ShoppingBag } from "lucide-react";

interface Order {
  id: string;
  checkNumber: string;
  openDate: string;
  staffName: string;
  amount: number;
  type: 'table' | 'package' | 'takeaway';
}

const orderTypeIcons = {
  table: Users,
  package: Package2,
  takeaway: ShoppingBag
};

const orderTypeLabels = {
  table: 'Masa',
  package: 'Paket',
  takeaway: 'Al Götür'
};

const orderTypeStyles = {
  table: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  package: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  takeaway: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
};

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(orders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentOrders = orders.slice(startIndex, endIndex);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 border-2 border-border/60 rounded-xl shadow-lg hover:border-border/80 transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Açılan Adisyonlar</h2>
            </div>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sayfa başına kayıt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 kayıt</SelectItem>
                <SelectItem value="10">10 kayıt</SelectItem>
                <SelectItem value="20">20 kayıt</SelectItem>
                <SelectItem value="50">50 kayıt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Çek No</TableHead>
                  <TableHead>Açılış Tarihi</TableHead>
                  <TableHead>Personel</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead className="text-center">Tipi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrders.map((order) => {
                  const Icon = orderTypeIcons[order.type];
                  return (
                    <TableRow key={order.id} className="group">
                      <TableCell className="font-medium">#{order.checkNumber}</TableCell>
                      <TableCell>{formatDateTime(order.openDate)}</TableCell>
                      <TableCell>{order.staffName}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <div className={`
                            flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                            ${orderTypeStyles[order.type]}
                          `}>
                            <Icon className="h-3.5 w-3.5" />
                            {orderTypeLabels[order.type]}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Toplam {orders.length} kayıttan {startIndex + 1}-{Math.min(endIndex, orders.length)} arası gösteriliyor
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}