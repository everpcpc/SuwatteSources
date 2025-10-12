import {
  BooleanState,
  Form,
  RunnerSetupProvider,
  UITextField,
} from "@suwatte/daisuke";
import { SuwayomiStore } from "../store";
import { graphqlRequest } from "../api/request";

type SetupForm = {
  host: string;
};

export const SuwayomiSetupProvider: RunnerSetupProvider = {
  getSetupMenu: async function (): Promise<Form> {
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
      ],
    };
  },
  validateSetupForm: async function ({
    host: value,
  }: SetupForm): Promise<void> {
    let url = value.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `http://${url}`;
    }
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }

    await ObjectStore.set("host", url);

    try {
      // Simple health check query
      await graphqlRequest(`
        query {
          aboutServer {
            name
            version
          }
        }
      `);
    } catch (error) {
      console.error(`${error}`);
      throw new Error("Cannot Connect to Suwayomi Server");
    }
  },
  isRunnerSetup: async function (): Promise<BooleanState> {
    return {
      state: !!(await SuwayomiStore.host()),
    };
  },
};
