import { graphqlRequest, simpleReq } from ".";
import { SuwayomiStore } from "../store";

// GraphQL query for server information
export const ABOUT_SERVER_QUERY = `
  query {
    aboutServer {
      name
      version
    }
  }
`;

export const getUser = async () => {
  const user = await graphqlRequest<any>(ABOUT_SERVER_QUERY);
  return user;
};

export const getHost = async () => {
  const host = await SuwayomiStore.host();
  if (!host) throw new Error("You have not defined a server url!");
  if (host.endsWith("/")) return host.slice(0, -1);
  return host;
};

export const healthCheck = async () => {
  const host = await getHost();
  await simpleReq({ url: `${host}/api/graphql` });
};

/**
 * Verify server connection by querying aboutServer
 * This can be used with any NetworkClient instance
 */
export const verifyServerConnection = async (
  client: NetworkClient,
  host: string,
  headers?: Record<string, string>
) => {
  const response = await client.request({
    url: `${host}/api/graphql`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: {
      query: ABOUT_SERVER_QUERY,
    },
  });

  if (response.status !== 200) {
    throw new Error("Invalid credentials or server error");
  }

  return response;
};
