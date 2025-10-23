import { JobStatus, BatchStatus } from '../types';

export function getJobStatusColor(status: JobStatus): 'green' | 'blue' | 'teal' | 'red' | 'orange' | 'grey' {
  switch (status) {
    case 'COMPLETED':
      return 'green';
    case 'RUNNING':
      return 'blue';
    case 'SCHEDULED':
      return 'teal';
    case 'FAILED':
      return 'red';
    case 'CANCELLED':
      return 'orange';
    case 'PENDING':
    default:
      return 'grey';
  }
}

export function getBatchStatusColor(status: BatchStatus): 'green' | 'blue' | 'red' | 'orange' | 'grey' {
  switch (status) {
    case 'COMPLETED':
      return 'green';
    case 'PROCESSING':
      return 'blue';
    case 'COMPLETED_WITH_ERRORS':
      return 'orange';
    case 'FAILED':
      return 'red';
    case 'CANCELLED':
    case 'COMPLETED_EMPTY':
    default:
      return 'grey';
  }
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    return dateString;
  }
}

export function calculateDuration(startTime: string | null, endTime: string | null): string {
  if (!startTime || !endTime) return '-';
  
  try {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;
    
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  } catch (error) {
    return '-';
  }
}

