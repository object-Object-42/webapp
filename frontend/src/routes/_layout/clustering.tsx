import {
  Container,
  Heading,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddItem from "../../components/Items/AddItem"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import Graph from "graphology";
import Sigma from "sigma";
import { FC, CSSProperties } from "react";
import { MultiDirectedGraph } from "graphology";

import { ControlsContainer, FullScreenControl, SearchControl, SigmaContainer, ZoomControl } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { color } from "framer-motion"

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute("/_layout/clustering")({
  component: ClusteringMenu,
  validateSearch: (search) => itemsSearchSchema.parse(search),
})

// function Clustering() {

//   // Create a graphology graph
//   const graph = new Graph();
//   graph.addNode("1", { label: "Node 1", x: 0, y: 0, size: 10, color: "blue" });
//   graph.addNode("2", { label: "Node 2", x: 1, y: 1, size: 20, color: "red" });
//   graph.addEdge("1", "2", { size: 5, color: "purple" });

//   // Instantiate sigma.js and render the graph
//   const sigmaInstance = new Sigma(graph, document.getElementById("container"));

//   return (
//     <div id='container'>
//     </div>
//   )
// }

export const LoadGraphWithProp: FC<{ style?: CSSProperties }> = ({ style }) => {
  // Create the graph
  const graph = new MultiDirectedGraph();
  graph.addNode("A", { x: 0, y: 0, label: "Node A", size: 10, color: "#333" });
  graph.addNode("B", { x: 1, y: 1, label: "Node B", size: 20 });
  graph.addNode("C", { x: 2, y: 2, label: "Test C", size: 10 });
  graph.addEdgeWithKey("rel1", "A", "B", { label: "REL_1", color: "red" });
  graph.addEdgeWithKey("rel2", "B", "C", { label: "REL_2"});

  return <SigmaContainer style={style} graph={graph} settings={{ allowInvalidContainer: true }}>
  <ControlsContainer>
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
      <LoadGraphWithProp style={{height: '85%'}}/>
    </Container>
  )
}
