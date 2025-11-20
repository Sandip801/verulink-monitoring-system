import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './CircularChart.css';

const CircularChart = ({ 
  data, 
  title, 
  total, 
  color = '#06b6d4',
  loading = false,
  error = null 
}) => {
  if (loading) {
    return (
      <div className="circular-chart">
        <div className="chart-header">
          <div className="chart-title animate-pulse">Loading...</div>
        </div>
        <div className="chart-container">
          <div className="chart-loading">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="circular-chart circular-chart--error">
        <div className="chart-header">
          <div className="chart-title">{title}</div>
        </div>
        <div className="chart-container">
          <div className="chart-error">
            <span>Error loading chart</span>
          </div>
        </div>
      </div>
    );
  }

  const value = data && data.length > 0 ? data[0].value : 0;
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  const chartData = [
    { name: 'Used', value: percentage, fill: color },
    { name: 'Available', value: 100 - percentage, fill: '#1e293b' }
  ];

  return (
    <div className="circular-chart card-hover">
      <div className="chart-header">
        <div className="chart-title">{title}</div>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={450}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className="chart-center">
          <div className="center-content">
            <div className="center-percentage">{percentage.toFixed(1)}%</div>
            <div className="center-label">Utilized</div>
          </div>
        </div>
      </div>

      <div className="chart-footer">
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: color }}></div>
            <span>Used: {value.toFixed(2)}</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#1e293b' }}></div>
            <span>Available: {(total - value).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularChart;