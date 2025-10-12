import { Form, RunnerPreferenceProvider } from "@suwatte/daisuke";

export const SuwayomiPreferenceProvider: RunnerPreferenceProvider = {
  getPreferenceMenu: async function (): Promise<Form> {
    return {
      sections: [],
    };
  },
};
