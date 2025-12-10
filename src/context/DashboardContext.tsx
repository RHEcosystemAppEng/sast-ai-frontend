import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import orchestratorApi from '../services/orchestratorApi';
import { Job, JobBatch, OshScanWithJob, DashboardSummary, WebSocketMessage, WS_MESSAGE_TYPES, JobActivityDataPoint, TimePeriod } from '../types';
import { config } from '../config';

interface DashboardContextType {
  jobs: Job[];
  batches: JobBatch[];
  oshScans: OshScanWithJob[];
  summary: DashboardSummary | null;
  jobActivity: JobActivityDataPoint[];
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
  isWebSocketConnected: boolean;
  loading: boolean;
  error: string | null;
  refetchAll: () => void;
  lastUpdated: Date | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [batches, setBatches] = useState<JobBatch[]>([]);
  const [oshScans, setOshScans] = useState<OshScanWithJob[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [jobActivity, setJobActivity] = useState<JobActivityDataPoint[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchJobActivity = useCallback(async (period: TimePeriod) => {
    try {
      const activityData = await orchestratorApi.getJobActivity(period);
      setJobActivity(activityData);
    } catch (err) {
      console.error('Failed to fetch job activity:', err);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, batchesData, oshScansData, summaryData, activityData] = await Promise.all([
        orchestratorApi.getJobs({ size: 200 }),
        orchestratorApi.getBatches({ size: 200 }),
        orchestratorApi.getOshScans({ size: 200 }),
        orchestratorApi.getDashboardSummary(),
        orchestratorApi.getJobActivity(timePeriod)
      ]);

      setJobs(jobsData);
      setBatches(batchesData);
      setOshScans(oshScansData);
      setSummary(summaryData);
      setJobActivity(activityData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError('Failed to load dashboard data. Please check if the orchestrator is running.');
    } finally {
      setLoading(false);
    }
  }, [timePeriod]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchJobActivity(timePeriod);
  }, [timePeriod, fetchJobActivity]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('Processing WebSocket message:', message);

    switch (message.type) {
      case WS_MESSAGE_TYPES.JOB_STATUS_CHANGE:
        setJobs(prev => {
          const index = prev.findIndex(j => j.jobId === message.data.jobId);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = message.data;
            return updated;
          }
          return [message.data, ...prev].slice(0, 100);
        });

        setSummary(prev => {
          if (!prev) return prev;
          return { ...prev };
        });
        setLastUpdated(new Date());
        break;

      case WS_MESSAGE_TYPES.BATCH_PROGRESS:
        setBatches(prev => {
          const index = prev.findIndex(b => b.batchId === message.data.batchId);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = message.data;
            return updated;
          }
          return [message.data, ...prev].slice(0, 100);
        });
        setLastUpdated(new Date());
        break;

      case WS_MESSAGE_TYPES.SUMMARY_UPDATE:
        setSummary(message.data);
        setLastUpdated(new Date());
        break;

      case WS_MESSAGE_TYPES.OSH_SCAN_COLLECTED:
        if (message.data.job) {
          setJobs(prev => [message.data.job, ...prev].slice(0, 100));
        }
        setLastUpdated(new Date());
        break;

      case WS_MESSAGE_TYPES.OSH_SCAN_FAILED:
        console.warn('OSH scan failed:', message.data);
        break;

      case WS_MESSAGE_TYPES.CONNECTED:
        console.log('WebSocket connection confirmed:', message.data);
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }, []);

  const { isConnected: isWebSocketConnected } = useWebSocket({
    url: config.wsUrl,
    onMessage: handleWebSocketMessage
  });

  return (
    <DashboardContext.Provider
      value={{
        jobs,
        batches,
        oshScans,
        summary,
        jobActivity,
        timePeriod,
        setTimePeriod,
        isWebSocketConnected,
        loading,
        error,
        refetchAll: fetchInitialData,
        lastUpdated
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

