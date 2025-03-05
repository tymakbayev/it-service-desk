const nodemailer = require('nodemailer');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const logger = require('../config/winston');

/**
 * Сервис для отправки электронных писем
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.templateCache = new Map();
    this.initialize();
  }

  /**
   * Инициализирует транспортер для отправки писем
   */
  initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
        tls: {
          rejectUnauthorized: config.email.rejectUnauthorized || false
        }
      });

      // Проверяем соединение с почтовым сервером
      this.transporter.verify((error) => {
        if (error) {
          logger.error('Email service connection error:', error);
        } else {
          logger.info('Email service ready to send messages');
        }
      });
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  /**
   * Загружает шаблон письма из файла
   * @param {string} templateName - Имя шаблона (без расширения)
   * @returns {Function} Скомпилированный шаблон Handlebars
   */
  async loadTemplate(templateName) {
    try {
      // Проверяем, есть ли шаблон в кэше
      if (this.templateCache.has(templateName)) {
        return this.templateCache.get(templateName);
      }

      // Путь к шаблону
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
      
      // Читаем файл шаблона
      const templateSource = await fs.promises.readFile(templatePath, 'utf-8');
      
      // Компилируем шаблон
      const template = handlebars.compile(templateSource);
      
      // Сохраняем в кэш
      this.templateCache.set(templateName, template);
      
      return template;
    } catch (error) {
      logger.error(`Failed to load email template "${templateName}":`, error);
      throw new Error(`Failed to load email template: ${error.message}`);
    }
  }

  /**
   * Отправляет электронное письмо
   * @param {Object} options - Параметры письма
   * @param {string} options.to - Email получателя
   * @param {string} options.subject - Тема письма
   * @param {string} options.text - Текстовое содержимое (опционально)
   * @param {string} options.html - HTML содержимое (опционально)
   * @param {Array} options.attachments - Вложения (опционально)
   * @returns {Promise<Object>} Результат отправки
   */
  async sendEmail({ to, subject, text, html, attachments = [] }) {
    try {
      if (!this.transporter) {
        this.initialize();
      }

      const mailOptions = {
        from: `"${config.email.senderName}" <${config.email.user}>`,
        to,
        subject,
        attachments
      };

      if (text) mailOptions.text = text;
      if (html) mailOptions.html = html;

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent to ${to}. MessageId: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Отправляет письмо с использованием шаблона
   * @param {Object} options - Параметры письма
   * @param {string} options.to - Email получателя
   * @param {string} options.subject - Тема письма
   * @param {string} options.templateName - Имя шаблона
   * @param {Object} options.context - Данные для шаблона
   * @param {Array} options.attachments - Вложения (опционально)
   * @returns {Promise<Object>} Результат отправки
   */
  async sendTemplateEmail({ to, subject, templateName, context, attachments = [] }) {
    try {
      // Загружаем шаблон
      const template = await this.loadTemplate(templateName);
      
      // Рендерим HTML с данными контекста
      const html = template(context);
      
      // Отправляем письмо
      return await this.sendEmail({
        to,
        subject,
        html,
        attachments
      });
    } catch (error) {
      logger.error(`Failed to send template email "${templateName}":`, error);
      throw new Error(`Failed to send template email: ${error.message}`);
    }
  }

  /**
   * Отправляет письмо для подтверждения регистрации
   * @param {Object} user - Данные пользователя
   * @param {string} user.email - Email пользователя
   * @param {string} user.firstName - Имя пользователя
   * @param {string} verificationToken - Токен подтверждения
   * @returns {Promise<Object>} Результат отправки
   */
  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;
    
    return this.sendTemplateEmail({
      to: user.email,
      subject: 'Подтверждение регистрации в IT Service Desk',
      templateName: 'verification',
      context: {
        name: user.firstName || 'Пользователь',
        verificationUrl,
        supportEmail: config.supportEmail,
        companyName: config.companyName,
        year: new Date().getFullYear()
      }
    });
  }

  /**
   * Отправляет письмо для сброса пароля
   * @param {Object} user - Данные пользователя
   * @param {string} user.email - Email пользователя
   * @param {string} user.firstName - Имя пользователя
   * @param {string} resetToken - Токен сброса пароля
   * @returns {Promise<Object>} Результат отправки
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
    
    return this.sendTemplateEmail({
      to: user.email,
      subject: 'Сброс пароля в IT Service Desk',
      templateName: 'password-reset',
      context: {
        name: user.firstName || 'Пользователь',
        resetUrl,
        supportEmail: config.supportEmail,
        companyName: config.companyName,
        year: new Date().getFullYear(),
        expiresIn: '1 час'
      }
    });
  }

  /**
   * Отправляет уведомление о новом инциденте
   * @param {Object} incident - Данные инцидента
   * @param {Object} user - Данные пользователя
   * @returns {Promise<Object>} Результат отправки
   */
  async sendNewIncidentNotification(incident, user) {
    const incidentUrl = `${config.clientUrl}/incidents/${incident._id}`;
    
    return this.sendTemplateEmail({
      to: user.email,
      subject: `Новый инцидент #${incident.number}: ${incident.title}`,
      templateName: 'new-incident',
      context: {
        name: user.firstName || 'Пользователь',
        incidentNumber: incident.number,
        incidentTitle: incident.title,
        incidentDescription: incident.description,
        incidentPriority: incident.priority,
        incidentUrl,
        supportEmail: config.supportEmail,
        companyName: config.companyName,
        year: new Date().getFullYear()
      }
    });
  }

  /**
   * Отправляет уведомление об обновлении инцидента
   * @param {Object} incident - Данные инцидента
   * @param {Object} user - Данные пользователя
   * @param {Object} changes - Изменения в инциденте
   * @returns {Promise<Object>} Результат отправки
   */
  async sendIncidentUpdateNotification(incident, user, changes) {
    const incidentUrl = `${config.clientUrl}/incidents/${incident._id}`;
    
    return this.sendTemplateEmail({
      to: user.email,
      subject: `Обновление инцидента #${incident.number}: ${incident.title}`,
      templateName: 'incident-update',
      context: {
        name: user.firstName || 'Пользователь',
        incidentNumber: incident.number,
        incidentTitle: incident.title,
        incidentStatus: incident.status,
        changes: Object.entries(changes).map(([key, value]) => ({ field: key, value })),
        incidentUrl,
        supportEmail: config.supportEmail,
        companyName: config.companyName,
        year: new Date().getFullYear()
      }
    });
  }

  /**
   * Отправляет отчет по инцидентам
   * @param {Object} user - Данные пользователя
   * @param {string} reportName - Название отчета
   * @param {Buffer} reportBuffer - Буфер с файлом отчета
   * @param {string} reportFormat - Формат отчета (pdf, xlsx)
   * @returns {Promise<Object>} Результат отправки
   */
  async sendReportEmail(user, reportName, reportBuffer, reportFormat) {
    const extension = reportFormat.toLowerCase();
    const mimeTypes = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    
    return this.sendTemplateEmail({
      to: user.email,
      subject: `Отчет: ${reportName}`,
      templateName: 'report',
      context: {
        name: user.firstName || 'Пользователь',
        reportName,
        reportFormat: reportFormat.toUpperCase(),
        supportEmail: config.supportEmail,
        companyName: config.companyName,
        year: new Date().getFullYear()
      },
      attachments: [
        {
          filename: `${reportName}.${extension}`,
          content: reportBuffer,
          contentType: mimeTypes[extension]
        }
      ]
    });
  }

  /**
   * Отправляет уведомление о назначении оборудования
   * @param {Object} equipment - Данные оборудования
   * @param {Object} user - Данные пользователя
   * @returns {Promise<Object>} Результат отправки
   */
  async sendEquipmentAssignmentNotification(equipment, user) {
    const equipmentUrl = `${config.clientUrl}/equipment/${equipment._id}`;
    
    return this.sendTemplateEmail({
      to: user.email,
      subject: `Вам назначено оборудование: ${equipment.name}`,
      templateName: 'equipment-assignment',
      context: {
        name: user.firstName || 'Пользователь',
        equipmentName: equipment.name,
        equipmentType: equipment.type,
        equipmentSerial: equipment.serialNumber,
        equipmentInventory: equipment.inventoryNumber,
        assignmentDate: new Date().toLocaleDateString('ru-RU'),
        equipmentUrl,
        supportEmail: config.supportEmail,
        companyName: config.companyName,
        year: new Date().getFullYear()
      }
    });
  }
}

module.exports = new EmailService();