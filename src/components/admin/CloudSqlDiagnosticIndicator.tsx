import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Activity,
  Server,
  ShieldCheck,
  Cpu,
  Layers,
  Clock,
  Radio,
  ExternalLink,
  ChevronRight,
  Zap,
  Info,
  X,
} from 'lucide-react';

export interface CloudSqlDiagnosticData {
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  database: string;
  host: string;
  user: string;
  engine: string;
  region: string;
  project: string;
  ssl: boolean;
  serverTime: string;
  pool: {
    total: number;
    idle: number;
    waiting: number;
    max: number;
  };
  tables: {
    name: string;
    verified: boolean;
    rowCount: number;
    error?: string;
  }[];
  lastChecked: string;
  errorMessage?: string;
}

interface CloudSqlDiagnosticProps {
  onOpenFullModal?: () => void;
  className?: string;
}

export const CloudSqlDiagnosticIndicator: React.FC<CloudSqlDiagnosticProps> = ({
  onOpenFullModal,
  className = '',
}) => {
  const [data, setData] = useState<CloudSqlDiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPinging, setIsPinging] = useState(false);
  const [showQuickPopover, setShowQuickPopover] = useState(false);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cloudsql/diagnostics');
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (e: any) {
      console.warn('[CloudSqlDiagnostic] Failed to poll diagnostics:', e);
      setData((prev) =>
        prev
          ? { ...prev, status: 'OFFLINE', errorMessage: e.message }
          : {
              status: 'OFFLINE',
              latencyMs: 999,
              database: 'Cloud SQL',
              host: 'unknown',
              user: 'postgres',
              engine: 'PostgreSQL',
              region: 'europe-west2',
              project: 'agentlens',
              ssl: false,
              serverTime: new Date().toISOString(),
              pool: { total: 0, idle: 0, waiting: 0, max: 10 },
              tables: [],
              lastChecked: new Date().toISOString(),
              errorMessage: e.message,
            }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePing = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPinging(true);
    try {
      await fetch('/api/cloudsql/ping', { method: 'POST' });
      await fetchDiagnostics();
    } catch (err) {
      console.warn('Ping error:', err);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    // Poll diagnostics every 20 seconds
    const interval = setInterval(fetchDiagnostics, 20000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = data?.status === 'ONLINE';
  const isDegraded = data?.status === 'DEGRADED';
  const latency = data?.latencyMs ?? 0;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => {
          if (onOpenFullModal) {
            onOpenFullModal();
          } else {
            setShowQuickPopover(!showQuickPopover);
          }
        }}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all shadow-xs cursor-pointer ${
          isOnline
            ? 'bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/25 hover:border-emerald-500/40'
            : isDegraded
            ? 'bg-amber-500/10 hover:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/25 hover:border-amber-500/40'
            : 'bg-rose-500/10 hover:bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/25 hover:border-rose-500/40'
        } ${className}`}
        title="Click to view full Cloud SQL Diagnostic & Connectivity details"
      >
        <div className="relative flex items-center justify-center">
          <Database className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : isDegraded ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`} />
          <span
            className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
              isOnline
                ? 'bg-emerald-500 animate-pulse'
                : isDegraded
                ? 'bg-amber-500 animate-pulse'
                : 'bg-rose-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-sans font-semibold hidden sm:inline">Cloud SQL:</span>
          <span>{isOnline ? 'Connected' : isDegraded ? 'Degraded' : 'Offline'}</span>
          {data && (
            <span className="text-[10px] font-normal opacity-80 px-1 py-0.2 rounded bg-black/5 dark:bg-white/10">
              {latency}ms
            </span>
          )}
        </div>

        <RefreshCw
          onClick={(e) => {
            e.stopPropagation();
            handlePing();
          }}
          className={`w-3 h-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-transform ${
            isLoading || isPinging ? 'animate-spin' : 'group-hover:rotate-180'
          }`}
        />
      </button>

      {/* Quick Popover when clicked if modal not wired */}
      {showQuickPopover && !onOpenFullModal && data && (
        <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-white dark:bg-[#211f1c] rounded-xl border border-[#e5e0d5] dark:border-[#33302b] shadow-xl z-50 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[#e5e0d5] dark:border-[#33302b] pb-2">
            <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#d97706]" />
              Cloud SQL Diagnostics
            </span>
            <button
              onClick={() => setShowQuickPopover(false)}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-neutral-500">Status:</span>
              <span className={`font-bold ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`}>
                {data.status} ({data.latencyMs}ms)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Engine:</span>
              <span className="truncate max-w-[140px]">{data.engine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Database:</span>
              <span>{data.database}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Active Pool:</span>
              <span>
                {data.pool.total} / {data.pool.max} (idle: {data.pool.idle})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Tables Ready:</span>
              <span className="text-emerald-600 font-bold">
                {data.tables.filter((t) => t.verified).length} / {data.tables.length} verified
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setShowQuickPopover(false);
              handlePing();
            }}
            className="w-full mt-2 py-1 bg-[#d97706] hover:bg-[#b45309] text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
            <span>Run Ping Test</span>
          </button>
        </div>
      )}
    </div>
  );
};
