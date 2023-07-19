import { App } from "vue";
import { useIndexedDB } from "@js-utils/shared-utils";

export const vueIndexedDBPlugin = {
  install: (app: App): void => {
    app.config.globalProperties.$indexedDB = (dbName: string): any => {
      return useIndexedDB(dbName);
    };
  },
};
