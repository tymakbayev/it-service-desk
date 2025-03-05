import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Components
import StatisticsCard from '../components/StatisticsCard';
import IncidentChart from '../components/IncidentChart';
import EquipmentStatusChart from '../components/EquipmentStatusChart';
import RecentIncidents from '../components/RecentIncidents';
import PerformanceMetrics from '../components/PerformanceMetrics';
import { Card, Loader, Alert } from '../../../components/common';
import Layout from '../../../components/Layout';

// Redux actions
import { fetchDashboardData, fetchPerformanceMetrics } from '../store/dashboardSlice';

// Hooks
import useAuth from '../../../hooks/useAuth';

// Utils
import { formatDate } from '../../../utils/dateUtils';
import { ROLES } from '../../../utils/constants';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ChartContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaea;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  gap: 10px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [timeRange, setTimeRange] = useState('week');
  
  const { 
    dashboardData, 
    performanceMetrics, 
    loading, 
    error 
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    dispatch(fetchDashboardData(timeRange));
    dispatch(fetchPerformanceMetrics(timeRange));
  }, [dispatch, isAuthenticated, navigate, timeRange]);

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  if (loading && !dashboardData) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <Loader size="large" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert type="error" message={`Error loading dashboard data: ${error}`} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Dashboard</h1>
          <FilterContainer>
            <Select value={timeRange} onChange={handleTimeRangeChange}>
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </Select>
          </FilterContainer>
        </div>

        {loading && (
          <div style={{ position: 'fixed', top: '60px', right: '20px' }}>
            <Loader size="small" />
          </div>
        )}

        {dashboardData && (
          <>
            <DashboardContainer>
              <StatisticsCard 
                title="Total Incidents" 
                value={dashboardData.totalIncidents} 
                icon="ticket-alt" 
                color="#4a90e2" 
                change={dashboardData.incidentChange} 
              />
              <StatisticsCard 
                title="Open Incidents" 
                value={dashboardData.openIncidents} 
                icon="exclamation-circle" 
                color="#f39c12" 
                change={dashboardData.openIncidentChange} 
              />
              <StatisticsCard 
                title="Resolved Today" 
                value={dashboardData.resolvedToday} 
                icon="check-circle" 
                color="#2ecc71" 
              />
              <StatisticsCard 
                title="Total Equipment" 
                value={dashboardData.totalEquipment} 
                icon="desktop" 
                color="#9b59b6" 
              />
            </DashboardContainer>

            <ChartContainer>
              <Card>
                <SectionTitle>Incident Trends</SectionTitle>
                <IncidentChart data={dashboardData.incidentTrends} timeRange={timeRange} />
              </Card>
              <Card>
                <SectionTitle>Equipment Status</SectionTitle>
                <EquipmentStatusChart data={dashboardData.equipmentStatus} />
              </Card>
            </ChartContainer>

            <Card>
              <SectionTitle>Recent Incidents</SectionTitle>
              <RecentIncidents incidents={dashboardData.recentIncidents} />
            </Card>

            {user && (user.role === ROLES.ADMIN || user.role === ROLES.TECHNICIAN) && (
              <Card style={{ marginTop: '20px' }}>
                <SectionTitle>Performance Metrics</SectionTitle>
                {performanceMetrics ? (
                  <PerformanceMetrics 
                    metrics={performanceMetrics} 
                    timeRange={timeRange} 
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Loader size="medium" />
                  </div>
                )}
              </Card>
            )}
          </>
        )}

        {!dashboardData && !loading && (
          <Alert 
            type="info" 
            message="No dashboard data available. Please check back later or contact your administrator." 
          />
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;