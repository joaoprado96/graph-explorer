import { cn } from "@/utils";
import { RefObject, useCallback, useMemo } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Card, EdgeIcon, GraphIcon, ListItem, StylingIcon } from "@/components";
import { GraphRef } from "@/components/Graph/Graph";
import {
  CenterGraphIcon,
  DetailsIcon,
  ExpandGraphIcon,
  FitToFrameIcon,
  RemoveFromCanvasIcon,
  ScreenshotIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@/components/icons";
import { useWithTheme } from "@/core";
import { edgesSelectedIdsAtom } from "@/core/StateProvider/edges";
import { nodesSelectedIdsAtom } from "@/core/StateProvider/nodes";
import { userLayoutAtom } from "@/core/StateProvider/userPreferences";
import useDisplayNames from "@/hooks/useDisplayNames";
import useEntities from "@/hooks/useEntities";
import useTranslations from "@/hooks/useTranslations";
import useGraphGlobalActions from "../useGraphGlobalActions";
import defaultStyles from "./ContextMenu.styles";

export type ContextMenuProps = {
  className?: string;
  affectedNodesIds?: string[];
  affectedEdgesIds?: string[];
  graphRef: RefObject<GraphRef | null>;
  onClose?(): void;
  onNodeCustomize(nodeType?: string): void;
  onEdgeCustomize(edgeType?: string): void;
};

const ContextMenu = ({
  className,
  affectedNodesIds,
  affectedEdgesIds,
  graphRef,
  onClose,
  onNodeCustomize,
  onEdgeCustomize,
}: ContextMenuProps) => {
  const styleWithTheme = useWithTheme();
  const t = useTranslations();
  const [entities, setEntities] = useEntities();
  const [nodesSelectedIds, setNodesSelectedIds] =
    useRecoilState(nodesSelectedIdsAtom);
  const [edgesSelectedIds, setEdgesSelectedIds] =
    useRecoilState(edgesSelectedIdsAtom);
  const setUserLayout = useSetRecoilState(userLayoutAtom);

  const {
    onFitToCanvas,
    onCenterGraph,
    onCenterSelectedGraph,
    onSaveScreenshot,
    onZoomIn,
    onZoomOut,
  } = useGraphGlobalActions(graphRef);

  const nonEmptySelection =
    nodesSelectedIds.size >= 1 || edgesSelectedIds.size >= 1;

  const openSidebarPanel = useCallback(
    (panelName: string, props?: { nodeType?: string; edgeType?: string }) =>
      () => {
        setUserLayout(prev => ({
          ...prev,
          activeSidebarItem: panelName,
        }));
        if (affectedNodesIds?.length) {
          setEdgesSelectedIds(prev => (prev.size === 0 ? prev : new Set([])));
          setNodesSelectedIds(new Set(affectedNodesIds ?? []));
        }
        if (affectedEdgesIds?.length) {
          setEdgesSelectedIds(new Set(affectedEdgesIds ?? []));
          setNodesSelectedIds(prev => (prev.size === 0 ? prev : new Set([])));
        }

        props?.nodeType && onNodeCustomize(props.nodeType);
        props?.edgeType && onEdgeCustomize(props.edgeType);

        onClose?.();
      },
    [
      affectedEdgesIds,
      affectedNodesIds,
      onClose,
      onNodeCustomize,
      onEdgeCustomize,
      setEdgesSelectedIds,
      setNodesSelectedIds,
      setUserLayout,
    ]
  );

  const handleFitToFrame = useCallback(() => {
    onFitToCanvas();
    onClose?.();
  }, [onClose, onFitToCanvas]);

  const handleCenter = useCallback(() => {
    if (nonEmptySelection) {
      onCenterSelectedGraph();
    } else {
      onCenterGraph();
    }
    onClose?.();
  }, [nonEmptySelection, onCenterGraph, onCenterSelectedGraph, onClose]);

  const handleDownloadScreenshot = useCallback(() => {
    onSaveScreenshot();
    onClose?.();
  }, [onClose, onSaveScreenshot]);

  const handleZoomIn = useCallback(() => {
    onZoomIn();
    onClose?.();
  }, [onClose, onZoomIn]);

  const handleZoomOut = useCallback(() => {
    onZoomOut();
    onClose?.();
  }, [onClose, onZoomOut]);

  const handleRemoveFromCanvas = useCallback(
    (nodesIds: string[], edgesIds: string[]) => () => {
      setEntities(prev => ({
        nodes: prev.nodes.filter(n => !nodesIds.includes(n.id)),
        edges: prev.edges.filter(e => !edgesIds.includes(e.id)),
        forceSet: true,
      }));
      onClose?.();
    },
    [onClose, setEntities]
  );

  const handleRemoveAllFromCanvas = useCallback(() => {
    setEntities({
      nodes: [],
      edges: [],
      forceSet: true,
    });
    onClose?.();
  }, [onClose, setEntities]);

  const noSelectionOrNotAffected =
    affectedNodesIds?.length === 0 &&
    nodesSelectedIds.size === 0 &&
    affectedEdgesIds?.length === 0 &&
    edgesSelectedIds.size === 0;

  const selectedButNoAffected =
    affectedNodesIds?.length === 0 &&
    affectedEdgesIds?.length === 0 &&
    nodesSelectedIds.size + edgesSelectedIds.size > 0;

  const getDisplayNames = useDisplayNames();
  const affectedNode = useMemo(() => {
    if (!affectedNodesIds?.length) {
      return;
    }

    return entities.nodes.find(n => n.id === affectedNodesIds[0]);
  }, [affectedNodesIds, entities.nodes]);

  const affectedEdge = useMemo(() => {
    if (!affectedEdgesIds?.length) {
      return;
    }

    return entities.edges.find(e => e.id === affectedEdgesIds[0]);
  }, [affectedEdgesIds, entities.edges]);

  if (affectedNode) {
    return (
      <div
        className={cn(styleWithTheme(defaultStyles), "context-menu", className)}
      >
        <Card className={"card-root"}>
          <ListItem
            className={cn("context-menu-list-item", "list-item-header")}
            startAdornment={<GraphIcon />}
          >
            {getDisplayNames(affectedNode)?.name}
          </ListItem>
          <div className={"divider"} />
          <ListItem
            className={"context-menu-list-item"}
            clickable={true}
            onClick={openSidebarPanel("details")}
            startAdornment={<DetailsIcon />}
          >
            Details Panel
          </ListItem>
          <ListItem
            className={"context-menu-list-item"}
            clickable={true}
            onClick={openSidebarPanel("expand")}
            startAdornment={<ExpandGraphIcon />}
          >
            Expand Panel
          </ListItem>
          <ListItem
            className={"context-menu-list-item"}
            clickable={true}
            onClick={openSidebarPanel("nodes-styling", {
              nodeType: affectedNode.type,
            })}
            startAdornment={<StylingIcon />}
          >
            Customize Panel
          </ListItem>
          <div className={"divider"} />
          <ListItem
            className={"context-menu-list-item"}
            clickable={true}
            onClick={handleRemoveFromCanvas([affectedNode.id], [])}
            startAdornment={<RemoveFromCanvasIcon color={"red"} />}
          >
            Remove {t("graph-viewer.node")} from canvas
          </ListItem>
        </Card>
      </div>
    );
  }

  if (affectedEdge) {
    return (
      <div
        className={cn(styleWithTheme(defaultStyles), "context-menu", className)}
      >
        <Card className={"card-root"}>
          <ListItem
            className={cn("context-menu-list-item", "list-item-header")}
            startAdornment={<EdgeIcon />}
          >
            {getDisplayNames(affectedEdge)?.name}
          </ListItem>
          <div className={"divider"} />
          <ListItem
            className={"context-menu-list-item"}
            clickable={true}
            onClick={openSidebarPanel("details")}
            startAdornment={<DetailsIcon />}
          >
            Details Panel
          </ListItem>
          <ListItem
            className={"context-menu-list-item"}
            clickable={true}
            onClick={openSidebarPanel("edges-styling", {
              edgeType: affectedEdge.type,
            })}
            startAdornment={<StylingIcon />}
          >
            Customize Panel
          </ListItem>
          <div className={"divider"} />
          <ListItem
            className={"context-menu-list-item"}
            clickable={true}
            onClick={handleRemoveFromCanvas([], [affectedEdge.id])}
            startAdornment={<RemoveFromCanvasIcon color={"red"} />}
          >
            Remove {t("graph-viewer.edge")} from canvas
          </ListItem>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(styleWithTheme(defaultStyles), "context-menu", className)}
    >
      <Card className={"card-root"}>
        <ListItem
          className={"context-menu-list-item"}
          clickable={true}
          onClick={handleFitToFrame}
          startAdornment={<FitToFrameIcon />}
        >
          {nonEmptySelection ? "Fit Selection to Frame" : "Fit to Frame"}
        </ListItem>
        <ListItem
          className={"context-menu-list-item"}
          clickable={true}
          onClick={handleCenter}
          startAdornment={<CenterGraphIcon />}
        >
          {nonEmptySelection ? "Center Selection" : "Center"}
        </ListItem>
        <ListItem
          className={"context-menu-list-item"}
          clickable={true}
          onClick={handleDownloadScreenshot}
          startAdornment={<ScreenshotIcon />}
        >
          Download Screenshot
        </ListItem>
        <div className={"divider"} />
        <ListItem
          className={"context-menu-list-item"}
          clickable={true}
          onClick={handleZoomIn}
          startAdornment={<ZoomInIcon />}
        >
          Zoom in
        </ListItem>
        <ListItem
          className={"context-menu-list-item"}
          clickable={true}
          onClick={handleZoomOut}
          startAdornment={<ZoomOutIcon />}
        >
          Zoom out
        </ListItem>
        {selectedButNoAffected && (
          <>
            <div className={"divider"} />
            <ListItem
              className={"context-menu-list-item"}
              clickable={true}
              onClick={handleRemoveFromCanvas(
                Array.from(nodesSelectedIds),
                Array.from(edgesSelectedIds)
              )}
              startAdornment={<RemoveFromCanvasIcon color={"red"} />}
            >
              Remove selection from canvas
            </ListItem>
          </>
        )}
        {noSelectionOrNotAffected && (
          <>
            <div className={"divider"} />
            <ListItem
              className={"context-menu-list-item"}
              clickable={true}
              onClick={handleRemoveAllFromCanvas}
              startAdornment={<RemoveFromCanvasIcon color={"red"} />}
            >
              Clear canvas
            </ListItem>
          </>
        )}
      </Card>
    </div>
  );
};

export default ContextMenu;
