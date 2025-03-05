import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import IncidentModule from './IncidentModule';
import { IncidentFilters, IncidentStatus, IncidentPriority, IncidentCategory } from './IncidentTypes';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../services/websocket/WebSocketProvider';

const IncidentList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subscribe } = useWebSocket();
  
  const { incidents, loading, error, totalCount, page, pageSize, filters } = useSelector(
    (state: RootState) => state.incidents
  );
  
  const [localFilters, setLocalFilters] = useState<IncidentFilters>(filters);
  
  useEffect(() => {
    // Загружаем инциденты при монтировании компонента
    IncidentModule.listIncidents();
    
    // Подписываемся на обновления инцидентов через WebSocket
    const unsubscribe = IncidentModule.subscribeToIncidentUpdates(() => {
      // При получении обновления перезагружаем список инцидентов
      IncidentModule.listIncidents();
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Обработчик изменения фильтров
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setLocalFilters(prev => {
      // Для мультиселектов (статус, приоритет, категория)
      if (name === 'status' || name === 'priority' || name === 'category') {
        const select = e.target as HTMLSelectElement;
        const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
        
        return {
          ...prev,
          [name]: selectedOptions
        };
      }
      
      // Для обычных полей
      return {
        ...prev,
        [name]: value
      };
    });
  };
  
  // Применение фильтров
  const applyFilters = () => {
    IncidentModule.listIncidents(1, pageSize, localFilters);
  };
  
  // Сброс фильтров
  const resetFilters = () => {
    setLocalFilters({});
    IncidentModule.listIncidents(1, pageSize, {});
  };
  
  // Обработчик изменения страницы
  const handlePageChange = (newPage: number) => {
    IncidentModule.listIncidents(newPage, pageSize, filters);
  };
  
  // Обработчик изменения размера страницы
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    IncidentModule.listIncidents(1, newPageSize, filters);
  };
  
  // Обработчик клика по инциденту
  const handleIncidentClick = (incidentId: string) => {
    navigate(`/incidents/${incidentId}`);
  };
  
  // Обработчик создания нового инцидента
  const handleCreateIncident = () => {
    navigate('/incidents/new');
  };
  
  if (loading && incidents.length === 0) {
    return <div className="loading">Загрузка инцидентов...</div>;
  }
  
  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }
  
  // Расчет количества страниц
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return (
    <div className="incident-list-container">
      <div className="incident-list-header">
        <h2>Инциденты</h2>
        <button className="create-incident-btn" onClick={handleCreateIncident}>
          Создать инцидент
        </button>
      </div>
      
      <div className="incident-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="status">Статус:</label>
            <select 
              id="status" 
              name="status" 
              multiple 
              value={localFilters.status || []} 
              onChange={handleFilterChange}
            >
              {Object.values(IncidentStatus).map(status => (
                <option key={status} value={status}>
                  {status === IncidentStatus.NEW ? 'Новый' :
                   status === IncidentStatus.ASSIGNED ? 'Назначен' :
                   status === IncidentStatus.IN_PROGRESS ? 'В работе' :
                   status === IncidentStatus.ON_HOLD ? 'На удержании' :
                   status === IncidentStatus.RESOLVED ? 'Решен' :
                   status === IncidentStatus.CLOSED ? 'Закрыт' :
                   'Отменен'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="priority">Приоритет:</label>
            <select 
              id="priority" 
              name="priority" 
              multiple 
              value={localFilters.priority || []} 
              onChange={handleFilterChange}
            >
              {Object.values(IncidentPriority).map(priority => (
                <option key={priority} value={priority}>
                  {priority === IncidentPriority.LOW ? 'Низкий' :
                   priority === IncidentPriority.MEDIUM ? 'Средний' :
                   priority === IncidentPriority.HIGH ? 'Высокий' :
                   'Критический'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="category">Категория:</label>
            <select 
              id="category" 
              name="category" 
              multiple 
              value={localFilters.category || []} 
              onChange={handleFilterChange}
            >
              {Object.values(IncidentCategory).map(category => (
                <option key={category} value={category}>
                  {category === IncidentCategory.HARDWARE ? 'Оборудование' :
                   category === IncidentCategory.SOFTWARE ? 'Программное обеспечение' :
                   category === IncidentCategory.NETWORK ? 'Сеть' :
                   category === IncidentCategory.SECURITY ? 'Безопасность' :
                   category === IncidentCategory.ACCESS ? 'Доступ' :
                   category === IncidentCategory.SERVICE_REQUEST ? 'Запрос на обслуживание' :
                   'Другое'}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="searchQuery">Поиск:</label>
            <input 
              type="text" 
              id="searchQuery" 
              name="searchQuery" 
              value={localFilters.searchQuery || ''} 
              onChange={handleFilterChange} 
              placeholder="Поиск по названию или описанию"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="dateFrom">С даты:</label>
            <input 
              type="date" 
              id="dateFrom" 
              name="dateFrom" 
              value={localFilters.dateFrom ? new Date(localFilters.dateFrom).toISOString().split('T')[0] : ''} 
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="dateTo">По дату:</label>
            <input 
              type="date" 
              id="dateTo" 
              name="dateTo" 
              value={localFilters.dateTo ? new Date(localFilters.dateTo).toISOString().split('T')[0] : ''} 
              onChange={handleFilterChange}
            />
          </div>
        </div>
        
        <div className="filter-actions">
          <button onClick={applyFilters}>Применить фильтры</button>
          <button onClick={resetFilters}>Сбросить фильтры</button>
        </div>
      </div>
      
      {incidents.length === 0 ? (
        <div className="no-incidents">Инциденты не найдены</div>
      ) : (
        <>
          <div className="incident-table-container">
            <table className="incident-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Статус</th>
                  <th>Приоритет</th>
                  <th>Категория</th>
                  <th>Заявитель</th>
                  <th>Исполнитель</th>
                  <th>Создан</th>
                  <th>Срок</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(incident => (
                  <tr 
                    key={incident.id} 
                    onClick={() => handleIncidentClick(incident.id)}
                    className={`incident-row ${incident.priority} ${incident.slaBreached ? 'sla-breached' : ''}`}
                  >
                    <td>{incident.id.substring(0, 8)}...</td>
                    <td>{incident.title}</td>
                    <td>
                      <span className={`status-badge ${incident.status}`}>
                        {incident.status === IncidentStatus.NEW ? 'Новый' :
                         incident.status === IncidentStatus.ASSIGNED ? 'Назначен' :
                         incident.status === IncidentStatus.IN_PROGRESS ? 'В работе' :
                         incident.status === IncidentStatus.ON_HOLD ? 'На удержании' :
                         incident.status === IncidentStatus.RESOLVED ? 'Решен' :
                         incident.status === IncidentStatus.CLOSED ? 'Закрыт' :
                         'Отменен'}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${incident.priority}`}>
                        {incident.priority === IncidentPriority.LOW ? 'Низкий' :
                         incident.priority === IncidentPriority.MEDIUM ? 'Средний' :
                         incident.priority === IncidentPriority.HIGH ? 'Высокий' :
                         'Критический'}
                      </span>
                    </td>
                    <td>{incident.category === IncidentCategory.HARDWARE ? 'Оборудование' :
                         incident.category === IncidentCategory.SOFTWARE ? 'ПО' :
                         incident.category === IncidentCategory.NETWORK ? 'Сеть' :
                         incident.category === IncidentCategory.SECURITY ? 'Безопасность' :
                         incident.category === IncidentCategory.ACCESS ? 'Доступ' :
                         incident.category === IncidentCategory.SERVICE_REQUEST ? 'Запрос' :
                         'Другое'}</td>
                    <td>{incident.reporterName}</td>
                    <td>{incident.assigneeName || '—'}</td>
                    <td>{new Date(incident.createdAt).toLocaleDateString()}</td>
                    <td>{incident.dueDate ? new Date(incident.dueDate).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="pagination">
            <div className="page-size">
              <label htmlFor="pageSize">Показывать по:</label>
              <select 
                id="pageSize" 
                value={pageSize} 
                onChange={handlePageSizeChange}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            
            <div className="page-controls">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={page === 1}
              >
                &laquo;
              </button>
              <button 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 1}
              >
                &lsaquo;
              </button>
              
              <span className="page-info">
                Страница {page} из {totalPages} (всего {totalCount} инцидентов)
              </span>
              
              <button 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page === totalPages}
              >
                &rsaquo;
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)} 
                disabled={page === totalPages}
              >
                &raquo;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IncidentList;
