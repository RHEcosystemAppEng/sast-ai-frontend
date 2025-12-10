import React, { useState, useEffect } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  List,
  ListItem,
  Spinner,
  Alert,
  AlertVariant,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Label,
  EmptyState,
  EmptyStateIcon,
  EmptyStateHeader,
  EmptyStateBody
} from '@patternfly/react-core';
import { PackageIcon, CheckCircleIcon, TimesCircleIcon } from '@patternfly/react-icons';
import orchestratorApi from '../services/orchestratorApi';
import { MonitoredPackagesResponse } from '../types';

const MonitoredPackagesList: React.FC = () => {
  const [data, setData] = useState<MonitoredPackagesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    loadMonitoredPackages();
  }, []);

  const loadMonitoredPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orchestratorApi.getMonitoredPackages();
      setData(response);
    } catch (err) {
      setError('Failed to load monitored packages');
      console.error('Error loading monitored packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = data?.packages.filter(pkg =>
    pkg.toLowerCase().includes(searchValue.toLowerCase())
  ).sort() || [];

  if (loading) {
    return (
      <Card>
        <CardTitle>Monitored Packages</CardTitle>
        <CardBody>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Spinner size="lg" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardTitle>Monitored Packages</CardTitle>
        <CardBody>
          <Alert variant={AlertVariant.danger} title="Error loading packages">
            {error}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardTitle style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Monitored Packages</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {data.oshEnabled ? (
              <Label color="green" icon={<CheckCircleIcon />}>OSH Enabled</Label>
            ) : (
              <Label color="grey" icon={<TimesCircleIcon />}>OSH Disabled</Label>
            )}
            <Label color="blue">{data.totalPackages} packages</Label>
          </div>
        </div>
      </CardTitle>
      <CardBody style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {data.totalPackages === 0 ? (
          <EmptyState>
            <EmptyStateHeader
              titleText="No packages configured"
              icon={<EmptyStateIcon icon={PackageIcon} />}
              headingLevel="h4"
            />
            <EmptyStateBody>
              No packages are currently being monitored. Configure packages in the ConfigMap to enable monitoring.
            </EmptyStateBody>
          </EmptyState>
        ) : (
          <>
            <Toolbar style={{ flexShrink: 0 }}>
              <ToolbarContent>
                <ToolbarItem>
                  <SearchInput
                    placeholder="Search packages..."
                    value={searchValue}
                    onChange={(_event, value) => setSearchValue(value)}
                    onClear={() => setSearchValue('')}
                    style={{ width: '300px' }}
                  />
                </ToolbarItem>
                <ToolbarItem>
                  <span style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                    {searchValue
                      ? `${filteredPackages.length} of ${data.totalPackages} packages`
                      : `${data.totalPackages} packages`}
                  </span>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>

            <div style={{
              flexGrow: 1,
              overflowY: 'auto',
              marginTop: '16px',
              border: '1px solid var(--pf-v5-global--BorderColor--100)',
              borderRadius: 'var(--pf-v5-global--BorderRadius--sm)',
              padding: '8px',
              minHeight: 0
            }}>
              {filteredPackages.length > 0 ? (
                <List isPlain isBordered={false}>
                  {filteredPackages.map((packageName) => (
                    <ListItem key={packageName} icon={<PackageIcon />}>
                      <code style={{
                        fontFamily: 'var(--pf-v5-global--FontFamily--monospace)',
                        fontSize: 'var(--pf-v5-global--FontSize--sm)'
                      }}>
                        {packageName}
                      </code>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <EmptyState variant="sm">
                  <EmptyStateHeader
                    titleText="No matching packages"
                    headingLevel="h5"
                  />
                  <EmptyStateBody>
                    No packages match your search criteria. Try a different search term.
                  </EmptyStateBody>
                </EmptyState>
              )}
            </div>

            {data.packagesFilePath && (
              <div style={{
                marginTop: '16px',
                fontSize: 'var(--pf-v5-global--FontSize--sm)',
                color: 'var(--pf-v5-global--Color--200)',
                flexShrink: 0
              }}>
                Source: <code>{data.packagesFilePath}</code>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default MonitoredPackagesList;
