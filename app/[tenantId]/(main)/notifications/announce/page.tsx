"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useExpo } from "@/hooks/use-expo";

interface User {
    id: string;
    name: string;
}

const Announce = () => {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    const { sendNotification} = useExpo();
    const users: User[] = [
        { id: "1297", name: "Fatih Sen" }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendNotification(selectedUsers.length === 0 ? users.map((user) => user.id) : selectedUsers.map((user) => user.id), title, message);
    };

    const clearSelectedUsers = () => {
        setSelectedUsers([]);
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Duyuru Oluştur</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Kullanıcılar</label>
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-between"
                                >
                                    {selectedUsers.length === 0
                                        ? "Tüm Kullanıcılar"
                                        : `${selectedUsers.length} kullanıcı seçildi`}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
                                <Command>
                                    <div className="flex items-center p-2 border-b border-border/50">
                                        <CommandInput
                                            placeholder="Kullanıcı ara..."
                                            className="w-[--radix-popover-trigger-width] h-9 border-none focus:ring-0"
                                        />
                                    </div>
                                    <CommandEmpty>Kullanıcı bulunamadı.</CommandEmpty>
                                    <CommandGroup>
                                        <CommandList
                                            className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-2
                                                [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                                                [&::-webkit-scrollbar-thumb]:rounded-full
                                                [&::-webkit-scrollbar-track]:bg-transparent
                                                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                                                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                                                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80"
                                        >
                                            {users.map((user) => (
                                                <CommandItem
                                                    key={user.id}
                                                    onSelect={() => {
                                                        const isSelected = selectedUsers.find(
                                                            (selectedUser) =>
                                                                selectedUser.id === user.id
                                                        );

                                                        const newSelectedUsers = isSelected
                                                            ? selectedUsers.filter(
                                                                (selectedUser) =>
                                                                    selectedUser.id !== user.id
                                                            )
                                                            : [...selectedUsers, user];

                                                        setSelectedUsers(newSelectedUsers);
                                                    }}
                                                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent/50"
                                                >
                                                    <Checkbox
                                                        checked={
                                                            selectedUsers.find(
                                                                (selectedUser) =>
                                                                    selectedUser.id === user.id
                                                            )
                                                                ? true
                                                                : false
                                                        }
                                                        className="border-border/50"
                                                    />
                                                    <span>{user.name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={clearSelectedUsers}
                            className="shrink-0"
                            type="button"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Başlık</label>
                    <Input
                        placeholder="Duyuru başlığı"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Mesaj</label>
                    <Input
                        placeholder="Duyuru mesajı"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[150px]"
                    />
                </div>

                <Button type="submit" className="w-full">
                    Gönder
                </Button>
            </form>
        </div>
    );
};

export default Announce;