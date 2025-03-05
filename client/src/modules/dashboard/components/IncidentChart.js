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
import { format, subDays, eachDayOfInterval, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import Card from '../../../components/common/Card';
import Loader from '../../../components/common/Loader';
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

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.height || '300px'};
  padding: 10px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ChartTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.colors?.text || '#333'};
`;

const ChartControls = styled.div`
  display: flex;
  gap: 10px;
`;

const PeriodSelector = styled.select`
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.colors?.border || '#ddd'};
  background-color: ${props => props.theme.colors?.background || '#fff'};
  color: ${props => props.theme.colors?.text || '#333'};
  font-size: 0.9rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors?.primary || '#4a90e2'};
  }
`;

const ChartTypeButton = styled.button`
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.colors?.border || '#ddd'};
  background-color: ${props => props.active 
    ? props.theme.colors?.primary || '#4a90e2' 
    : props.theme.colors?.background || '#fff'};
  color: ${props => props.active 
    ? '#fff' 
    : props.theme.colors?.text || '#333'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active 
      ? props.theme.colors?.primaryDark || '#3a80d2' 
      : props.theme.colors?.backgroundHover || '#f5f5f5'};
  }
`;

const NoDataContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${props => props.height || '300px'};
  color: ${props => props.theme.colors?.textSecondary || '#666'};
  font-style: italic;
`;

/**
 * IncidentChart component displays incident statistics over time
 * Supports multiple chart types (line, bar) and different time periods
 */
const IncidentChart = ({
  data,
  title = 'Incident Trends',
  type: initialType = 'line',
  period: initialPeriod = 'week',
  height = '300px',
  showLegend = true,
  isLoading = false,
  categories = [],
  stacked = false,
  showGrid = true,
  allowPeriodChange = true,
  allowTypeChange = true,
  onPeriodChange = null,
  onTypeChange = null,
}) => {
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState(initialType);
  const [period, setPeriod] = useState(initialPeriod);
  const theme = useSelector((state) => state.theme) || { mode: 'light' };
  const isDarkMode = theme.mode === 'dark';

  // Generate date labels based on selected period
  const dateLabels = useMemo(() => {
    const today = new Date();
    let dates = [];
    let interval = {};

    switch (period) {
      case 'week':
        interval = { start: subDays(today, 6), end: today };
        dates = eachDayOfInterval(interval);
        return dates.map(date => format(date, 'EEE'));
      
      case 'month':
        interval = { start: subDays(today, 29), end: today };
        dates = eachDayOfInterval(interval);
        return dates.map(date => format(date, 'dd MMM'));
      
      case 'quarter':
        interval = { start: subDays(today, 89), end: today };
        // For quarter, we'll use weeks instead of days
        const weeks = [];
        for (let i = 0; i < 13; i++) {
          const weekStart = subDays(today, i * 7 + 6);
          weeks.push(format(weekStart, 'dd MMM'));
        }
        return weeks.reverse();
      
      case 'year':
        // For year, we'll use months
        interval = { 
          start: startOfMonth(new Date(today.getFullYear(), 0, 1)), 
          end: endOfMonth(new Date(today.getFullYear(), 11, 31)) 
        };
        dates = eachMonthOfInterval(interval);
        return dates.map(date => format(date, 'MMM'));
      
      default:
        interval = { start: subDays(today, 6), end: today };
        dates = eachDayOfInterval(interval);
        return dates.map(date => format(date, 'EEE'));
    }
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
        `rgba(46, 204, 113, ${opacity})`,
        `rgba(52, 152, 219, ${opacity})`,
        `rgba(155, 89, 182, ${opacity})`,
        `rgba(241, 196, 15, ${opacity})`,
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    // If data is an array of datasets
    if (Array.isArray(data)) {
      data.forEach((dataset, index) => {
        const color = dataset.color || getRandomColor();
        
        processedData.datasets.push({
          label: dataset.label || `Dataset ${index + 1}`,
          data: dataset.data,
          borderColor: color,
          backgroundColor: chartType === 'line' ? color.replace(`, ${opacity})`, ', 0.2)') : color,
          fill: chartType === 'line' && dataset.fill !== false,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
          stack: stacked ? 'stack1' : undefined,
        });
      });
    } 
    // If data is a single dataset
    else if (data.data) {
      const color = data.color || getRandomColor();
      
      processedData.datasets.push({
        label: data.label || 'Incidents',
        data: data.data,
        borderColor: color,
        backgroundColor: chartType === 'line' ? color.replace(/, 1\)/, ', 0.2)') : color,
        fill: chartType === 'line' && data.fill !== false,
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
        const color = category.color || getRandomColor();
        
        processedData.datasets.push({
          label: category.label || `Category ${index + 1}`,
          data: category.data || Array(dateLabels.length).fill(0),
          borderColor: color,
          backgroundColor: chartType === 'line' ? color.replace(/, 1\)/, ', 0.2)') : color,
          fill: chartType === 'line',
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
          stack: stacked ? 'stack1' : undefined,
        });
      });
    }
    // If data is an object with key-value pairs
    else {
      const color = getRandomColor();
      
      processedData.datasets.push({
        label: 'Incidents',
        data: Object.values(data),
        borderColor: color,
        backgroundColor: chartType === 'line' ? color.replace(/, 1\)/, ', 0.2)') : color,
        fill: chartType === 'line',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
      });
      
      // Override labels if data keys match the expected format
      if (Object.keys(data).length === dateLabels.length) {
        processedData.labels = Object.keys(data);
      }
    }

    setChartData(processedData);
  }, [data, dateLabels, chartType, stacked, isLoading, categories]);

  // Chart options
  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'top',
          labels: {
            color: isDarkMode ? '#e0e0e0' : '#333',
            font: {
              size: 12,
            },
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        title: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: isDarkMode ? '#333' : 'rgba(255, 255, 255, 0.9)',
          titleColor: isDarkMode ? '#e0e0e0' : '#333',
          bodyColor: isDarkMode ? '#e0e0e0' : '#333',
          borderColor: isDarkMode ? '#555' : '#ddd',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 4,
          boxPadding: 3,
        },
      },
      scales: {
        x: {
          grid: {
            display: showGrid,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: isDarkMode ? '#e0e0e0' : '#333',
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            display: showGrid,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: isDarkMode ? '#e0e0e0' : '#333',
            precision: 0,
          },
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
    };
  }, [showLegend, showGrid, isDarkMode]);

  // Handle period change
  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setPeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };

  // Handle chart type change
  const handleTypeChange = (newType) => {
    setChartType(newType);
    if (onTypeChange) {
      onTypeChange(newType);
    }
  };

  // Render chart component
  const renderChart = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
      return (
        <NoDataContainer height={height}>
          No data available for the selected period
        </NoDataContainer>
      );
    }

    return chartType === 'line' ? (
      <Line data={chartData} options={chartOptions} />
    ) : (
      <Bar data={chartData} options={chartOptions} />
    );
  };

  return (
    <Card>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
        <ChartControls>
          {allowPeriodChange && (
            <PeriodSelector value={period} onChange={handlePeriodChange}>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">This Year</option>
            </PeriodSelector>
          )}
          {allowTypeChange && (
            <>
              <ChartTypeButton
                active={chartType === 'line'}
                onClick={() => handleTypeChange('line')}
              >
                Line
              </ChartTypeButton>
              <ChartTypeButton
                active={chartType === 'bar'}
                onClick={() => handleTypeChange('bar')}
              >
                Bar
              </ChartTypeButton>
            </>
          )}
        </ChartControls>
      </ChartHeader>
      <ChartContainer height={height}>
        {renderChart()}
      </ChartContainer>
    </Card>
  );
};

IncidentChart.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  title: PropTypes.string,
  type: PropTypes.oneOf(['line', 'bar']),
  period: PropTypes.oneOf(['week', 'month', 'quarter', 'year']),
  height: PropTypes.string,
  showLegend: PropTypes.bool,
  isLoading: PropTypes.bool,
  categories: PropTypes.array,
  stacked: PropTypes.bool,
  showGrid: PropTypes.bool,
  allowPeriodChange: PropTypes.bool,
  allowTypeChange: PropTypes.bool,
  onPeriodChange: PropTypes.func,
  onTypeChange: PropTypes.func,
};

export default IncidentChart;