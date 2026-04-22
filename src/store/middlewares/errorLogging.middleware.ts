import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import { notificationController } from '@app/controllers/notificationController';

/**
 * Log a warning and show a toast!
 */
export const errorLoggingMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    notificationController.error({ title: String(action.payload) });
  }

  return next(action);
};
