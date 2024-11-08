import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import type { ModuleContainerHeaderProps } from "@/components";
import {
  ModuleContainer,
  ModuleContainerContent,
  ModuleContainerHeader,
} from "@/components";
import GraphIcon from "@/components/icons/GraphIcon";
import PanelEmptyState from "@/components/PanelEmptyState/PanelEmptyState";
import { edgesSelectedIdsAtom } from "@/core/StateProvider/edges";
import { nodesAtom, nodesSelectedIdsAtom } from "@/core/StateProvider/nodes";
import useTranslations from "@/hooks/useTranslations";
import NodeExpandContent from "./NodeExpandContent";

export type NodeExpandProps = Omit<
  ModuleContainerHeaderProps,
  "title" | "sidebar"
> & {
  title?: ModuleContainerHeaderProps["title"];
};

const NodeExpand = ({ title = "Expand", ...headerProps }: NodeExpandProps) => {
  const t = useTranslations();
  const nodes = useRecoilValue(nodesAtom);
  const nodesSelectedIds = useRecoilValue(nodesSelectedIdsAtom);
  const edgesSelectedIds = useRecoilValue(edgesSelectedIdsAtom);

  const selectedNode = useMemo(() => {
    return nodes.find(node => nodesSelectedIds.has(node.id));
  }, [nodes, nodesSelectedIds]);

  return (
    <ModuleContainer variant="sidebar">
      <ModuleContainerHeader
        title={title}
        variant={"sidebar"}
        {...headerProps}
      />
      <ModuleContainerContent>
        {nodesSelectedIds.size === 0 && edgesSelectedIds.size === 0 && (
          <PanelEmptyState
            icon={<GraphIcon />}
            title={t("node-expand.no-selection-title")}
            subtitle={t("node-expand.no-selection-subtitle")}
          />
        )}
        {nodesSelectedIds.size === 0 && edgesSelectedIds.size > 0 && (
          <PanelEmptyState
            icon={<GraphIcon />}
            title={t("node-expand.edge-selection-title")}
            subtitle={t("node-expand.edge-selection-subtitle")}
          />
        )}
        {nodesSelectedIds.size > 1 && (
          <PanelEmptyState
            icon={<GraphIcon />}
            title={t("node-expand.multi-selection-title")}
            subtitle={t("node-expand.multi-selection-subtitle")}
          />
        )}
        {nodesSelectedIds.size === 1 && selectedNode && (
          <NodeExpandContent vertex={selectedNode} />
        )}
      </ModuleContainerContent>
    </ModuleContainer>
  );
};

export default NodeExpand;
