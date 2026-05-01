export const buildPaginationMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
  hasNextPage: page * limit < total,
  hasPreviousPage: page > 1,
});
