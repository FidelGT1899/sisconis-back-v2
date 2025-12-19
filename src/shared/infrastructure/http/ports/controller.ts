export interface HttpRequest<T = unknown> {
  body?: T;
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  headers?: Record<string, unknown>;
}

export interface HttpResponse {
  statusCode: number;
  body?: unknown;
}

export interface Controller<T = unknown> {
  handle(request: HttpRequest<T>): Promise<HttpResponse>;
}
