import { initialKandang, initialRecordings, initialSettings, createNewId } from './mockData';
import type { Kandang, Recording, Settings } from './types';

// In-memory storage
let kandangStore: Kandang[] = [...initialKandang];
let recordingStore: Recording[] = [...initialRecordings];
let settingsStore: Settings = { ...initialSettings };

// Kandang CRUD
export function getAllKandang(): Kandang[] {
  return [...kandangStore].sort((a, b) => a.name.localeCompare(b.name));
}

export function getActiveKandang(): Kandang[] {
  return getAllKandang().filter(k => k.status === 'active');
}

export function getKandangById(id: string): Kandang | undefined {
  return kandangStore.find(k => k.id === id);
}

export function createKandang(data: Omit<Kandang, 'id' | 'createdAt' | 'updatedAt'>): Kandang {
  const now = new Date().toISOString();
  const newKandang: Kandang = {
    ...data,
    id: createNewId(),
    createdAt: now,
    updatedAt: now,
  };
  kandangStore.push(newKandang);
  return newKandang;
}

export function updateKandang(id: string, data: Partial<Kandang>): Kandang | undefined {
  const index = kandangStore.findIndex(k => k.id === id);
  if (index === -1) return undefined;

  kandangStore[index] = {
    ...kandangStore[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return kandangStore[index];
}

export function deleteKandang(id: string): boolean {
  const index = kandangStore.findIndex(k => k.id === id);
  if (index === -1) return false;

  kandangStore.splice(index, 1);
  // Also delete all recordings for this kandang
  recordingStore = recordingStore.filter(r => r.kandangId !== id);
  return true;
}

// Recording CRUD
export function getAllRecordings(): Recording[] {
  return [...recordingStore].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getRecordingById(id: string): Recording | undefined {
  return recordingStore.find(r => r.id === id);
}

export function getRecordingsByKandang(kandangId: string): Recording[] {
  return recordingStore
    .filter(r => r.kandangId === kandangId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRecordingsByDateRange(startDate: string, endDate: string): Recording[] {
  return recordingStore
    .filter(r => r.date >= startDate && r.date <= endDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRecordingByDateAndKandang(date: string, kandangId: string): Recording | undefined {
  return recordingStore.find(r => r.date === date && r.kandangId === kandangId);
}

export function createRecording(
  data: Omit<Recording, 'id' | 'createdAt' | 'updatedAt' | 'feedUsedKg'>
): Recording {
  const now = new Date().toISOString();
  const feedUsedKg = Math.max(0, data.feedInKg - data.feedRemainingKg);
  
  const newRecording: Recording = {
    ...data,
    feedUsedKg,
    id: createNewId(),
    createdAt: now,
    updatedAt: now,
  };
  recordingStore.push(newRecording);
  return newRecording;
}

export function updateRecording(id: string, data: Partial<Recording>): Recording | undefined {
  const index = recordingStore.findIndex(r => r.id === id);
  if (index === -1) return undefined;

  const updated = { ...recordingStore[index], ...data };
  
  // Recalculate feedUsedKg if feedIn or feedRemaining changed
  if (data.feedInKg !== undefined || data.feedRemainingKg !== undefined) {
    updated.feedUsedKg = Math.max(0, updated.feedInKg - updated.feedRemainingKg);
  }

  updated.updatedAt = new Date().toISOString();
  recordingStore[index] = updated;
  return recordingStore[index];
}

export function deleteRecording(id: string): boolean {
  const index = recordingStore.findIndex(r => r.id === id);
  if (index === -1) return false;

  recordingStore.splice(index, 1);
  return true;
}

// Settings
export function getSettings(): Settings {
  return { ...settingsStore };
}

export function updateSettings(data: Partial<Settings>): Settings {
  settingsStore = { ...settingsStore, ...data };
  return settingsStore;
}

// Reset data (for development/testing)
export function resetData(): void {
  kandangStore = [...initialKandang];
  recordingStore = [...initialRecordings];
  settingsStore = { ...initialSettings };
}
