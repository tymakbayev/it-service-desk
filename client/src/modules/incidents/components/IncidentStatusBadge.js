import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { INCIDENT_STATUSES, INCIDENT_PRIORITIES } from '../../../utils/constants';

/**
 * Component for displaying incident status and priority as a colored badge
 * Supports different styles based on status or priority type
 */
const IncidentStatusBadge = ({ type, value, size = 'medium', showText = true }) => {
  // Determine if we're displaying a status or priority badge
  const isStatus = type === 'status';
  const isPriority = type === 'priority';
  
  // Get the appropriate color based on status or priority
  const getColor = () => {
    if (isStatus) {
      switch (value) {
        case INCIDENT_STATUSES.NEW:
          return '#3498db'; // Blue
        case INCIDENT_STATUSES.IN_PROGRESS:
          return '#f39c12'; // Orange
        case INCIDENT_STATUSES.ON_HOLD:
          return '#9b59b6'; // Purple
        case INCIDENT_STATUSES.RESOLVED:
          return '#2ecc71'; // Green
        case INCIDENT_STATUSES.CLOSED:
          return '#7f8c8d'; // Gray
        case INCIDENT_STATUSES.REOPENED:
          return '#e74c3c'; // Red
        default:
          return '#95a5a6'; // Light gray (default)
      }
    } else if (isPriority) {
      switch (value) {
        case INCIDENT_PRIORITIES.CRITICAL:
          return '#e74c3c'; // Red
        case INCIDENT_PRIORITIES.HIGH:
          return '#e67e22'; // Dark orange
        case INCIDENT_PRIORITIES.MEDIUM:
          return '#f39c12'; // Orange
        case INCIDENT_PRIORITIES.LOW:
          return '#3498db'; // Blue
        default:
          return '#95a5a6'; // Light gray (default)
      }
    }
    return '#95a5a6'; // Default color
  };

  // Get the appropriate label text
  const getLabel = () => {
    if (!showText) return '';
    
    // Format the value for display (replace underscores with spaces and capitalize)
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get the appropriate icon (can be extended with actual icons)
  const getIcon = () => {
    // This could be extended to return actual icons based on status/priority
    return null;
  };

  return (
    <Badge 
      color={getColor()} 
      size={size}
      data-testid={`${type}-badge-${value}`}
    >
      {getIcon()}
      {showText && <span>{getLabel()}</span>}
    </Badge>
  );
};

// Styled components
const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.color};
  color: white;
  border-radius: 4px;
  font-weight: 500;
  padding: ${props => {
    switch (props.size) {
      case 'small':
        return '0.15rem 0.5rem';
      case 'large':
        return '0.5rem 1rem';
      case 'medium':
      default:
        return '0.25rem 0.75rem';
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return '0.75rem';
      case 'large':
        return '1rem';
      case 'medium':
      default:
        return '0.875rem';
    }
  }};
  white-space: nowrap;
  
  span {
    margin-left: ${props => props.icon ? '0.25rem' : '0'};
  }
  
  &:hover {
    opacity: 0.9;
  }
  
  transition: all 0.2s ease;
`;

// PropTypes validation
IncidentStatusBadge.propTypes = {
  /**
   * Type of badge - 'status' or 'priority'
   */
  type: PropTypes.oneOf(['status', 'priority']).isRequired,
  
  /**
   * Value of the status or priority
   */
  value: PropTypes.string.isRequired,
  
  /**
   * Size of the badge
   */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  /**
   * Whether to show the text label
   */
  showText: PropTypes.bool
};

// Default props
IncidentStatusBadge.defaultProps = {
  size: 'medium',
  showText: true
};

export default IncidentStatusBadge;