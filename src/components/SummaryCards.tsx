import React from 'react';
import {
  Gallery,
  Card,
  CardTitle,
  CardBody,
  Label,
  Spinner
} from '@patternfly/react-core';
import { useDashboard } from '../context/DashboardContext';

const SummaryCards: React.FC = () => {
  const { summary, loading } = useDashboard();

  if (loading || !summary) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <Gallery hasGutter minWidths={{ default: '250px' }}>
      <Card>
        <CardTitle>Jobs</CardTitle>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>Total: <Label color="blue">{summary.totalJobs}</Label></div>
            <div>Running: <Label color="cyan">{summary.runningJobs}</Label></div>
            <div>Pending: <Label color="grey">{summary.pendingJobs}</Label></div>
            <div>Completed: <Label color="green">{summary.completedJobs}</Label></div>
            <div>Failed: <Label color="red">{summary.failedJobs}</Label></div>
            <div>Cancelled: <Label color="orange">{summary.cancelledJobs}</Label></div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardTitle>Batches</CardTitle>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>Total: <Label color="blue">{summary.totalBatches}</Label></div>
            <div>Processing: <Label color="cyan">{summary.processingBatches}</Label></div>
            <div>Completed: <Label color="green">{summary.completedBatches}</Label></div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardTitle>OSH Scans</CardTitle>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>Total: <Label color="blue">{summary.totalOshScans}</Label></div>
            <div>Collected: <Label color="green">{summary.collectedOshScans}</Label></div>
            <div>Uncollected: <Label color="orange">{summary.uncollectedOshScans}</Label></div>
          </div>
        </CardBody>
      </Card>
    </Gallery>
  );
};

export default SummaryCards;

