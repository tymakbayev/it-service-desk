// server/controllers/controller.js

/**
 * Базовый контроллер, предоставляющий общие методы CRUD операций
 * Может использоваться как родительский класс для других контроллеров
 */
class Controller {
  /**
   * Создает экземпляр базового контроллера
   * @param {mongoose.Model} model - Mongoose модель для работы с данными
   * @param {string} modelName - Название модели для сообщений об ошибках
   */
  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName || 'Resource';
  }

  /**
   * Получает все записи с поддержкой пагинации, сортировки и фильтрации
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  getAll = async (req, res, next) => {
    try {
      // Параметры пагинации
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Параметры сортировки
      const sortField = req.query.sortField || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      const sort = { [sortField]: sortOrder };

      // Фильтрация
      let filter = {};
      if (req.query.filter) {
        try {
          filter = JSON.parse(req.query.filter);
        } catch (error) {
          return res.status(400).json({ message: 'Invalid filter format' });
        }
      }

      // Поиск по тексту
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        const searchFields = req.query.searchFields ? req.query.searchFields.split(',') : ['name', 'title', 'description'];
        
        const searchConditions = searchFields.map(field => ({ [field]: searchRegex }));
        filter = { ...filter, $or: searchConditions };
      }

      // Выполнение запроса с пагинацией
      const items = await this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();

      // Получение общего количества записей для пагинации
      const total = await this.model.countDocuments(filter);

      return res.status(200).json({
        items,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Получает запись по ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const item = await this.model.findById(id);

      if (!item) {
        return res.status(404).json({ message: `${this.modelName} not found` });
      }

      return res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Создает новую запись
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  create = async (req, res, next) => {
    try {
      const newItem = new this.model(req.body);
      const savedItem = await newItem.save();
      return res.status(201).json(savedItem);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Обновляет существующую запись
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedItem = await this.model.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedItem) {
        return res.status(404).json({ message: `${this.modelName} not found` });
      }

      return res.status(200).json(updatedItem);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Удаляет запись по ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedItem = await this.model.findByIdAndDelete(id);

      if (!deletedItem) {
        return res.status(404).json({ message: `${this.modelName} not found` });
      }

      return res.status(200).json({ message: `${this.modelName} deleted successfully` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Выполняет массовое удаление записей
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  bulkDelete = async (req, res, next) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid or empty IDs array' });
      }

      const result = await this.model.deleteMany({ _id: { $in: ids } });

      return res.status(200).json({
        message: `${result.deletedCount} ${this.modelName.toLowerCase()}(s) deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Выполняет массовое обновление записей
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  bulkUpdate = async (req, res, next) => {
    try {
      const { ids, data } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid or empty IDs array' });
      }

      if (!data || typeof data !== 'object') {
        return res.status(400).json({ message: 'Invalid update data' });
      }

      const result = await this.model.updateMany(
        { _id: { $in: ids } },
        { $set: { ...data, updatedAt: new Date() } }
      );

      return res.status(200).json({
        message: `${result.modifiedCount} ${this.modelName.toLowerCase()}(s) updated successfully`
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Проверяет существование записи по ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  exists = async (req, res, next) => {
    try {
      const { id } = req.params;
      const exists = await this.model.exists({ _id: id });

      return res.status(200).json({ exists: !!exists });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Получает количество записей с учетом фильтра
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  count = async (req, res, next) => {
    try {
      let filter = {};
      if (req.query.filter) {
        try {
          filter = JSON.parse(req.query.filter);
        } catch (error) {
          return res.status(400).json({ message: 'Invalid filter format' });
        }
      }

      const count = await this.model.countDocuments(filter);
      return res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = Controller;