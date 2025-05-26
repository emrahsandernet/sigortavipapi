import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password, company_code) => {
    try {
      const response = await authService.login(username, password, company_code);
      const userData = response.data;
      
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasPermission = (queryType) => {
    if (!user) return false;
    
    // Admin kullanıcılar tüm yetkilere sahiptir
    if (user.is_admin) return true;
    
    // Kullanıcının rollerini kontrol et
    // Bu basitleştirilmiş bir kontrol - gerçek uygulamada
    // backend'den yetki kontrolü yapılabilir
    return true; // Şimdilik tüm kullanıcılar için true dönüyoruz
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 