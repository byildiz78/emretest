"use client";

import { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useParams } from 'next/navigation';

export function SettingsMenu() {
  const params = useParams();
  const [settings, setSettings] = useState({
    minDiscountAmount: null,
    minCancelAmount: null,
    minSaleAmount: null,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/${params.tenantId}/api/get-user-settings`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, [params.tenantId]);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/${params.tenantId}/api/update-user-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const event = new CustomEvent('settingsUpdated', { detail: settings });
      window.dispatchEvent(event);

    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Bildirim Ayarları</h4>
            <p className="text-sm text-muted-foreground">
              Minimum bildirim limitlerini ayarlayın
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="minDiscountAmount">Min İndirim</Label>
              <Input
                id="minDiscountAmount"
                type="number"
                className="col-span-2"
                value={settings.minDiscountAmount ?? ''}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    minDiscountAmount: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                placeholder="Limit yok"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="minCancelAmount">Min İptal</Label>
              <Input
                id="minCancelAmount"
                type="number"
                className="col-span-2"
                value={settings.minCancelAmount ?? ''}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    minCancelAmount: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                placeholder="Limit yok"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="minSaleAmount">Min Satış</Label>
              <Input
                id="minSaleAmount"
                type="number"
                className="col-span-2"
                value={settings.minSaleAmount ?? ''}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    minSaleAmount: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                placeholder="Limit yok"
              />
            </div>
          </div>
          <Button onClick={handleSave}>Kaydet</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
