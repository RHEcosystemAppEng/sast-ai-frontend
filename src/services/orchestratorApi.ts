import axios, { AxiosInstance } from 'axios';
import { Job, JobBatch, OshScanWithJob, DashboardSummary, JobActivityDataPoint, TimePeriod, MonitoredPackageWithScans } from '../types';
import { config } from '../config';

class OrchestratorApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Jobs
  async getJobs(params?: { packageName?: string; status?: string; page?: number; size?: number }): Promise<Job[]> {
    const response = await this.client.get<Job[]>('/jobs', { params });
    return response.data;
  }

  async getJobById(jobId: number): Promise<Job> {
    const response = await this.client.get<Job>(`/jobs/${jobId}`);
    return response.data;
  }

  // Batches
  async getBatches(params?: { page?: number; size?: number }): Promise<JobBatch[]> {
    const response = await this.client.get<JobBatch[]>('/job-batches', { params });
    return response.data;
  }

  async getBatchById(batchId: number): Promise<JobBatch> {
    const response = await this.client.get<JobBatch>(`/job-batches/${batchId}`);
    return response.data;
  }

  // OSH Scans
  async getOshStatus(): Promise<any> {
    try {
      const response = await this.client.get('/admin/osh/status');
      return response.data;
    } catch (error) {
      console.error('OSH status endpoint not available:', error);
      return null;
    }
  }

  async getOshScans(params?: { page?: number; size?: number; status?: 'COLLECTED' | 'UNCOLLECTED' }): Promise<OshScanWithJob[]> {
    try {
      const response = await this.client.get<OshScanWithJob[]>('/admin/osh/scans/all', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch OSH scans:', error);
      return [];
    }
  }

  // Summary (aggregate from multiple endpoints)
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      // Fetch jobs to calculate statistics
      const jobs = await this.getJobs({ size: 1000 }); // Get recent jobs
      const batches = await this.getBatches({ size: 1000 });

      const summary: DashboardSummary = {
        totalJobs: jobs.length,
        pendingJobs: jobs.filter(j => j.status === 'PENDING').length,
        runningJobs: jobs.filter(j => j.status === 'RUNNING').length,
        completedJobs: jobs.filter(j => j.status === 'COMPLETED').length,
        failedJobs: jobs.filter(j => j.status === 'FAILED').length,
        cancelledJobs: jobs.filter(j => j.status === 'CANCELLED').length,
        totalBatches: batches.length,
        processingBatches: batches.filter(b => b.status === 'PROCESSING').length,
        completedBatches: batches.filter(b => b.status === 'COMPLETED' || b.status === 'COMPLETED_WITH_ERRORS').length,
        totalOshScans: jobs.filter(j => j.oshScanId).length,
        collectedOshScans: jobs.filter(j => j.oshScanId && j.status !== 'FAILED').length,
        uncollectedOshScans: 0 // Will be calculated from OSH API later
      };

      return summary;
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error);
      throw error;
    }
  }

  async getHealth(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }

  async getJobActivity(timePeriod: TimePeriod = '24h'): Promise<JobActivityDataPoint[]> {
    try {
      const response = await this.client.get<JobActivityDataPoint[]>(`/jobs/activity/${timePeriod}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch job activity:', error);
      return [];
    }
  }

  async getMonitoredPackagesWithScans(): Promise<MonitoredPackageWithScans[]> {
    try {
      const response = await this.client.get<MonitoredPackageWithScans[]>('/packages/monitored-with-scans');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch monitored packages with scans:', error);
      throw error;
    }
  }
}

const orchestratorApiInstance = new OrchestratorApi();
export default orchestratorApiInstance;

