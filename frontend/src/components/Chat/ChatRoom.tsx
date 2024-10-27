import {
  Button,
  Card,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  Stack,
  Box,
  CardBody,
  Spacer,
} from '@chakra-ui/react';
import '../../models/ChatMessage';
import ChatMessage from '../../models/ChatMessage';
import Message from './Message'
import ChatPrompt from '../../models/ChatPrompt'
import ChatResponse from '../../models/ChatResponse'
import Organisation from '../../models/Organisation'
import { useEffect, useState } from 'react';
import axios from 'axios';
import ChatInfo from '../../models/ChatInfo';
import { AddIcon } from '@chakra-ui/icons';
import { ApiError, ChatCreate, OrganisationsService } from '../../client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useCustomToast from '../../hooks/useCustomToast';
import { ChatService } from '../../client/services/ChatService';
import { handleError } from '../../utils';

type ChatRoomProps = {
  selectedChat: ChatInfo|undefined;
  setSelectedChat: Function;
};
const ChatRoom = ({selectedChat, setSelectedChat}: ChatRoomProps) => {

  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const [promptContent, setPromptContent] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const getOrganisationQueryOptions = () => {
    return {
      queryFn: () =>
        OrganisationsService.readOrganisations({
          skip: 0,
          limit: 999,
        }),
      queryKey: ["organisationItems"],
    };
  }

  const {
    data: organisations,
    // isPending,
    // isPlaceholderData,
  } = useQuery({
    ...getOrganisationQueryOptions(),
    placeholderData: (prevData) => prevData,
  });

  const createChatMutation = useMutation({
    mutationFn: (data: ChatCreate) =>
      ChatService.createChat(data),
    onSuccess: () => {
      showToast("Success!", "Item created successfully.", "success");
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["createChat"] });
    },
  });

  useEffect(() => {
    // if (selectedChat?.chatId === undefined) fetchOrganisations()
    // else
    fetchMessages()
  }, [selectedChat])


  const fetchMessages = () => {
    const _messages: ChatMessage[] = [];

    axios.get(`/api/v1/chats/${selectedChat?.chatId}`).then((response) => {
      console.log(response.data);
    }).catch((error) => {
      console.error(error);
    })

    setMessages(_messages)
  }


  const addMessageToHistory = (newMessage: ChatMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
  }


  const sendPrompt = () => {
    if (!promptContent.trim()) return;

    // add message to chat history
    const newMessage: ChatMessage = {
      messageId: 'unregistered',
      content: promptContent,
      isFromBot: false,
      timestamp: new Date()
    }

    addMessageToHistory(newMessage);

    setPromptContent('')

    // send message to backend
    const chatPrompt: ChatPrompt = {
      prompt: promptContent,
      level: 3,
      organisation: "current organisation or project"
    }

    axios.post(`/api/v1/chat/${selectedChat?.chatId}`, chatPrompt).then((response) => {
      if (response.status !== 200) {
        console.error("Error fetching response:", response);
        return
      }

      const responseContent: ChatResponse = response.data;

      const newMessage: ChatMessage = {
        messageId: 'unregistered',
        content: responseContent.message,
        isFromBot: true,
        timestamp: new Date(responseContent.created_at)
      }
      addMessageToHistory(newMessage)

    }).catch((response) => {
      console.error("Error fetching response:", response);
      // showToast({
      //   title: 'Error sending chat message.',
      //   description: response.message,
      //   status: 'error',
      //   duration: 3000,
      //   isClosable: true,
      // })
    })
  }

  const renderChatContent = () => {
    let htmlMessages: any = [];
    messages.forEach((message) => {
      htmlMessages.push(
        <Message text={message.content} isFromBot={message.isFromBot} />
      )
    })

    return (
      <Stack
        px={4}
        py={8}
        overflow="auto"
        flexGrow="1"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#d5e3f7',
            borderRadius: '24px',
          },
        }}
      >
      {htmlMessages}
    </Stack>
    )
  }

  const renderSelectChatbot = () => {

    if (organisations === undefined) return ''

    let htmlOrganisations: any = [];
    organisations.data.forEach((organisation) => {
      htmlOrganisations.push(
        <Card mb="15" key={organisation.org_id}>
          <CardBody>
            <Flex>
            <Heading size="md">{organisation.org_name}</Heading>
              <Spacer />
              <Button colorScheme='teal' onClick={() => createNewChat(organisation.org_id)}>Choose <AddIcon ml="3" boxSize="15" /></Button>
            </Flex>
          </CardBody>
        </Card>
      )
    })

    return (
      <Container flexGrow="1" alignContent="center">
        <Heading size="lg" mb="50">Select a new Chatbot</Heading>
        {htmlOrganisations}
      </Container>
    )
  }

  const createNewChat = (organisation_id: string) => {
    const payload: ChatCreate = {organisation_id}
    createChatMutation.mutate(payload)
  }

  const hasChatSelected = selectedChat !== undefined;

  return (
    <Box h="full">
      <Flex w="full" h="full" direction="column">
      <Heading ml="25" size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        {selectedChat?.name || 'New Chat'}
      </Heading>
          {selectedChat?.name ? renderChatContent() : renderSelectChatbot() }

          <HStack p={4} h="20" w="full" bg="gray.100" alignSelf="flex-end">
            <Input
              bg="white"
              placeholder="Enter your question"
              value={promptContent}
              onChange={(e) => {
                setPromptContent(e.target.value);
              }}
              disabled={!hasChatSelected}
              onKeyDown={(e) => {
              const enterKeys = ['Enter', 'NumpadEnter']
              if(enterKeys.includes(e.code)) sendPrompt()
              }}
            />
            <Button variant={hasChatSelected ? 'primary' : 'grey'} onClick={sendPrompt}>Send</Button>
          </HStack>
      </Flex>
    </Box>
  );
}

export default ChatRoom
