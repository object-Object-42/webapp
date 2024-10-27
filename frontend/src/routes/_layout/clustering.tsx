import {
  Container,
  Heading,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { FC, CSSProperties } from "react";
import { MultiDirectedGraph } from "graphology";
import { GraphEvents } from "../../components/Clustering/eventHelper";
import { ControlsContainer, SearchControl, SigmaContainer, ZoomControl } from "@react-sigma/core";
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



export const LoadGraphWithProp: FC<{ style?: CSSProperties }> = ({ style }) => {
  // Create the graph
  const graph = new MultiDirectedGraph();
  graph.addNode("A", { x: 0, y: 0, label: "Node A", size: 10, color: "#333", key: 1 });
  graph.addNode("B", { x: 1, y: 1, label: "Node B", size: 20, key: 1 });
  graph.addNode("C", { x: 2, y: 2, label: "Test C", size: 10 });
  graph.addEdgeWithKey("rel1", "A", "B", { label: "REL_1", color: "red" });
  graph.addEdgeWithKey("rel2", "B", "C", { label: "REL_2"});

  return <SigmaContainer style={style} graph={graph} settings={{ allowInvalidContainer: true }}>
    <GraphEvents />
  <ControlsContainer style={{display: 'flex'}}>
    <SearchControl />
    <ZoomControl />
  </ControlsContainer>
  </SigmaContainer>;
};

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
