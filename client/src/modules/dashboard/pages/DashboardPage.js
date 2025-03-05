import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Components
import StatisticsCard from '../components/StatisticsCard';
import IncidentChart from '../components/IncidentChart';
import EquipmentStatusChart from '../components/EquipmentStatusChart';
import RecentIncidents from '../components/RecentIncidents';
import PerformanceMetrics from '../components/PerformanceMetrics';
import { Card, Loader, Alert, Button } from '../../../components/common';
import Layout from '../../../components/Layout';

// Redux actions
import { fetchDashboardData, fetchPerformanceMetrics } from '../dashboardSlice';

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

const RefreshButton = styled(Button)`
  padding: 8px 12px;
  margin-left: 10px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  text-align: center;
  margin: 20px 0;
`;

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [timeRange, setTimeRange] = useState('week');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { 
    dashboardData, 
    performanceMetrics, 
    loading, 
    error 
  } = useSelector((state) => state.dashboard);

  // Check if user has access to this page
  const hasAccess = useMemo(() => {
    if (!user) return false;
    return [ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN].includes(user.role);
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard' } });
      return;
    }

    if (!hasAccess) {
      navigate('/unauthorized');
      return;
    }

    dispatch(fetchDashboardData(timeRange));
    dispatch(fetchPerformanceMetrics(timeRange));
  }, [dispatch, isAuthenticated, navigate, timeRange, hasAccess, refreshKey]);

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const renderStatisticsCards = () => {
    if (!dashboardData) return null;

    return (
      <DashboardContainer>
        <StatisticsCard 
          title="Total Incidents" 
          value={dashboardData.totalIncidents} 
          icon="ticket-alt" 
          color="#4a90e2" 
          change={dashboardData.incidentChange} 
          changeLabel={`${dashboardData.incidentChange >= 0 ? '+' : ''}${dashboardData.incidentChange}% from last ${timeRange}`}
        />
        <StatisticsCard 
          title="Open Incidents" 
          value={dashboardData.openIncidents} 
          icon="exclamation-circle" 
          color="#f39c12" 
          change={dashboardData.openIncidentChange}
          changeLabel={`${dashboardData.openIncidentChange >= 0 ? '+' : ''}${dashboardData.openIncidentChange}% from last ${timeRange}`}
        />
        <StatisticsCard 
          title="Resolved Today" 
          value={dashboardData.resolvedToday} 
          icon="check-circle" 
          color="#2ecc71" 
          change={dashboardData.resolvedChange}
          changeLabel={`${dashboardData.resolvedChange >= 0 ? '+' : ''}${dashboardData.resolvedChange}% from yesterday`}
        />
        <StatisticsCard 
          title="Total Equipment" 
          value={dashboardData.totalEquipment} 
          icon="desktop" 
          color="#9b59b6" 
          change={dashboardData.equipmentChange}
          changeLabel={`${dashboardData.equipmentChange >= 0 ? '+' : ''}${dashboardData.equipmentChange}% from last ${timeRange}`}
        />
      </DashboardContainer>
    );
  };

  const renderCharts = () => {
    if (!dashboardData) return null;

    return (
      <>
        <SectionTitle>Analytics Overview</SectionTitle>
        <ChartContainer>
          <Card>
            <h3>Incident Trends</h3>
            <IncidentChart data={dashboardData.incidentTrends} timeRange={timeRange} />
          </Card>
          <Card>
            <h3>Equipment Status</h3>
            <EquipmentStatusChart data={dashboardData.equipmentStatus} />
          </Card>
        </ChartContainer>
      </>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!performanceMetrics) return null;

    return (
      <>
        <SectionTitle>Performance Metrics</SectionTitle>
        <Card>
          <PerformanceMetrics 
            metrics={performanceMetrics} 
            timeRange={timeRange} 
          />
        </Card>
      </>
    );
  };

  const renderRecentIncidents = () => {
    if (!dashboardData || !dashboardData.recentIncidents || dashboardData.recentIncidents.length === 0) {
      return (
        <EmptyState>
          <h3>No Recent Incidents</h3>
          <p>There are no recent incidents to display.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/incidents/create')}
            style={{ marginTop: '15px' }}
          >
            Create New Incident
          </Button>
        </EmptyState>
      );
    }

    return (
      <>
        <SectionTitle>Recent Incidents</SectionTitle>
        <Card>
          <RecentIncidents 
            incidents={dashboardData.recentIncidents} 
            onViewIncident={(id) => navigate(`/incidents/${id}`)} 
          />
        </Card>
      </>
    );
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
        <Alert 
          type="error" 
          message={`Error loading dashboard data: ${error}`} 
          action={
            <Button variant="secondary" onClick={handleRefresh}>
              Try Again
            </Button>
          }
        />
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
            <RefreshButton 
              variant="secondary" 
              onClick={handleRefresh}
              icon="refresh"
              disabled={loading}
            >
              Refresh
            </RefreshButton>
          </FilterContainer>
        </div>

        {loading && (
          <div style={{ position: 'fixed', top: '60px', right: '20px' }}>
            <Loader size="small" />
          </div>
        )}

        {dashboardData ? (
          <>
            <div style={{ marginBottom: '10px' }}>
              <p>Last updated: {formatDate(new Date(), 'PPpp')}</p>
            </div>
            
            {renderStatisticsCards()}
            {renderCharts()}
            {renderPerformanceMetrics()}
            {renderRecentIncidents()}
          </>
        ) : (
          <EmptyState>
            <h3>No Dashboard Data Available</h3>
            <p>There is no data to display at this time.</p>
            <Button 
              variant="primary" 
              onClick={handleRefresh}
              style={{ marginTop: '15px' }}
            >
              Refresh Dashboard
            </Button>
          </EmptyState>
        )}

        {user && user.role === ROLES.ADMIN && (
          <div style={{ marginTop: '30px', textAlign: 'right' }}>
            <Button 
              variant="primary" 
              onClick={() => navigate('/reports/generate')}
            >
              Generate Dashboard Report
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;