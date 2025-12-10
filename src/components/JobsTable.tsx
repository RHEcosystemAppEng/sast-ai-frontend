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
import { getJobStatusColor, formatDateTime } from '../utils/statusHelpers';

const JobsTable: React.FC = () => {
  const { jobs } = useDashboard();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filter, setFilter] = useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter(job =>
      !filter || 
      job.packageName?.toLowerCase().includes(filter.toLowerCase()) ||
      job.packageNvr?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [jobs, filter]);

  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredJobs.slice(start, start + perPage);
  }, [filteredJobs, page, perPage]);

  const onSetPage = (_event: any, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: any, newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1); // Reset to first page
  };

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
          <ToolbarItem align={{ default: 'alignRight' }}>
            <Pagination
              itemCount={filteredJobs.length}
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

      <Table variant="compact" aria-label="Jobs table">
        <Thead>
          <Tr>
            <Th>Job ID</Th>
            <Th>Package</Th>
            <Th>Status</Th>
            <Th>OSH Scan ID</Th>
            <Th>Created At</Th>
            <Th>Submitted By</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedJobs.map(job => (
            <Tr key={job.jobId}>
              <Td>{job.jobId}</Td>
              <Td>
                <div>
                  <strong>{job.packageName || job.packageNvr}</strong>
                  {job.packageName && job.packageNvr && (
                    <div style={{ fontSize: '0.85em', color: '#6a6e73' }}>
                      {job.packageNvr}
                    </div>
                  )}
                </div>
              </Td>
              <Td>
                <Label color={getJobStatusColor(job.status)}>
                  {job.status}
                </Label>
              </Td>
              <Td>{job.oshScanId || '-'}</Td>
              <Td>{formatDateTime(job.createdAt)}</Td>
              <Td>{job.submittedBy || '-'}</Td>
              <Td>
                {job.tektonUrl && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    component="a" 
                    href={job.tektonUrl} 
                    target="_blank"
                    icon={<ExternalLinkAltIcon />}
                    iconPosition="end"
                  >
                    Tekton
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Pagination
        itemCount={filteredJobs.length}
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
    </>
  );
};

export default JobsTable;

