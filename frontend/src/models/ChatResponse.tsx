export default interface ChatResponse {
    chat_id: number;
    user_id: number;
    message: string;
    referenced_doc_id: number;
    created_at: string;
}
