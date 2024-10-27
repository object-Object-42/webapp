export default interface ChatMessage {
    messageId: string;
    is_from_bot: boolean;
    message_text: string;
    created_at: Date;
}
