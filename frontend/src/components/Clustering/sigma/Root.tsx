import { FullScreenControl, SigmaContainer, ZoomControl } from "@react-sigma/core";
import { createNodeImageProgram } from "@sigma/node-image";
import { DirectedGraph } from "graphology";
import { constant, keyBy, mapValues, omit } from "lodash";
import { FC, useEffect, useMemo, useState } from "react";
import { BiRadioCircleMarked } from "react-icons/bi";
import { BsArrowsFullscreen, BsFullscreenExit, BsZoomIn, BsZoomOut } from "react-icons/bs";
import { GrClose } from "react-icons/gr";
import { Settings } from "sigma/settings";

import { drawHover, drawLabel } from "../canvas-utils";
import { Cluster, Dataset, Description, FiltersState, NodeData } from "../types";
import ClustersPanel from "./ClustersPanel";
import DescriptionPanel from "./DescriptionPanel";
import GraphDataController from "./GraphDataController";
import GraphEventsController from "./GraphEventsController";
import GraphSettingsController from "./GraphSettingsController";
import GraphTitle from "./GraphTitle";
import SearchField from "./SearchField";
import { VectorReturn, VectorService } from "../../../client";

const Root: FC = () => {
  const [showContents, setShowContents] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [filtersState, setFiltersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [description, setDescription] = useState<Description | null>(null);

  const sigmaSettings: Partial<Settings> = useMemo(
    () => ({
      nodeProgramClasses: {
        image: createNodeImageProgram({
          size: { mode: "force", value: 256 },
        }),
      },
      defaultDrawNodeLabel: drawLabel,
      defaultDrawNodeHover: drawHover,
      defaultNodeType: "image",
      defaultEdgeType: "arrow",
      labelDensity: 0.07,
      labelGridCellSize: 60,
      labelRenderedSizeThreshold: 15,
      labelFont: "Lato, sans-serif",
      zIndex: true,
      allowInvalidContainer: true,
    }),
    [],
  );

  function parseDataSet(vector :VectorReturn): Dataset {
    const nodeData: NodeData[] = [];
    const clusters: Cluster[] = [];
    const tags: {key:string, image: string}[] = [];

    Object.keys(vector.organizations).forEach((orgName, index) => {
      clusters.push({
        key: index + 1 + '',
        color: vector.organizations[orgName].color,
        clusterLabel: orgName,
      });
      tags.push({ key: orgName, image: "charttype.svg" });
      vector.organizations[orgName].points.forEach((dataPoint) => {
        const splitTitle = dataPoint.doc_name.split(' [', 2);
        nodeData.push({
          key: splitTitle[0],
          label: splitTitle[0],
          tag: orgName,
          URL: splitTitle[1]?.replace(']', ''),
          cluster: index + 1 + '',
          x: dataPoint.x,
          y: dataPoint.y,
        });
      });
    });

    return {
      nodes: nodeData,
      edges: [],
      clusters: clusters,
      tags: tags,
    }
  }

  // Load data on mount:
  useEffect(() => {
      VectorService.getVectorNodes().then((vectorDataset: VectorReturn) => {
        const dataset: Dataset = parseDataSet(vectorDataset)
        setDataset(dataset);
        setFiltersState({
          clusters: mapValues(keyBy(dataset.clusters, "key"), constant(true)),
          tags: mapValues(keyBy(dataset.tags, "key"), constant(true)),
        });
        requestAnimationFrame(() => setDataReady(true));
      }).catch((error) => {
        console.error("Error fetching vector nodes:", error);
      });        
  }, []);

  if (!dataset) return null;

  return (
    <div id="app-root" className={showContents ? "show-contents" : ""}>
      <SigmaContainer graph={DirectedGraph} settings={sigmaSettings} className="react-sigma">
        <GraphSettingsController hoveredNode={hoveredNode} />
        <GraphEventsController setHoveredNode={setHoveredNode} setDescription={setDescription} />
        <GraphDataController dataset={dataset} filters={filtersState} />
        {/* <GraphEvents /> could be enabled, currently clashing with node onClick navigation*/}

        {dataReady && (
          <>
            <div className="controls">
              <FullScreenControl className="ico">
                <BsArrowsFullscreen />
                <BsFullscreenExit />
              </FullScreenControl>

              <ZoomControl className="ico">
                <BsZoomIn />
                <BsZoomOut />
                <BiRadioCircleMarked />
              </ZoomControl>
            </div>
            <div className="contents">
              <div className="ico">
                <button
                  type="button"
                  className="ico hide-contents"
                  onClick={() => setShowContents(false)}
                  title="Show caption and description"
                >
                  <GrClose />
                </button>
              </div>
              <GraphTitle filters={filtersState} />
              <div className="panels">
                <SearchField filters={filtersState} />
                <DescriptionPanel content={description}/>
                <ClustersPanel
                  clusters={dataset.clusters}
                  filters={filtersState}
                  setClusters={(clusters) =>
                    setFiltersState((filters) => ({
                      ...filters,
                      clusters,
                    }))
                  }
                  toggleCluster={(cluster) => {
                    setFiltersState((filters) => ({
                      ...filters,
                      clusters: filters.clusters[cluster]
                        ? omit(filters.clusters, cluster)
                        : { ...filters.clusters, [cluster]: true },
                    }));
                  }}
                />
              </div>
            </div>
          </>
        )}
      </SigmaContainer>
    </div>
  );
};

export default Root;
