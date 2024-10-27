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
      {content && <footer className="flex">
        <p>{"Source: "}</p>
        <a href={content.URL}>{content.URL}</a>
      </footer>}
    </Panel>
  );
};

export default DescriptionPanel;
