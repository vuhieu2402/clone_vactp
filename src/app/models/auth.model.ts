// Login Request Interface
export interface LoginRequest {
  username: string;
  password: string;
}

// Login Response Interface
export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: {
      id: string;
      username: string;
      email?: string;
      fullName?: string;
    };
  };
  error?: string;
}

// User Interface
export interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
} 