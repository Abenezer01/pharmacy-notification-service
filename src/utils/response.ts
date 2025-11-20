import { ApiResponse } from '../types/shared';

export class ResponseUtil {
  
  /**
   * Sends a standardized success response.
   * @param res Express Response Object
   * @param data The payload to return
   * @param message Optional success message
   * @param statusCode HTTP Status code (default 200)
   */
  static sendSuccess<T>(res: any, data: T, message: string = 'Success', statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    res.status(statusCode).json(response);
  }

  /**
   * Sends a standardized error response.
   * @param res Express Response Object
   * @param message Error message to display
   * @param statusCode HTTP Status code (default 500)
   * @param error Optional error details or stack trace (should be hidden in production usually)
   */
  static sendError(res: any, message: string, statusCode: number = 500, error: any = null): void {
    const response: ApiResponse<null> = {
      success: false,
      message,
      error: error instanceof Error ? error.message : (typeof error === 'string' ? error : undefined),
      timestamp: new Date().toISOString()
    };
    res.status(statusCode).json(response);
  }
}