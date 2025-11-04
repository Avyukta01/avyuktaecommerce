/**
 * TypeScript types for authentication and authorization
 */

export type UserRole = "user" | "admin" | "super_admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface Session {
  user: AuthUser;
  expires: string;
}

/**
 * API Response structure for authentication endpoints
 */
export interface AuthApiResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
  error?: string;
}

/**
 * Sample API Response Examples:
 * 
 * Login Success (user):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "user": {
 *     "id": "123e4567-e89b-12d3-a456-426614174000",
 *     "email": "user@example.com",
 *     "role": "user"
 *   },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * Login Success (admin):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "user": {
 *     "id": "123e4567-e89b-12d3-a456-426614174001",
 *     "email": "admin@example.com",
 *     "role": "admin"
 *   },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * Login Success (super_admin):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "user": {
 *     "id": "123e4567-e89b-12d3-a456-426614174002",
 *     "email": "superadmin@example.com",
 *     "role": "super_admin"
 *   },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * Login Error:
 * {
 *   "success": false,
 *   "error": "Invalid email or password"
 * }
 */

