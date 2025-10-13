import { NetworkRequest } from "@suwatte/daisuke";
import { SuwayomiStore } from "../store";

export async function graphqlRequest<T>(query: string, variables?: any) {
  const host = await SuwayomiStore.host();

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
  const response = await client.request({
    url: `${host}/api/graphql`,
    method: "POST",
    headers,
    body: {
      query,
      variables,
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
  const client = new NetworkClient();
  console.log(`${req.method || "GET"} ${req.url}`);
  const response = await client.request(req);

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
