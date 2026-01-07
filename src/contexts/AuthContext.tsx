import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getOrCreateClient } from '../lib/api';
import type { AuthState } from '../types/validation';

interface AuthContextType extends AuthState {
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Storage key for persisting email
const STORAGE_KEY = 'fg_validation_email';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    // Initialize from localStorage
    const savedEmail = localStorage.getItem(STORAGE_KEY);
    return {
      email: savedEmail,
      isAuthenticated: !!savedEmail,
      isLoading: false
    };
  });

  const login = useCallback(async (email: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Get or create client in database
      const result = await getOrCreateClient(email);
      
      if (result.success) {
        localStorage.setItem(STORAGE_KEY, email);
        setState({
          email,
          isAuthenticated: true,
          isLoading: false
        });
        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      email: null,
      isAuthenticated: false,
      isLoading: false
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
