const userRepository = require('./userRepository');
const AppError = require('../errorHandling/AppError');

class UserService {
   async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updateRole(userId, newRole) {
    if (!['ADMIN', 'CUSTOMER'].includes(newRole)) {
      throw new AppError('Invalid role. Only ADMIN or CUSTOMER allowed.', 400);
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const updated = await userRepository.update(userId, { role: newRole });

    const { password, ...safeUser } = updated;
    return safeUser;
  }

}

module.exports = new UserService();
