import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { createFileRoute } from "@tanstack/react-router"
import downloadImage from '../../img/undraw_download_re_li50.svg'
import axios from '../../client/axiosClient'
import useCustomToast from "../../hooks/useCustomToast"

const ChatPage = () => {
  const showToast = useCustomToast()

  const downloadCurrentPodcast = () => {
    axios.get(`/api/v1/podcast/demo`, {responseType: 'blob'}).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'daily-podcast.mp3');
      document.body.appendChild(link);
      link.click();
    }).catch((response) => {
      console.error("Error fetching response:", response);
      showToast("Success!", "User created successfully.", "success")
    })
  }

  return (
    <Container maxW="full">
      <Flex w="full" h="full" direction="column" justifyContent="center">
          <Box alignSelf="center" w="20%">
            <img src={downloadImage} alt="download image" />
          </Box>
          <Box alignSelf="center" mt="100">
            <Heading>Download your Daily Podcast here:</Heading>
          </Box>
          <Box alignSelf="center" mt="50">
            <Button
              color="white"
              background="teal"
              onClick={() => downloadCurrentPodcast()}
            >Download</Button>
          </Box>
      </Flex>
    </Container>
  );
}

export const Route = createFileRoute("/_layout/podcasts")({
  component: ChatPage,
})
