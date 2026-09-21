import React from 'react';
import { WorkflowNode, WorkflowEdge, ExecutionPacket } from '../../types/workflow';

interface WorkflowWireLayerProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedEdgeId: string | null;
  activePackets: ExecutionPacket[];
  connectingLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null;
  onSelectEdge: (edgeId: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
}

export const WorkflowWireLayer: React.FC<WorkflowWireLayerProps> = ({
  nodes,
  edges,
  selectedEdgeId,
  activePackets,
  connectingLine,
  onSelectEdge,
  onDeleteEdge,
}) => {
  const NODE_WIDTH = 280;
  const PORT_START_Y = 58;
  const PORT_GAP_Y = 28;

  // Find port coordinates for source and target
  const getPortCoordinates = (
    nodeId: string,
    portId: string,
    isOutput: boolean
  ): { x: number; y: number } | null => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    const portList = isOutput ? node.outputs : node.inputs;
    const portIndex = portList.findIndex((p) => p.id === portId);
    const index = portIndex >= 0 ? portIndex : 0;

    const x = isOutput ? node.position.x + NODE_WIDTH : node.position.x;
    const y = node.position.y + PORT_START_Y + index * PORT_GAP_Y;

    return { x, y };
  };

  // Generate cubic bezier path
  const createBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1);
    const offset = Math.max(dx * 0.45, 50);
    const cx1 = x1 + offset;
    const cy1 = y1;
    const cx2 = x2 - offset;
    const cy2 = y2;
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
      <defs>
        {/* Glow Filters */}
        <filter id="wire-glow-orange" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="wire-glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="wire-glow-amber" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Linear Gradients for Wires */}
        <linearGradient id="wire-grad-default" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c15f3c" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="wire-grad-intercept" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>

      {/* Existing Edges */}
      {edges.map((edge) => {
        const p1 = getPortCoordinates(edge.sourceNodeId, edge.sourcePortId, true);
        const p2 = getPortCoordinates(edge.targetNodeId, edge.targetPortId, false);
        if (!p1 || !p2) return null;

        const pathData = createBezierPath(p1.x, p1.y, p2.x, p2.y);
        const isSelected = selectedEdgeId === edge.id;
        const isIntercepted = edge.status === 'intercepted';
        const isTransmitting = edge.status === 'transmitting';

        // Calculate midpoint for label pill
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        return (
          <g key={edge.id} className="group cursor-pointer pointer-events-auto">
            {/* Wide invisible path for easy clicking */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="24"
              onClick={() => onSelectEdge(edge.id)}
            />

            {/* Background wire track */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? '#c15f3c' : isIntercepted ? '#d97706' : '#878278'}
              strokeWidth={isSelected ? '3.5' : '2'}
              strokeOpacity={isSelected ? 1 : isIntercepted ? 0.9 : 0.35}
              strokeLinecap="round"
            />

            {/* Animated Flowing Pulse Wire */}
            {isTransmitting && (
              <path
                d={pathData}
                fill="none"
                stroke={isIntercepted ? 'url(#wire-grad-intercept)' : 'url(#wire-grad-default)'}
                strokeWidth={isSelected ? '4' : '2.5'}
                strokeDasharray="8 6"
                strokeDashoffset="0"
                className="animate-[dash_1.5s_linear_infinite]"
                filter={isIntercepted ? 'url(#wire-glow-amber)' : 'url(#wire-glow-orange)'}
              />
            )}

            {/* Glowing Packet Traveling Along Cable */}
            {isTransmitting && (
              <circle r="4.5" fill={isIntercepted ? '#ef4444' : '#c15f3c'}>
                <animateMotion
                  path={pathData}
                  dur={isIntercepted ? '3s' : '2s'}
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Edge Label Pill at Midpoint */}
            {edge.label && (
              <g
                transform={`translate(${midX}, ${midY})`}
                onClick={() => onSelectEdge(edge.id)}
                className="transition-transform duration-150 hover:scale-110"
              >
                <rect
                  x="-70"
                  y="-11"
                  width="140"
                  height="22"
                  rx="11"
                  fill="white"
                  className="dark:fill-[#211f1c] stroke-[#e5e0d5] dark:stroke-[#33302b]"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  className={`text-[9px] font-mono font-bold tracking-tight ${
                    isIntercepted
                      ? 'fill-amber-600 dark:fill-amber-400'
                      : 'fill-[#5c5850] dark:fill-[#b8b4aa]'
                  }`}
                >
                  {edge.label.length > 22 ? `${edge.label.slice(0, 20)}...` : edge.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Active Connecting Drag Line (When User Connects 2 Ports) */}
      {connectingLine && (
        <g>
          <path
            d={createBezierPath(
              connectingLine.x1,
              connectingLine.y1,
              connectingLine.x2,
              connectingLine.y2
            )}
            fill="none"
            stroke="#c15f3c"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="animate-[dash_1s_linear_infinite]"
            filter="url(#wire-glow-orange)"
          />
          <circle
            cx={connectingLine.x2}
            cy={connectingLine.y2}
            r="6"
            fill="#c15f3c"
            className="animate-ping"
          />
        </g>
      )}
    </svg>
  );
};
