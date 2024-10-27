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
  useToast,
} from '@chakra-ui/react';
import ChatMessage from '../../models/ChatMessage';
import Message from './Message'
import ChatPrompt from '../../models/ChatPrompt'
import ChatResponse from '../../models/ChatResponse'
import { useEffect, useState } from 'react';
import axios from '../../client/axiosClient'
import ChatInfo from '../../models/ChatInfo';
import { AddIcon } from '@chakra-ui/icons';
import { OrganisationPublic, OrganisationsPublic } from '../../client';

type ChatRoomProps = {
  selectedChat: ChatInfo|undefined;
  setSelectedChat: Function;
};
const ChatRoom = ({selectedChat, setSelectedChat}: ChatRoomProps) => {

  const toast = useToast()
  const [promptContent, setPromptContent] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [organisations, setOrganisations] = useState<OrganisationPublic[]>([]);

  useEffect(() => {
    if (selectedChat?.chat_id === undefined) fetchOrganisations()
    else fetchMessages()
  }, [selectedChat])

  const fetchMessages = () => {
    axios.get(`/api/v1/chats/${selectedChat?.chat_id}`).then((response) => {
      const _messages: ChatMessage[] = response.data.data;
      setMessages(_messages)
    }).catch((error) => {
      console.error(error);
    })
  }

  const fetchOrganisations = () => {
    const _messages: ChatMessage[] = [];

    axios.get(`/api/v1/organisations`).then((response) => {
      const _organisationsPublic: OrganisationsPublic = response.data
      const _organisations = _organisationsPublic.data
      setOrganisations(_organisations)
    }).catch((response) => {
      console.error("Error fetching response:", response);
      toast({
        title: 'Error getting chatbots',
        description: response.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
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
      message_text: promptContent,
      is_from_bot: false,
      created_at: new Date()
    }

    addMessageToHistory(newMessage);

    setPromptContent('')

    // send message to backend
    const chatPrompt: ChatPrompt = {
      prompt: promptContent,
      level: 3,
      organisation: "current organisation or project"
    }

    axios.post(`/api/v1/chats/${selectedChat?.chat_id}`, chatPrompt).then((response) => {
      const responseContent: ChatResponse = response.data;

      const newMessage: ChatMessage = {
        messageId: 'unregistered',
        message_text: responseContent.message_text,
        is_from_bot: true,
        created_at: new Date(responseContent.created_at)
      }
      addMessageToHistory(newMessage)

      // refetch history with new content to get message ids
      fetchMessages()

    }).catch((response) => {
      console.error("Error fetching response:", response);
      toast({
        title: 'Error sending chat message.',
        description: response.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    })
  }

  const renderChatContent = () => {
    let htmlMessages: any = [];
    messages.forEach((message) => {
      htmlMessages.push(
        <Message text={message.message_text} isFromBot={message.is_from_bot} />
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
    let htmlOrganisations: any = [];
    organisations.forEach((organisation) => {
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
    axios.post('/api/v1/chats', {organisation_id}).then((response) => {
      const _chatInfo: ChatInfo = response.data;
      setSelectedChat(_chatInfo);
      
    }).catch((response) => {
      console.error("Error fetching response:", response);
      toast({
        title: 'Error creating new Chat.',
        description: response.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    })
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
