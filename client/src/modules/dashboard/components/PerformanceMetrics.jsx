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
  const theme = useSelector((state) => state.theme);
  const isDarkMode = theme?.mode === 'dark';

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
        return Math.floor(15 + Math.random() * 45); // 15-60 minutes
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
          borderWidth: 2,
          pointBackgroundColor: selectedMetric.color,
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
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
        }] : []),
      ],
    };
  }, [data, selectedMetric, dateLabels]);

  // Chart options
  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: isDarkMode ? '#e5e7eb' : '#374151',
            font: {
              size: 12,
              weight: 'bold',
            },
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: isDarkMode ? '#374151' : '#fff',
          titleColor: isDarkMode ? '#e5e7eb' : '#111827',
          bodyColor: isDarkMode ? '#e5e7eb' : '#374151',
          borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
                if (selectedMetric?.unit) {
                  label += ` ${selectedMetric.unit}`;
                }
              }
              return label;
            }
          }
        },
      },
      scales: {
        x: {
          grid: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: isDarkMode ? '#e5e7eb' : '#374151',
          },
        },
        y: {
          grid: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: isDarkMode ? '#e5e7eb' : '#374151',
            callback: function(value) {
              return value + (selectedMetric?.unit ? ` ${selectedMetric.unit}` : '');
            }
          },
          beginAtZero: true,
        },
      },
    };
  }, [isDarkMode, selectedMetric]);

  // Calculate current performance
  const currentPerformance = useMemo(() => {
    if (!data || !selectedMetric) return null;
    
    const metricData = data[selectedMetric.id] || [];
    if (metricData.length === 0) return null;
    
    // Get the most recent value
    const currentValue = metricData[metricData.length - 1] || 0;
    
    // Calculate performance against target
    let performance = 0;
    let status = 'neutral';
    
    if (selectedMetric.id === 'slaCompliance') {
      // For SLA compliance, higher is better
      performance = (currentValue / selectedMetric.target) * 100;
      status = currentValue >= selectedMetric.target ? 'good' : 'bad';
    } else if (selectedMetric.id === 'reopenRate') {
      // For reopen rate, lower is better
      performance = selectedMetric.target > 0 ? 
        ((selectedMetric.target - currentValue) / selectedMetric.target) * 100 : 0;
      status = currentValue <= selectedMetric.target ? 'good' : 'bad';
    } else if (selectedMetric.id === 'resolutionTime' || selectedMetric.id === 'responseTime') {
      // For time metrics, lower is better
      performance = selectedMetric.target > 0 ? 
        ((selectedMetric.target - currentValue) / selectedMetric.target) * 100 : 0;
      status = currentValue <= selectedMetric.target ? 'good' : 'bad';
    }
    
    return {
      value: currentValue,
      performance: Math.min(Math.max(performance, 0), 100), // Clamp between 0-100
      status,
    };
  }, [data, selectedMetric]);

  return (
    <MetricsCard>
      <CardHeader>
        <Title>{title}</Title>
        <MetricTabs>
          {metrics.map((metric) => (
            <MetricTab
              key={metric.id}
              active={activeMetric === metric.id}
              onClick={() => setActiveMetric(metric.id)}
            >
              {metric.name}
            </MetricTab>
          ))}
        </MetricTabs>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <LoaderContainer>
            <Loader size={40} />
          </LoaderContainer>
        ) : (
          <>
            {selectedMetric && (
              <MetricInfoContainer>
                <MetricDescription>{selectedMetric.description}</MetricDescription>
                {currentPerformance && (
                  <CurrentMetric>
                    <CurrentValue>
                      {currentPerformance.value}
                      <Unit>{selectedMetric.unit}</Unit>
                    </CurrentValue>
                    <TargetInfo>
                      Target: {selectedMetric.target} {selectedMetric.unit}
                    </TargetInfo>
                    <PerformanceIndicator status={currentPerformance.status}>
                      {currentPerformance.status === 'good' ? '✓ On target' : '⚠ Needs attention'}
                    </PerformanceIndicator>
                  </CurrentMetric>
                )}
              </MetricInfoContainer>
            )}

            <ChartContainer style={{ height: `${height}px` }}>
              {chartData ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <NoDataMessage>No data available for the selected metric</NoDataMessage>
              )}
            </ChartContainer>
          </>
        )}
      </CardContent>
    </MetricsCard>
  );
};

PerformanceMetrics.propTypes = {
  /** Performance metrics data */
  data: PropTypes.shape({
    resolutionTime: PropTypes.arrayOf(PropTypes.number),
    responseTime: PropTypes.arrayOf(PropTypes.number),
    slaCompliance: PropTypes.arrayOf(PropTypes.number),
    reopenRate: PropTypes.arrayOf(PropTypes.number),
  }),
  /** Loading state */
  isLoading: PropTypes.bool,
  /** Time period for the metrics (week, month, quarter) */
  period: PropTypes.oneOf(['week', 'month', 'quarter']),
  /** Component title */
  title: PropTypes.string,
  /** Chart height in pixels */
  height: PropTypes.number,
};

PerformanceMetrics.defaultProps = {
  data: null,
  isLoading: false,
  period: 'week',
  title: 'Performance Metrics',
  height: 350,
};

// Styled components
const MetricsCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme?.isDark ? '#374151' : '#e5e7eb'};
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme?.isDark ? '#e5e7eb' : '#111827'};
`;

const MetricTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const MetricTab = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ theme, active }) => 
    active 
      ? theme?.isDark ? '#4361ee' : '#4361ee' 
      : theme?.isDark ? '#4b5563' : '#e5e7eb'
  };
  background-color: ${({ theme, active }) => 
    active 
      ? theme?.isDark ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' 
      : 'transparent'
  };
  color: ${({ theme, active }) => 
    active 
      ? theme?.isDark ? '#4361ee' : '#4361ee' 
      : theme?.isDark ? '#e5e7eb' : '#4b5563'
  };

  &:hover {
    background-color: ${({ theme, active }) => 
      active 
        ? theme?.isDark ? 'rgba(67, 97, 238, 0.3)' : 'rgba(67, 97, 238, 0.2)' 
        : theme?.isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'
    };
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MetricInfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const MetricDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme?.isDark ? '#9ca3af' : '#6b7280'};
  flex: 1;
  min-width: 200px;
`;

const CurrentMetric = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const CurrentValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme?.isDark ? '#e5e7eb' : '#111827'};
  display: flex;
  align-items: baseline;
`;

const Unit = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme?.isDark ? '#9ca3af' : '#6b7280'};
  margin-left: 0.25rem;
`;

const TargetInfo = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme?.isDark ? '#9ca3af' : '#6b7280'};
  margin-top: 0.25rem;
`;

const PerformanceIndicator = styled.div`
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${({ status, theme }) => {
    if (status === 'good') return theme?.isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)';
    if (status === 'bad') return theme?.isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)';
    return theme?.isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)';
  }};
  color: ${({ status, theme }) => {
    if (status === 'good') return theme?.isDark ? 'rgb(16, 185, 129)' : 'rgb(16, 185, 129)';
    if (status === 'bad') return theme?.isDark ? 'rgb(239, 68, 68)' : 'rgb(239, 68, 68)';
    return theme?.isDark ? '#9ca3af' : '#6b7280';
  }};
`;

const ChartContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
`;

const NoDataMessage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme?.isDark ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
`;

const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
`;

export default PerformanceMetrics;