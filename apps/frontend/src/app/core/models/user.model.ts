export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}
