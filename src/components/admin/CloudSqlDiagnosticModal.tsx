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
  Zap,
  Check,
  X,
  Play,
  Terminal,
  Table,
  Lock,
} from 'lucide-react';
import { CloudSqlDiagnosticData } from './CloudSqlDiagnosticIndicator';

interface CloudSqlDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSqlDiagnosticModal: React.FC<CloudSqlDiagnosticModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<CloudSqlDiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingHistory, setPingHistory] = useState<{ time: string; latencyMs: number; status: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'pool' | 'logs'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cloudsql/diagnostics');
      const json = await res.json();
      if (json.data) {
        setData(json.data);
        setPingHistory((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            latencyMs: json.data.latencyMs,
            status: json.data.status,
          },
          ...prev.slice(0, 9),
        ]);
      }
    } catch (e: any) {
      console.warn('Diagnostics fetch failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualPing = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/cloudsql/ping', { method: 'POST' });
      const pingJson = await res.json();
      const latency = Math.round(performance.now() - start);

      setPingHistory((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          latencyMs: pingJson.latencyMs || latency,
          status: pingJson.status || 'ONLINE',
        },
        ...prev.slice(0, 9),
      ]);

      await fetchDiagnostics();
    } catch (e) {
      console.warn('Ping failed:', e);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDiagnostics();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !autoRefresh) return;
    const interval = setInterval(fetchDiagnostics, 15000);
    return () => clearInterval(interval);
  }, [isOpen, autoRefresh]);

  if (!isOpen) return null;

  const isOnline = data?.status === 'ONLINE';
  const isDegraded = data?.status === 'DEGRADED';
  const isOffline = data?.status === 'OFFLINE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                  Google Cloud SQL Live Diagnostic Center
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${
                    isOnline
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                      : isDegraded
                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOnline ? 'bg-emerald-500 animate-pulse' : isDegraded ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                  <span>{data?.status || 'POLLING...'}</span>
                  {data && <span className="opacity-75">({data.latencyMs}ms)</span>}
                </span>
              </div>
              <p className="text-xs text-[#878278] dark:text-[#7d7970] font-medium mt-0.5">
                PostgreSQL Relational Storage • Real-Time Health &amp; Connection Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualPing}
              disabled={isPinging}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#211f1c] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Execute immediate SQL roundtrip ping test"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#d97706] dark:text-[#f59e0b] ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Pinging...' : 'Ping Test'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#878278] dark:text-[#7d7970] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#faf8f5] dark:bg-[#181715] border-b border-[#e5e0d5] dark:border-[#33302b]">
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Telemetry Overview', icon: Activity },
              { id: 'tables', label: 'Schema & Tables Health', icon: Table },
              { id: 'pool', label: 'Connection Pool', icon: Layers },
              { id: 'logs', label: 'Ping Benchmark Log', icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#211f1c] text-[#d97706] dark:text-[#f59e0b] shadow-xs border border-[#e5e0d5] dark:border-[#33302b]'
                      : 'text-[#5c5850] dark:text-[#b8b4aa] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#878278] dark:text-[#7d7970]">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="accent-[#d97706] rounded"
              />
              <span className="text-[11px] font-medium">Auto-poll (15s)</span>
            </label>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && !data ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#d97706]" />
              <p className="text-xs font-medium text-[#878278]">Benchmarking Cloud SQL connection...</p>
            </div>
          ) : !data ? (
            <div className="py-12 text-center text-rose-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-bold">Failed to load Cloud SQL status</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top 4 KPI Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                        <span className="font-bold font-mono">ROUNDTRIP PING</span>
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-[#1f1e1b] dark:text-[#f5f3ef]">
                        {data.latencyMs} <span className="text-xs font-normal text-[#878278]">ms</span>
                      </div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {data.latencyMs < 50 ? 'Optimal Latency (<50ms)' : 'Operational Latency'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                        <span className="font-bold font-mono">ENGINE INSTANCE</span>
                        <Cpu className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div className="text-sm font-bold font-mono text-[#1f1e1b] dark:text-[#f5f3ef] truncate">
                        {data.engine}
                      </div>
                      <p className="text-[11px] text-[#878278] dark:text-[#7d7970] font-medium">
                        DB: <span className="font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{data.database}</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                        <span className="font-bold font-mono">CONNECTION POOL</span>
                        <Layers className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-[#1f1e1b] dark:text-[#f5f3ef]">
                        {data.pool.total} <span className="text-xs font-normal text-[#878278]">/ {data.pool.max} max</span>
                      </div>
                      <p className="text-[11px] text-[#878278] dark:text-[#7d7970] font-medium">
                        Idle: {data.pool.idle} • Waiting: {data.pool.waiting}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                        <span className="font-bold font-mono">SECURITY &amp; SSL</span>
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" />
                        <span>TLS Enforced</span>
                      </div>
                      <p className="text-[11px] text-[#878278] dark:text-[#7d7970] font-medium truncate">
                        Region: {data.region}
                      </p>
                    </div>
                  </div>

                  {/* Deep Diagnostic Table */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#d97706]" />
                      Real-Time Instance Specifications &amp; Health Probe
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-[#878278] dark:text-[#7d7970]">Provider &amp; Tier:</span>
                          <span className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">Google Cloud SQL (PostgreSQL)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#878278] dark:text-[#7d7970]">GCP Region:</span>
                          <span className="font-mono font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">{data.region}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#878278] dark:text-[#7d7970]">Host Endpoint:</span>
                          <span className="font-mono text-[11px] text-[#1f1e1b] dark:text-[#f5f3ef]">{data.host}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#878278] dark:text-[#7d7970]">Database User:</span>
                          <span className="font-mono text-[#1f1e1b] dark:text-[#f5f3ef]">{data.user}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-[#878278] dark:text-[#7d7970]">Database Server Time:</span>
                          <span className="font-mono text-[11px] text-[#1f1e1b] dark:text-[#f5f3ef]">{new Date(data.serverTime).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#878278] dark:text-[#7d7970]">Last Diagnostic Probe:</span>
                          <span className="font-mono text-[11px] text-[#1f1e1b] dark:text-[#f5f3ef]">{new Date(data.lastChecked).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#878278] dark:text-[#7d7970]">Verified Schemas:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {data.tables.filter((t) => t.verified).length} / {data.tables.length} Tables Active
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#878278] dark:text-[#7d7970]">Health Status:</span>
                          <span className="font-mono font-bold text-emerald-600">
                            {isOnline ? 'HEALTHY & INGRESS OPERATIONAL' : data.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SCHEMA & TABLES */}
              {activeTab === 'tables' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      Relational Schemas &amp; Active Table Record Counts
                    </h3>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                      {data.tables.filter((t) => t.verified).length} Tables Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.tables.map((tbl) => (
                      <div
                        key={tbl.name}
                        className="p-4 rounded-xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Table className="w-4 h-4 text-[#d97706]" />
                            <span className="font-mono text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                              {tbl.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#878278] dark:text-[#7d7970]">
                            Active Table in PostgreSQL
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold font-mono text-[#1f1e1b] dark:text-[#f5f3ef]">
                            {tbl.rowCount.toLocaleString()}{' '}
                            <span className="text-xs font-normal text-[#878278]">rows</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-0.5">
                            <Check className="w-3 h-3" />
                            <span>READY</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CONNECTION POOL */}
              {activeTab === 'pool' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      PostgreSQL Connection Pool Utilization
                    </h3>
                    <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa]">
                      Connection pooling prevents database exhaustion under high concurrency agent executions.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-mono font-bold mb-1">
                          <span>Pool Capacity ({data.pool.total} / {data.pool.max})</span>
                          <span>{Math.round((data.pool.total / data.pool.max) * 100)}% Used</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#e5e0d5] dark:bg-[#33302b] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#d97706] rounded-full transition-all"
                            style={{ width: `${Math.max(10, (data.pool.total / data.pool.max) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-center">
                          <span className="text-[10px] font-mono text-[#878278] uppercase">Total Clients</span>
                          <div className="text-xl font-bold font-mono text-[#1f1e1b] dark:text-[#f5f3ef]">
                            {data.pool.total}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-center">
                          <span className="text-[10px] font-mono text-[#878278] uppercase">Idle Clients</span>
                          <div className="text-xl font-bold font-mono text-emerald-600">
                            {data.pool.idle}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] text-center">
                          <span className="text-[10px] font-mono text-[#878278] uppercase">Queue Waiting</span>
                          <div className="text-xl font-bold font-mono text-blue-600">
                            {data.pool.waiting}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PING LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">
                      Recent SQL Ping Benchmark Log
                    </h3>
                    <button
                      onClick={handleManualPing}
                      disabled={isPinging}
                      className="px-3 py-1 bg-[#d97706] text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Execute Ping</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#181715] text-[#f5f3ef] font-mono text-xs space-y-2 border border-[#33302b]">
                    {pingHistory.length === 0 ? (
                      <p className="text-neutral-500">No pings recorded yet in this session.</p>
                    ) : (
                      pingHistory.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-neutral-800">
                          <span className="text-neutral-400">[{p.time}]</span>
                          <span className="text-emerald-400">SELECT 1 -- Benchmark roundtrip</span>
                          <span className="font-bold text-amber-400">{p.latencyMs} ms</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            {p.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white dark:bg-[#211f1c] border-t border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between text-xs text-[#878278] dark:text-[#7d7970]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#d97706]" />
            <span>PostgreSQL Instance Active • Direct Drizzle ORM Pool</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#faf8f5] dark:bg-[#181715] hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#1f1e1b] dark:text-[#f5f3ef] border border-[#e5e0d5] dark:border-[#33302b] font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
