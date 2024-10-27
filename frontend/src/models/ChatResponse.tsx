export default interface ChatResponse {
    chat_id: number;
    user_id: number;
    message_text: string;
    referenced_doc_id: number;
    created_at: string;
}
