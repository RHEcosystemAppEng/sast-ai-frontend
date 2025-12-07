import React from 'react';
import {
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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      width: '100%'
    }}>
      <Card style={{ flex: '0 1 320px' }}>
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

      <Card style={{ flex: '0 1 320px' }}>
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

      <Card style={{ flex: '0 1 320px' }}>
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
    </div>
  );
};

export default SummaryCards;

