interface PagesRequestContext {
  request: Request;
  env: Record<string, unknown>;
  params: Record<string, unknown>;
}

export const onRequest = async (context: PagesRequestContext) => {
  const url = new URL(context.request.url);
  const backendBaseUrl = "https://budgeting-be.daffabdullah111.workers.dev/api/budgeting";
  const targetPath = url.pathname.replace(/^\/api/, "");
  
  const targetUrl = `${backendBaseUrl}${targetPath}${url.search}`;
  
  // Clone the request with the new target URL to preserve method, headers, and body
  const modifiedRequest = new Request(targetUrl, context.request);
  
  return fetch(modifiedRequest);
};
