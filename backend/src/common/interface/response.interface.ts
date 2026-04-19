export interface ResponseInterface<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | null;
}

export type ApiResponse<T = any> = ResponseInterface<T>;
