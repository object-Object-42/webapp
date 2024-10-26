export default interface ChatMessage {
    isFromBot: boolean;
    content: string;
    timestamp: Date;
}
