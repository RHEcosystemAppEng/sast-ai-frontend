import React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Spinner
} from '@patternfly/react-core';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { useDashboard } from '../context/DashboardContext';

// Color constants matching PatternFly color scheme
const COLORS = {
  running: '#06c',
  pending: '#8a8d90',
  completed: '#3e8635',
  failed: '#c9190b',
  cancelled: '#ec7a08',
  processing: '#06c',
  collected: '#3e8635',
  uncollected: '#ec7a08'
};

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

// Data transformation helpers
const transformJobsData = (summary: any): ChartDataItem[] => [
  { name: 'Running', value: summary.runningJobs, color: COLORS.running },
  { name: 'Pending', value: summary.pendingJobs, color: COLORS.pending },
  { name: 'Completed', value: summary.completedJobs, color: COLORS.completed },
  { name: 'Failed', value: summary.failedJobs, color: COLORS.failed },
  { name: 'Cancelled', value: summary.cancelledJobs, color: COLORS.cancelled }
];

const transformBatchesData = (summary: any): ChartDataItem[] => [
  { name: 'Processing', value: summary.processingBatches, color: COLORS.processing },
  { name: 'Completed', value: summary.completedBatches, color: COLORS.completed }
];

const transformOshScansData = (summary: any): ChartDataItem[] => [
  { name: 'Collected', value: summary.collectedOshScans, color: COLORS.collected },
  { name: 'Uncollected', value: summary.uncollectedOshScans, color: COLORS.uncollected }
];

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '8px 12px',
        border: '1px solid #d2d2d2',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].name}</p>
        <p style={{ margin: 0, color: payload[0].payload.color }}>
          Count: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

// Custom legend that shows all items including zeros
const CustomLegend = ({ data }: { data: ChartDataItem[] }) => {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '8px',
      padding: '8px 0',
      fontSize: '12px'
    }}>
      {data.map((item, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            backgroundColor: item.color,
            borderRadius: '2px'
          }} />
          <span style={{ color: '#151515' }}>{item.name}</span>
        </div>
      ))}
    </div>
  );
};

interface DonutChartProps {
  data: ChartDataItem[];
  total: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, total }) => {
  // Filter out zero values for cleaner visualization
  const filteredData = data.filter(item => item.value > 0);

  // Handle empty state
  if (filteredData.length === 0) {
    return (
      <div style={{
        height: '250px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8a8d90'
      }}>
        No data available
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
          >
            <Label
              value={total}
              position="center"
              style={{ fontSize: '32px', fontWeight: 'bold', fill: '#151515' }}
            />
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <CustomLegend data={data} />
    </div>
  );
};

const SummaryCards: React.FC = () => {
  const { summary, loading } = useDashboard();

  if (loading || !summary) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      width: '100%'
    }}>
      <Card style={{ flex: '0 1 320px' }}>
        <CardTitle>Jobs</CardTitle>
        <CardBody>
          <DonutChart
            data={transformJobsData(summary)}
            total={summary.totalJobs}
          />
        </CardBody>
      </Card>

      <Card style={{ flex: '0 1 320px' }}>
        <CardTitle>Batches</CardTitle>
        <CardBody>
          <DonutChart
            data={transformBatchesData(summary)}
            total={summary.totalBatches}
          />
        </CardBody>
      </Card>

      <Card style={{ flex: '0 1 320px' }}>
        <CardTitle>OSH Scans</CardTitle>
        <CardBody>
          <DonutChart
            data={transformOshScansData(summary)}
            total={summary.totalOshScans}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default SummaryCards;
