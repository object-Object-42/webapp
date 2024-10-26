import {
  Flex,
  Text,
} from '@chakra-ui/react';

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

export default Message;