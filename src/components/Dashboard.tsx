import React, { useState } from 'react';
import {
  Page,
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
import { useDashboard } from '../context/DashboardContext';
import SummaryCards from './SummaryCards';
import JobsTable from './JobsTable';
import BatchesTable from './BatchesTable';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | number>('jobs');
  const { isWebSocketConnected, error, loading, refetchAll } = useDashboard();
  const [showAlert, setShowAlert] = useState(true);

  return (
    <Page>
      <PageSection variant="default">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title headingLevel="h1" size="2xl">
            SAST AI Monitoring Dashboard
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button 
              variant="secondary" 
              icon={<SyncIcon />}
              onClick={refetchAll}
              isLoading={loading}
            >
              Refresh
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            <div style={{ paddingTop: '1rem' }}>
              <JobsTable />
            </div>
          </Tab>
          <Tab 
            eventKey="batches" 
            title={<TabTitleText>Batches</TabTitleText>}
            aria-label="Batches tab"
          >
            <div style={{ paddingTop: '1rem' }}>
              <BatchesTable />
            </div>
          </Tab>
        </Tabs>
      </PageSection>
    </Page>
  );
};

export default Dashboard;

