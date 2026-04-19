import { ApiResponse } from "../interface/response.interface";

export const successResponse = <T = any>(
  data: T,
  message = "Success",
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    error: null,
  };
};

export const errorResponse = (
  errorMessage: string,
  message = "Error",
): ApiResponse<null> => {
  return {
    success: false,
    message,
    data: null,
    error: errorMessage,
  };
};


