import React, { useState } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Spinner,
  MenuToggle,
  Select,
  SelectList,
  SelectOption
} from '@patternfly/react-core';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { TIME_PERIOD_OPTIONS, getTimePeriodLabel } from '../types';

const JobActivityGraph: React.FC = () => {
  const { jobActivity, loading, timePeriod, setTimePeriod } = useDashboard();
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const onSelectTimePeriod = (_event: any, value: string | number | undefined) => {
    if (value && typeof value === 'string') {
      setTimePeriod(value as any);
      setIsSelectOpen(false);
    }
  };

  const cardTitle = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Job Activity - {getTimePeriodLabel(timePeriod)}</span>
      <Select
        id="time-period-select"
        isOpen={isSelectOpen}
        selected={timePeriod}
        onSelect={onSelectTimePeriod}
        onOpenChange={(isOpen) => setIsSelectOpen(isOpen)}
        toggle={(toggleRef) => (
          <MenuToggle ref={toggleRef} onClick={() => setIsSelectOpen(!isSelectOpen)} isExpanded={isSelectOpen}>
            {getTimePeriodLabel(timePeriod)}
          </MenuToggle>
        )}
      >
        <SelectList>
          {TIME_PERIOD_OPTIONS.map((option) => (
            <SelectOption key={option.value} value={option.value}>
              {option.label}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </div>
  );

  if (loading) {
    return (
      <Card style={{ width: '100%' }}>
        <CardTitle>{cardTitle}</CardTitle>
        <CardBody>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', height: '300px', alignItems: 'center' }}>
            <Spinner size="xl" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!jobActivity || jobActivity.length === 0) {
    return (
      <Card style={{ width: '100%' }}>
        <CardTitle>{cardTitle}</CardTitle>
        <CardBody>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#6a6e73' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>No job activity data available</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);

    // For 7d and 30d, show date
    if (timePeriod === '7d' || timePeriod === '30d') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }

    // For hourly periods, show time
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const chartData = jobActivity.map(point => ({
    time: formatTime(point.timestamp),
    Running: point.running,
    Pending: point.pending,
    Completed: point.completed,
    Failed: point.failed,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card style={{ width: '100%' }}>
      <CardTitle>{cardTitle}</CardTitle>
      <CardBody>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRunning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06c" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06c" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8a8d90" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8a8d90" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3e8635" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3e8635" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c9190b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#c9190b" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d2d2d2" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="Running"
              stackId="1"
              stroke="#06c"
              fill="url(#colorRunning)"
            />
            <Area
              type="monotone"
              dataKey="Pending"
              stackId="1"
              stroke="#8a8d90"
              fill="url(#colorPending)"
            />
            <Area
              type="monotone"
              dataKey="Completed"
              stackId="1"
              stroke="#3e8635"
              fill="url(#colorCompleted)"
            />
            <Area
              type="monotone"
              dataKey="Failed"
              stackId="1"
              stroke="#c9190b"
              fill="url(#colorFailed)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default JobActivityGraph;
