import { login, logout, register, checkAuth } from './authThunks';
import { UserRole } from './authTypes';
import { RootState } from '../../store';

class AuthModule {
  /**
   * Login a user with email and password
   */
  login(email: string, password: string) {
    return login({ email, password });
  }

  /**
   * Register a new user
   */
  register(userData: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    department?: string;
    position?: string;
  }) {
    return register(userData);
  }

  /**
   * Logout the current user
   */
  logout() {
    return logout();
  }

  /**
   * Check if user is authenticated
   */
  checkAuth() {
    return checkAuth();
  }

  /**
   * Get the current user's role
   */
  getUserRole(state: RootState): UserRole | null {
    return state.auth.user?.role || null;
  }

  /**
   * Check if the user has a specific role
   */
  hasRole(state: RootState, role: UserRole): boolean {
    return state.auth.user?.role === role;
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(state: RootState): boolean {
    return state.auth.isAuthenticated;
  }
}

export default new AuthModule();
