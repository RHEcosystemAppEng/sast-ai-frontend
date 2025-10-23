export type JobStatus = 'PENDING' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type BatchStatus = 'PROCESSING' | 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'COMPLETED_EMPTY' | 'FAILED' | 'CANCELLED';

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

