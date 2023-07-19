import { App } from "vue";
import { useIndexedDB } from "@js-utils/shared-utils";
import { IndexedDBProxy } from "@js-utils/shared-utils/dist/utils/indexed-db";

export const vueIndexedDBPlugin = {
  install: (app: App, _options: any) => {
    app.config.globalProperties.$indexedDB = (dbName: string): any => {
      return useIndexedDB(dbName);
    };
  },
};

const testDB: IndexedDBProxy = useIndexedDB("myDB");
