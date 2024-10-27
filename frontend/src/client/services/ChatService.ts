import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import ChatInfo from "../../models/ChatInfo";
import ChatMessage from "../../models/ChatMessage";
import { ChatCreate, OrganisationCreate } from "../models";

export class ChatService {
    /**
     * Read Organisations
     * Retrieve Organisations.
     * @returns OrganisationsPublic Successful Response
     * @throws ApiError
     */
    public static readChats(): CancelablePromise<ChatInfo[]> {
      return __request(OpenAPI, {
        method: "GET",
        url: "/api/v1/chats/",
        errors: {
          422: `Validation Error`,
        },
      });
    }
  
    /**
     * Create Organisation
     * Create new Organisation.
     * @returns OrganisationPublic Successful Response
     * @throws ApiError
     */
    public static readChatMessages(
      chatId: string,
      // data: ChatMessage[]
    ): CancelablePromise<ChatMessage[]> {
      // const { requestBody } = data;
      return __request(OpenAPI, {
        method: "GET",
        url: `/api/v1/chats/${chatId}`,
        // body: {},
        mediaType: "application/json",
        errors: {
          422: `Validation Error`,
        },
      });
    }
  
    /**
     * Create a new Chat
     * @throws ApiError
     */
    public static createChat(
      data: ChatCreate
    ): CancelablePromise<ChatCreate> {
      return __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/chats",
        body: data,
        errors: {
          422: `Validation Error`,
        },
      });
    }
  
    /**
     * Update Organisation
     * Update an Organisation.
     * @returns OrganisationPublic Successful Response
     * @throws ApiError
     */
    // public static updateOrganisation(
    //   data: TDataUpdateOrganisation
    // ): CancelablePromise<OrganisationPublic> {
    //   const { org_id, requestBody } = data;
    //   return __request(OpenAPI, {
    //     method: "PUT",
    //     url: "/api/v1/organisations/{org_id}",
    //     path: {
    //       org_id,
    //     },
    //     body: requestBody,
    //     mediaType: "application/json",
    //     errors: {
    //       422: `Validation Error`,
    //     },
    //   });
    // }
  
    /**
     * Delete Organisation
     * Delete an Organisation.
     * @returns Message Successful Response
     * @throws ApiError
     */
  //   public static deleteOrganisation(
  //     data: TDataDeleteOrganisation
  //   ): CancelablePromise<Message> {
  //     const { org_id } = data;
  //     console.log("Delete", data);
  //     return __request(OpenAPI, {
  //       method: "DELETE",
  //       url: "/api/v1/organisations/{org_id}",
  //       path: {
  //         org_id,
  //       },
  //       errors: {
  //         422: `Validation Error`,
  //       },
  //     });
  //   }
}