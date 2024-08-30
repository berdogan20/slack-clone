"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useCreateWorkspaceModal } from "../store/use-create-workspace-modal";
import { useState } from "react";
import { useCreateWorkspace } from "../api/use-create-workspace";
import { useRouter } from "next/navigation";



export const CreateWorkspaceModal = () => {

    const router = useRouter();
    
    const [open, setOpen] = useCreateWorkspaceModal();
    const [name, setName] = useState("");

    const { mutate } = useCreateWorkspace();

    const handleClose = () => {
        setOpen(false);
        setName("");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        mutate({ name }, {
            onSuccsess(id) {
                toast.success("Workspace created");
                router.push(`/workspace/${id}`);
                handleClose();
            },
            throwError: false // Add throwError property and set it to false
        });
    };


    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a Workspace</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}> 
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={false}
                        required
                        autoFocus
                        minLength={3}
                        placeholder="Workspace Name e.g. 'Work', 'Personal', 'Home'"
                    />
                    <div className="flex justify-end"> 
                        <Button disabled={false}>
                            Create
                        </Button>
                    </div>
                </form>
                </DialogContent>
        </Dialog>
    );
};

function mutate(arg0: { name: string; }, arg1: { onSuccess(data: any): void; }) {
    throw new Error("Function not implemented.");
}
