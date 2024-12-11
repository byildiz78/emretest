"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const Announce = () => {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState("");

    // Dummy users data - replace with actual users data
    const users = [
        { id: "1", name: "User 1" },
        { id: "2", name: "User 2" },
        { id: "3", name: "User 3" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log({ selectedUser, title, message });
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Duyuru Oluştur</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Kullanıcı</label>
                    <Select onValueChange={setSelectedUser} value={selectedUser}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Kullanıcı seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
               
                </div>

                <Button type="submit" className="w-full">
                    Gönder
                </Button>
            </form>
        </div>
    );
};

export default Announce;