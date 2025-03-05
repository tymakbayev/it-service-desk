import { ChartOptions } from './types';

// Default chart colors
export const defaultColors = [
  '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
  '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
];

// Helper function to prepare data for pie/doughnut charts
export const preparePieChartData = (data: Array<{ [key: string]: any }>, labelKey: string, valueKey: string) => {
  return {
    labels: data.map(item => item[labelKey]),
    datasets: [
      {
        data: data.map(item => item[valueKey]),
        backgroundColor: defaultColors.slice(0, data.length),
        borderWidth: 1
      }
    ]
  };
};

// Helper function to prepare data for bar charts
export const prepareBarChartData = (
  data: Array<{ [key: string]: any }>,
  labelKey: string,
  valueKey: string,
  options: ChartOptions = {}
) => {
  return {
    labels: data.map(item => item[labelKey]),
    datasets: [
      {
        label: options.title || '',
        data: data.map(item => item[valueKey]),
        backgroundColor: options.colors?.[0] || defaultColors[0],
        borderColor: options.colors?.[0] || defaultColors[0],
        borderWidth: 1
      }
    ]
  };
};

// Helper function to prepare data for line charts
export const prepareLineChartData = (
  data: Array<{ [key: string]: any }>,
  labelKey: string,
  datasets: Array<{ key: string; label: string; color?: string }>
) => {
  return {
    labels: data.map(item => item[labelKey]),
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: data.map(item => item[dataset.key]),
      borderColor: dataset.color || defaultColors[index % defaultColors.length],
      backgroundColor: 'transparent',
      tension: 0.4
    }))
  };
};

// Helper function to get chart.js options
export const getChartOptions = (options: ChartOptions = {}) => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: options.showLegend !== false,
        position: 'top' as const
      },
      title: {
        display: !!options.title,
        text: options.title || ''
      }
    },
    animation: {
      animateScale: options.animate !== false,
      animateRotate: options.animate !== false
    }
  };
};

// Helper function to format large numbers
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper function to format time duration in hours
export const formatDuration = (hours: number): string => {
  if (hours < 1) {
    return Math.round(hours * 60) + ' min';
  }
  if (hours < 24) {
    return hours.toFixed(1) + ' hrs';
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return days + ' days';
  }
  return days + ' days ' + remainingHours.toFixed(0) + ' hrs';
};