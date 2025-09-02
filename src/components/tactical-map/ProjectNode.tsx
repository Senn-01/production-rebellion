/**
 * ProjectNode Component
 * 
 * Visual representation of projects on the tactical map grid.
 * Handles category patterns, priority colors, and boss battle indicators.
 */

import React from 'react';
import { ProjectWithComputedFields } from '@/services/projects.service';
import type { Database } from '@/types/database';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectNodeProps {
  project: ProjectWithComputedFields;
  onClick: (project: ProjectWithComputedFields) => void;
  size?: number;
}

export function ProjectNode({ project, onClick, size = 32 }: ProjectNodeProps) {
  
  // Get shadow color based on priority
  const getShadowColor = () => {
    switch (project.priority) {
      case 'must': return '#FFD700'; // Gold for must-do items
      case 'should': return '#000000'; // Black for should-do items
      case 'nice': return '#666666'; // Grey for nice-to-have items
      default: return '#000000';
    }
  };
  
  // Get category pattern
  const getCategoryPattern = () => {
    const patternId = `pattern-${project.category}-${project.id}`;
    const darkGrey = '#9ca3af';
    
    switch (project.category) {
      case 'work':
        // Solid fill
        return {
          patternId,
          backgroundColor: darkGrey,
          pattern: null
        };
      case 'learn':
        // Vertical lines
        return {
          patternId,
          backgroundColor: '#f7f7f5',
          pattern: (
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id={patternId} patternUnits="userSpaceOnUse" width="6" height="6">
                  <path d="M3,0 L3,6" stroke={darkGrey} strokeWidth="1.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          )
        };
      case 'build':
        // Diagonal lines
        return {
          patternId,
          backgroundColor: '#f7f7f5',
          pattern: (
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
                  <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke={darkGrey} strokeWidth="1.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          )
        };
      case 'manage':
        // Horizontal lines
        return {
          patternId,
          backgroundColor: '#f7f7f5',
          pattern: (
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="6">
                  <path d="M0,3 L8,3" stroke={darkGrey} strokeWidth="1.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          )
        };
      default:
        return {
          patternId,
          backgroundColor: darkGrey,
          pattern: null
        };
    }
  };

  const categoryPattern = getCategoryPattern();
  const shadowColor = getShadowColor();
  
  // Apply opacity for inactive projects
  const opacity = project.status === 'inactive' ? 0.6 : 1.0;
  
  // Apply pulse for approaching deadlines
  const pulseClass = project.isApproachingDeadline ? 'animate-pulse' : '';

  const handleClick = () => {
    onClick(project);
  };

  return (
    <div 
      className={`relative cursor-pointer ${pulseClass}`}
      style={{ opacity }}
      title={`${project.name} - ${project.category} - Priority: ${project.priority}`}
      onClick={handleClick}
    >
      <div 
        className="border-4 border-black hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] transition-all duration-100 relative overflow-hidden"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: categoryPattern.backgroundColor,
          boxShadow: `4px 4px 0px ${shadowColor}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `6px 6px 0px ${shadowColor}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `4px 4px 0px ${shadowColor}`;
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.boxShadow = `2px 2px 0px ${shadowColor}`;
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.boxShadow = `4px 4px 0px ${shadowColor}`;
        }}
      >
        {categoryPattern.pattern}
      </div>
      
      {/* Boss Battle Indicator */}
      {project.is_boss_battle && (
        <div className="absolute -top-1 -right-1 text-[#FDE047] text-sm drop-shadow-[2px_2px_0px_#000000]">
          ⭐
        </div>
      )}
    </div>
  );
}