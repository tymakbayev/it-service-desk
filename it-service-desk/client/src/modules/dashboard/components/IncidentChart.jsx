import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import Card from '../../../components/common/Card';
import { useSelector } from 'react-redux';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * IncidentChart component displays incident statistics over time
 * Supports multiple chart types (line, bar) and different time periods
 */
const IncidentChart = ({
  data,
  title,
  type,
  period,
  height,
  showLegend,
  isLoading,
  categories,
  stacked,
  showGrid,
}) => {
  const [chartData, setChartData] = useState(null);
  const theme = useSelector((state) => state.theme);
  const isDarkMode = theme?.mode === 'dark';

  // Generate date labels based on selected period
  const dateLabels = useMemo(() => {
    const today = new Date();
    let dates = [];
    let interval = {};

    switch (period) {
      case 'week':
        interval = { start: subDays(today, 6), end: today };
        break;
      case 'month':
        interval = { start: subDays(today, 29), end: today };
        break;
      case 'quarter':
        interval = { start: subDays(today, 89), end: today };
        break;
      case 'year':
        // For year, we'll use months instead of days
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date(today.getFullYear(), i, 1);
          return format(date, 'MMM');
        });
      default:
        interval = { start: subDays(today, 6), end: today };
    }

    dates = eachDayOfInterval(interval);
    return dates.map(date => format(date, period === 'week' ? 'EEE' : 'dd MMM'));
  }, [period]);

  // Process and format chart data
  useEffect(() => {
    if (!data || isLoading) return;

    const processedData = {
      labels: dateLabels,
      datasets: [],
    };

    // Helper function to get random color with opacity
    const getRandomColor = (opacity = 1) => {
      const colors = [
        `rgba(75, 192, 192, ${opacity})`,
        `rgba(54, 162, 235, ${opacity})`,
        `rgba(153, 102, 255, ${opacity})`,
        `rgba(255, 159, 64, ${opacity})`,
        `rgba(255, 99, 132, ${opacity})`,
        `rgba(255, 206, 86, ${opacity})`,
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    // If data is an array of datasets
    if (Array.isArray(data)) {
      data.forEach((dataset, index) => {
        const color = getRandomColor();
        
        processedData.datasets.push({
          label: dataset.label || `Dataset ${index + 1}`,
          data: dataset.data,
          borderColor: color,
          backgroundColor: type === 'line' ? getRandomColor(0.2) : color,
          fill: type === 'line',
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
        });
      });
    } 
    // If data is a single dataset
    else if (data.data) {
      const color = getRandomColor();
      
      processedData.datasets.push({
        label: data.label || 'Incidents',
        data: data.data,
        borderColor: color,
        backgroundColor: type === 'line' ? getRandomColor(0.2) : color,
        fill: type === 'line',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
      });
    }
    // If data is categorized (for stacked charts)
    else if (categories && categories.length > 0) {
      categories.forEach((category, index) => {
        const color = getRandomColor();
        
        processedData.datasets.push({
          label: category,
          data: data[category] || Array(dateLabels.length).fill(0),
          borderColor: color,
          backgroundColor: getRandomColor(0.7),
          borderWidth: 1,
          stack: stacked ? 'stack1' : undefined,
        });
      });
    }

    setChartData(processedData);
  }, [data, dateLabels, type, isLoading, categories, stacked, period]);

  // Chart options
  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'top',
          labels: {
            color: isDarkMode ? '#e5e7eb' : '#374151',
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: isDarkMode ? '#374151' : '#fff',
          titleColor: isDarkMode ? '#e5e7eb' : '#111827',
          bodyColor: isDarkMode ? '#e5e7eb' : '#374151',
          borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 14,
            weight: 'bold',
            family: "'Inter', sans-serif",
          },
          bodyFont: {
            size: 13,
            family: "'Inter', sans-serif",
          },
          displayColors: true,
          boxPadding: 6,
        },
        title: {
          display: !!title,
          text: title,
          color: isDarkMode ? '#e5e7eb' : '#111827',
          font: {
            size: 16,
            weight: 'bold',
            family: "'Inter', sans-serif",
          },
          padding: {
            top: 10,
            bottom: 20,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: showGrid,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            font: {
              size: 11,
              family: "'Inter', sans-serif",
            },
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            display: showGrid,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            font: {
              size: 11,
              family: "'Inter', sans-serif",
            },
            precision: 0,
          },
          stacked: stacked,
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      elements: {
        line: {
          tension: 0.4,
        },
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart',
      },
    };
  }, [title, showLegend, isDarkMode, showGrid, stacked]);

  // Render loading state
  if (isLoading) {
    return (
      <ChartContainer height={height}>
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Loading chart data...</LoadingText>
        </LoadingOverlay>
      </ChartContainer>
    );
  }

  // Render empty state if no data
  if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
    return (
      <ChartContainer height={height}>
        <EmptyState>
          <EmptyStateIcon>📊</EmptyStateIcon>
          <EmptyStateText>No incident data available</EmptyStateText>
          <EmptyStateSubtext>Try changing the time period or check back later</EmptyStateSubtext>
        </EmptyState>
      </ChartContainer>
    );
  }

  // Render the appropriate chart type
  return (
    <ChartContainer height={height}>
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </ChartContainer>
  );
};

IncidentChart.propTypes = {
  /** Chart data - can be array of datasets or single dataset object */
  data: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
      })
    ),
    PropTypes.shape({
      label: PropTypes.string,
      data: PropTypes.arrayOf(PropTypes.number).isRequired,
    }),
    PropTypes.object, // For categorized data
  ]),
  /** Chart title */
  title: PropTypes.string,
  /** Chart type: 'line' or 'bar' */
  type: PropTypes.oneOf(['line', 'bar']),
  /** Time period for the chart: 'week', 'month', 'quarter', 'year' */
  period: PropTypes.oneOf(['week', 'month', 'quarter', 'year']),
  /** Chart height in pixels */
  height: PropTypes.number,
  /** Whether to show the legend */
  showLegend: PropTypes.bool,
  /** Loading state */
  isLoading: PropTypes.bool,
  /** Categories for categorized data (used in stacked charts) */
  categories: PropTypes.arrayOf(PropTypes.string),
  /** Whether to stack the datasets (for bar charts) */
  stacked: PropTypes.bool,
  /** Whether to show grid lines */
  showGrid: PropTypes.bool,
};

IncidentChart.defaultProps = {
  title: '',
  type: 'line',
  period: 'week',
  height: 300,
  showLegend: true,
  isLoading: false,
  categories: [],
  stacked: false,
  showGrid: true,
  data: null,
};

// Styled components
const ChartContainer = styled(Card)`
  position: relative;
  width: 100%;
  height: ${(props) => `${props.height}px`};
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4361ee;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 2rem;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const EmptyStateText = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 0.5rem 0;
`;

const EmptyStateSubtext = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

export default IncidentChart;