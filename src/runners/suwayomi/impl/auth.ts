import {
  BasicAuthenticatable,
  BasicAuthenticationUIIdentifier,
} from "@suwatte/daisuke";
import { getUser, verifyServerConnection } from "../api/auth";
import { SuwayomiStore } from "../store";
import { AuthMode } from "../types/auth";

export const SuwayomiAuthentication: BasicAuthenticatable = {
  BasicAuthUIIdentifier: BasicAuthenticationUIIdentifier.USERNAME,
  getAuthenticatedUser: async () => {
    const host = await SuwayomiStore.host();
    if (!host)
      throw new Error(
        "You have not set your server url. You must do this to use the runner"
      );

    const authMode = await SuwayomiStore.authMode();

    // For authenticated modes, check if user is logged in
    if (authMode !== AuthMode.NONE) {
      const authenticated = await SuwayomiStore.authenticated();
      if (!authenticated) return null;
    }

    try {
      const data = await getUser();
      const aboutServer = data.aboutServer;
      if (!aboutServer) {
        throw new Error("Invalid credentials");
      }

      return {
        handle: `${aboutServer.name}(${aboutServer.version})`,
      };
    } catch (err: any) {
      console.error(err.message);
      // Only clear credentials for authenticated modes
      if (authMode !== AuthMode.NONE) {
        await SecureStore.remove("credentials");
        await ObjectStore.remove("authenticated");
      }
    }

    return null;
  },
  handleUserSignOut: async () => {
    await SecureStore.remove("credentials");
    await ObjectStore.remove("authenticated");
  },
  handleBasicAuth: async (identifier, password) => {
    const host = await SuwayomiStore.host();
    if (!host) throw new Error("You have not defined a server url!");

    const client = new NetworkClient();

    // Basic Auth mode: store credentials and verify
    const value = Buffer.from(`${identifier}:${password}`).toString("base64");

    // Verify credentials with Basic Auth header
    await verifyServerConnection(client, host, {
      Authorization: `Basic ${value}`,
    });

    console.info("login successfully");

    // Set Props
    await ObjectStore.set("authenticated", true);
    await SecureStore.set("credentials", value);
  },
};
