import * as db from '../mock/mockDb';
import type { Settings } from '../mock/types';

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
