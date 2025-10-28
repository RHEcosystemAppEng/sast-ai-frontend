import React, { useState, useMemo } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import {
  Label,
  Button,
  Pagination,
  PaginationVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useDashboard } from '../context/DashboardContext';
import { formatDateTime } from '../utils/statusHelpers';

const OshScansTable: React.FC = () => {
  const { oshScans } = useDashboard();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [filter, setFilter] = useState('');

  const filteredScans = useMemo(() => {
    return oshScans.filter(scan =>
      !filter || 
      scan.packageName?.toLowerCase().includes(filter.toLowerCase()) ||
      scan.oshScanId?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [oshScans, filter]);

  const paginatedScans = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredScans.slice(start, start + perPage);
  }, [filteredScans, page, perPage]);

  const getStatusColor = (status: string): 'green' | 'orange' => {
    return status === 'COLLECTED' ? 'green' : 'orange';
  };

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput
              placeholder="Filter by package name or scan ID"
              value={filter}
              onChange={(_event, value) => setFilter(value)}
              onClear={() => setFilter('')}
            />
          </ToolbarItem>
          <ToolbarItem align={{ default: 'alignRight' }}>
            <Pagination
              itemCount={filteredScans.length}
              page={page}
              perPage={perPage}
              onSetPage={(_event, newPage) => setPage(newPage)}
              onPerPageSelect={(_event, newPerPage) => {
                setPerPage(newPerPage);
                setPage(1);
              }}
              variant={PaginationVariant.top}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table variant="compact" aria-label="OSH Scans table">
        <Thead>
          <Tr>
            <Th>OSH Scan ID</Th>
            <Th>Package</Th>
            <Th>NVR</Th>
            <Th>Status</Th>
            <Th>Associated Job</Th>
            <Th>Retry Info</Th>
            <Th>Processed At</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedScans.map(scan => (
            <Tr key={scan.oshScanId}>
              <Td>{scan.oshScanId}</Td>
              <Td>{scan.packageName}</Td>
              <Td>{scan.packageNvr}</Td>
              <Td>
                <Label color={getStatusColor(scan.status)}>
                  {scan.status}
                </Label>
              </Td>
              <Td>
                {scan.associatedJob ? (
                  <div>
                    Job #{scan.associatedJob.jobId}
                    {scan.associatedJob.tektonUrl && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        component="a" 
                        href={scan.associatedJob.tektonUrl} 
                        target="_blank"
                        icon={<ExternalLinkAltIcon />}
                        iconPosition="end"
                      >
                        Tekton
                      </Button>
                    )}
                  </div>
                ) : (
                  '-'
                )}
              </Td>
              <Td>
                {scan.retryInfo ? (
                  <div style={{ fontSize: '0.875rem' }}>
                    <div>Attempts: {scan.retryInfo.retryAttempts}/{scan.retryInfo.maxRetries}</div>
                    <div>Reason: {scan.retryInfo.failureReason}</div>
                  </div>
                ) : (
                  '-'
                )}
              </Td>
              <Td>{formatDateTime(scan.processedAt)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Pagination
        itemCount={filteredScans.length}
        page={page}
        perPage={perPage}
        onSetPage={(_event, newPage) => setPage(newPage)}
        onPerPageSelect={(_event, newPerPage) => {
          setPerPage(newPerPage);
          setPage(1);
        }}
        variant={PaginationVariant.bottom}
      />
    </>
  );
};

export default OshScansTable;

