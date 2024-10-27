import {
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Input,
    Stack,
    Box,
  } from '@chakra-ui/react';
  import '../../models/ChatMessage';
  import ChatMessage from '../../models/ChatMessage';
  import Message from './Message'
  import ChatPrompt from '../../models/ChatPrompt'
  import ChatResponse from '../../models/ChatResponse'
  import { useEffect, useState } from 'react';
  import axios from 'axios';
import ChatInfo from '../../models/ChatInfo';

type ChatRoomProps = {
    selectedChat: ChatInfo|undefined;
};
const ChatRoom = ({selectedChat}: ChatRoomProps) => {

    const [promptContent, setPromptContent] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);  
  
    useEffect(() => {
      // fetchMessages()
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
  
      axios.get(`/api/v1/chat/${selectedChat?.chatId}`).then((response) => {
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
        console.log("RESPONSE:", response);
  
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
  
      }).catch((error) => {
        console.error(error);
      })
    }
  
    return (
      // <Container h="full">
      <Box h="full">
        <Flex w="full" h="full" direction="column">
        <Heading ml="25" size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
          {selectedChat?.name}
        </Heading>
          {/* <Flex
            flexDirection="row"
            w="full"
            h="full"
            // roundedTop="lg"
            flexGrow="1"
          > */}
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
              {renderMessages()}
            </Stack>
  
            <HStack p={4} h="20" w="full" bg="gray.100" alignSelf="flex-end">
              <Input bg="white" placeholder="Enter your question" value={promptContent} onChange={(e) => {
                setPromptContent(e.target.value);
              }}
              onKeyDown={(e) => {
                const enterKeys = ['Enter', 'NumpadEnter']
                if(enterKeys.includes(e.code)) sendPrompt()
              }}
               />
              <Button variant="primary" onClick={sendPrompt}>Send</Button>
            </HStack>
          {/* </Flex> */}
        </Flex>
        {/* </Container> */}
      </Box>
    );
  }

export default ChatRoom