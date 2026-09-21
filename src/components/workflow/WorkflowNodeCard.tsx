import React from 'react';
import {
  WorkflowNode,
  IntegrationPlatform,
  WorkflowNodeType,
} from '../../types/workflow';
import {
  Sparkles,
  Zap,
  Bot,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Mail,
  DollarSign,
  Server,
  Folder,
  MessageSquare,
  Radio,
  Clock,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu,
  Layers,
  FileCode,
  Image as ImageIcon,
} from 'lucide-react';
import { useWorkflowStore } from '../../stores/useWorkflowStore';

interface WorkflowNodeCardProps {
  node: WorkflowNode;
  isSelected: boolean;
  isActiveStep: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onPortMouseDown: (e: React.MouseEvent, portId: string, isOutput: boolean) => void;
}

export const WorkflowNodeCard: React.FC<WorkflowNodeCardProps> = ({
  node,
  isSelected,
  isActiveStep,
  onSelect,
  onDragStart,
  onPortMouseDown,
}) => {
  // Render Platform & Node Icons
  const renderPlatformIcon = (platform: IntegrationPlatform, iconName: string) => {
    switch (platform) {
      case 'gemini':
        return <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'anthropic':
        return <Bot className="w-4 h-4 text-[#d97706] dark:text-[#f59e0b]" />;
      case 'openai':
        return <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'gmail':
        return <Mail className="w-4 h-4 text-red-500" />;
      case 'gdrive':
        return <Folder className="w-4 h-4 text-amber-500" />;
      case 'stripe':
        return <DollarSign className="w-4 h-4 text-indigo-500" />;
      case 'slack':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'aws_nitro':
        return <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'cloudsql':
        return <Server className="w-4 h-4 text-blue-500" />;
      case 'imagen':
        return <ImageIcon className="w-4 h-4 text-rose-500" />;
      case 'webhook':
      default:
        return <Radio className="w-4 h-4 text-[#c15f3c]" />;
    }
  };

  // Get Node Category Theming
  const getCategoryTheme = (type: WorkflowNodeType) => {
    switch (type) {
      case 'trigger':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
          text: 'text-emerald-800 dark:text-emerald-300',
          border: 'border-emerald-500/30',
          indicator: 'bg-emerald-500',
        };
      case 'ai_model':
        return {
          bg: 'bg-violet-500/10 dark:bg-violet-500/15',
          text: 'text-violet-800 dark:text-violet-300',
          border: 'border-violet-500/30',
          indicator: 'bg-violet-500',
        };
      case 'api_key_proxy':
        return {
          bg: 'bg-orange-500/10 dark:bg-orange-500/15',
          text: 'text-orange-800 dark:text-orange-300',
          border: 'border-orange-500/30',
          indicator: 'bg-orange-500',
        };
      case 'policy_gate':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/15',
          text: 'text-amber-800 dark:text-amber-300',
          border: 'border-amber-500/30',
          indicator: 'bg-amber-500',
        };
      case 'integration':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-500/15',
          text: 'text-blue-800 dark:text-blue-300',
          border: 'border-blue-500/30',
          indicator: 'bg-blue-500',
        };
      case 'transformer':
        return {
          bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
          text: 'text-cyan-800 dark:text-cyan-300',
          border: 'border-cyan-500/30',
          indicator: 'bg-cyan-500',
        };
      case 'output':
      default:
        return {
          bg: 'bg-teal-500/10 dark:bg-teal-500/15',
          text: 'text-teal-800 dark:text-teal-300',
          border: 'border-teal-500/30',
          indicator: 'bg-teal-500',
        };
    }
  };

  const theme = getCategoryTheme(node.type);

  return (
    <div
      id={`workflow-node-${node.id}`}
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        width: '280px',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`absolute select-none cursor-move transition-shadow duration-150 rounded-2xl border bg-white dark:bg-[#211f1c] shadow-md ${
        isSelected
          ? 'border-[#c15f3c] ring-2 ring-[#c15f3c]/40 shadow-xl z-30'
          : isActiveStep
          ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl z-30 animate-pulse'
          : 'border-[#e5e0d5] dark:border-[#33302b] hover:border-[#d5cfc2] dark:hover:border-[#4a463f] z-10'
      }`}
    >
      {/* Node Header & Category Tag */}
      <div
        onMouseDown={onDragStart}
        className={`px-3.5 py-2.5 rounded-t-2xl border-b ${theme.bg} ${theme.border} flex items-center justify-between cursor-grab active:cursor-grabbing`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-white/90 dark:bg-[#181715]/90 border border-[#e5e0d5] dark:border-[#33302b] shadow-2xs">
            {renderPlatformIcon(node.platform, node.icon)}
          </div>
          <div>
            <span className={`text-[10px] font-mono font-extrabold uppercase tracking-wider ${theme.text}`}>
              {node.category}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${theme.indicator}`} />
              <span className="text-[10px] font-mono text-[#878278] dark:text-[#9e998f] font-semibold uppercase">
                {node.platform}
              </span>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {node.status === 'intercepted' ? (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 animate-pulse">
            ESCROW HELD
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            ONLINE
          </span>
        )}
      </div>

      {/* Node Body Content */}
      <div className="p-3.5 space-y-2.5">
        <div>
          <h4 className="text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] tracking-tight leading-snug">
            {node.name}
          </h4>
          <p className="text-[11px] text-[#5c5850] dark:text-[#b8b4aa] line-clamp-2 mt-0.5 leading-relaxed font-normal">
            {node.description}
          </p>
        </div>

        {/* Node Live Payload Summary Pill */}
        {node.livePayload?.statusSummary && (
          <div className="p-2 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-[10px] font-mono text-[#5c5850] dark:text-[#b8b4aa] flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c15f3c] flex-shrink-0" />
            <span className="truncate">{node.livePayload.statusSummary}</span>
          </div>
        )}

        {/* Credentials / Key Mask Tag */}
        {node.credentials && (
          <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-[#f4f1ea] dark:border-[#2a2824]">
            <span className="text-[#878278] dark:text-[#7d7970] truncate max-w-[130px]">
              {node.credentials.type}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/20">
              {node.credentials.status === 'MINTED_EPHEMERAL' ? '300s TTL' : 'Nitro Sealed'}
            </span>
          </div>
        )}

        {/* Metrics Footer */}
        <div className="grid grid-cols-3 gap-1 pt-1.5 text-center text-[10px] font-mono text-[#878278] dark:text-[#7d7970] border-t border-[#f4f1ea] dark:border-[#2a2824]">
          <div>
            <span className="block font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
              {node.metrics.latencyMs}ms
            </span>
            <span className="text-[9px]">Latency</span>
          </div>
          <div>
            <span className="block font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
              {node.metrics.tokens > 0 ? `${node.metrics.tokens}` : '0'}
            </span>
            <span className="text-[9px]">Tokens</span>
          </div>
          <div>
            <span className="block font-bold text-emerald-700 dark:text-emerald-400">
              ${node.metrics.costUsd.toFixed(4)}
            </span>
            <span className="text-[9px]">Cost</span>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* INPUT PORTS (LEFT SIDE SOCKETS)                                         */}
      {/* ======================================================================= */}
      <div className="absolute top-12 -left-2.5 flex flex-col gap-3">
        {node.inputs.map((port, idx) => (
          <div
            key={port.id}
            id={`port-${node.id}-${port.id}`}
            title={`Input: ${port.name} (${port.type})`}
            onMouseDown={(e) => onPortMouseDown(e, port.id, false)}
            className="group relative flex items-center"
          >
            <div className="w-5 h-5 rounded-full bg-white dark:bg-[#181715] border-2 border-[#878278] hover:border-[#c15f3c] flex items-center justify-center cursor-crosshair transition-all duration-150 hover:scale-125 shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-[#878278] group-hover:bg-[#c15f3c]" />
            </div>
            <span className="absolute left-6 text-[9px] font-mono font-bold text-[#878278] dark:text-[#7d7970] whitespace-nowrap bg-white/95 dark:bg-[#181715]/95 px-1.5 py-0.5 rounded border border-[#e5e0d5] dark:border-[#33302b] shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40">
              in:{port.name}
            </span>
          </div>
        ))}
      </div>

      {/* ======================================================================= */}
      {/* OUTPUT PORTS (RIGHT SIDE SOCKETS)                                       */}
      {/* ======================================================================= */}
      <div className="absolute top-12 -right-2.5 flex flex-col gap-3">
        {node.outputs.map((port, idx) => (
          <div
            key={port.id}
            id={`port-${node.id}-${port.id}`}
            title={`Output: ${port.name} (${port.type})`}
            onMouseDown={(e) => onPortMouseDown(e, port.id, true)}
            className="group relative flex items-center justify-end"
          >
            <span className="absolute right-6 text-[9px] font-mono font-bold text-[#878278] dark:text-[#7d7970] whitespace-nowrap bg-white/95 dark:bg-[#181715]/95 px-1.5 py-0.5 rounded border border-[#e5e0d5] dark:border-[#33302b] shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40">
              out:{port.name}
            </span>
            <div className="w-5 h-5 rounded-full bg-white dark:bg-[#181715] border-2 border-[#c15f3c] hover:border-[#ad5232] flex items-center justify-center cursor-crosshair transition-all duration-150 hover:scale-125 shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c15f3c]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
