// Interface for chat participant (user)

export interface TParticipant{
    uuid : string; 
    name : string; 
    avatarUrl?: string; 
    bio?: string;
    email?: string;
    jobTitle?: string;
    createdAt: number;
    updatedAt: number;
}

// Interface for single chat msg

export interface TMessage{
    uuid: string; 
    authorUuid: string 
    text: string; 
    attachments: TMessageAttachment[]; 
    sentAt: number; 
    updatedAt: number; 
    reactions: TReaction[]; 
    replyToMessageUuid?: string; 
    replyToMessage?: TMessage; 
}

export interface TMessageAttachment {
    uuid: string;
    type: "image";
    url: string;
    width: number;
    height: number;
}

export interface TReaction {
    uuid: string;
    participantUuid: string;
    value: string;
}