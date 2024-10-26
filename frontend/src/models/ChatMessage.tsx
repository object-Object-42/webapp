import internal from "stream";

export default interface ChatMessage {
    messageId: string;
    isFromBot: boolean;
    content: string;
    timestamp: Date;
}
