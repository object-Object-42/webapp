import {
  Box,
  Container,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { createFileRoute } from "@tanstack/react-router"
import '../../models/ChatMessage';
import ChatInfo from '../../models/ChatInfo';
import ChatRoom from '../../components/Chat/ChatRoom'
import ChatSidebar from '../../components/Chat/ChatSidebar'
import { useState } from 'react';

const ChatPage = () => {

  const [selectedChat, setSelectedChat] = useState<ChatInfo>()

  return (
    <Container maxW="full">
      <Flex h="full">
        <Box w="100" flexGrow="0" h="full" borderRight="1px solid lightgrey">
          <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
            Chat
          </Heading>
          <ChatSidebar selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
        </Box>
        <Box flexGrow="1">
          <ChatRoom selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
        </Box>
      </Flex>
    </Container>
  );
}

export const Route = createFileRoute("/_layout/chat")({
  component: ChatPage,
})
