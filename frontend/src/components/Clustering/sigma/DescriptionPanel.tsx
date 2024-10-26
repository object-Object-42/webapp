import { FC } from "react";
import { BsInfoCircle } from "react-icons/bs";

import Panel from "./Panel";

const DescriptionPanel: FC<{content: string}> = ({content}) => {
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
        <p>{content}</p>
      </footer>
    </Panel>
  );
};

export default DescriptionPanel;
