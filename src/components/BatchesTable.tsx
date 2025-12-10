import React, { useState, useMemo } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import {
  Label,
  Pagination,
  PaginationVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Progress,
  ProgressSize,
  ProgressMeasureLocation
} from '@patternfly/react-core';
import { useDashboard } from '../context/DashboardContext';
import { getBatchStatusColor, formatDateTime } from '../utils/statusHelpers';

const BatchesTable: React.FC = () => {
  const { batches } = useDashboard();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const paginatedBatches = useMemo(() => {
    const start = (page - 1) * perPage;
    return batches.slice(start, start + perPage);
  }, [batches, page, perPage]);

  const calculateProgress = (batch: any) => {
    if (batch.totalJobs === 0) return 0;
    return Math.round(((batch.completedJobs + batch.failedJobs) / batch.totalJobs) * 100);
  };

  const onSetPage = (_event: any, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: any, newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem align={{ default: 'alignRight' }}>
            <Pagination
              itemCount={batches.length}
              page={page}
              perPage={perPage}
              onSetPage={onSetPage}
              onPerPageSelect={onPerPageSelect}
              variant={PaginationVariant.top}
              perPageOptions={[
                { title: '10', value: 10 },
                { title: '20', value: 20 },
                { title: '50', value: 50 }
              ]}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table variant="compact" aria-label="Batches table">
        <Thead>
          <Tr>
            <Th>Batch ID</Th>
            <Th>Status</Th>
            <Th>Progress</Th>
            <Th>Total Jobs</Th>
            <Th>Completed</Th>
            <Th>Failed</Th>
            <Th>Submitted At</Th>
            <Th>Submitted By</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedBatches.map(batch => (
            <Tr key={batch.batchId}>
              <Td>{batch.batchId}</Td>
              <Td>
                <Label color={getBatchStatusColor(batch.status)}>
                  {batch.status}
                </Label>
              </Td>
              <Td>
                <Progress
                  value={calculateProgress(batch)}
                  title="Batch progress"
                  size={ProgressSize.sm}
                  measureLocation={ProgressMeasureLocation.inside}
                  style={{ minWidth: '150px' }}
                />
              </Td>
              <Td>{batch.totalJobs}</Td>
              <Td>
                <Label color="green">{batch.completedJobs}</Label>
              </Td>
              <Td>
                {batch.failedJobs > 0 ? (
                  <Label color="red">{batch.failedJobs}</Label>
                ) : (
                  <span>0</span>
                )}
              </Td>
              <Td>{formatDateTime(batch.submittedAt)}</Td>
              <Td>{batch.submittedBy || '-'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Pagination
        itemCount={batches.length}
        page={page}
        perPage={perPage}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
        variant={PaginationVariant.bottom}
        perPageOptions={[
          { title: '10', value: 10 },
          { title: '20', value: 20 },
          { title: '50', value: 50 }
        ]}
      />
    </>
  );
};

export default BatchesTable;

