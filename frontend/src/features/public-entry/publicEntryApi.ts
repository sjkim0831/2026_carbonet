import { fetchFrontendSession } from "../../lib/api";

export async function postJsonWithSession<TResponse>(url: string, payload: unknown): Promise<TResponse> {
  const session = await fetchFrontendSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session.csrfHeaderName && session.csrfToken) {
    headers[session.csrfHeaderName] = session.csrfToken;
  }
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(payload)
  });
  return response.json() as Promise<TResponse>;
}
