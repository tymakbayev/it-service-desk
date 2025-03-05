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
} from 'chart.js';
import Card from '../../../components/common/Card';
import { useSelector } from 'react-redux';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

/**
 * EquipmentStatusChart component displays equipment status distribution
 * in a pie or doughnut chart format
 */
const EquipmentStatusChart = ({
  data,
  title,
  chartType,
  height,
  showLegend,
  isLoading,
  showLabels,
  centerText,
  onClick,
}) => {
  const [chartData, setChartData] = useState(null);
  const theme = useSelector((state) => state.theme);
  const isDarkMode = theme?.mode === 'dark';

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

    // Process data based on its format
    if (Array.isArray(data)) {
      // If data is an array of objects with label and value properties
      data.forEach((item) => {
        labels.push(item.label);
        values.push(item.value);
        
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
        
        // Use predefined colors if available, otherwise use defaults
        const bgColor = defaultColors[key] || getRandomColor(0.8);
        backgroundColors.push(bgColor);
        
        // Create slightly darker border color
        const borderColor = bgColor.replace('0.8', '1');
        borderColors.push(borderColor);
      });
    }

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
              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
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
          caretSize: 6,
        },
      },
      cutout: chartType === 'doughnut' ? '70%' : undefined,
      animation: {
        animateScale: true,
        animateRotate: true,
      },
    };
  }, [title, showLegend, chartType, isDarkMode]);

  // Render loading state
  if (isLoading) {
    return (
      <StyledCard>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </StyledCard>
    );
  }

  // Render no data state
  if (!chartData || chartData.labels.length === 0) {
    return (
      <StyledCard>
        <NoDataContainer>
          <NoDataText>No equipment status data available</NoDataText>
        </NoDataContainer>
      </StyledCard>
    );
  }

  return (
    <StyledCard onClick={onClick} clickable={!!onClick}>
      <ChartContainer height={height}>
        {chartType === 'pie' ? (
          <Pie data={chartData} options={options} />
        ) : (
          <DoughnutContainer>
            <Doughnut data={chartData} options={options} />
            {centerText && <CenterText>{centerText}</CenterText>}
          </DoughnutContainer>
        )}
      </ChartContainer>
      {showLabels && (
        <LabelContainer>
          {chartData.labels.map((label, index) => (
            <LabelItem key={label}>
              <LabelColor color={chartData.datasets[0].backgroundColor[index]} />
              <LabelText>{label}</LabelText>
              <LabelValue>{chartData.datasets[0].data[index]}</LabelValue>
            </LabelItem>
          ))}
        </LabelContainer>
      )}
    </StyledCard>
  );
};

EquipmentStatusChart.propTypes = {
  /** Chart data - can be array of {label, value} objects or object with status keys and count values */
  data: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        color: PropTypes.string,
      })
    ),
    PropTypes.object,
  ]),
  /** Chart title */
  title: PropTypes.string,
  /** Chart type - 'pie' or 'doughnut' */
  chartType: PropTypes.oneOf(['pie', 'doughnut']),
  /** Chart height in pixels */
  height: PropTypes.number,
  /** Whether to show the legend */
  showLegend: PropTypes.bool,
  /** Loading state */
  isLoading: PropTypes.bool,
  /** Whether to show labels below the chart */
  showLabels: PropTypes.bool,
  /** Text to display in the center of a doughnut chart */
  centerText: PropTypes.string,
  /** Optional click handler */
  onClick: PropTypes.func,
};

EquipmentStatusChart.defaultProps = {
  data: [],
  title: 'Equipment Status Distribution',
  chartType: 'doughnut',
  height: 300,
  showLegend: true,
  isLoading: false,
  showLabels: false,
  centerText: '',
  onClick: null,
};

// Styled components
const StyledCard = styled(Card)`
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};

  &:hover {
    transform: ${(props) => (props.clickable ? 'translateY(-5px)' : 'none')};
    box-shadow: ${(props) =>
      props.clickable ? '0 10px 20px rgba(0, 0, 0, 0.1)' : ''};
  }
`;

const ChartContainer = styled.div`
  position: relative;
  height: ${(props) => `${props.height}px`};
  width: 100%;
`;

const DoughnutContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

const CenterText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  color: #4a5568;
`;

const LabelContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 1.5rem;
  gap: 0.75rem;
`;

const LabelItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
`;

const LabelColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  margin-right: 0.5rem;
`;

const LabelText = styled.span`
  font-size: 0.875rem;
  color: #4a5568;
  margin-right: 0.5rem;
`;

const LabelValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 200px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const NoDataContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 200px;
`;

const NoDataText = styled.p`
  font-size: 1rem;
  color: #a0aec0;
  text-align: center;
`;

export default EquipmentStatusChart;