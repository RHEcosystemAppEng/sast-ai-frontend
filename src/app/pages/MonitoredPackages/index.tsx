import React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import MonitoredPackagesTable from '../../../components/MonitoredPackagesTable';

const MonitoredPackagesPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageSection variant="light" style={{ flexShrink: 0 }}>
        <Title headingLevel="h1" size="2xl">
          Monitored Packages
        </Title>
      </PageSection>

      <PageSection style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <MonitoredPackagesTable />
      </PageSection>
    </div>
  );
};

export default MonitoredPackagesPage;
