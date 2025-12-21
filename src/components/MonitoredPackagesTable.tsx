import React, { useState, useMemo, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, ThProps } from '@patternfly/react-table';
import {
  Label,
  Pagination,
  PaginationVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Spinner,
  Button
} from '@patternfly/react-core';
import { SyncIcon } from '@patternfly/react-icons';
import { MonitoredPackageWithScans } from '../types';
import orchestratorApi from '../services/orchestratorApi';
import { formatDateTime } from '../utils/statusHelpers';

const MonitoredPackagesTable: React.FC = () => {
  const [packages, setPackages] = useState<MonitoredPackageWithScans[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filter, setFilter] = useState('');
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0); // Default: sort by package name
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await orchestratorApi.getMonitoredPackagesWithScans();
      setPackages(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching monitored packages:', err);
      setError('Failed to load monitored packages');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReload = async () => {
    try {
      setReloading(true);
      await orchestratorApi.reloadMonitoredPackages();
      await fetchPackages();
    } catch (err) {
      console.error('Error reloading packages:', err);
      setError('Failed to reload monitored packages');
    } finally {
      setReloading(false);
    }
  };

  const filteredPackages = useMemo(() => {
    if (!Array.isArray(packages)) {
      return [];
    }
    return packages.filter(pkg =>
      !filter || pkg.packageName.toLowerCase().includes(filter.toLowerCase())
    );
  }, [packages, filter]);

  const sortedPackages = useMemo(() => {
    const sorted = [...filteredPackages];

    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (activeSortIndex) {
        case 0: // Package name
          compareValue = a.packageName.localeCompare(b.packageName);
          break;
        case 1: // OSH scan count
          compareValue = a.oshScanCount - b.oshScanCount;
          break;
        case 2: // Last scan date
          const dateA = a.lastOshScanDate ? new Date(a.lastOshScanDate).getTime() : 0;
          const dateB = b.lastOshScanDate ? new Date(b.lastOshScanDate).getTime() : 0;
          compareValue = dateA - dateB;
          break;
        case 3: // Completed scans
          compareValue = a.completedOshScans - b.completedOshScans;
          break;
        case 4: // Failed scans
          compareValue = a.failedOshScans - b.failedOshScans;
          break;
      }

      return activeSortDirection === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }, [filteredPackages, activeSortIndex, activeSortDirection]);

  const paginatedPackages = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedPackages.slice(start, start + perPage);
  }, [sortedPackages, page, perPage]);

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const onSetPage = (_event: any, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: any, newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Spinner size="lg" />
        <div style={{ marginTop: '1rem' }}>Loading monitored packages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput
              placeholder="Filter by package name"
              value={filter}
              onChange={(_event, value) => setFilter(value)}
              onClear={() => setFilter('')}
            />
          </ToolbarItem>
          <ToolbarItem>
            <Button
              variant="secondary"
              onClick={handleReload}
              isDisabled={reloading || loading}
              icon={<SyncIcon />}
            >
              {reloading ? 'Reloading...' : 'Reload Packages'}
            </Button>
          </ToolbarItem>
          <ToolbarItem align={{ default: 'alignRight' }}>
            <Pagination
              itemCount={sortedPackages.length}
              page={page}
              perPage={perPage}
              onSetPage={onSetPage}
              onPerPageSelect={onPerPageSelect}
              variant={PaginationVariant.top}
              perPageOptions={[
                { title: '10', value: 10 },
                { title: '20', value: 20 },
                { title: '50', value: 50 },
                { title: '100', value: 100 }
              ]}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table variant="compact" aria-label="Monitored packages table" isStickyHeader>
        <Thead>
          <Tr>
            <Th sort={getSortParams(0)}>Package Name</Th>
            <Th sort={getSortParams(1)}>OSH Scan Count</Th>
            <Th sort={getSortParams(2)}>Last Scan Date</Th>
            <Th sort={getSortParams(3)}>Completed Scans</Th>
            <Th sort={getSortParams(4)}>Failed Scans</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedPackages.length === 0 ? (
            <Tr>
              <Td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                {filter ? 'No packages match your filter' : 'No monitored packages found'}
              </Td>
            </Tr>
          ) : (
            paginatedPackages.map(pkg => (
              <Tr key={pkg.packageName}>
                <Td>
                  {pkg.packageName}
                </Td>
                <Td>
                  {pkg.oshScanCount > 0 ? (
                    <Label color="blue">{pkg.oshScanCount}</Label>
                  ) : (
                    <span style={{ color: '#6a6e73' }}>0</span>
                  )}
                </Td>
                <Td>
                  {pkg.lastOshScanDate ? (
                    formatDateTime(pkg.lastOshScanDate)
                  ) : (
                    <span style={{ color: '#6a6e73' }}>Never</span>
                  )}
                </Td>
                <Td>
                  {pkg.completedOshScans > 0 ? (
                    <Label color="green">{pkg.completedOshScans}</Label>
                  ) : (
                    <span style={{ color: '#6a6e73' }}>0</span>
                  )}
                </Td>
                <Td>
                  {pkg.failedOshScans > 0 ? (
                    <Label color="red">{pkg.failedOshScans}</Label>
                  ) : (
                    <span style={{ color: '#6a6e73' }}>0</span>
                  )}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      <Toolbar>
        <ToolbarContent>
          <ToolbarItem align={{ default: 'alignRight' }}>
            <Pagination
              itemCount={sortedPackages.length}
              page={page}
              perPage={perPage}
              onSetPage={onSetPage}
              onPerPageSelect={onPerPageSelect}
              variant={PaginationVariant.bottom}
              perPageOptions={[
                { title: '10', value: 10 },
                { title: '20', value: 20 },
                { title: '50', value: 50 },
                { title: '100', value: 100 }
              ]}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </>
  );
};

export default MonitoredPackagesTable;
