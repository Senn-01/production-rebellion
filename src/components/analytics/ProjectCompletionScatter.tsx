'use client';

import React from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import type { ProjectCompletionData } from '@/services/analytics.service';

interface ProjectCompletionScatterProps {
  data: ProjectCompletionData | undefined;
  isLoading: boolean;
  height?: number;
  compact?: boolean;
}

// Transform completion data for scatter chart
function transformCompletionData(projectCompletions: ProjectCompletionData) {
  return projectCompletions.completionsByPosition.map(item => ({
    cost: item.cost,
    benefit: item.benefit,
    count: item.count,
    totalXP: item.totalXP,
    // Size the dot based on count (radius 4-12)
    size: Math.min(Math.max(item.count * 3 + 1, 4), 12)
  }));
}

// Neo-brutalist tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_#000000]">
        <p className="font-black uppercase text-sm mb-2">
          Cost {data.cost} × Benefit {data.benefit}
        </p>
        <p className="font-bold text-sm">
          <span className="text-[var(--theme-primary)]">{data.count}</span> Project{data.count !== 1 ? 's' : ''}
        </p>
        <p className="font-bold text-sm">
          <span className="text-[var(--theme-primary)]">{data.totalXP}</span> XP Total
        </p>
      </div>
    );
  }
  return null;
};

export function ProjectCompletionScatter({ 
  data, 
  isLoading, 
  height = 280, 
  compact = false 
}: ProjectCompletionScatterProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse" style={{ height }}>
        <div className="h-full bg-gray-200 rounded-none border-4 border-gray-300"></div>
      </div>
    );
  }

  if (!data || data.completionsByPosition.length === 0) {
    return (
      <div 
        className="flex items-center justify-center border-4 border-dashed border-gray-300" 
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="font-bold uppercase text-sm opacity-50">
            No completed projects yet
          </p>
          <p className="text-xs opacity-30 mt-2">
            Complete your first project to see the cost/benefit analysis
          </p>
        </div>
      </div>
    );
  }

  const chartData = transformCompletionData(data);
  const hasData = chartData.length > 0;

  if (!hasData) {
    return (
      <div 
        className="flex items-center justify-center border-4 border-dashed border-gray-300" 
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="font-bold uppercase text-sm opacity-50">
            Ready to see your impact?
          </p>
          <p className="text-xs opacity-30 mt-2">
            Your completed projects will show up as dots on this cost/benefit grid
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          data={chartData}
          margin={compact ? { top: 10, right: 10, left: 10, bottom: 10 } : { top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="none" 
            stroke="#000000" 
            strokeWidth={1}
          />
          <XAxis 
            dataKey="cost"
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            axisLine={{ stroke: '#000000', strokeWidth: compact ? 2 : 4 }}
            tickLine={{ stroke: '#000000', strokeWidth: 1 }}
            tick={{ 
              fontSize: compact ? 10 : 12, 
              fontWeight: 'bold', 
              fontFamily: 'monospace',
              fill: '#000000'
            }}
            label={compact ? undefined : { 
              value: 'Cost', 
              position: 'insideBottom', 
              offset: -10,
              style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '12px' }
            }}
          />
          <YAxis 
            dataKey="benefit"
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            axisLine={{ stroke: '#000000', strokeWidth: compact ? 2 : 4 }}
            tickLine={{ stroke: '#000000', strokeWidth: 1 }}
            tick={{ 
              fontSize: compact ? 10 : 12, 
              fontWeight: 'bold', 
              fontFamily: 'monospace',
              fill: '#000000'
            }}
            label={compact ? undefined : { 
              value: 'Benefit', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '12px' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter 
            dataKey="count" 
            fill="var(--theme-primary)"
            stroke="#000000"
            strokeWidth={2}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProjectCompletionScatter;