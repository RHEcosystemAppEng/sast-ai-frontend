export type JobStatus = 'PENDING' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type BatchStatus = 'PROCESSING' | 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'COMPLETED_EMPTY' | 'FAILED' | 'CANCELLED';
export type TimePeriod = '1h' | '6h' | '12h' | '24h' | '7d' | '30d';

export interface Job {
  jobId: number;
  packageName: string;
  packageNvr: string;
  sourceCodeUrl: string;
  status: JobStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  tektonUrl: string | null;
  batchId: number | null;
  projectName: string;
  projectVersion: string;
  oshScanId: string | null;
  jiraLink: string | null;
  hostname: string | null;
  submittedBy: string;
}

export interface JobBatch {
  batchId: number;
  batchGoogleSheetUrl: string;
  submittedBy: string;
  submittedAt: string;
  status: BatchStatus;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
}

export interface OshScanWithJob {
  oshScanId: string;
  packageName: string;
  packageNvr: string;
  status: 'COLLECTED' | 'UNCOLLECTED';
  associatedJob: Job | null;
  retryInfo: {
    retryAttempts: number;
    maxRetries: number;
    failureReason: string;
    lastAttemptAt: string;
  } | null;
  processedAt: string;
}

export interface DashboardSummary {
  totalJobs: number;
  pendingJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  cancelledJobs: number;
  totalBatches: number;
  processingBatches: number;
  completedBatches: number;
  totalOshScans: number;
  collectedOshScans: number;
  uncollectedOshScans: number;
}

export interface JobActivityDataPoint {
  timestamp: string;
  running: number;
  pending: number;
  completed: number;
  failed: number;
}

export interface MonitoredPackagesResponse {
  packages: string[];
  oshEnabled: boolean;
  totalPackages: number;
  packagesFilePath: string;
}

export const TIME_PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '12h', label: '12 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export const getTimePeriodLabel = (timePeriod: TimePeriod): string => {
  const option = TIME_PERIOD_OPTIONS.find(opt => opt.value === timePeriod);
  return option ? option.label : '24 Hours';
};

export const WS_MESSAGE_TYPES = {
  CONNECTED: 'connected',
  PONG: 'pong',
  JOB_STATUS_CHANGE: 'job_status_change',
  BATCH_PROGRESS: 'batch_progress',
  OSH_SCAN_COLLECTED: 'osh_scan_collected',
  OSH_SCAN_FAILED: 'osh_scan_failed',
  SUMMARY_UPDATE: 'summary_update',
} as const;

export type WebSocketMessageType = typeof WS_MESSAGE_TYPES[keyof typeof WS_MESSAGE_TYPES];

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
}

