import { JobStatus, BatchStatus } from '../types';

export function getJobStatusColor(status: JobStatus): 'green' | 'blue' | 'cyan' | 'red' | 'orange' | 'grey' {
  switch (status) {
    case 'COMPLETED':
      return 'green';
    case 'RUNNING':
      return 'blue';
    case 'SCHEDULED':
      return 'cyan';
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

export function formatRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

  if (diffSeconds < 0) {
    return 'just now';
  }

  if (diffSeconds < 60) {
    return `${diffSeconds} ${diffSeconds === 1 ? 'second' : 'seconds'} ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
}

