const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const IncidentModel = require('../models/incident.model');
const EquipmentModel = require('../models/equipment.model');
const UserModel = require('../models/user.model');
const config = require('../config/config');
const { formatDate } = require('../utils/helpers');

/**
 * Сервис для генерации и управления отчетами
 */
class ReportService {
  /**
   * Генерирует отчет по инцидентам
   * @param {Object} filters - Фильтры для отчета
   * @param {Date} filters.startDate - Начальная дата
   * @param {Date} filters.endDate - Конечная дата
   * @param {String} filters.status - Статус инцидентов
   * @param {String} filters.priority - Приоритет инцидентов
   * @param {String} filters.assignedTo - ID назначенного специалиста
   * @param {String} format - Формат отчета (pdf, xlsx, csv)
   * @returns {Promise<Object>} - Объект с путем к файлу и метаданными отчета
   */
  async generateIncidentReport(filters, format = 'pdf') {
    try {
      // Построение запроса на основе фильтров
      const query = {};
      
      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.priority) {
        query.priority = filters.priority;
      }
      
      if (filters.assignedTo) {
        query.assignedTo = mongoose.Types.ObjectId(filters.assignedTo);
      }

      // Получение данных с заполнением связанных полей
      const incidents = await IncidentModel.find(query)
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email')
        .populate('relatedEquipment', 'name inventoryNumber type')
        .sort({ createdAt: -1 });

      // Подготовка данных для отчета
      const reportData = {
        title: 'Отчет по инцидентам',
        generatedAt: new Date(),
        filters: {
          period: filters.startDate && filters.endDate ? 
            `${formatDate(new Date(filters.startDate))} - ${formatDate(new Date(filters.endDate))}` : 
            'Все время',
          status: filters.status || 'Все',
          priority: filters.priority || 'Все',
          assignedTo: filters.assignedTo ? 
            await this._getUserNameById(filters.assignedTo) : 
            'Все специалисты'
        },
        summary: {
          total: incidents.length,
          byStatus: this._countByProperty(incidents, 'status'),
          byPriority: this._countByProperty(incidents, 'priority')
        },
        incidents: incidents.map(incident => ({
          id: incident._id,
          title: incident.title,
          description: incident.description,
          status: incident.status,
          priority: incident.priority,
          reportedBy: incident.reportedBy ? incident.reportedBy.name : 'Н/Д',
          assignedTo: incident.assignedTo ? incident.assignedTo.name : 'Не назначен',
          relatedEquipment: incident.relatedEquipment ? 
            `${incident.relatedEquipment.name} (${incident.relatedEquipment.inventoryNumber})` : 
            'Н/Д',
          createdAt: formatDate(incident.createdAt),
          updatedAt: formatDate(incident.updatedAt),
          resolutionTime: incident.resolvedAt ? 
            this._calculateResolutionTime(incident.createdAt, incident.resolvedAt) : 
            'Не решен'
        }))
      };

      // Генерация отчета в выбранном формате
      const fileName = `incident-report-${Date.now()}`;
      let filePath;
      
      switch (format.toLowerCase()) {
        case 'pdf':
          filePath = await this._generatePdfReport(reportData, fileName);
          break;
        case 'xlsx':
          filePath = await this._generateExcelReport(reportData, fileName);
          break;
        case 'csv':
          filePath = await this._generateCsvReport(reportData, fileName);
          break;
        default:
          throw new Error(`Неподдерживаемый формат отчета: ${format}`);
      }

      // Сохранение метаданных отчета в базе данных
      const reportMeta = {
        type: 'incident',
        format,
        filePath,
        filters,
        generatedAt: new Date(),
        recordCount: incidents.length
      };

      return {
        filePath,
        meta: reportMeta
      };
    } catch (error) {
      console.error('Error generating incident report:', error);
      throw error;
    }
  }

  /**
   * Генерирует отчет по оборудованию
   * @param {Object} filters - Фильтры для отчета
   * @param {String} filters.type - Тип оборудования
   * @param {String} filters.status - Статус оборудования
   * @param {String} filters.location - Местоположение
   * @param {String} format - Формат отчета (pdf, xlsx, csv)
   * @returns {Promise<Object>} - Объект с путем к файлу и метаданными отчета
   */
  async generateEquipmentReport(filters, format = 'pdf') {
    try {
      // Построение запроса на основе фильтров
      const query = {};
      
      if (filters.type) {
        query.type = filters.type;
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.location) {
        query.location = filters.location;
      }

      // Получение данных с заполнением связанных полей
      const equipment = await EquipmentModel.find(query)
        .populate('assignedTo', 'name email department')
        .sort({ name: 1 });

      // Подготовка данных для отчета
      const reportData = {
        title: 'Отчет по оборудованию',
        generatedAt: new Date(),
        filters: {
          type: filters.type || 'Все типы',
          status: filters.status || 'Все статусы',
          location: filters.location || 'Все местоположения'
        },
        summary: {
          total: equipment.length,
          byType: this._countByProperty(equipment, 'type'),
          byStatus: this._countByProperty(equipment, 'status')
        },
        equipment: equipment.map(item => ({
          id: item._id,
          name: item.name,
          type: item.type,
          model: item.model,
          manufacturer: item.manufacturer,
          inventoryNumber: item.inventoryNumber,
          serialNumber: item.serialNumber,
          purchaseDate: formatDate(item.purchaseDate),
          warrantyExpires: item.warrantyExpires ? formatDate(item.warrantyExpires) : 'Н/Д',
          status: item.status,
          location: item.location,
          assignedTo: item.assignedTo ? item.assignedTo.name : 'Не назначено',
          lastMaintenance: item.lastMaintenance ? formatDate(item.lastMaintenance) : 'Н/Д'
        }))
      };

      // Генерация отчета в выбранном формате
      const fileName = `equipment-report-${Date.now()}`;
      let filePath;
      
      switch (format.toLowerCase()) {
        case 'pdf':
          filePath = await this._generatePdfReport(reportData, fileName, 'equipment');
          break;
        case 'xlsx':
          filePath = await this._generateExcelReport(reportData, fileName, 'equipment');
          break;
        case 'csv':
          filePath = await this._generateCsvReport(reportData, fileName, 'equipment');
          break;
        default:
          throw new Error(`Неподдерживаемый формат отчета: ${format}`);
      }

      // Сохранение метаданных отчета в базе данных
      const reportMeta = {
        type: 'equipment',
        format,
        filePath,
        filters,
        generatedAt: new Date(),
        recordCount: equipment.length
      };

      return {
        filePath,
        meta: reportMeta
      };
    } catch (error) {
      console.error('Error generating equipment report:', error);
      throw error;
    }
  }

  /**
   * Генерирует сводный отчет по производительности
   * @param {Object} filters - Фильтры для отчета
   * @param {Date} filters.startDate - Начальная дата
   * @param {Date} filters.endDate - Конечная дата
   * @param {String} format - Формат отчета (pdf, xlsx, csv)
   * @returns {Promise<Object>} - Объект с путем к файлу и метаданными отчета
   */
  async generatePerformanceReport(filters, format = 'pdf') {
    try {
      const startDate = filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
      
      // Получение инцидентов за период
      const incidents = await IncidentModel.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate('assignedTo', 'name');

      // Получение всех техников
      const technicians = await UserModel.find({ role: 'technician' });
      
      // Расчет метрик производительности
      const technicianPerformance = {};
      
      technicians.forEach(tech => {
        technicianPerformance[tech._id] = {
          name: tech.name,
          totalAssigned: 0,
          resolved: 0,
          avgResolutionTime: 0,
          totalResolutionTime: 0
        };
      });
      
      incidents.forEach(incident => {
        if (incident.assignedTo && technicianPerformance[incident.assignedTo._id]) {
          const techId = incident.assignedTo._id;
          technicianPerformance[techId].totalAssigned++;
          
          if (incident.status === 'resolved' || incident.status === 'closed') {
            technicianPerformance[techId].resolved++;
            
            if (incident.resolvedAt) {
              const resolutionTime = incident.resolvedAt - incident.createdAt;
              technicianPerformance[techId].totalResolutionTime += resolutionTime;
            }
          }
        }
      });
      
      // Расчет средних значений
      Object.keys(technicianPerformance).forEach(techId => {
        const tech = technicianPerformance[techId];
        if (tech.resolved > 0) {
          tech.avgResolutionTime = tech.totalResolutionTime / tech.resolved;
          // Преобразование в часы
          tech.avgResolutionTime = Math.round(tech.avgResolutionTime / (1000 * 60 * 60) * 10) / 10;
        }
        tech.resolutionRate = tech.totalAssigned > 0 ? 
          Math.round((tech.resolved / tech.totalAssigned) * 100) : 0;
      });
      
      // Подготовка данных для отчета
      const reportData = {
        title: 'Отчет по производительности',
        generatedAt: new Date(),
        filters: {
          period: `${formatDate(startDate)} - ${formatDate(endDate)}`
        },
        summary: {
          totalIncidents: incidents.length,
          resolvedIncidents: incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length,
          avgResolutionTime: this._calculateAverageResolutionTime(incidents)
        },
        technicians: Object.values(technicianPerformance).map(tech => ({
          name: tech.name,
          totalAssigned: tech.totalAssigned,
          resolved: tech.resolved,
          resolutionRate: `${tech.resolutionRate}%`,
          avgResolutionTime: `${tech.avgResolutionTime} ч.`
        }))
      };

      // Генерация отчета в выбранном формате
      const fileName = `performance-report-${Date.now()}`;
      let filePath;
      
      switch (format.toLowerCase()) {
        case 'pdf':
          filePath = await this._generatePdfReport(reportData, fileName, 'performance');
          break;
        case 'xlsx':
          filePath = await this._generateExcelReport(reportData, fileName, 'performance');
          break;
        case 'csv':
          filePath = await this._generateCsvReport(reportData, fileName, 'performance');
          break;
        default:
          throw new Error(`Неподдерживаемый формат отчета: ${format}`);
      }

      // Сохранение метаданных отчета в базе данных
      const reportMeta = {
        type: 'performance',
        format,
        filePath,
        filters,
        generatedAt: new Date(),
        recordCount: technicians.length
      };

      return {
        filePath,
        meta: reportMeta
      };
    } catch (error) {
      console.error('Error generating performance report:', error);
      throw error;
    }
  }

  /**
   * Получает список доступных отчетов
   * @param {Object} filters - Фильтры для списка отчетов
   * @param {String} filters.type - Тип отчета
   * @param {Date} filters.startDate - Начальная дата генерации
   * @param {Date} filters.endDate - Конечная дата генерации
   * @param {Number} page - Номер страницы
   * @param {Number} limit - Количество записей на странице
   * @returns {Promise<Object>} - Объект со списком отчетов и метаданными пагинации
   */
  async getReportsList(filters = {}, page = 1, limit = 10) {
    try {
      const query = {};
      
      if (filters.type) {
        query.type = filters.type;
      }
      
      if (filters.startDate && filters.endDate) {
        query.generatedAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }
      
      const skip = (page - 1) * limit;
      
      const reports = await ReportModel.find(query)
        .sort({ generatedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await ReportModel.countDocuments(query);
      
      return {
        reports,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting reports list:', error);
      throw error;
    }
  }

  /**
   * Получает отчет по ID
   * @param {String} reportId - ID отчета
   * @returns {Promise<Object>} - Объект с данными отчета
   */
  async getReportById(reportId) {
    try {
      const report = await ReportModel.findById(reportId);
      
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Проверка существования файла
      if (!fs.existsSync(report.filePath)) {
        throw new Error('Report file not found');
      }
      
      return report;
    } catch (error) {
      console.error('Error getting report by ID:', error);
      throw error;
    }
  }

  /**
   * Удаляет отчет по ID
   * @param {String} reportId - ID отчета
   * @returns {Promise<Boolean>} - Результат операции
   */
  async deleteReport(reportId) {
    try {
      const report = await ReportModel.findById(reportId);
      
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Удаление файла отчета
      if (fs.existsSync(report.filePath)) {
        fs.unlinkSync(report.filePath);
      }
      
      // Удаление записи из базы данных
      await ReportModel.findByIdAndDelete(reportId);
      
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  /**
   * Генерирует PDF-отчет
   * @param {Object} data - Данные для отчета
   * @param {String} fileName - Имя файла без расширения
   * @param {String} type - Тип отчета (incident, equipment, performance)
   * @returns {Promise<String>} - Путь к сгенерированному файлу
   * @private
   */
  async _generatePdfReport(data, fileName, type = 'incident') {
    return new Promise((resolve, reject) => {
      try {
        // Создание директории для отчетов, если не существует
        const reportsDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        const filePath = path.join(reportsDir, `${fileName}.pdf`);
        const doc = new PDFDocument({ margin: 50 });
        
        // Создание потока для записи файла
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        
        // Добавление заголовка и метаданных
        doc.fontSize(20).text(data.title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Дата формирования: ${formatDate(data.generatedAt)}`, { align: 'right' });
        doc.moveDown();
        
        // Добавление информации о фильтрах
        doc.fontSize(14).text('Параметры отчета:', { underline: true });
        doc.moveDown(0.5);
        
        Object.entries(data.filters).forEach(([key, value]) => {
          doc.fontSize(12).text(`${this._formatFilterName(key)}: ${value}`);
        });
        
        doc.moveDown();
        
        // Добавление сводной информации
        doc.fontSize(14).text('Сводная информация:', { underline: true });
        doc.moveDown(0.5);
        
        Object.entries(data.summary).forEach(([key, value]) => {
          if (typeof value === 'object') {
            doc.fontSize(12).text(`${this._formatFilterName(key)}:`);
            Object.entries(value).forEach(([subKey, subValue]) => {
              doc.fontSize(10).text(`  ${subKey}: ${subValue}`, { indent: 20 });
            });
          } else {
            doc.fontSize(12).text(`${this._formatFilterName(key)}: ${value}`);
          }
        });
        
        doc.moveDown();
        
        // Добавление основных данных в зависимости от типа отчета
        switch (type) {
          case 'incident':
            this._addIncidentsToPdf(doc, data.incidents);
            break;
          case 'equipment':
            this._addEquipmentToPdf(doc, data.equipment);
            break;
          case 'performance':
            this._addPerformanceToPdf(doc, data.technicians);
            break;
        }
        
        // Добавление нижнего колонтитула
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).text(
            `IT Service Desk - Страница ${i + 1} из ${pageCount}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
        }
        
        // Завершение документа
        doc.end();
        
        stream.on('finish', () => {
          resolve(filePath);
        });
        
        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Добавляет таблицу инцидентов в PDF-документ
   * @param {PDFDocument} doc - Экземпляр PDFDocument
   * @param {Array} incidents - Массив инцидентов
   * @private
   */
  _addIncidentsToPdf(doc, incidents) {
    doc.fontSize(14).text('Список инцидентов:', { underline: true });
    doc.moveDown();
    
    // Определение ширины колонок
    const tableWidth = doc.page.width - 100;
    const colWidths = {
      id: tableWidth * 0.1,
      title: tableWidth * 0.25,
      status: tableWidth * 0.1,
      priority: tableWidth * 0.1,
      assignedTo: tableWidth * 0.15,
      createdAt: tableWidth * 0.15,
      resolutionTime: tableWidth * 0.15
    };
    
    // Заголовки таблицы
    let y = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('ID', 50, y, { width: colWidths.id });
    doc.text('Название', 50 + colWidths.id, y, { width: colWidths.title });
    doc.text('Статус', 50 + colWidths.id + colWidths.title, y, { width: colWidths.status });
    doc.text('Приоритет', 50 + colWidths.id + colWidths.title + colWidths.status, y, { width: colWidths.priority });
    doc.text('Назначен', 50 + colWidths.id + colWidths.title + colWidths.status + colWidths.priority, y, { width: colWidths.assignedTo });
    doc.text('Создан', 50 + colWidths.id + colWidths.title + colWidths.status + colWidths.priority + colWidths.assignedTo, y, { width: colWidths.createdAt });
    doc.text('Время решения', 50 + colWidths.id + colWidths.title + colWidths.status + colWidths.priority + colWidths.assignedTo + colWidths.createdAt, y, { width: colWidths.resolutionTime });
    
    doc.moveDown();
    y = doc.y;
    
    // Горизонтальная линия после заголовков
    doc.moveTo(50, y - 5).lineTo(doc.page.width - 50, y - 5).stroke();
    
    // Данные таблицы
    doc.font('Helvetica');
    incidents.forEach((incident, index) => {
      // Проверка, достаточно ли места на странице для новой строки
      if (doc.y + 40 > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      } else {
        y = doc.y;
      }
      
      const idText = incident.id.toString().substring(0, 8) + '...';
      
      doc.fontSize(9);
      doc.text(idText, 50, y, { width: colWidths.id });
      doc.text(incident.title, 50 + colWidths.id, y, { width: colWidths.title });
      doc.text(incident.status, 50 + colWidths.id + colWidths.title, y, { width: colWidths.status });
      doc.text(incident.priority, 50 + colWidths.id + colWidths.title + colWidths.status, y, { width: colWidths.priority });
      doc.text(incident.assignedTo, 50 + colWidths.id + colWidths.title + colWidths.status + colWidths.priority, y, { width: colWidths.assignedTo });
      doc.text(incident.createdAt, 50 + colWidths.id + colWidths.title + colWidths.status + colWidths.priority + colWidths.assignedTo, y, { width: colWidths.createdAt });
      doc.text(incident.resolutionTime, 50 + colWidths.id + colWidths.title + colWidths.status + colWidths.priority + colWidths.assignedTo + colWidths.createdAt, y, { width: colWidths.resolutionTime });
      
      doc.moveDown(1.5);
      
      // Добавление разделительной линии между строками
      if (index < incidents.length - 1) {
        doc.moveTo(50, doc.y - 10).lineTo(doc.page.width - 50, doc.y - 10).stroke();
      }
    });
  }

  /**
   * Добавляет таблицу оборудования в PDF-документ
   * @param {PDFDocument} doc - Экземпляр PDFDocument
   * @param {Array} equipment - Массив оборудования
   * @private
   */
  _addEquipmentToPdf(doc, equipment) {
    doc.fontSize(14).text('Список оборудования:', { underline: true });
    doc.moveDown();
    
    // Определение ширины колонок
    const tableWidth = doc.page.width - 100;
    const colWidths = {
      name: tableWidth * 0.2,
      type: tableWidth * 0.15,
      inventoryNumber: tableWidth * 0.15,
      status: tableWidth * 0.1,
      location: tableWidth * 0.15,
      assignedTo: tableWidth * 0.15,
      lastMaintenance: tableWidth * 0.1
    };
    
    // Заголовки таблицы
    let y = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Название', 50, y, { width: colWidths.name });
    doc.text('Тип', 50 + colWidths.name, y, { width: colWidths.type });
    doc.text('Инв. номер', 50 + colWidths.name + colWidths.type, y, { width: colWidths.inventoryNumber });
    doc.text('Статус', 50 + colWidths.name + colWidths.type + colWidths.inventoryNumber, y, { width: colWidths.status });
    doc.text('Местоположение', 50 + colWidths.name + colWidths.type + colWidths.inventoryNumber + colWidths.status, y, { width: colWidths.location });
    doc.text('Назначено', 50 + colWidths.name + colWidths.type + colWidths.inventoryNumber + colWidths.status + colWidths.location, y, { width: colWidths.assignedTo });
    doc.text('Обслуживание', 50 + colWidths.name + colWidths.type + colWidths.inventoryNumber + colWidths.status + colWidths.location + colWidths.assignedTo, y, { width: colWidths.lastMaintenance });
    
    doc.moveDown();
    y = doc.y;
    
    // Горизонтальная линия после заголовков
    doc.moveTo(50, y - 5).lineTo(doc.page.width - 50, y - 5).stroke();
    
    // Данные таблицы
    doc.font('Helvetica');
    equipment.forEach((item, index) => {
      // Проверка, достаточно ли места на странице для новой строки
      if (doc.y + 40 > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      } else {
        y = doc.y;
      }
      
      doc.fontSize(9);
      doc.text(item.name, 50, y, { width: colWidths.name });
      doc.text(item.type, 50 + colWidths.name, y, { width: colWidths.type });
      doc.text(item.inventoryNumber, 50 + colWidths.name + colWidths.type, y, { width: colWidths.inventoryNumber });
      doc.text(item.status, 50 + colWidths.name + colWidths.type + colWidths.inventoryNumber, y, { width: colWidths.status });
      doc.text(item.location, 50 + colWidths.name + colWidths.type + colWidths.inventoryNumber + colWidths.status, y, { width: colWidths.location });
      doc.text(item.assignedTo, 50 + colWidths.name + colWidths.type + colWidths.inventoryNumber + colWidths.status + colWidths.location, y, { width: colWidths.assignedTo });
      doc.text(item.lastMaintenance, 50 + colWidths.name + colWidths.type + colWidths.inventoryNumber + colWidths.status + colWidths.location + colWidths.assignedTo, y, { width: colWidths.lastMaintenance });
      
      doc.moveDown(1.5);
      
      // Добавление разделительной линии между строками
      if (index < equipment.length - 1) {
        doc.moveTo(50, doc.y - 10).lineTo(doc.page.width - 50, doc.y - 10).stroke();
      }
    });
  }

  /**
   * Добавляет таблицу производительности в PDF-документ
   * @param {PDFDocument} doc - Экземпляр PDFDocument
   * @param {Array} technicians - Массив данных о техниках
   * @private
   */
  _addPerformanceToPdf(doc, technicians) {
    doc.fontSize(14).text('Производительность специалистов:', { underline: true });
    doc.moveDown();
    
    // Определение ширины колонок
    const tableWidth = doc.page.width - 100;
    const colWidths = {
      name: tableWidth * 0.25,
      totalAssigned: tableWidth * 0.2,
      resolved: tableWidth * 0.2,
      resolutionRate: tableWidth * 0.15,
      avgResolutionTime: tableWidth * 0.2
    };
    
    // Заголовки таблицы
    let y = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Специалист', 50, y, { width: colWidths.name });
    doc.text('Назначено', 50 + colWidths.name, y, { width: colWidths.totalAssigned });
    doc.text('Решено', 50 + colWidths.name + colWidths.totalAssigned, y, { width: colWidths.resolved });
    doc.text('% решения', 50 + colWidths.name + colWidths.totalAssigned + colWidths.resolved, y, { width: colWidths.resolutionRate });
    doc.text('Среднее время', 50 + colWidths.name + colWidths.totalAssigned + colWidths.resolved + colWidths.resolutionRate, y, { width: colWidths.avgResolutionTime });
    
    doc.moveDown();
    y = doc.y;
    
    // Горизонтальная линия после заголовков
    doc.moveTo(50, y - 5).lineTo(doc.page.width - 50, y - 5).stroke();
    
    // Данные таблицы
    doc.font('Helvetica');
    technicians.forEach((tech, index) => {
      // Проверка, достаточно ли места на странице для новой строки
      if (doc.y + 40 > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      } else {
        y = doc.y;
      }
      
      doc.fontSize(9);
      doc.text(tech.name, 50, y, { width: colWidths.name });
      doc.text(tech.totalAssigned.toString(), 50 + colWidths.name, y, { width: colWidths.totalAssigned });
      doc.text(tech.resolved.toString(), 50 + colWidths.name + colWidths.totalAssigned, y, { width: colWidths.resolved });
      doc.text(tech.resolutionRate, 50 + colWidths.name + colWidths.totalAssigned + colWidths.resolved, y, { width: colWidths.resolutionRate });
      doc.text(tech.avgResolutionTime, 50 + colWidths.name + colWidths.totalAssigned + colWidths.resolved + colWidths.resolutionRate, y, { width: colWidths.avgResolutionTime });
      
      doc.moveDown(1.5);
      
      // Добавление разделительной линии между строками
      if (index < technicians.length - 1) {
        doc.moveTo(50, doc.y - 10).lineTo(doc.page.width - 50, doc.y - 10).stroke();
      }
    });
  }

  /**
   * Генерирует Excel-отчет
   * @param {Object} data - Данные для отчета
   * @param {String} fileName - Имя файла без расширения
   * @param {String} type - Тип отчета (incident, equipment, performance)
   * @returns {Promise<String>} - Путь к сгенерированному файлу
   * @private
   */
  async _generateExcelReport(data, fileName, type = 'incident') {
    try {
      // Создание директории для отчетов, если не существует
      const reportsDir = path.join(__dirname, '..', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const filePath = path.join(reportsDir, `${fileName}.xlsx`);
      
      // Создание рабочей книги и листа
      const workbook = xlsx.utils.book_new();
      
      // Добавление информации о отчете
      const infoData = [
        [data.title],
        [`Дата формирования: ${formatDate(data.generatedAt)}`],
        [''],
        ['Параметры отчета:']
      ];
      
      // Добавление фильтров
      Object.entries(data.filters).forEach(([key, value]) => {
        infoData.push([`${this._formatFilterName(key)}: ${value}`]);
      });
      
      infoData.push(['']);
      infoData.push(['Сводная информация:']);
      
      // Добавление сводной информации
      Object.entries(data.summary).forEach(([key, value]) => {
        if (typeof value === 'object') {
          infoData.push([`${this._formatFilterName(key)}:`]);
          Object.entries(value).forEach(([subKey, subValue]) => {
            infoData.push([`  ${subKey}`, subValue]);
          });
        } else {
          infoData.push([`${this._formatFilterName(key)}:`, value]);
        }
      });
      
      // Создание листа с информацией
      const infoSheet = xlsx.utils.aoa_to_sheet(infoData);
      xlsx.utils.book_append_sheet(workbook, infoSheet, 'Информация');
      
      // Создание листа с данными в зависимости от типа отчета
      let dataSheet;
      
      switch (type) {
        case 'incident':
          dataSheet = this._createIncidentsExcelSheet(data.incidents);
          xlsx.utils.book_append_sheet(workbook, dataSheet, 'Инциденты');
          break;
        case 'equipment':
          dataSheet = this._createEquipmentExcelSheet(data.equipment);
          xlsx.utils.book_append_sheet(workbook, dataSheet, 'Оборудование');
          break;
        case 'performance':
          dataSheet = this._createPerformanceExcelSheet(data.technicians);
          xlsx.utils.book_append_sheet(workbook, dataSheet, 'Производительность');
          break;
      }
      
      // Запись файла
      xlsx.writeFile(workbook, filePath);
      
      return filePath;
    } catch (error) {
      console.error('Error generating Excel report:', error);
      throw error;
    }
  }

  /**
   * Создает лист Excel с данными об инцидентах
   * @param {Array} incidents - Массив инцидентов
   * @returns {Object} - Лист Excel
   * @private
   */
  _createIncidentsExcelSheet(incidents) {
    // Заголовки таблицы
    const headers = [
      'ID', 'Название', 'Описание', 'Статус', 'Приоритет', 
      'Создал', 'Назначен', 'Оборудование', 'Создан', 'Обновлен', 'Время решения'
    ];
    
    // Данные таблицы
    const rows = incidents.map(incident => [
      incident.id,
      incident.title,
      incident.description,
      incident.status,
      incident.priority,
      incident.reportedBy,
      incident.assignedTo,
      incident.relatedEquipment,
      incident.createdAt,
      incident.updatedAt,
      incident.resolutionTime
    ]);
    
    // Создание листа
    const sheet = xlsx.utils.aoa_to_sheet([headers, ...rows]);
    
    // Настройка ширины колонок
    const colWidths = [
      { wch: 24 }, // ID
      { wch: 30 }, // Название
      { wch: 40 }, // Описание
      { wch: 15 }, // Статус
      { wch: 15 }, // Приоритет
      { wch: 20 }, // Создал
      { wch: 20 }, // Назначен
      { wch: 30 }, // Оборудование
      { wch: 20 }, // Создан
      { wch: 20 }, // Обновлен
      { wch: 20 }  // Время решения
    ];
    
    sheet['!cols'] = colWidths;
    
    return sheet;
  }

  /**
   * Создает лист Excel с данными об оборудовании
   * @param {Array} equipment - Массив оборудования
   * @returns {Object} - Лист Excel
   * @private
   */
  _createEquipmentExcelSheet(equipment) {
    // Заголовки таблицы
    const headers = [
      'ID', 'Название', 'Тип', 'Модель', 'Производитель', 
      'Инв. номер', 'Серийный номер', 'Дата покупки', 'Гарантия до', 
      'Статус', 'Местоположение', 'Назначено', 'Последнее обслуживание'
    ];
    
    // Данные таблицы
    const rows = equipment.map(item => [
      item.id,
      item.name,
      item.type,
      item.model,
      item.manufacturer,
      item.inventoryNumber,
      item.serialNumber,
      item.purchaseDate,
      item.warrantyExpires,
      item.status,
      item.location,
      item.assignedTo,
      item.lastMaintenance
    ]);
    
    // Создание листа
    const sheet = xlsx.utils.aoa_to_sheet([headers, ...rows]);
    
    // Настройка ширины колонок
    const colWidths = [
      { wch: 24 }, // ID
      { wch: 30 }, // Название
      { wch: 20 }, // Тип
      { wch: 20 }, // Модель
      { wch: 20 }, // Производитель
      { wch: 15 }, // Инв. номер
      { wch: 20 }, // Серийный номер
      { wch: 15 }, // Дата покупки
      { wch: 15 }, // Гарантия до
      { wch: 15 }, // Статус
      { wch: 20 }, // Местоположение
      { wch: 20 }, // Назначено
      { wch: 20 }  // Последнее обслуживание
    ];
    
    sheet['!cols'] = colWidths;
    
    return sheet;
  }

  /**
   * Создает лист Excel с данными о производительности
   * @param {Array} technicians - Массив данных о техниках
   * @returns {Object} - Лист Excel
   * @private
   */
  _createPerformanceExcelSheet(technicians) {
    // Заголовки таблицы
    const headers = [
      'Специалист', 'Назначено инцидентов', 'Решено инцидентов', 
      'Процент решения', 'Среднее время решения'
    ];
    
    // Данные таблицы
    const rows = technicians.map(tech => [
      tech.name,
      tech.totalAssigned,
      tech.resolved,
      tech.resolutionRate,
      tech.avgResolutionTime
    ]);
    
    // Создание листа
    const sheet = xlsx.utils.aoa_to_sheet([headers, ...rows]);
    
    // Настройка ширины колонок
    const colWidths = [
      { wch: 30 }, // Специалист
      { wch: 20 }, // Назначено инцидентов
      { wch: 20 }, // Решено инцидентов
      { wch: 20 }, // Процент решения
      { wch: 25 }  // Среднее время решения
    ];
    
    sheet['!cols'] = colWidths;
    
    return sheet;
  }

  /**
   * Генерирует CSV-отчет
   * @param {Object} data - Данные для отчета
   * @param {String} fileName - Имя файла без расширения
   * @param {String} type - Тип отчета (incident, equipment, performance)
   * @returns {Promise<String>} - Путь к сгенерированному файлу
   * @private
   */
  async _generateCsvReport(data, fileName, type = 'incident') {
    try {
      // Создание директории для отчетов, если не существует
      const reportsDir = path.join(__dirname, '..', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const filePath = path.join(reportsDir, `${fileName}.csv`);
      
      // Подготовка данных в зависимости от типа отчета
      let csvContent;
      
      switch (type) {
        case 'incident':
          csvContent = this._createIncidentsCsvContent(data.incidents);
          break;
        case 'equipment':
          csvContent = this._createEquipmentCsvContent(data.equipment);
          break;
        case 'performance':
          csvContent = this._createPerformanceCsvContent(data.technicians);
          break;
        default:
          throw new Error(`Неподдерживаемый тип отчета: ${type}`);
      }
      
      // Запись файла
      fs.writeFileSync(filePath, csvContent);
      
      return filePath;
    } catch (error) {
      console.error('Error generating CSV report:', error);
      throw error;
    }
  }

  /**
   * Создает содержимое CSV-файла с данными об инцидентах
   * @param {Array} incidents - Массив инцидентов
   * @returns {String} - Содержимое CSV-файла
   * @private
   */
  _createIncidentsCsvContent(incidents) {
    // Заголовки таблицы
    const headers = [
      'ID', 'Название', 'Описание', 'Статус', 'Приоритет', 
      'Создал', 'Назначен', 'Оборудование', 'Создан', 'Обновлен', 'Время решения'
    ].join(',');
    
    // Данные таблицы
    const rows = incidents.map(incident => [
      `"${incident.id}"`,
      `"${this._escapeCsvValue(incident.title)}"`,
      `"${this._escapeCsvValue(incident.description)}"`,
      `"${incident.status}"`,
      `"${incident.priority}"`,
      `"${this._escapeCsvValue(incident.reportedBy)}"`,
      `"${this._escapeCsvValue(incident.assignedTo)}"`,
      `"${this._escapeCsvValue(incident.relatedEquipment)}"`,
      `"${incident.createdAt}"`,
      `"${incident.updatedAt}"`,
      `"${incident.resolutionTime}"`
    ].join(','));
    
    return [headers, ...rows].join('\n');
  }

  /**
   * Создает содержимое CSV-файла с данными об оборудовании
   * @param {Array} equipment - Массив оборудования
   * @returns {String} - Содержимое CSV-файла
   * @private
   */
  _createEquipmentCsvContent(equipment) {
    // Заголовки таблицы
    const headers = [
      'ID', 'Название', 'Тип', 'Модель', 'Производитель', 
      'Инв. номер', 'Серийный номер', 'Дата покупки', 'Гарантия до', 
      'Статус', 'Местоположение', 'Назначено', 'Последнее обслуживание'
    ].join(',');
    
    // Данные таблицы
    const rows = equipment.map(item => [
      `"${item.id}"`,
      `"${this._escapeCsvValue(item.name)}"`,
      `"${item.type}"`,
      `"${this._escapeCsvValue(item.model)}"`,
      `"${this._escapeCsvValue(item.manufacturer)}"`,
      `"${item.inventoryNumber}"`,
      `"${item.serialNumber}"`,
      `"${item.purchaseDate}"`,
      `"${item.warrantyExpires}"`,
      `"${item.status}"`,
      `"${this._escapeCsvValue(item.location)}"`,
      `"${this._escapeCsvValue(item.assignedTo)}"`,
      `"${item.lastMaintenance}"`
    ].join(','));
    
    return [headers, ...rows].join('\n');
  }

  /**
   * Создает содержимое CSV-файла с данными о производительности
   * @param {Array} technicians - Массив данных о техниках
   * @returns {String} - Содержимое CSV-файла
   * @private
   */
  _createPerformanceCsvContent(technicians) {
    // Заголовки таблицы
    const headers = [
      'Специалист', 'Назначено инцидентов', 'Решено инцидентов', 
      'Процент решения', 'Среднее время решения'
    ].join(',');
    
    // Данные таблицы
    const rows = technicians.map(tech => [
      `"${this._escapeCsvValue(tech.name)}"`,
      tech.totalAssigned,
      tech.resolved,
      `"${tech.resolutionRate}"`,
      `"${tech.avgResolutionTime}"`
    ].join(','));
    
    return [headers, ...rows].join('\n');
  }

  /**
   * Экранирует специальные символы в значениях для CSV
   * @param {String} value - Исходное значение
   * @returns {String} - Экранированное значение
   * @private
   */
  _escapeCsvValue(value) {
    if (!value) return '';
    return value.toString().replace(/"/g, '""');
  }

  /**
   * Подсчитывает количество элементов по свойству
   * @param {Array} items - Массив элементов
   * @param {String} property - Свойство для подсчета
   * @returns {Object} - Объект с количеством элементов по значениям свойства
   * @private
   */
  _countByProperty(items, property) {
    return items.reduce((acc, item) => {
      const value = item[property];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Рассчитывает среднее время решения инцидентов
   * @param {Array} incidents - Массив инцидентов
   * @returns {String} - Среднее время решения в формате "X ч. Y мин."
   * @private
   */
  _calculateAverageResolutionTime(incidents) {
    const resolvedIncidents = incidents.filter(i => 
      i.status === 'resolved' || i.status === 'closed'
    );
    
    if (resolvedIncidents.length === 0) {
      return 'Н/Д';
    }
    
    let totalTime = 0;
    let count = 0;
    
    resolvedIncidents.forEach(incident => {
      if (incident.resolvedAt && incident.createdAt) {
        const resolutionTime = incident.resolvedAt - incident.createdAt;
        totalTime += resolutionTime;
        count++;
      }
    });
    
    if (count === 0) {
      return 'Н/Д';
    }
    
    const avgTimeMs = totalTime / count;
    const avgTimeHours = Math.floor(avgTimeMs / (1000 * 60 * 60));
    const avgTimeMinutes = Math.floor((avgTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${avgTimeHours} ч. ${avgTimeMinutes} мин.`;
  }

  /**
   * Рассчитывает время решения инцидента
   * @param {Date} createdAt - Дата создания инцидента
   * @param {Date} resolvedAt - Дата решения инцидента
   * @returns {String} - Время решения в формате "X ч. Y мин."
   * @private
   */
  _calculateResolutionTime(createdAt, resolvedAt) {
    const resolutionTime = resolvedAt - createdAt;
    const hours = Math.floor(resolutionTime / (1000 * 60 * 60));
    const minutes = Math.floor((resolutionTime % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours} ч. ${minutes} мин.`;
  }

  /**
   * Форматирует название фильтра для отображения
   * @param {String} filterName - Название фильтра
   * @returns {String} - Отформатированное название
   * @private
   */
  _formatFilterName(filterName) {
    const nameMap = {
      period: 'Период',
      status: 'Статус',
      priority: 'Приоритет',
      assignedTo: 'Назначено',
      type: 'Тип',
      location: 'Местоположение',
      total: 'Всего записей',
      byStatus: 'По статусу',
      byPriority: 'По приоритету',
      byType: 'По типу',
      resolvedIncidents: 'Решено инцидентов',
      avgResolutionTime: 'Среднее время решения'
    };
    
    return nameMap[filterName] || filterName;
  }

  /**
   * Получает имя пользователя по ID
   * @param {String} userId - ID пользователя
   * @returns {Promise<String>} - Имя пользователя
   * @private
   */
  async _getUserNameById(userId) {
    try {
      const user = await UserModel.findById(userId);
      return user ? user.name : 'Неизвестный пользователь';
    } catch (error) {
      console.error('Error getting user name:', error);
      return 'Неизвестный пользователь';
    }
  }
}

module.exports = new ReportService();