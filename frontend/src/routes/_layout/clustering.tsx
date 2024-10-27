import {
  Container,
  Heading,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import "@react-sigma/core/lib/react-sigma.min.css";
import "../../components/Clustering/styles.css";
import Root from "../../components/Clustering/sigma/Root";

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute("/_layout/clustering")({
  component: ClusteringMenu,
  validateSearch: (search) => itemsSearchSchema.parse(search),
})

function ClusteringMenu() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Central Intelligence Cluster
      </Heading>
      <Root></Root>
    </Container>
  )
}
