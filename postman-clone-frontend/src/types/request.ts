export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface HttpRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  body?: RequestBody;
  params?: KeyValuePair[];
  auth?: AuthConfig;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface RequestBody {
  type: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary';
  raw?: string;
  formData?: KeyValuePair[];
  urlEncoded?: KeyValuePair[];
}

export interface AuthConfig {
  type: 'none' | 'bearer' | 'basic' | 'api-key';
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown; // Better than 'any'
  responseTime: number;
  size: number;
  timestamp: string; // ISO string format
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  requests: HttpRequest[];
  folders: Folder[];
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  requests: HttpRequest[];
  folders: Folder[]; // Recursive folders
}

export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
  isActive: boolean;
}

export interface RequestHistory {
  id: string;
  request: HttpRequest;
  response?: HttpResponse;
  timestamp: string; // ISO string format
}

export type RequestTab = 'params' | 'headers' | 'body' | 'auth' | 'tests' | 'settings';
export type ResponseTab = 'body' | 'headers' | 'cookies' | 'tests';

export interface RequestState {
  loading: boolean;
  error: string | null;
  activeTab: RequestTab;
}

export interface ResponseState {
  activeTab: ResponseTab;
  isVisible: boolean;
}

// Additional utility types
export interface ApiError {
  message: string;
  code?: string | number;
  details?: unknown;
}

export interface RequestOptions {
  timeout?: number;
  followRedirects?: boolean;
  validateSSL?: boolean;
}

export type HttpStatus = {
  code: number;
  text: string;
  type: 'info' | 'success' | 'redirect' | 'client-error' | 'server-error';
};

export interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}
