import {
  BooleanState,
  Form,
  RunnerSetupProvider,
  UITextField,
  UIPicker,
} from "@suwatte/daisuke";
import { SuwayomiStore } from "../store";
import { ABOUT_SERVER_QUERY } from "../api/auth";
import { graphqlRequest } from "../api/request";
import { AuthMode } from "../types/auth";

type SetupForm = {
  host: string;
  authMode: string;
};

export const SuwayomiSetupProvider: RunnerSetupProvider = {
  getSetupMenu: async function (): Promise<Form> {
    const currentAuthMode = await SuwayomiStore.authMode();

    return {
      sections: [
        {
          header: "Server URL",
          children: [
            UITextField({
              id: "host",
              title: "Server URL",
              value: (await SuwayomiStore.host()) ?? "",
              placeholder: "http://localhost:4567",
            }),
          ],
        },
        {
          header: "Authentication",
          footer:
            "Select authentication mode:\n• None: No authentication required\n• Basic Auth: Use header-based authentication",
          children: [
            UIPicker({
              id: "authMode",
              title: "Authentication Mode",
              options: [
                { id: AuthMode.NONE, title: "No Authentication" },
                { id: AuthMode.BASIC, title: "Basic Auth (Header)" },
              ],
              value: currentAuthMode,
            }),
          ],
        },
      ],
    };
  },
  validateSetupForm: async function ({
    host: value,
    authMode,
  }: SetupForm): Promise<void> {
    let url = value.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `http://${url}`;
    }
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }

    await ObjectStore.set("host", url);
    await SuwayomiStore.setAuthMode(authMode as AuthMode);

    // Only verify connection if no authentication is required
    // For Basic Auth mode, user needs to login first before we can verify
    if (authMode === AuthMode.NONE) {
      try {
        // Simple health check query
        await graphqlRequest(ABOUT_SERVER_QUERY);
      } catch (error) {
        console.error(`${error}`);
        throw new Error("Cannot Connect to Suwayomi Server");
      }
    } else {
      console.info("Please login after setup");
    }
  },
  isRunnerSetup: async function (): Promise<BooleanState> {
    return {
      state: !!(await SuwayomiStore.host()),
    };
  },
};
