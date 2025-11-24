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
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
            <span>Total:</span>
            <Label color="blue">{summary.totalJobs}</Label>
            <span>Running:</span>
            <Label color="cyan">{summary.runningJobs}</Label>
            <span>Pending:</span>
            <Label color="grey">{summary.pendingJobs}</Label>
            <span>Completed:</span>
            <Label color="green">{summary.completedJobs}</Label>
            <span>Failed:</span>
            <Label color="red">{summary.failedJobs}</Label>
            <span>Cancelled:</span>
            <Label color="orange">{summary.cancelledJobs}</Label>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardTitle>Batches</CardTitle>
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
            <span>Total:</span>
            <Label color="blue">{summary.totalBatches}</Label>
            <span>Processing:</span>
            <Label color="cyan">{summary.processingBatches}</Label>
            <span>Completed:</span>
            <Label color="green">{summary.completedBatches}</Label>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardTitle>OSH Scans</CardTitle>
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
            <span>Total:</span>
            <Label color="blue">{summary.totalOshScans}</Label>
            <span>Collected:</span>
            <Label color="green">{summary.collectedOshScans}</Label>
            <span>Uncollected:</span>
            <Label color="orange">{summary.uncollectedOshScans}</Label>
          </div>
        </CardBody>
      </Card>
    </Gallery>
  );
};

export default SummaryCards;

