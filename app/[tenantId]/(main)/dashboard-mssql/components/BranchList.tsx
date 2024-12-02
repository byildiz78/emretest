"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useFilterStore } from "@/stores/filters-store";
import { BranchModel } from "@/types/tables";
import { Button } from "@/components/ui/button";

export default function BranchList() {
    const { selectedFilter, setSelectedBranches } = useFilterStore();

    const handleBranchClick = (branch: BranchModel) => {
        const isSelected = selectedFilter.selectedBranches.some(
            (selectedBranch) => selectedBranch.BranchID === branch.BranchID
        );

        if (isSelected) {
            setSelectedBranches(
                selectedFilter.selectedBranches.filter(
                    (selectedBranch) => selectedBranch.BranchID !== branch.BranchID
                )
            );
        } else {
            setSelectedBranches([...selectedFilter.selectedBranches, branch]);
        }
    };

    return (
        <ScrollArea className="h-[calc(100vh-100px)]">
            <div className="space-y-2 p-4">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedBranches([])}
                >
                    Tümünü Seç
                </Button>
                {selectedFilter.branches.map((branch) => {
                    const isSelected = selectedFilter.selectedBranches.some(
                        (selectedBranch) =>
                            selectedBranch.BranchID === branch.BranchID
                    );

                    return (
                        <Button
                            key={branch.BranchID}
                            variant={isSelected ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => handleBranchClick(branch)}
                        >
                            {branch.BranchName}
                        </Button>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
