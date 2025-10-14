import { Form, RunnerPreferenceProvider, UIToggle } from "@suwatte/daisuke";
import { KomgaStore } from "../store";

export const KomgaPreferenceProvider: RunnerPreferenceProvider = {
  getPreferenceMenu: async function (): Promise<Form> {
    return {
      sections: [
        {
          header: "Core",
          children: [
            UIToggle({
              id: "syncChaptersMarked",
              title: "Sync Chapters Marked",
              value: await KomgaStore.syncChaptersMarked(),
              async didChange(value) {
                await ObjectStore.set("syncChaptersMarked", value);
              },
            }),
          ],
        },
      ],
    };
  },
};
