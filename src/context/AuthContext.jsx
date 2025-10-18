import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state for authentication
const initialState = {
  token: null,
  user: null,
  loading: true,
  isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  RESTORE_SESSION: 'RESTORE_SESSION',
};

// Reducer function to handle authentication state changes
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: !!action.payload.token,
        loading: false,
      };
    default:
      return state;
  }
};

// Create the context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app load
  useEffect(() => {
    const restoreSession = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          dispatch({
            type: AUTH_ACTIONS.RESTORE_SESSION,
            payload: { token, user },
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    restoreSession();
  }, []);

  // Login function
  const loginAction = async (loginData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      // Assuming loginData contains { token, user } from API response
      const { token, user } = loginData;
      
      // Save to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Update state
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token, user },
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logOut = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Update state
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update user data (for profile updates)
  const updateUser = (updatedUser) => {
    if (state.isAuthenticated) {
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token: state.token, user: updatedUser },
      });
    }
  };

  // Check if token is expired (basic check)
  const isTokenExpired = () => {
    if (!state.token) return true;
    
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(state.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  // Refresh token function (placeholder for future implementation)
  const refreshToken = async () => {
    // This would typically make an API call to refresh the token
    // For now, we'll just return the current token
    return state.token;
  };

  const contextValue = {
    // State
    token: state.token,
    user: state.user,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    
    // Actions
    loginAction,
    logOut,
    updateUser,
    isTokenExpired,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Export the context for advanced usage
export { AuthContext };
