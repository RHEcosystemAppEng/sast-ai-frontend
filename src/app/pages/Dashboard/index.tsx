import React, { useState, useEffect } from 'react';
import {
  PageSection,
  Title,
  Tabs,
  Tab,
  TabTitleText,
  Alert,
  AlertVariant,
  AlertActionCloseButton,
  Button
} from '@patternfly/react-core';
import { ConnectedIcon, DisconnectedIcon, SyncIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useDashboard } from '../../../context/DashboardContext';
import SummaryCards from '../../../components/SummaryCards';
import JobActivityGraph from '../../../components/JobActivityGraph';
import JobsTable from '../../../components/JobsTable';
import BatchesTable from '../../../components/BatchesTable';
import OshScansTable from '../../../components/OshScansTable';
import { formatRelativeTime } from '../../../utils/statusHelpers';
import { config } from '../../../config';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | number>('jobs');
  const { isWebSocketConnected, error, loading, refetchAll, lastUpdated } = useDashboard();
  const [showAlert, setShowAlert] = useState(true);
  const [, setTick] = useState(0);

  // Update the relative time display every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <PageSection variant="light">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title headingLevel="h1" size="2xl">
              SAST AI Monitoring Dashboard
            </Title>
            {config.grafanaUrl && (
              <Button
                variant="link"
                component="a"
                href={config.grafanaUrl}
                target="_blank"
                icon={<ExternalLinkAltIcon />}
                iconPosition="end"
                isInline
                style={{ paddingLeft: 0, marginTop: 'var(--pf-v5-global--spacer--xs)' }}
              >
                View Grafana Dashboard
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--md)' }}>
            <Button
              variant="secondary"
              icon={<SyncIcon />}
              onClick={refetchAll}
              isLoading={loading}
            >
              Refresh
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
              {isWebSocketConnected ? (
                <>
                  <ConnectedIcon color="var(--pf-v5-global--success-color--100)" />
                  <span style={{ color: 'var(--pf-v5-global--success-color--100)' }}>Live</span>
                </>
              ) : (
                <>
                  <DisconnectedIcon color="var(--pf-v5-global--warning-color--100)" />
                  <span style={{ color: 'var(--pf-v5-global--warning-color--100)' }}>Reconnecting...</span>
                </>
              )}
              {lastUpdated && (
                <>
                  <span style={{ color: 'var(--pf-v5-global--Color--200)' }}>•</span>
                  <span style={{ color: 'var(--pf-v5-global--Color--200)', fontSize: '0.875rem' }}>
                    Updated {formatRelativeTime(lastUpdated)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </PageSection>

      {error && showAlert && (
        <PageSection>
          <Alert
            variant={AlertVariant.danger}
            title="Connection Error"
            actionClose={<AlertActionCloseButton onClose={() => setShowAlert(false)} />}
          >
            {error}
          </Alert>
        </PageSection>
      )}

      {!isWebSocketConnected && !error && showAlert && (
        <PageSection>
          <Alert
            variant={AlertVariant.warning}
            title="WebSocket disconnected"
            actionClose={<AlertActionCloseButton onClose={() => setShowAlert(false)} />}
          >
            Real-time updates temporarily unavailable. Attempting to reconnect...
          </Alert>
        </PageSection>
      )}

      <PageSection>
        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'stretch',
          justifyContent: 'flex-start'
        }}>
          <div style={{ flex: '0 0 auto', display: 'flex' }}>
            <SummaryCards />
          </div>
          <div style={{ flex: '1 1 auto', display: 'flex' }}>
            <JobActivityGraph />
          </div>
        </div>
      </PageSection>

      <PageSection>
        <Tabs
          activeKey={activeTab}
          onSelect={(_event, key) => setActiveTab(key)}
          aria-label="Dashboard tabs"
          role="region"
        >
          <Tab
            eventKey="jobs"
            title={<TabTitleText><span style={{ fontWeight: 'bold' }}>Jobs</span></TabTitleText>}
            aria-label="Jobs tab"
          >
            <div style={{ paddingTop: 'var(--pf-v5-global--spacer--md)' }}>
              <JobsTable />
            </div>
          </Tab>
          <Tab
            eventKey="batches"
            title={<TabTitleText><span style={{ fontWeight: 'bold' }}>Batches</span></TabTitleText>}
            aria-label="Batches tab"
          >
            <div style={{ paddingTop: 'var(--pf-v5-global--spacer--md)' }}>
              <BatchesTable />
            </div>
          </Tab>
          <Tab
            eventKey="osh"
            title={<TabTitleText><span style={{ fontWeight: 'bold' }}>OSH Scans</span></TabTitleText>}
            aria-label="OSH Scans tab"
          >
            <div style={{ paddingTop: 'var(--pf-v5-global--spacer--md)' }}>
              <OshScansTable />
            </div>
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};

export default DashboardPage;
