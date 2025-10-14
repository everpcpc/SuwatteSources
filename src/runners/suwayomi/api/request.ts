import { NetworkRequest, NetworkResponse } from "@suwatte/daisuke";
import { SuwayomiStore } from "../store";
import { AuthMode } from "../types/auth";

export async function graphqlRequest<T>(query: string, variables?: any) {
  const host = await SuwayomiStore.host();
  const authMode = await SuwayomiStore.authMode();
  const credentials = await SuwayomiStore.credentials();

  if (!host) throw new Error("You have not defined a server url!");

  const client = new NetworkClient();

  console.log(`POST ${host}/api/graphql`);
  console.log("GraphQL Query:", query);
  if (variables) {
    console.log("GraphQL Variables:", JSON.stringify(variables, null, 2));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add Basic Auth header only if in Basic Auth mode and credentials are available
  if (authMode === AuthMode.BASIC && credentials) {
    headers.Authorization = `Basic ${credentials}`;
  }

  const response = await client.request({
    url: `${host}/api/graphql`,
    method: "POST",
    headers,
    body: {
      query,
      variables,
    },
    transformResponse: async (res: NetworkResponse) => {
      if (res.status === 401) {
        // Signed Out
        await ObjectStore.remove("authenticated");
      }
      return res;
    },
  });

  // Check HTTP status code
  if (response.status < 200 || response.status >= 300) {
    console.error(`GraphQL request failed with status ${response.status}`);
    console.error(`Response data: ${response.data}`);
    throw new Error(
      `HTTP ${response.status}: Failed to fetch data from Suwayomi server`
    );
  }

  // Check if response data is empty
  if (!response.data || response.data.length === 0) {
    console.warn("Received empty response from GraphQL server");
    return {} as T;
  }

  let parsedResponse;
  try {
    parsedResponse = JSON.parse(response.data);
  } catch (error) {
    console.error(`Failed to parse GraphQL response: ${error}`);
    console.error(`Response data: ${response.data}`);
    throw new Error("Failed to parse server response");
  }

  if (parsedResponse.errors) {
    console.error("GraphQL errors:", parsedResponse.errors);
    throw new Error(parsedResponse.errors[0]?.message || "GraphQL Error");
  }

  return parsedResponse.data as T;
}

export const simpleReq = async (req: NetworkRequest) => {
  const authMode = await SuwayomiStore.authMode();
  const credentials = await SuwayomiStore.credentials();
  const client = new NetworkClient();
  console.log(`${req.method || "GET"} ${req.url}`);

  // Build request with optional Basic Auth (only in Basic Auth mode)
  const requestConfig = {
    ...req,
    headers:
      authMode === AuthMode.BASIC && credentials
        ? {
            ...req.headers,
            Authorization: `Basic ${credentials}`,
          }
        : req.headers,
  };

  const response = await client.request(requestConfig);

  // Check HTTP status code
  if (response.status < 200 || response.status >= 300) {
    console.error(`Request failed with status ${response.status}`);
    console.error(`Response data: ${response.data}`);
    throw new Error(`HTTP ${response.status}: Request failed`);
  }

  if (!response.data || response.data.length === 0) {
    console.warn("Received empty response");
    return {};
  }

  try {
    const object = JSON.parse(response.data);
    return object;
  } catch (error) {
    console.error(`Failed to parse response: ${error}`);
    console.error(`Response data: ${response.data}`);
    throw new Error("Failed to parse server response");
  }
};
