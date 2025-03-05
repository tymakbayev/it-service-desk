import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale
} from 'chart.js';
import Card from '../../../components/common/Card';
import Loader from '../../../components/common/Loader';
import { useSelector } from 'react-redux';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale);

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.height || '300px'};
`;

const CenterTextContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
`;

const CenterTextValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: ${props => props.theme.colors?.text || '#333'};
`;

const CenterTextLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors?.textSecondary || '#666'};
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
 * EquipmentStatusChart component displays equipment status distribution
 * in a pie or doughnut chart format
 */
const EquipmentStatusChart = ({
  data,
  title = 'Equipment Status Distribution',
  chartType = 'doughnut',
  height = '300px',
  showLegend = true,
  isLoading = false,
  showLabels = true,
  centerText = null,
  onClick = null,
}) => {
  const [chartData, setChartData] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const theme = useSelector((state) => state.theme) || { mode: 'light' };
  const isDarkMode = theme.mode === 'dark';

  // Default color palette for equipment statuses
  const defaultColors = useMemo(() => ({
    'In Use': 'rgba(54, 162, 235, 0.8)',
    'Available': 'rgba(75, 192, 192, 0.8)',
    'Maintenance': 'rgba(255, 206, 86, 0.8)',
    'Repair': 'rgba(255, 159, 64, 0.8)',
    'Decommissioned': 'rgba(255, 99, 132, 0.8)',
    'Reserved': 'rgba(153, 102, 255, 0.8)',
    'Lost': 'rgba(231, 76, 60, 0.8)',
    'Expired': 'rgba(149, 165, 166, 0.8)',
    // Fallback colors for additional statuses
    'default1': 'rgba(41, 128, 185, 0.8)',
    'default2': 'rgba(39, 174, 96, 0.8)',
    'default3': 'rgba(142, 68, 173, 0.8)',
    'default4': 'rgba(243, 156, 18, 0.8)',
  }), []);

  // Process and format chart data
  useEffect(() => {
    if (!data || isLoading) return;

    let labels = [];
    let values = [];
    let backgroundColors = [];
    let borderColors = [];
    let total = 0;

    // Process data based on its format
    if (Array.isArray(data)) {
      // If data is an array of objects with label and value properties
      data.forEach((item) => {
        labels.push(item.label);
        values.push(item.value);
        total += Number(item.value);
        
        // Use predefined colors if available, otherwise use defaults
        const bgColor = item.color || defaultColors[item.label] || getRandomColor(0.8);
        backgroundColors.push(bgColor);
        
        // Create slightly darker border color
        const borderColor = bgColor.replace('0.8', '1');
        borderColors.push(borderColor);
      });
    } else if (typeof data === 'object') {
      // If data is an object with status keys and count values
      Object.entries(data).forEach(([key, value]) => {
        labels.push(key);
        values.push(value);
        total += Number(value);
        
        // Use predefined colors if available, otherwise use defaults
        const bgColor = defaultColors[key] || getRandomColor(0.8);
        backgroundColors.push(bgColor);
        
        // Create slightly darker border color
        const borderColor = bgColor.replace('0.8', '1');
        borderColors.push(borderColor);
      });
    }

    setTotalItems(total);

    // Set chart data
    setChartData({
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    });
  }, [data, isLoading, defaultColors]);

  // Helper function to generate random colors
  const getRandomColor = (opacity = 1) => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Chart options
  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'right',
          labels: {
            color: isDarkMode ? '#e2e8f0' : '#4a5568',
            font: {
              size: 12,
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        title: {
          display: !!title,
          text: title,
          color: isDarkMode ? '#e2e8f0' : '#2d3748',
          font: {
            size: 16,
            weight: 'bold',
          },
          padding: {
            top: 10,
            bottom: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const percentage = totalItems > 0 ? Math.round((value / totalItems) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          },
          backgroundColor: isDarkMode ? '#4a5568' : '#fff',
          titleColor: isDarkMode ? '#e2e8f0' : '#2d3748',
          bodyColor: isDarkMode ? '#e2e8f0' : '#4a5568',
          borderColor: isDarkMode ? '#2d3748' : '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          usePointStyle: true,
        },
      },
      cutout: chartType === 'doughnut' ? '70%' : undefined,
      radius: '90%',
      onClick: onClick ? (event, elements) => {
        if (elements && elements.length > 0) {
          const { index } = elements[0];
          const label = chartData.labels[index];
          const value = chartData.datasets[0].data[index];
          onClick({ label, value, index });
        }
      } : undefined,
    };
  }, [showLegend, title, isDarkMode, chartType, onClick, chartData, totalItems]);

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <ChartContainer height={height}>
          <Loader />
        </ChartContainer>
      </Card>
    );
  }

  // Render no data state
  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <Card>
        <NoDataContainer height={height}>
          No equipment status data available
        </NoDataContainer>
      </Card>
    );
  }

  // Render chart with appropriate type
  return (
    <Card>
      <ChartContainer height={height}>
        {chartType === 'pie' ? (
          <Pie data={chartData} options={options} />
        ) : (
          <Doughnut data={chartData} options={options} />
        )}
        
        {centerText && chartType === 'doughnut' && (
          <CenterTextContainer>
            <CenterTextValue>
              {typeof centerText === 'object' ? centerText.value : totalItems}
            </CenterTextValue>
            <CenterTextLabel>
              {typeof centerText === 'object' ? centerText.label : 'Total'}
            </CenterTextLabel>
          </CenterTextContainer>
        )}
      </ChartContainer>
    </Card>
  );
};

EquipmentStatusChart.propTypes = {
  /**
   * Data for the chart. Can be an array of objects with label and value properties,
   * or an object with status keys and count values
   */
  data: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string,
    })),
    PropTypes.object,
  ]),
  
  /** Chart title */
  title: PropTypes.string,
  
  /** Type of chart to display: 'pie' or 'doughnut' */
  chartType: PropTypes.oneOf(['pie', 'doughnut']),
  
  /** Height of the chart container */
  height: PropTypes.string,
  
  /** Whether to show the legend */
  showLegend: PropTypes.bool,
  
  /** Loading state */
  isLoading: PropTypes.bool,
  
  /** Whether to show labels on the chart */
  showLabels: PropTypes.bool,
  
  /** Text to display in the center of a doughnut chart */
  centerText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    }),
  ]),
  
  /** Callback function when a chart segment is clicked */
  onClick: PropTypes.func,
};

export default EquipmentStatusChart;