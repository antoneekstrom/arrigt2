export async function query<T = { data: unknown }>(
  query: unknown,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch("http://localhost:4000/graphql", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      query,
      variables,
    }),
  });
  return await response.json();
}
