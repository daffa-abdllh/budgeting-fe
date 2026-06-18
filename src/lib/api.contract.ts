export type PaginationMeta = {
  page: number;
  limit: number;
  hasNextPage: boolean;
};

export type ApiResponse<T = null> = {
  status: "success" | "error";
  data: T;
  message?: string;
  pagination?: PaginationMeta;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  status: "error";
  message: string;
  errors?: Record<string, string[]>;
};
