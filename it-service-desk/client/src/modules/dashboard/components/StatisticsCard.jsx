import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Card from '../../../components/common/Card';

/**
 * StatisticsCard component displays a metric with title, value, change percentage and icon
 * Used in the dashboard to show key performance indicators and statistics
 */
const StatisticsCard = ({
  title,
  value,
  changePercentage,
  icon: Icon,
  color,
  isLoading,
  description,
  onClick,
}) => {
  // Determine if change is positive, negative or neutral
  const isPositive = useMemo(() => changePercentage > 0, [changePercentage]);
  const isNegative = useMemo(() => changePercentage < 0, [changePercentage]);
  const isNeutral = useMemo(() => changePercentage === 0, [changePercentage]);

  // Format the change percentage for display
  const formattedChange = useMemo(() => {
    const absChange = Math.abs(changePercentage);
    return `${absChange.toFixed(1)}%`;
  }, [changePercentage]);

  return (
    <StyledCard onClick={onClick} clickable={!!onClick} color={color}>
      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      ) : (
        <>
          <CardHeader>
            <Title>{title}</Title>
            {Icon && (
              <IconContainer color={color}>
                <Icon size={20} />
              </IconContainer>
            )}
          </CardHeader>
          <ValueContainer>
            <Value>{value}</Value>
            {changePercentage !== null && (
              <ChangeContainer
                isPositive={isPositive}
                isNegative={isNegative}
                isNeutral={isNeutral}
              >
                {isPositive && <FaArrowUp />}
                {isNegative && <FaArrowDown />}
                <ChangeText>{formattedChange}</ChangeText>
              </ChangeContainer>
            )}
          </ValueContainer>
          {description && <Description>{description}</Description>}
        </>
      )}
    </StyledCard>
  );
};

StatisticsCard.propTypes = {
  /** Title of the statistics card */
  title: PropTypes.string.isRequired,
  /** Value to display (can be a number or formatted string) */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  /** Percentage change (positive for increase, negative for decrease) */
  changePercentage: PropTypes.number,
  /** Icon component to display */
  icon: PropTypes.elementType,
  /** Primary color for the card accents */
  color: PropTypes.string,
  /** Loading state */
  isLoading: PropTypes.bool,
  /** Optional description text */
  description: PropTypes.string,
  /** Optional click handler */
  onClick: PropTypes.func,
};

StatisticsCard.defaultProps = {
  changePercentage: null,
  icon: null,
  color: '#4361ee',
  isLoading: false,
  description: '',
  onClick: null,
};

// Styled components
const StyledCard = styled(Card)`
  padding: 1.5rem;
  height: 100%;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border-left: 4px solid ${(props) => props.color};
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};

  &:hover {
    transform: ${(props) => (props.clickable ? 'translateY(-5px)' : 'none')};
    box-shadow: ${(props) =>
      props.clickable ? '0 10px 20px rgba(0, 0, 0, 0.1)' : ''};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${(props) => `${props.color}20`};
  color: ${(props) => props.color};
`;

const ValueContainer = styled.div`
  display: flex;
  align-items: baseline;
  margin-bottom: 0.5rem;
`;

const Value = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  margin-right: 0.75rem;
`;

const ChangeContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: ${(props) => {
    if (props.isPositive) return '#d1fae5';
    if (props.isNegative) return '#fee2e2';
    return '#f3f4f6';
  }};
  color: ${(props) => {
    if (props.isPositive) return '#059669';
    if (props.isNegative) return '#dc2626';
    return '#6b7280';
  }};
`;

const ChangeText = styled.span`
  margin-left: 0.25rem;
  font-weight: 600;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  margin-top: auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const LoadingSpinner = styled.div`
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4361ee;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default StatisticsCard;