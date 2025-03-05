// client/src/modules/dashboard/chartUtils.js

/**
 * Utility functions for chart generation and data processing
 * Used by dashboard components to prepare and format data for Chart.js
 */

import { format, subDays, subMonths, parseISO, eachDayOfInterval, eachMonthOfInterval, isWithinInterval } from 'date-fns';

/**
 * Chart color palettes
 * Provides consistent colors for different chart types
 */
export const chartColors = {
  // Primary colors for main datasets
  primary: [
    'rgba(75, 192, 192, 1)',   // teal
    'rgba(54, 162, 235, 1)',   // blue
    'rgba(153, 102, 255, 1)',  // purple
    'rgba(255, 159, 64, 1)',   // orange
    'rgba(255, 99, 132, 1)',   // pink
    'rgba(255, 206, 86, 1)',   // yellow
  ],
  // Background colors with transparency
  background: [
    'rgba(75, 192, 192, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)',
    'rgba(255, 99, 132, 0.2)',
    'rgba(255, 206, 86, 0.2)',
  ],
  // Status-specific colors
  status: {
    open: 'rgba(255, 159, 64, 1)',
    inProgress: 'rgba(54, 162, 235, 1)',
    resolved: 'rgba(75, 192, 192, 1)',
    closed: 'rgba(153, 102, 255, 1)',
    critical: 'rgba(255, 99, 132, 1)',
    high: 'rgba(255, 159, 64, 1)',
    medium: 'rgba(255, 206, 86, 1)',
    low: 'rgba(75, 192, 192, 1)',
  },
  // Equipment status colors
  equipment: {
    operational: 'rgba(75, 192, 192, 1)',
    maintenance: 'rgba(255, 206, 86, 1)',
    repair: 'rgba(255, 159, 64, 1)',
    retired: 'rgba(153, 102, 255, 1)',
    broken: 'rgba(255, 99, 132, 1)',
  }
};

/**
 * Default chart options for different chart types
 */
export const chartOptions = {
  line: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      },
    },
  },
  bar: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  },
  pie: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
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
        }
      },
    },
  },
  doughnut: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
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
        }
      },
    },
  },
};

/**
 * Generates date labels for time-based charts
 * @param {string} period - time period ('week', 'month', 'quarter', 'year')
 * @returns {Array} array of formatted date labels
 */
export const generateDateLabels = (period) => {
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
      interval = { start: subMonths(today, 3), end: today };
      dates = eachDayOfInterval(interval);
      // Group by week for quarter view
      const weeks = [];
      for (let i = 0; i < dates.length; i += 7) {
        const weekStart = dates[i];
        weeks.push(format(weekStart, 'dd MMM'));
      }
      return weeks;
    
    case 'year':
      interval = { start: subMonths(today, 11), end: today };
      dates = eachMonthOfInterval(interval);
      return dates.map(date => format(date, 'MMM'));
    
    default:
      interval = { start: subDays(today, 6), end: today };
      dates = eachDayOfInterval(interval);
      return dates.map(date => format(date, 'EEE'));
  }
};

/**
 * Groups incident data by date
 * @param {Array} incidents - array of incident objects
 * @param {string} period - time period ('week', 'month', 'quarter', 'year')
 * @param {string} dateField - field name containing the date (e.g., 'createdAt', 'updatedAt')
 * @returns {Object} grouped data by date
 */
export const groupIncidentsByDate = (incidents, period, dateField = 'createdAt') => {
  if (!incidents || !incidents.length) return {};

  const today = new Date();
  let startDate;
  let formatPattern;

  // Determine start date and format pattern based on period
  switch (period) {
    case 'week':
      startDate = subDays(today, 6);
      formatPattern = 'EEE';
      break;
    case 'month':
      startDate = subDays(today, 29);
      formatPattern = 'dd MMM';
      break;
    case 'quarter':
      startDate = subMonths(today, 3);
      formatPattern = 'dd MMM';
      break;
    case 'year':
      startDate = subMonths(today, 11);
      formatPattern = 'MMM';
      break;
    default:
      startDate = subDays(today, 6);
      formatPattern = 'EEE';
  }

  const dateInterval = { start: startDate, end: today };
  const groupedData = {};

  // Initialize all dates in the range with zero counts
  const dateLabels = generateDateLabels(period);
  dateLabels.forEach(label => {
    groupedData[label] = 0;
  });

  // Count incidents for each date
  incidents.forEach(incident => {
    const incidentDate = parseISO(incident[dateField]);
    
    if (isWithinInterval(incidentDate, dateInterval)) {
      const formattedDate = format(incidentDate, formatPattern);
      
      if (groupedData[formattedDate] !== undefined) {
        groupedData[formattedDate]++;
      }
    }
  });

  return groupedData;
};

/**
 * Groups incident data by status
 * @param {Array} incidents - array of incident objects
 * @returns {Object} grouped data by status
 */
export const groupIncidentsByStatus = (incidents) => {
  if (!incidents || !incidents.length) return {};

  const statusCounts = {
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  };

  incidents.forEach(incident => {
    if (statusCounts[incident.status] !== undefined) {
      statusCounts[incident.status]++;
    }
  });

  return statusCounts;
};

/**
 * Groups incident data by priority
 * @param {Array} incidents - array of incident objects
 * @returns {Object} grouped data by priority
 */
export const groupIncidentsByPriority = (incidents) => {
  if (!incidents || !incidents.length) return {};

  const priorityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  incidents.forEach(incident => {
    if (priorityCounts[incident.priority] !== undefined) {
      priorityCounts[incident.priority]++;
    }
  });

  return priorityCounts;
};

/**
 * Groups equipment data by status
 * @param {Array} equipment - array of equipment objects
 * @returns {Object} grouped data by status
 */
export const groupEquipmentByStatus = (equipment) => {
  if (!equipment || !equipment.length) return {};

  const statusCounts = {
    operational: 0,
    maintenance: 0,
    repair: 0,
    retired: 0,
    broken: 0
  };

  equipment.forEach(item => {
    if (statusCounts[item.status] !== undefined) {
      statusCounts[item.status]++;
    }
  });

  return statusCounts;
};

/**
 * Groups equipment data by type
 * @param {Array} equipment - array of equipment objects
 * @returns {Object} grouped data by type
 */
export const groupEquipmentByType = (equipment) => {
  if (!equipment || !equipment.length) return {};

  const typeCounts = {};

  equipment.forEach(item => {
    if (!typeCounts[item.type]) {
      typeCounts[item.type] = 0;
    }
    typeCounts[item.type]++;
  });

  return typeCounts;
};

/**
 * Prepares data for line or bar charts
 * @param {Object} groupedData - data grouped by category
 * @param {string} label - dataset label
 * @param {string} chartType - chart type ('line' or 'bar')
 * @param {string} colorIndex - index for color selection
 * @returns {Object} formatted chart data
 */
export const prepareChartData = (groupedData, label, chartType = 'line', colorIndex = 0) => {
  const labels = Object.keys(groupedData);
  const data = Object.values(groupedData);
  const color = chartColors.primary[colorIndex % chartColors.primary.length];
  const backgroundColor = chartType === 'line' 
    ? chartColors.background[colorIndex % chartColors.background.length]
    : color;

  return {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor,
        fill: chartType === 'line',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
};

/**
 * Prepares data for pie or doughnut charts
 * @param {Object} groupedData - data grouped by category
 * @param {string} label - dataset label
 * @returns {Object} formatted chart data
 */
export const preparePieChartData = (groupedData) => {
  const labels = Object.keys(groupedData);
  const data = Object.values(groupedData);
  
  // Select appropriate color set based on labels
  let backgroundColors = [];
  
  if (labels.includes('open') || labels.includes('inProgress') || 
      labels.includes('resolved') || labels.includes('closed')) {
    // Incident status colors
    backgroundColors = labels.map(label => chartColors.status[label] || chartColors.primary[0]);
  } else if (labels.includes('operational') || labels.includes('maintenance') || 
             labels.includes('repair') || labels.includes('retired')) {
    // Equipment status colors
    backgroundColors = labels.map(label => chartColors.equipment[label] || chartColors.primary[0]);
  } else if (labels.includes('critical') || labels.includes('high') || 
             labels.includes('medium') || labels.includes('low')) {
    // Priority colors
    backgroundColors = labels.map(label => chartColors.status[label] || chartColors.primary[0]);
  } else {
    // Default colors
    backgroundColors = labels.map((_, index) => 
      chartColors.primary[index % chartColors.primary.length]
    );
  }

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace(', 0.2)', ', 1)')),
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };
};

/**
 * Calculates performance metrics from incident data
 * @param {Array} incidents - array of incident objects
 * @returns {Object} calculated performance metrics
 */
export const calculatePerformanceMetrics = (incidents) => {
  if (!incidents || !incidents.length) return {
    avgResolutionTime: 0,
    resolvedOnTime: 0,
    resolvedLate: 0,
    resolutionRate: 0
  };

  const resolvedIncidents = incidents.filter(incident => 
    incident.status === 'resolved' || incident.status === 'closed'
  );
  
  const totalResolved = resolvedIncidents.length;
  
  if (totalResolved === 0) {
    return {
      avgResolutionTime: 0,
      resolvedOnTime: 0,
      resolvedLate: 0,
      resolutionRate: 0
    };
  }

  // Calculate average resolution time in hours
  let totalResolutionTime = 0;
  let resolvedOnTime = 0;
  let resolvedLate = 0;

  resolvedIncidents.forEach(incident => {
    const createdAt = new Date(incident.createdAt);
    const resolvedAt = new Date(incident.resolvedAt || incident.updatedAt);
    
    // Calculate resolution time in hours
    const resolutionTime = (resolvedAt - createdAt) / (1000 * 60 * 60);
    totalResolutionTime += resolutionTime;
    
    // Check if resolved within SLA
    // Assuming SLA is stored in hours on the incident or determined by priority
    const slaTime = incident.slaTime || 
                   (incident.priority === 'critical' ? 4 : 
                    incident.priority === 'high' ? 8 : 
                    incident.priority === 'medium' ? 24 : 48);
    
    if (resolutionTime <= slaTime) {
      resolvedOnTime++;
    } else {
      resolvedLate++;
    }
  });

  const avgResolutionTime = totalResolutionTime / totalResolved;
  const resolutionRate = (totalResolved / incidents.length) * 100;

  return {
    avgResolutionTime: parseFloat(avgResolutionTime.toFixed(2)),
    resolvedOnTime,
    resolvedLate,
    resolutionRate: parseFloat(resolutionRate.toFixed(2))
  };
};

/**
 * Applies theme-specific styling to chart options
 * @param {Object} options - chart options
 * @param {boolean} isDarkMode - whether dark mode is enabled
 * @returns {Object} updated chart options with theme-specific styling
 */
export const applyChartTheme = (options, isDarkMode) => {
  const themeOptions = { ...options };
  
  if (isDarkMode) {
    // Text color
    const textColor = 'rgba(255, 255, 255, 0.8)';
    
    // Apply to title
    if (themeOptions.plugins && themeOptions.plugins.title) {
      themeOptions.plugins.title.color = textColor;
    }
    
    // Apply to legend
    if (themeOptions.plugins && themeOptions.plugins.legend) {
      themeOptions.plugins.legend.labels = {
        ...themeOptions.plugins.legend.labels,
        color: textColor
      };
    }
    
    // Apply to axes
    if (themeOptions.scales) {
      if (themeOptions.scales.y) {
        themeOptions.scales.y.ticks = {
          ...themeOptions.scales.y.ticks,
          color: textColor
        };
        themeOptions.scales.y.grid = {
          ...themeOptions.scales.y.grid,
          color: 'rgba(255, 255, 255, 0.1)'
        };
      }
      
      if (themeOptions.scales.x) {
        themeOptions.scales.x.ticks = {
          ...themeOptions.scales.x.ticks,
          color: textColor
        };
        themeOptions.scales.x.grid = {
          ...themeOptions.scales.x.grid,
          color: 'rgba(255, 255, 255, 0.1)'
        };
      }
    }
  }
  
  return themeOptions;
};

export default {
  chartColors,
  chartOptions,
  generateDateLabels,
  groupIncidentsByDate,
  groupIncidentsByStatus,
  groupIncidentsByPriority,
  groupEquipmentByStatus,
  groupEquipmentByType,
  prepareChartData,
  preparePieChartData,
  calculatePerformanceMetrics,
  applyChartTheme
};