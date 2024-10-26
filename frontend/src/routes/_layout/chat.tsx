import {
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { createFileRoute } from "@tanstack/react-router"
import '../../models/ChatMessage';
import { ChatMessage } from '../../models/ChatMessage';

type MessageProps = {
  text: string;
  isFromBot: boolean;
};
const Message = ({ text, isFromBot }: MessageProps) => {
  return (
    <Flex
      p={4}
      bg={isFromBot ? 'teal.500' : 'gray.100'}
      color={isFromBot ? 'white' : 'gray.600'}
      borderRadius="lg"
      w="fit-content"
      alignSelf={isFromBot ? 'flex-start' : 'flex-end'}
    >
      <Text>{text}</Text>
    </Flex>
  );
};


const messages: ChatMessage[] = [];

messages.push({
  content: "Guten Tag123",
  isFromBot: true,
  timestamp: new Date()
})

messages.push({
  content: "Wie gehts wie stehts?",
  isFromBot: false,
  timestamp: new Date()
})

messages.push({
  content: "Soso",
  isFromBot: true,
  timestamp: new Date()
})

messages.push({
  content: "Guten Tag123",
  isFromBot: true,
  timestamp: new Date()
})

const renderMessages = () => {
  let htmlContent: any = [];
  messages.forEach((message) => {
    htmlContent.push(
      <Message text={message.content} isFromBot={message.isFromBot} />
    )
  })
  
  console.log(htmlContent);
  

  return htmlContent;
}


function Chat() {
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
          <Input bg="white" placeholder="Enter your text" />
          <Button variant="primary">Send</Button>
        </HStack>
      </Flex>
    </Flex>

    </Container>
  );
}

export const Route = createFileRoute("/_layout/chat")({
  component: Chat,
})