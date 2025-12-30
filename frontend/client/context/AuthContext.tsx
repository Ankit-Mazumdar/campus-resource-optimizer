// // import { createContext, useState, useEffect, ReactNode } from 'react';
// // import { User, UserRole, AuthContextType } from '@/types';

// // export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // export function AuthProvider({ children }: { children: ReactNode }) {
// //   const [user, setUser] = useState<User | null>(null);

// //   // Initialize from localStorage on mount
// //   useEffect(() => {
// //     const stored = localStorage.getItem('authUser');
// //     if (stored) {
// //       try {
// //         setUser(JSON.parse(stored));
// //       } catch (e) {
// //         console.error('Failed to parse stored user:', e);
// //       }
// //     }
// //   }, []);

// //   const login = (email: string, password: string, role: UserRole) => {
// //     // Mock authentication - in real app, this would call an API
// //     if (email && password && password.length >= 6) {
// //       const newUser: User = {
// //         id: `user_${Date.now()}`,
// //         name: email.split('@')[0],
// //         email,
// //         role,
// //         department: role === 'faculty' ? 'Engineering' : undefined,
// //       };
// //       setUser(newUser);
// //       localStorage.setItem('authUser', JSON.stringify(newUser));
// //     }
// //   };

// //   const signup = (name: string, email: string, password: string, role: UserRole) => {
// //     // Mock signup - in real app, this would call an API
// //     if (name && email && password && password.length >= 6) {
// //       const newUser: User = {
// //         id: `user_${Date.now()}`,
// //         name,
// //         email,
// //         role,
// //         department: role === 'faculty' ? 'Engineering' : undefined,
// //       };
// //       setUser(newUser);
// //       localStorage.setItem('authUser', JSON.stringify(newUser));
// //     }
// //   };

// //   const logout = () => {
// //     setUser(null);
// //     localStorage.removeItem('authUser');
// //   };

// //   return (
// //     <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // }


// import { createContext, useState, useEffect, ReactNode } from 'react';
// import { User, UserRole, AuthContextType } from '@/types';
// import api from '@/lib/api'; // <-- import API layer

// export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);

//   // Initialize from localStorage on mount
//   useEffect(() => {
//     const storedUser = localStorage.getItem('authUser');
//     const token = localStorage.getItem('token');
//     if (storedUser && token) {
//       try {
//         setUser(JSON.parse(storedUser));
//         api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       } catch (e) {
//         console.error('Failed to parse stored user:', e);
//       }
//     }
//   }, []);

//   // ------------------- LOGIN -------------------
//   const login = async (email: string, password: string) => {
//     try {
//       const res = await api.post('/auth/login', { email, password });
//       const { token, user: loggedInUser } = res.data;

//       // Save user and token
//       setUser(loggedInUser);
//       localStorage.setItem('authUser', JSON.stringify(loggedInUser));
//       localStorage.setItem('token', token);

//       // Attach token to API layer
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

//       return { success: true };
//     } catch (error: any) {
//       console.error('Login error:', error);
//       return {
//         success: false,
//         message: error.response?.data?.error || 'Login failed',
//       };
//     }
//   };

//   // ------------------- SIGNUP -------------------
//   const signup = async (name: string, email: string, password: string, role: UserRole) => {
//     try {
//       const res = await api.post('/auth/register', { name, email, password, role });
//       const { token, user: newUser } = res.data;

//       setUser(newUser);
//       localStorage.setItem('authUser', JSON.stringify(newUser));
//       localStorage.setItem('token', token);

//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

//       return { success: true };
//     } catch (error: any) {
//       console.error('Signup error:', error);
//       return {
//         success: false,
//         message: error.response?.data?.error || 'Signup failed',
//       };
//     }
//   };

//   // ------------------- LOGOUT -------------------
//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('authUser');
//     localStorage.removeItem('token');
//     delete api.defaults.headers.common['Authorization'];
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated: !!user,
//         login,
//         signup,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }


import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '@/types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      // Mock authentication
      if (email && password && password.length >= 6) {
        const newUser: User = {
          id: `user_${Date.now()}`,
          name: email.split('@')[0],
          email,
          role,
          department: role === 'faculty' ? 'Engineering' : undefined,
        };
        setUser(newUser);
        localStorage.setItem('authUser', JSON.stringify(newUser));

        return { success: true };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (err: any) {
      console.error(err);
      return { success: false, message: 'Login failed' };
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      // Mock signup
      if (name && email && password && password.length >= 6) {
        const newUser: User = {
          id: `user_${Date.now()}`,
          name,
          email,
          role,
          department: role === 'faculty' ? 'Engineering' : undefined,
        };
        setUser(newUser);
        localStorage.setItem('authUser', JSON.stringify(newUser));

        return { success: true };
      } else {
        return { success: false, message: 'Invalid signup data' };
      }
    } catch (err: any) {
      console.error(err);
      return { success: false, message: 'Signup failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

