import { Box, Container, Flex, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import useAuth from "../../hooks/useAuth"
import chatbotImage from '../../img/undraw_chat_bot_re_e2gj.svg'
import clusteringImage from '../../img/undraw_mind_map_re_nlb6.svg'
import podcastImage from '../../img/undraw_podcast_audience_re_4i5q.svg'
import DashboardCard from '../../components/Dashboard/DashboardCard'

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <Container maxW="full">
      <Box pt={12} m={4}>
        <Text fontSize="2xl">Hi, {currentUser?.full_name || currentUser?.email} 👋🏼</Text>
        <Flex mt="50">
          <DashboardCard
            title="Chatbot"
            subtitle="Ask the AI for information"
            image={<img src={chatbotImage} alt="chatbot" width="350px" />}
            link="/chat"
          />

          <DashboardCard
            title="Clustering"
            subtitle="Visualize your knowledge"
            image={<img src={clusteringImage} alt="clustering" width="350px" />}
            link="/clustering"
          />

          <DashboardCard
            title="Podcasts"
            subtitle="Keep yourself up to date"
            image={<img src={podcastImage} alt="podcast" width="350px" />}
            link="/podcasts"
          />
        </Flex>
      </Box>
    </Container>
  )
}
