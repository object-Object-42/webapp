import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Description } from "../types";

function getMouseLayer() {
  return document.querySelector(".sigma-mouse");
}

const GraphEventsController: FC<PropsWithChildren<{ setHoveredNode: (node: string | null) => void, setDescription: (node: Description | null) => void}>> = ({
  setHoveredNode,
  setDescription,
  children,
}) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;

    sigma.getGraph().setNodeAttribute(selected, "highlighted", true);
    const nodeDisplayData = sigma.getNodeDisplayData(selected);

    if (nodeDisplayData)
      sigma.getCamera().animate(
        { ...nodeDisplayData, ratio: 0.05 },
        {
          duration: 600,
        },
      );

    return () => {
      sigma.getGraph().setNodeAttribute(selected, "highlighted", false);
    };
  }, [selected]);

  /**
   * Initialize here settings that require to know the graph and/or the sigma
   * instance:
   */
  useEffect(() => {
    registerEvents({
      clickNode({ node }) {
        if (!graph.getNodeAttribute(node, "hidden")) {
          setSelected(graph.getNodeAttribute(node, "key"));
          setDescription({URL: graph.getNodeAttribute(node, "URL")});
        }
      },
        enterNode({ node }) {
          setHoveredNode(node);
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.add("mouse-pointer");
      },
      leaveNode() {
        setHoveredNode(null);
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.remove("mouse-pointer");
      },
    });
  }, []);

  return <>{children}</>;
};

export default GraphEventsController;
