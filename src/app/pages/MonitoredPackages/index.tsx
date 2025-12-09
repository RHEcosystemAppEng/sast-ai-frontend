import React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import MonitoredPackagesList from '../../../components/MonitoredPackagesList';

const MonitoredPackagesPage: React.FC = () => {
  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1" size="2xl">
          Monitored Packages
        </Title>
      </PageSection>

      <PageSection>
        <MonitoredPackagesList />
      </PageSection>
    </>
  );
};

export default MonitoredPackagesPage;
