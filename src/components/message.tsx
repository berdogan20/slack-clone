import { format, isToday, isYesterday } from "date-fns";
import { Doc, Id } from "../../convex/_generated/dataModel";
import dynamic from 'next/dynamic';
import { Hint } from "./hint";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useConfirm } from "@/hooks/use-confirm";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { Reactions } from "./reactions";
import { usePanel } from "@/hooks/use-panel";
import { ThreadBar } from "./thread-bar";
import { time } from "console";

const Renderer = dynamic(() => import('@/components/renderer'), { ssr: false });
const Editor = dynamic(() => import('@/components/editor'), { ssr: false });

interface MessageProps {
    id: Id<'messages'>;
    memberId: Id<'members'>;
    authorImage?: string;
    authorName?: string;
    isAuthor: boolean;
    reactions: Array<
        Omit<Doc<"reactions">, 'memberId'> & {
            count: number;
            memberIds: Id<'members'>[];
        }
    >
    body: Doc<"messages">['body'];
    image: string | null | undefined;
    createdAt: Doc<"messages">['_creationTime'];
    updatedAt: Doc<"messages">['updatedAt'];
    isEditing: boolean;
    isCompact?: boolean;
    setIsEditing: (id: Id<'messages'> | null) => void;
    hideThreadButton?: boolean;
    threadCount?: number;
    threadImage?: string;
    threadName?: string;
    threadTimestamp?: number;
}

const formatFullTime = (date: Date) => {
    return `${isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMMM d, yyyy')} at ${format(date, 'hh:mm:ss a')}`;
}

export const Message = ({
    id,
    memberId,
    authorImage,
    authorName = 'Member',
    isAuthor,
    reactions,
    body,
    image,
    createdAt,
    updatedAt,
    isEditing,
    isCompact,
    setIsEditing,
    hideThreadButton,
    threadCount,
    threadImage,
    threadName,
    threadTimestamp
}: MessageProps) => {

    const { parentMessageId, onOpenMessage, onOpenProfile, onClose } = usePanel();

    const [ConfirmDialog, confirm] = useConfirm(
        "Delete message",
        "Are you sure you want to delete this message? This action cannot be undone."
    );

    const { mutate: updateMessage, isPending: isUpdatingMessage } = useUpdateMessage();
    const { mutate: removeMessage, isPending: isRemovingMessage } = useRemoveMessage();
    const { mutate: toggleReaction, isPending:isTogglingReaction } = useToggleReaction();
    
    const isPending = isUpdatingMessage || isTogglingReaction;

    const handleReaction = (value: string) => {
        toggleReaction({ messageId: id, value }, {
            onError: (error) => {
                toast.error("Failed to add reaction");
            },
            throwError: true // Add the throwError property
        });
    }

    const handleRemove = async () => {
        const ok = await confirm();

        if (!ok) return;

        removeMessage({ id }, {
            onSuccsess: () => {
                toast.success('Message deleted');

                if (parentMessageId === id) {
                    onClose();
                }
            },
            onError: (error) => {
                toast.error("Failed to delete message");
            },
            throwError: true // Add the throwError property
        });
    }

    const handleUpdate = ({ body }: { body: string }) => {
        updateMessage({ id, body }, {
            onSuccsess: () => {
                toast.success('Message updated');
                setIsEditing(null);
            },
            onError: (error) => {
                toast.error("Failed to update message");
            },
            throwError: true // Add the throwError property
        });
    };


    if (isCompact) {
        return (
            <>
                <ConfirmDialog />
                <div className={cn(
                    "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
                    isEditing && 'bg-[#f2c74433] hover:bg-bg-[#f2c74433]',
                    isRemovingMessage && 'bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200'
                    )}>
                <div className="flex items-start gap-2">
                    <Hint label={formatFullTime(new Date(createdAt))}>
                        <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                            {format(new Date(createdAt), "hh:mm")}
                        </button>
                    </Hint>
                    {isEditing ? (
                        <div className="w-full h-full">
                            <Editor
                                onSubmit={handleUpdate}
                                disabled={isPending}
                                defaultValue={JSON.parse(body)}
                                onCancel={() => setIsEditing(null)}
                                variant="update"
                            />
                        </div>

                    ): (
                        <div className="flex flex-col w-full">
                            { updatedAt ? (
                                <span className="text-xs text-muted-foreground">(edited)</span>
                            ): null}
                            <Renderer value={body}/>
                            <Thumbnail url={image}/>
                            { updatedAt ? (
                                    <span className="text-xs text-muted-foreground">
                                        (edited)
                                    </span>
                            ): null}
                            <Reactions 
                                data={reactions}
                                onChange={handleReaction}
                            />
                            <ThreadBar
                                count={threadCount}
                                image={threadImage}
                                name={threadName}
                                timestamp={threadTimestamp}
                                onClick={() => onOpenMessage(id)}
                            />
                        </div>
                    )}
                </div>
                {!isEditing && (
                    <Toolbar
                        isAuthor={isAuthor}
                        isPending={false}
                        handleEdit={() => setIsEditing(id)}
                        handleThread={() => onOpenMessage(id)}
                        handleDelete={handleRemove}
                        handleReaction={handleReaction}
                        hideThreadButton={hideThreadButton}
                    />    
                )}    
            </div>  
        </>    
        )
    }

    const avatarFallback = authorName.charAt(0).toUpperCase();
    
    return (
        <>
                <ConfirmDialog />
                <div className={cn(
                    "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
                    isEditing && 'bg-[#f2c74433] hover:bg-bg-[#f2c74433]',
                    isRemovingMessage && 'bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200'

                )}>            <div className="flex items-start gap-2">
                <button
                    onClick={() => onOpenProfile(memberId)}
                >
                    <Avatar>
                        <AvatarImage src={authorImage} />
                        <AvatarFallback className="  bg-sky-400 text-white text-xs">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                </button>
                {isEditing ? (
                    <div className="w-full h-full">
                        <Editor
                            onSubmit={handleUpdate}
                            disabled={isPending}
                            defaultValue={JSON.parse(body)}
                            onCancel={() => setIsEditing(null)}
                            variant="update"
                        />
                    </div>
                ) : 
                    <div className="flex flex-col w-full overflow-hidden ">
                        <div className="text-sm">
                            <button onClick={() => onOpenProfile(memberId)} className="font-bold text-primary hover:underline">
                                {authorName}
                            </button>
                            <span>&nbsp;&nbsp;</span>
                            <Hint label={ formatFullTime(new Date(createdAt)) }>
                                <button className="text-xs text-muted-foreground hover:underline">
                                    {format(new Date(createdAt), "h:mm a")}
                                </button>
                            </Hint>
                        </div>
                        <Renderer value={body}/>
                        <Thumbnail url={image}/>
                        { updatedAt ? (
                            <span className="text-xs text-muted-foreground">
                                (edited)
                            </span>
                        ): null}
                        <Reactions 
                            data={reactions}
                            onChange={handleReaction}
                        />
                        
                        <ThreadBar
                            count={threadCount}
                            image={threadImage}
                            name={threadName}
                            timestamp={threadTimestamp}
                            onClick={() => onOpenMessage(id)}
                        />
                    </div>
                }
            </div>
            {!isEditing && (
                <Toolbar
                    isAuthor={isAuthor}
                    isPending={isPending}
                    handleEdit={() => setIsEditing(id)}
                    handleThread={() => onOpenMessage(id)}
                    handleDelete={handleRemove}
                    handleReaction={handleReaction}
                    hideThreadButton={hideThreadButton}
                />    
            )}    
        </div>  
        </>  
    )
}
