"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BranchData {
  id: number;
  name: string;
  currentValue: number;
  previousValue: number;
  difference: number;
  totalDaily: number;
  dailyCustomers: number;
  peopleCount: number;
  percentageChange: number | null;
}

interface BranchTableProps {
  data: BranchData[];
}

export default function BranchTable({ data }: BranchTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Şube</TableHead>
            {/* <TableHead className="text-right">Güncel Değer</TableHead>
            <TableHead className="text-right">Geçen Hafta</TableHead>
            <TableHead className="text-right">Fark</TableHead>
            <TableHead className="text-right">Günlük Toplam</TableHead>
            <TableHead className="text-right">Müşteri Sayısı</TableHead>
            <TableHead className="text-right">Kişi Sayısı</TableHead>
            <TableHead className="text-right">Değişim %</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell className="font-medium">{branch.name}</TableCell>
              <TableCell className="text-right">{formatCurrency(branch.currentValue)}</TableCell>
              <TableCell className="text-right">{formatCurrency(branch.previousValue)}</TableCell>
              <TableCell className="text-right text-green-600">
                +{formatCurrency(branch.difference)}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(branch.totalDaily)}</TableCell>
              <TableCell className="text-right">{branch.dailyCustomers}</TableCell>
              <TableCell className="text-right">{branch.peopleCount}</TableCell>
              <TableCell className="text-right">
                {branch.percentageChange ? `${branch.percentageChange.toFixed(2)}%` : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}