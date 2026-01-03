import * as db from '../mock/mockDb';
import type { Kandang } from '../mock/types';

export const kandangService = {
  getAll(): Kandang[] {
    return db.getAllKandang();
  },

  getActive(): Kandang[] {
    return db.getActiveKandang();
  },

  getById(id: string): Kandang | undefined {
    return db.getKandangById(id);
  },

  create(data: {
    name: string;
    initialChickenCount: number;
    targetHDPPercent: number;
    targetFCR: number;
    status: 'active' | 'inactive';
  }): Kandang {
    return db.createKandang(data);
  },

  update(id: string, data: Partial<Kandang>): Kandang | undefined {
    return db.updateKandang(id, data);
  },

  delete(id: string): boolean {
    return db.deleteKandang(id);
  },

  toggleStatus(id: string): Kandang | undefined {
    const kandang = db.getKandangById(id);
    if (!kandang) return undefined;
    
    return db.updateKandang(id, {
      status: kandang.status === 'active' ? 'inactive' : 'active',
    });
  },
};
