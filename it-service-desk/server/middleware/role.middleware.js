/**
 * Middleware для проверки роли пользователя
 * @param {Array} roles - Массив разрешенных ролей
 * @returns {Function} Middleware функция
 */
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const { role } = req.user;
    
    if (!roles.includes(role)) {
      return res.status(403).json({ 
        message: 'У вас нет прав для выполнения этого действия' 
      });
    }
    
    next();
  };
};

module.exports = roleMiddleware;