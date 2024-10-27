import { FC } from "react";
import { BsInfoCircle } from "react-icons/bs";

import Panel from "./Panel";
import { Description } from "../types";

const DescriptionPanel: FC<{content: Description | null}> = ({content}) => {
  return (
    <Panel
      initiallyDeployed
      title={
        <>
          <BsInfoCircle className="text-muted mr-md" /> Description
        </>
      }
    >
      <footer>
        {content ? <>Source: <a style={{color: "blue"}} target="_blank" href={`https://${content.URL ?? ''}`}>{content.URL}</a></> : <i className="text-muted">Please select a node to show the source</i>}
      </footer>
    </Panel>
  );
};

export default DescriptionPanel;
