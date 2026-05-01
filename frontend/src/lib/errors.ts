import axios from 'axios';

import type { ErrorResponse } from '../types';

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};
