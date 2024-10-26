import {
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  Stack,
} from '@chakra-ui/react';
import { createFileRoute } from "@tanstack/react-router"
import '../../models/ChatMessage';
import ChatMessage from '../../models/ChatMessage';
import Message from '../../components/Chat/Message'
import ChatPrompt from '../../models/ChatPrompt'
import ChatResponse from '../../models/ChatResponse'
import { useEffect, useState } from 'react';
import axios from 'axios';

const Chat = () => {

  const [promptContent, setPromptContent] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatId = 1


  useEffect(() => {
    fetchMessages()
  }, [])

  const renderMessages = () => {
    let htmlContent: any = [];
    messages.forEach((message) => {
      htmlContent.push(
        <Message text={message.content} isFromBot={message.isFromBot} />
      )
    })

    return htmlContent;
  }

  const fetchMessages = () => {
    // @TODO change static into GET request
    const _messages: ChatMessage[] = [];

    _messages.push({
      content: "Guten Tag123",
      isFromBot: true,
      timestamp: new Date()
    })

    _messages.push({
      content: "Wie gehts wie stehts?",
      isFromBot: false,
      timestamp: new Date()
    })

    _messages.push({
      content: "Soso",
      isFromBot: true,
      timestamp: new Date()
    })

    _messages.push({
      content: "Guten Tag123",
      isFromBot: true,
      timestamp: new Date()
    })

    axios.get(`/api/v1/chats/${chatId}`).then((response) => {
      console.log(response);
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

    console.log("SEND", promptContent);

    // add message to chat history
    const newMessage: ChatMessage = {
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

    axios.post(`/api/v1/chats/${chatId}`, chatPrompt).then((response) => {
      console.log("RESPONSE:", response);

      if (response.status !== 200) {
        console.error("Error fetching response:", response);
        return
      }

      const responseContent: ChatResponse = response.data;

      const newMessage: ChatMessage = {
        content: responseContent.message,
        isFromBot: true,
        timestamp: new Date(responseContent.created_at)
      }
      addMessageToHistory(newMessage)

    }).catch((error) => {
      console.error(error);
    })
  }

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Chat
      </Heading>

      <Flex h="100vh" w="full" py={12}>
        <Flex
          flexDirection="column"
          w="full"
          h="full"
          roundedTop="lg"
        >
          <Stack
            px={4}
            py={8}
            overflow="auto"
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
            {renderMessages()}
          </Stack>

          <HStack p={4} bg="gray.100">
            <Input bg="white" placeholder="Enter your question" value={promptContent} onChange={(e) => {
              setPromptContent(e.target.value);
            }} />
            <Button variant="primary" onClick={sendPrompt}>Send</Button>
          </HStack>
        </Flex>
      </Flex>
    </Container>
  );
}

export const Route = createFileRoute("/_layout/chat")({
  component: Chat,
})
