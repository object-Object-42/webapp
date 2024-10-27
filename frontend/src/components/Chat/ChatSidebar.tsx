'use client'

import {
  Box,
  Flex,
  useColorModeValue,
  FlexProps,
} from '@chakra-ui/react'
import { ReactText, useEffect, useState } from 'react'
import ChatInfo from '../../models/ChatInfo'
import axios from 'axios'


type ChatsidebarProps = {
  selectedChat: ChatInfo|undefined;
  setSelectedChat: Function;
};

const ChatSidebar = ({selectedChat, setSelectedChat}: ChatsidebarProps) => {

  const [chatList, setChatList] = useState<ChatInfo[]>([]);

  useEffect(() => {
      fetchChats()
  }, [])
    
  const fetchChats = () => {
    axios.get(`/api/v1/chats`).then((response) => {
      if (response.status !== 200) {
        console.error("Error fetching response:", response);
        return
      }

      const _chatList: ChatInfo[] = response.data.data
      setChatList(_chatList)

      setChatList(_chatList)
    }).catch((error) => {
      console.error(error);
    })
  }

  return (
    <Box mt="50">
      <Box
        bg={useColorModeValue('white', 'gray.900')}
        borderRight="1px"
        borderBottom="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        borderRightRadius="25px"
        w={{ base: 'full', md: 60 }}
        h="full"
        p="3"
        >
        <NavItem
          isSelected={selectedChat === undefined}
        >New Chat</NavItem>
        {chatList.map((chatInfo) => (
          <NavItem
            key={chatInfo.chatId}
            isSelected={selectedChat !== undefined && chatInfo.chatId == selectedChat.chatId}
            onClick={() => setSelectedChat(chatInfo)}
          >
            {chatInfo.name}
          </NavItem>
        ))}
        </Box>
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  isSelected: boolean,
  children: ReactText
}
const NavItem = ({ isSelected, children, ...rest }: NavItemProps) => {

  const navItemBg = (isSelected ? 'teal.400' : 'white')
  const navItemColor = (isSelected ? 'white' : '')

  return (
    <Flex
      align="center"
      p="4"
      mx="4"
      borderRadius="lg"
      role="group"
      cursor="pointer"
      color={navItemColor}
      bg={navItemBg}
      _hover={{
        bg: 'teal.400',
        color: 'white',
      }}
      {...rest}>
      {children}
    </Flex>
  )
}

export default ChatSidebar