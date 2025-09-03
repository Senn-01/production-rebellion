'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import type { WeeklyStats } from '@/services/analytics.service';

interface WeeklyActivityChartProps {
  data: WeeklyStats[] | undefined;
  isLoading: boolean;
  height?: number;
}

// Transform weekly data for chart display
function transformWeeklyData(weeklyStats: WeeklyStats[]) {
  return weeklyStats.map(week => ({
    weekLabel: new Date(week.weekStart).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    sessions: week.sessionCount,
    hours: Number(week.totalHours.toFixed(1)),
    xp: week.totalXP
  }));
}

// Neo-brutalist tooltip
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{payload: any}>; label?: string }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_#000000]">
        <p className="font-black uppercase text-sm mb-2">Week of {label}</p>
        <p className="font-bold text-sm">
          <span className="text-[var(--theme-primary)]">{data.sessions}</span> Sessions
        </p>
        <p className="font-bold text-sm">
          <span className="text-[var(--theme-primary)]">{data.hours}</span> Hours
        </p>
        <p className="font-bold text-sm">
          <span className="text-[var(--theme-primary)]">{data.xp}</span> XP
        </p>
      </div>
    );
  }
  return null;
};

export function WeeklyActivityChart({ data, isLoading, height = 280 }: WeeklyActivityChartProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse" style={{ height }}>
        <div className="h-full bg-gray-200 rounded-none"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center border-4 border-dashed border-gray-300" 
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="font-bold uppercase text-sm opacity-50">
            No session data yet
          </p>
          <p className="text-xs opacity-30 mt-2">
            Complete your first session to see weekly trends
          </p>
        </div>
      </div>
    );
  }

  const chartData = transformWeeklyData(data);
  const maxSessions = Math.max(...chartData.map(d => d.sessions));
  const hasAnyData = chartData.some(d => d.sessions > 0);

  if (!hasAnyData) {
    return (
      <div 
        className="flex items-center justify-center border-4 border-dashed border-gray-300" 
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="font-bold uppercase text-sm opacity-50">
            Ready to build your weekly rhythm?
          </p>
          <p className="text-xs opacity-30 mt-2">
            Your session data will appear here as beautiful charts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid 
            strokeDasharray="none" 
            stroke="#000000" 
            strokeWidth={2}
          />
          <XAxis 
            dataKey="weekLabel" 
            axisLine={{ stroke: '#000000', strokeWidth: 4 }}
            tickLine={{ stroke: '#000000', strokeWidth: 2 }}
            tick={{ 
              fontSize: 12, 
              fontWeight: 'bold', 
              fontFamily: 'monospace',
              fill: '#000000'
            }}
          />
          <YAxis 
            axisLine={{ stroke: '#000000', strokeWidth: 4 }}
            tickLine={{ stroke: '#000000', strokeWidth: 2 }}
            tick={{ 
              fontSize: 12, 
              fontWeight: 'bold', 
              fontFamily: 'monospace',
              fill: '#000000'
            }}
            domain={[0, Math.max(maxSessions + 1, 5)]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="sessions" 
            fill="var(--theme-primary)"
            stroke="#000000"
            strokeWidth={2}
            radius={[0, 0, 0, 0]} // No rounded corners for neo-brutalist style
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeeklyActivityChart;