import React, { useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { useCreateChannelModal } from '../store/use-create-channel-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useCreateChannel } from '../api/use-create-channel';

export const CreateChannelModal = () => {

    const workspaceId = useWorkspaceId();
    const { mutate, isPending } = useCreateChannel();
    const [open, setOpen] = useCreateChannelModal();
    const [name, setName] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
        setName(value);
    }
    const handleClose = () => {
        setOpen(false);
        setName('');
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutate(
            { name , workspaceId }, 
            { 
                onSuccsess: () => {
                    // TODO: redirect to the new channel
                    handleClose();
                },
                throwError: false, // Add this line to fix the error
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add a channel
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <Input
                        value={name}
                        disabled={isPending}
                        onChange={handleChange}
                        required
                        autoFocus
                        minLength={3}
                        maxLength={580}
                        placeholder="e.g. plan-budget"
                    />
                    <div className='flex justify-end'>
                        <Button disabled={false}>
                            Create
                        </Button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    )
}