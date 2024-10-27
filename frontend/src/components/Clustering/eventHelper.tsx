import { FC, CSSProperties, useEffect, useState } from "react";
import { ControlsContainer, SearchControl, SigmaContainer, useRegisterEvents, useSigma, ZoomControl } from "@react-sigma/core";


export const GraphEvents: React.FC = () => {
    const registerEvents = useRegisterEvents();
    const sigma = useSigma();
    const [draggedNode, setDraggedNode] = useState<string | null>(null);
  
    useEffect(() => {
      // Register the events
      registerEvents({
        downNode: (e) => {
          setDraggedNode(e.node);
          sigma.getGraph().setNodeAttribute(e.node, "highlighted", true);
        },
        // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
        mousemovebody: (e) => {
          if (!draggedNode) return;
          // Get new position of node
          const pos = sigma.viewportToGraph(e);
          sigma.getGraph().setNodeAttribute(draggedNode, "x", pos.x);
          sigma.getGraph().setNodeAttribute(draggedNode, "y", pos.y);
  
          // Prevent sigma to move camera:
          e.preventSigmaDefault();
          e.original.preventDefault();
          e.original.stopPropagation();
        },
        // On mouse up, we reset the autoscale and the dragging mode
        mouseup: () => {
          if (draggedNode) {
            setDraggedNode(null);
            sigma.getGraph().removeNodeAttribute(draggedNode, "highlighted");
          }
        },
        // Disable the autoscale at the first down interaction
        mousedown: () => {
          if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
        },
      });
    }, [registerEvents, sigma, draggedNode]);
  
    return null;
  };