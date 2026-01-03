import * as db from '../mock/mockDb.ts';
import type { Settings } from '../mock/types.ts';

export const settingsService = {
  get(): Settings {
    return db.getSettings();
  },

  update(data: Partial<Settings>): Settings {
    return db.updateSettings(data);
  },

  resetData(): void {
    db.resetData();
  },
};
