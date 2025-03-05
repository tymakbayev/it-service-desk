const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const JWTService = require('../services/jwt.service');
const { ValidationError } = require('../utils/errors');

class AuthController {
  /**
   * Авторизация пользователя
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        throw new ValidationError('Email и пароль обязательны');
      }
      
      // Поиск пользователя по email
      const user = await UserModel.findOne({ email });
      
      if (!user) {
        return res.status(401).json({ message: 'Неверный email или пароль' });
      }
      
      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Неверный email или пароль' });
      }
      
      // Генерация токенов
      const userData = {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      };
      
      const { accessToken, refreshToken } = JWTService.generateTokens(userData);
      
      // Сохранение refresh токена в БД
      user.refreshToken = refreshToken;
      await user.save();
      
      // Отправка токенов клиенту
      res.status(200).json({
        success: true,
        user: userData,
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Регистрация нового пользователя
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async register(req, res, next) {
    try {
      const { email, password, name, role = 'user' } = req.body;
      
      // Проверка обязательных полей
      if (!email || !password || !name) {
        throw new ValidationError('Email, пароль и имя обязательны');
      }
      
      // Проверка существования пользователя
      const existingUser = await UserModel.findOne({ email });
      
      if (existingUser) {
        return res.status(409).json({ message: 'Пользователь с таким email уже существует' });
      }
      
      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Создание нового пользователя
      const newUser = await UserModel.create({
        email,
        password: hashedPassword,
        name,
        role
      });
      
      // Генерация токенов
      const userData = {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      };
      
      const { accessToken, refreshToken } = JWTService.generateTokens(userData);
      
      // Сохранение refresh токена
      newUser.refreshToken = refreshToken;
      await newUser.save();
      
      res.status(201).json({
        success: true,
        user: userData,
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Проверка валидности токена
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async verifyToken(req, res, next) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: 'Токен не предоставлен' });
      }
      
      const decoded = JWTService.verifyAccessToken(token);
      
      res.status(200).json({
        success: true,
        valid: true,
        user: decoded
      });
    } catch (error) {
      res.status(200).json({
        success: true,
        valid: false
      });
    }
  }
  
  /**
   * Обновление токена доступа
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh токен не предоставлен' });
      }
      
      // Проверка валидности refresh токена
      const decoded = JWTService.verifyRefreshToken(refreshToken);
      
      // Поиск пользователя с таким refresh токеном
      const user = await UserModel.findOne({ 
        _id: decoded.id,
        refreshToken 
      });
      
      if (!user) {
        return res.status(401).json({ message: 'Недействительный refresh токен' });
      }
      
      // Генерация новых токенов
      const userData = {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      };
      
      const tokens = JWTService.generateTokens(userData);
      
      // Обновление refresh токена в БД
      user.refreshToken = tokens.refreshToken;
      await user.save();
      
      res.status(200).json({
        success: true,
        ...tokens
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Получение профиля пользователя
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserProfile(req, res, next) {
    try {
      const userId = req.user.id;
      
      const user = await UserModel.findById(userId).select('-password -refreshToken');
      
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();