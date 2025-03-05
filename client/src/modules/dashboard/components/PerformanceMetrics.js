import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { format, parseISO, subDays } from 'date-fns';
import { useSelector } from 'react-redux';
import Card from '../../../components/common/Card';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import Loader from '../../../components/common/Loader';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MetricsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChartContainer = styled.div`
  position: relative;
  flex-grow: 1;
  min-height: 250px;
`;

const MetricButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const MetricButton = styled.button`
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  background-color: ${props => props.active 
    ? props.color || props.theme.colors?.primary 
    : props.theme.colors?.backgroundSecondary || '#f5f5f5'};
  color: ${props => props.active 
    ? '#fff' 
    : props.theme.colors?.text || '#333'};
  border: 1px solid ${props => props.active 
    ? props.color || props.theme.colors?.primary 
    : props.theme.colors?.border || '#ddd'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active 
      ? props.color || props.theme.colors?.primaryDark 
      : props.theme.colors?.backgroundHover || '#e9e9e9'};
  }
`;

const MetricInfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
`;

const MetricDescription = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors?.textSecondary || '#666'};
`;

const MetricSummary = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const CurrentValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors?.text || '#333'};
`;

const TargetValue = styled.div`
  font-size: 0.85rem;
  color: ${props => props.theme.colors?.textSecondary || '#666'};
`;

const NoDataContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 200px;
  color: ${props => props.theme.colors?.textSecondary || '#666'};
  font-style: italic;
`;

/**
 * PerformanceMetrics component displays key performance indicators for the IT service desk
 * Shows metrics like average resolution time, SLA compliance, and first response time
 */
const PerformanceMetrics = ({
  data,
  isLoading,
  period = 'week',
  title = 'Performance Metrics',
  height = 350,
}) => {
  const [activeMetric, setActiveMetric] = useState('resolutionTime');
  const theme = useSelector((state) => state.theme) || { mode: 'light' };
  const isDarkMode = theme.mode === 'dark';

  // Define available metrics
  const metrics = useMemo(() => [
    {
      id: 'resolutionTime',
      name: 'Avg. Resolution Time',
      unit: 'hours',
      description: 'Average time to resolve incidents',
      color: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      target: 24, // Target: 24 hours
    },
    {
      id: 'responseTime',
      name: 'First Response Time',
      unit: 'minutes',
      description: 'Average time to first response',
      color: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      target: 30, // Target: 30 minutes
    },
    {
      id: 'slaCompliance',
      name: 'SLA Compliance',
      unit: '%',
      description: 'Percentage of incidents resolved within SLA',
      color: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      target: 95, // Target: 95%
    },
    {
      id: 'reopenRate',
      name: 'Reopen Rate',
      unit: '%',
      description: 'Percentage of incidents that were reopened',
      color: 'rgba(255, 159, 64, 1)',
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      target: 5, // Target: below 5%
    },
  ], []);

  // Get the currently selected metric
  const selectedMetric = useMemo(() => 
    metrics.find(m => m.id === activeMetric), 
    [activeMetric, metrics]
  );

  // Generate date labels based on selected period
  const dateLabels = useMemo(() => {
    const today = new Date();
    let days = 7;
    
    switch (period) {
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      case 'quarter':
        days = 90;
        break;
      default:
        days = 7;
    }
    
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(today, days - i - 1);
      return format(date, 'MMM dd');
    });
  }, [period]);

  // Process data for the chart
  const chartData = useMemo(() => {
    if (!data || !selectedMetric) return null;
    
    // If we have real data for the selected metric, use it
    const metricData = data[selectedMetric.id] || [];
    
    // Map data to the date labels
    const values = dateLabels.map((_, index) => {
      // If we have real data for this index, use it
      if (metricData[index] !== undefined) {
        return metricData[index];
      }
      
      // Otherwise generate some placeholder data
      // This would be replaced with real data in production
      if (selectedMetric.id === 'slaCompliance') {
        return Math.floor(85 + Math.random() * 15); // 85-100%
      } else if (selectedMetric.id === 'reopenRate') {
        return Math.floor(1 + Math.random() * 8); // 1-9%
      } else if (selectedMetric.id === 'resolutionTime') {
        return Math.floor(12 + Math.random() * 24); // 12-36 hours
      } else {
        return Math.floor(10 + Math.random() * 30); // 10-40 minutes
      }
    });
    
    return {
      labels: dateLabels,
      datasets: [
        {
          label: selectedMetric.name,
          data: values,
          borderColor: selectedMetric.color,
          backgroundColor: selectedMetric.backgroundColor,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        // Add target line if applicable
        ...(selectedMetric.target ? [{
          label: 'Target',
          data: Array(dateLabels.length).fill(selectedMetric.target),
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
        }] : [])
      ]
    };
  }, [data, selectedMetric, dateLabels]);

  // Calculate current value (average of last 3 data points or all if less than 3)
  const currentValue = useMemo(() => {
    if (!chartData || !chartData.datasets || !chartData.datasets[0].data) {
      return null;
    }
    
    const dataPoints = chartData.datasets[0].data;
    const lastThreePoints = dataPoints.slice(-3);
    
    if (lastThreePoints.length === 0) return null;
    
    const sum = lastThreePoints.reduce((acc, val) => acc + val, 0);
    return (sum / lastThreePoints.length).toFixed(1);
  }, [chartData]);

  // Chart options
  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: isDarkMode ? '#e0e0e0' : '#333',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
                if (selectedMetric) {
                  label += ` ${selectedMetric.unit}`;
                }
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: isDarkMode ? '#e0e0e0' : '#333',
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          grid: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: isDarkMode ? '#e0e0e0' : '#333',
            callback: function(value) {
              return value + (selectedMetric ? ` ${selectedMetric.unit}` : '');
            }
          },
          beginAtZero: true
        }
      }
    };
  }, [isDarkMode, selectedMetric]);

  // Format the current value with the appropriate unit
  const formattedCurrentValue = useMemo(() => {
    if (currentValue === null || !selectedMetric) return 'N/A';
    return `${currentValue} ${selectedMetric.unit}`;
  }, [currentValue, selectedMetric]);

  // Format the target value with the appropriate unit
  const formattedTargetValue = useMemo(() => {
    if (!selectedMetric || selectedMetric.target === undefined) return '';
    
    // For metrics where lower is better (like resolution time)
    if (selectedMetric.id === 'resolutionTime' || selectedMetric.id === 'responseTime' || selectedMetric.id === 'reopenRate') {
      return `Target: < ${selectedMetric.target} ${selectedMetric.unit}`;
    }
    
    // For metrics where higher is better (like SLA compliance)
    return `Target: > ${selectedMetric.target} ${selectedMetric.unit}`;
  }, [selectedMetric]);

  // Determine if the current value is meeting the target
  const isTargetMet = useMemo(() => {
    if (currentValue === null || !selectedMetric || selectedMetric.target === undefined) {
      return null;
    }
    
    // For metrics where lower is better
    if (selectedMetric.id === 'resolutionTime' || selectedMetric.id === 'responseTime' || selectedMetric.id === 'reopenRate') {
      return parseFloat(currentValue) <= selectedMetric.target;
    }
    
    // For metrics where higher is better
    return parseFloat(currentValue) >= selectedMetric.target;
  }, [currentValue, selectedMetric]);

  return (
    <Card title={title} height={height}>
      <MetricsContainer>
        <MetricButtonsContainer>
          {metrics.map((metric) => (
            <MetricButton
              key={metric.id}
              active={activeMetric === metric.id}
              color={metric.color}
              onClick={() => setActiveMetric(metric.id)}
            >
              {metric.name}
            </MetricButton>
          ))}
        </MetricButtonsContainer>
        
        <ChartContainer>
          {isLoading ? (
            <Loader />
          ) : chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <NoDataContainer>No data available for this metric</NoDataContainer>
          )}
        </ChartContainer>
        
        {selectedMetric && !isLoading && chartData && (
          <MetricInfoContainer>
            <MetricDescription>{selectedMetric.description}</MetricDescription>
            <MetricSummary>
              <CurrentValue style={{ 
                color: isTargetMet === null 
                  ? undefined 
                  : isTargetMet 
                    ? 'green' 
                    : 'red' 
              }}>
                {formattedCurrentValue}
              </CurrentValue>
              <TargetValue>{formattedTargetValue}</TargetValue>
            </MetricSummary>
          </MetricInfoContainer>
        )}
      </MetricsContainer>
    </Card>
  );
};

PerformanceMetrics.propTypes = {
  data: PropTypes.object,
  isLoading: PropTypes.bool,
  period: PropTypes.oneOf(['week', 'month', 'quarter']),
  title: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PerformanceMetrics;