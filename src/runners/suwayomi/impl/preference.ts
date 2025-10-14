import { Form, RunnerPreferenceProvider, UIToggle } from "@suwatte/daisuke";
import { SuwayomiStore } from "../store";

export const SuwayomiPreferenceProvider: RunnerPreferenceProvider = {
  getPreferenceMenu: async function (): Promise<Form> {
    return {
      sections: [
        {
          header: "Core",
          children: [
            UIToggle({
              id: "syncChaptersMarked",
              title: "Sync Chapters Marked",
              value: await SuwayomiStore.syncChaptersMarked(),
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
