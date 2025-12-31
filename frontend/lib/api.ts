/**
 * API Client for HOA Ops AI
 * Handles all HTTP requests to the backend with authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Get the stored authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Set the authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

/**
 * Remove the authentication token
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add existing headers
  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    const errorData = isJson ? await response.json() : { detail: response.statusText };
    throw new ApiError(
      errorData.detail || 'An error occurred',
      response.status,
      errorData
    );
  }

  return isJson ? response.json() : (response.text() as Promise<T>);
}

// ============================================================================
// Authentication API
// ============================================================================

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

/**
 * Sign up a new user
 */
export async function signup(data: SignupData): Promise<UserResponse> {
  const response = await apiRequest<UserResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  // Store the token
  setAuthToken(response.token);
  
  return response;
}

/**
 * Log in an existing user
 */
export async function login(data: LoginData): Promise<UserResponse> {
  const response = await apiRequest<UserResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  // Store the token
  setAuthToken(response.token);
  
  return response;
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });
  } finally {
    // Always remove token, even if request fails
    removeAuthToken();
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/auth/me');
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate password strength (0-4)
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  return Math.min(strength, 4);
}

// ============================================================================
// Projects API
// ============================================================================

export interface ProjectCreate {
  name: string;
  description: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  budget: number;
  startDate: string;
  endDate?: string;
  assignedVendorId?: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  status: string;
  budget: number;
  startDate: string;
  endDate?: string;
  assignedVendorId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface ProjectListResponse {
  projects: ProjectResponse[];
  total: number;
}

/**
 * Get all projects
 */
export async function getProjects(params?: {
  status?: string;
  search?: string;
  archived?: boolean;
  limit?: number;
  skip?: number;
}): Promise<ProjectListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.archived !== undefined) queryParams.append('archived', String(params.archived));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.skip) queryParams.append('skip', String(params.skip));
  
  const query = queryParams.toString();
  return apiRequest<ProjectListResponse>(`/projects${query ? `?${query}` : ''}`);
}

/**
 * Create a new project
 */
export async function createProject(data: ProjectCreate): Promise<ProjectResponse> {
  return apiRequest<ProjectResponse>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<any> {
  return apiRequest(`/projects/${id}`);
}

// ============================================================================
// Expenses API
// ============================================================================

export interface ExpenseCreate {
  date: string;
  amount: number;
  category: string;
  vendor: string;
  description: string;
  projectId?: string;
  receiptUrl?: string;
}

export interface ExpenseResponse {
  id: string;
  date: string;
  amount: number;
  category: string;
  vendor: string;
  description: string;
  projectId?: string;
  receiptUrl?: string;
  createdBy: string;
  createdAt: string;
}

export interface ExpenseListResponse {
  expenses: ExpenseResponse[];
  total: number;
}

/**
 * Get all expenses
 */
export async function getExpenses(params?: {
  category?: string;
  vendor?: string;
  projectId?: string;
  search?: string;
  limit?: number;
  skip?: number;
}): Promise<ExpenseListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.vendor) queryParams.append('vendor', params.vendor);
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.skip) queryParams.append('skip', String(params.skip));
  
  const query = queryParams.toString();
  return apiRequest<ExpenseListResponse>(`/expenses${query ? `?${query}` : ''}`);
}

/**
 * Create a new expense
 */
export async function createExpense(data: ExpenseCreate): Promise<ExpenseResponse> {
  return apiRequest<ExpenseResponse>('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get a single expense by ID
 */
export async function getExpense(id: string): Promise<ExpenseResponse> {
  return apiRequest<ExpenseResponse>(`/expenses/${id}`);
}