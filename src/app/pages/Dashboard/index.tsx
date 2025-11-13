import React, { useState } from 'react';
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
import { ConnectedIcon, DisconnectedIcon, SyncIcon } from '@patternfly/react-icons';
import { useDashboard } from '../../../context/DashboardContext';
import SummaryCards from '../../../components/SummaryCards';
import JobActivityGraph from '../../../components/JobActivityGraph';
import JobsTable from '../../../components/JobsTable';
import BatchesTable from '../../../components/BatchesTable';
import OshScansTable from '../../../components/OshScansTable';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | number>('jobs');
  const { isWebSocketConnected, error, loading, refetchAll } = useDashboard();
  const [showAlert, setShowAlert] = useState(true);

  return (
    <>
      <PageSection variant="light">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title headingLevel="h1" size="2xl">
            SAST AI Monitoring Dashboard
          </Title>
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
        <SummaryCards />
      </PageSection>

      <PageSection>
        <JobActivityGraph />
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
            title={<TabTitleText>Jobs</TabTitleText>}
            aria-label="Jobs tab"
          >
            <div style={{ paddingTop: 'var(--pf-v5-global--spacer--md)' }}>
              <JobsTable />
            </div>
          </Tab>
          <Tab
            eventKey="batches"
            title={<TabTitleText>Batches</TabTitleText>}
            aria-label="Batches tab"
          >
            <div style={{ paddingTop: 'var(--pf-v5-global--spacer--md)' }}>
              <BatchesTable />
            </div>
          </Tab>
          <Tab
            eventKey="osh"
            title={<TabTitleText>OSH Scans</TabTitleText>}
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
