import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './MetricCard.css';

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  color = 'cyan', 
  icon: Icon, 
  trend,
  loading = false,
  error = null 
}) => {
  const colorClasses = {
    cyan: 'card-icon--cyan',
    purple: 'card-icon--purple',
    green: 'card-icon--green',
    orange: 'card-icon--orange'
  };

  if (loading) {
    return (
      <div className="metric-card">
        <div className="card-header">
          <div className="card-title animate-pulse">Loading...</div>
          <div className={`card-icon ${colorClasses[color]} animate-pulse`}>
            {Icon && <Icon size={20} />}
          </div>
        </div>
        <div className="card-value animate-pulse">--</div>
        <div className="card-subtitle animate-pulse">Fetching data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metric-card metric-card--error">
        <div className="card-header">
          <div className="card-title">{title}</div>
          <div className={`card-icon ${colorClasses[color]}`}>
            {Icon && <Icon size={20} />}
          </div>
        </div>
        <div className="card-value">Error</div>
        <div className="card-subtitle card-subtitle--error">{error}</div>
      </div>
    );
  }

  return (
    <div className="metric-card card-hover">
      <div className="card-header">
        <div className="card-title">{title}</div>
        {Icon && (
          <div className={`card-icon ${colorClasses[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      
      <div className="card-value">{value}</div>
      
      {subtitle && (
        <div className="card-footer">
          <span className="card-subtitle">{subtitle}</span>
          {trend !== undefined && trend !== null && (
            <div className="card-trend">
              {trend > 0 ? (
                <TrendingUp size={16} className="trend-icon trend-icon--positive" />
              ) : trend < 0 ? (
                <TrendingDown size={16} className="trend-icon trend-icon--negative" />
              ) : null}
              <span className={`trend-value ${trend > 0 ? 'trend-value--positive' : trend < 0 ? 'trend-value--negative' : 'trend-value--neutral'}`}>
                {trend > 0 ? '+' : ''}{trend.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;