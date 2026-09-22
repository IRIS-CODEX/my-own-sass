import React, { useState, useRef, useEffect } from 'react';
import { useWorkflowStore } from '../../stores/useWorkflowStore';
import { WorkflowTopHeader } from './WorkflowTopHeader';
import { WorkflowNodeCard } from './WorkflowNodeCard';
import { WorkflowWireLayer } from './WorkflowWireLayer';
import { WorkflowInspector } from './WorkflowInspector';
import { WorkflowLogsDrawer } from './WorkflowLogsDrawer';
import { WorkflowAgentSidebar } from './WorkflowAgentSidebar';
import { AddNodeModal } from './AddNodeModal';
import { BuildAgentModal } from './BuildAgentModal';

export const WorkflowCanvasHub: React.FC = () => {
  const {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    selectNode,
    selectEdge,
    updateNodePosition,
    addEdge,
    deleteNode,
    deleteEdge,
    zoom,
    panX,
    panY,
    setPan,
    inspectorOpen,
    executionState,
    currentExecutionStep,
    activePackets,
  } = useWorkflowStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Panning canvas state
  const [isPanningCanvas, setIsPanningCanvas] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Connecting wire state
  const [connectingSource, setConnectingSource] = useState<{
    nodeId: string;
    portId: string;
    isOutput: boolean;
    startX: number;
    startY: number;
  } | null>(null);

  const [connectingCurrentPos, setConnectingCurrentPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Keyboard hotkeys: Delete/Backspace to delete selected, Esc to clear selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          deleteEdge(selectedEdgeId);
        }
      } else if (e.key === 'Escape') {
        selectNode(null);
        selectEdge(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, deleteNode, deleteEdge, selectNode, selectEdge]);

  // Handle Mouse Down on Node to start dragging
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    selectNode(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDraggingNodeId(nodeId);
    setDragOffset({
      x: (e.clientX - panX) / zoom - node.position.x,
      y: (e.clientY - panY) / zoom - node.position.y,
    });
  };

  // Handle Mouse Down on Port to start wire connection
  const handlePortMouseDown = (
    e: React.MouseEvent,
    nodeId: string,
    portId: string,
    isOutput: boolean
  ) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const startX = isOutput ? node.position.x + 280 : node.position.x;
    const portList = isOutput ? node.outputs : node.inputs;
    const portIndex = portList.findIndex((p) => p.id === portId);
    const startY = node.position.y + 58 + (portIndex >= 0 ? portIndex : 0) * 28;

    setConnectingSource({
      nodeId,
      portId,
      isOutput,
      startX,
      startY,
    });

    setConnectingCurrentPos({
      x: (e.clientX - panX) / zoom,
      y: (e.clientY - panY) / zoom,
    });
  };

  // Canvas Mouse Down: Start Canvas Pan
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    selectNode(null);
    selectEdge(null);
    setIsPanningCanvas(true);
    setPanStart({
      x: e.clientX - panX,
      y: e.clientY - panY,
    });
  };

  // Mouse Move: Updates node dragging, canvas pan, or wire drawing
  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Dragging Node
    if (draggingNodeId) {
      const newX = Math.round((e.clientX - panX) / zoom - dragOffset.x);
      const newY = Math.round((e.clientY - panY) / zoom - dragOffset.y);
      updateNodePosition(draggingNodeId, newX, newY);
      return;
    }

    // 2. Connecting Wire
    if (connectingSource) {
      setConnectingCurrentPos({
        x: (e.clientX - panX) / zoom,
        y: (e.clientY - panY) / zoom,
      });
      return;
    }

    // 3. Panning Canvas
    if (isPanningCanvas) {
      setPan(e.clientX - panStart.x, e.clientY - panStart.y);
    }
  };

  // Mouse Up: Releases dragging or creates new wire connection
  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }

    if (isPanningCanvas) {
      setIsPanningCanvas(false);
    }

    if (connectingSource) {
      // Find element under cursor
      const targetEl = document.elementFromPoint(e.clientX, e.clientY);
      const portEl = targetEl?.closest('[id^="port-"]') as HTMLElement | null;

      if (portEl && portEl.id) {
        // ID format: `port-${nodeId}-${portId}`
        const parts = portEl.id.split('-');
        if (parts.length >= 3) {
          const targetNodeId = parts[1];
          const targetPortId = parts[2];

          if (targetNodeId !== connectingSource.nodeId) {
            if (connectingSource.isOutput) {
              addEdge(connectingSource.nodeId, connectingSource.portId, targetNodeId, targetPortId);
            } else {
              addEdge(targetNodeId, targetPortId, connectingSource.nodeId, connectingSource.portId);
            }
          }
        }
      }

      setConnectingSource(null);
      setConnectingCurrentPos(null);
    }
  };

  // Active connecting wire line calculation
  const connectingLine =
    connectingSource && connectingCurrentPos
      ? {
          x1: connectingSource.startX,
          y1: connectingSource.startY,
          x2: connectingCurrentPos.x,
          y2: connectingCurrentPos.y,
        }
      : null;

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden select-none bg-[#faf8f5] dark:bg-[#181715] text-[#1f1e1b] dark:text-[#f5f3ef]">
      {/* Top Matrix & Blueprint Controls Header */}
      <WorkflowTopHeader />

      {/* Main Workspace Area (Canvas + Inspector) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Infinite Grid Blueprint Canvas */}
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 h-full relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#faf8f5] dark:bg-[#181715]"
        >
          {/* Blueprint Grid Texture Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle, #878278 1px, transparent 1px), linear-gradient(to right, rgba(135,130,120,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(135,130,120,0.06) 1px, transparent 1px)',
              backgroundSize: '24px 24px, 120px 120px, 120px 120px',
              backgroundPosition: `${panX}px ${panY}px`,
            }}
          />

          {/* Scaled & Panned Canvas Viewport */}
          <div
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: '4000px',
              height: '3000px',
            }}
            className="absolute inset-0 transition-transform duration-75"
          >
            {/* SVG Wire Layer */}
            <WorkflowWireLayer
              nodes={nodes}
              edges={edges}
              selectedEdgeId={selectedEdgeId}
              activePackets={activePackets}
              connectingLine={connectingLine}
              onSelectEdge={(edgeId) => selectEdge(edgeId)}
              onDeleteEdge={(edgeId) => deleteEdge(edgeId)}
            />

            {/* Render Draggable Nodes */}
            {nodes.map((node, index) => (
              <WorkflowNodeCard
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                isActiveStep={executionState === 'running' && currentExecutionStep === index}
                onSelect={() => selectNode(node.id)}
                onDragStart={(e) => handleNodeDragStart(e, node.id)}
                onPortMouseDown={(e, portId, isOutput) =>
                  handlePortMouseDown(e, node.id, portId, isOutput)
                }
              />
            ))}
          </div>

          {/* Canvas Bottom Legend / Instructions */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-white/90 dark:bg-[#211f1c]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#e5e0d5] dark:border-[#33302b] text-[11px] font-mono text-[#878278] dark:text-[#7d7970] shadow-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#c15f3c]" />
              Drag sockets to wire nodes
            </span>
            <span>•</span>
            <span>Drag canvas to pan</span>
            <span>•</span>
            <span>Del / Backspace to remove</span>
          </div>
        </div>

        {/* Right Inspector Sidepanel */}
        {inspectorOpen && <WorkflowInspector />}

        {/* AI Coding Agent Builder Sidebar */}
        <WorkflowAgentSidebar />
      </div>

      {/* Bottom Live Execution Stream Console */}
      <WorkflowLogsDrawer />

      {/* Add Node Modal */}
      <AddNodeModal />

      {/* Build AI Agent Swarm Modal */}
      <BuildAgentModal />
    </div>
  );
};
