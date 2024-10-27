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

        const _chatList: Array<ChatInfo> = [
            { chatId:'1', name: 'Home', timestamp: new Date() },
            { chatId:'2', name: 'Trending', timestamp: new Date() },
            { chatId:'3', name: 'Explore', timestamp: new Date() },
            { chatId:'4', name: 'Favourites', timestamp: new Date() },
            { chatId:'5', name: 'Settings', timestamp: new Date() },
          ]
        setChatList(_chatList)
      }, [])
    
      const fetchChats = () => {
        const _chatList: ChatInfo[] = [];
    
        axios.get(`/api/v1/chat`).then((response) => {
          if (response.status !== 200) {
            console.error("Error fetching response:", response);
            return
          }


          const _chatList: ChatInfo[] = response.data.data
          setChatList(_chatList)
        }).catch((error) => {
          console.error(error);
        })
    
        setChatList(_chatList)
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