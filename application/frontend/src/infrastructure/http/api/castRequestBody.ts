/**
 * The OpenAPI specification generated for the backend currently omits request body schemas,
 * which causes openapi-fetch to model payloads as Record<string, never>. This helper wraps
 * payload objects so we can keep type safety without resorting to `any`.
 */
export function castRequestBody<T>(value: T): Record<string, never> {
  return value as unknown as Record<string, never>;
}
