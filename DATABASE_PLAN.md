# DATABASE PLAN - Thayyib Jaya Farm

Dokumen ini merangkum entitas data kandidat untuk aplikasi pencatatan
peternakan ayam petelur, berdasarkan mock data dan pemakaian di UI.

## 1) Fitur/halaman utama (scan /src)
- Dashboard: ringkasan produksi, performa kandang, status harian.
  - Source: src/pages/Dashboard.tsx
- Pencatatan Harian: list, filter, tambah, edit, hapus.
  - Source: src/pages/Recordings.tsx
  - Source: src/pages/RecordingNew.tsx
  - Source: src/pages/RecordingEdit.tsx
- Manajemen Kandang: CRUD kandang, toggle status aktif/tidak aktif.
  - Source: src/pages/Kandang.tsx
- Laporan & Analisis: grafik, tabel rekap, ranking kandang.
  - Source: src/pages/Reports.tsx
- Pengaturan: konfigurasi farm, reset data mock.
  - Source: src/pages/Settings.tsx
- Login placeholder (belum ada autentikasi).
  - Source: src/pages/Login.tsx
- Not Found (404).
  - Source: src/pages/NotFound.tsx

## 2) Data di /src/lib/mock/*
Jenis data yang ada (bukan e-commerce):
- Kandang: data kandang ayam (nama, populasi awal, target HDP/FCR, status).
  - Source: src/lib/mock/types.ts
  - Source: src/lib/mock/mockData.ts
  - Source: src/lib/mock/mockDb.ts
- Recording (pencatatan harian):
  - produksi telur (kg, butir), pakan masuk/sisa/terpakai, mortalitas, catatan.
  - Source: src/lib/mock/types.ts
  - Source: src/lib/mock/mockData.ts
  - Source: src/lib/mock/mockDb.ts
- Settings (global farm):
  - default target HDP, default target FCR, nama farm.
  - Source: src/lib/mock/types.ts
  - Source: src/lib/mock/mockData.ts
  - Source: src/lib/mock/mockDb.ts
- Turunan (computed view, bukan tabel utama):
  - DailyMetrics, DashboardSummary, KandangStatus, RankingEntry, ReportFilters.
  - Source: src/lib/mock/types.ts
  - Source: src/lib/mock/calculations.ts

## 3) Pemakai mock data (komponen/halaman)
- Dashboard (ringkasan + status kandang)
  - Source: src/pages/Dashboard.tsx
  - Service: src/lib/services/reportService.ts
  - Komponen: src/components/dashboard/KandangStatusGrid.tsx
  - Komponen: src/components/dashboard/PerformanceList.tsx
- Pencatatan Harian (list + filter)
  - Source: src/pages/Recordings.tsx
  - Service: src/lib/services/recordingService.ts
  - Service: src/lib/services/kandangService.ts
- Tambah Pencatatan
  - Source: src/pages/RecordingNew.tsx
  - Service: src/lib/services/recordingService.ts
  - Service: src/lib/services/kandangService.ts
- Edit Pencatatan
  - Source: src/pages/RecordingEdit.tsx
  - Service: src/lib/services/recordingService.ts
  - Service: src/lib/services/kandangService.ts
- Pencatatan Cepat (widget di dashboard)
  - Source: src/components/dashboard/QuickAddRecording.tsx
  - Service: src/lib/services/recordingService.ts
  - Service: src/lib/services/kandangService.ts
- Manajemen Kandang
  - Source: src/pages/Kandang.tsx
  - Service: src/lib/services/kandangService.ts
  - Service: src/lib/services/settingsService.ts
- Laporan & Analisis
  - Source: src/pages/Reports.tsx
  - Service: src/lib/services/reportService.ts
  - Service: src/lib/services/kandangService.ts
- Pengaturan + Header (farm name)
  - Source: src/pages/Settings.tsx
  - Source: src/components/layout/Header.tsx
  - Service: src/lib/services/settingsService.ts

## 4) Entitas data (kandidat tabel) + relasi

### A. kandang
- Deskripsi: unit kandang ayam petelur.
- Field:
  - id: string (uuid/short id)
  - name: string
  - initialChickenCount: int
  - targetHDPPercent: float
  - targetFCR: float
  - status: enum('active','inactive')
  - createdAt: timestamp
  - updatedAt: timestamp
- Relasi:
  - kandang 1 - N recordings
- Sumber mock:
  - src/lib/mock/types.ts
  - src/lib/mock/mockData.ts
  - src/lib/mock/mockDb.ts
- Pemakai:
  - src/pages/Kandang.tsx
  - src/pages/Recordings.tsx
  - src/pages/RecordingNew.tsx
  - src/pages/RecordingEdit.tsx
  - src/pages/Reports.tsx
  - src/pages/Dashboard.tsx
  - src/components/dashboard/QuickAddRecording.tsx
  - src/components/dashboard/KandangStatusGrid.tsx
  - src/components/dashboard/PerformanceList.tsx
- Status implementasi:
  - Sudah dibuat di schema: db/schema.ts

### B. recordings
- Deskripsi: pencatatan harian produksi kandang.
- Field:
  - id: string (uuid/short id)
  - kandangId: string (FK -> kandang.id)
  - date: date (YYYY-MM-DD)
  - feedInKg: float
  - feedRemainingKg: float
  - feedUsedKg: float (bisa dihitung, saat ini disimpan)
  - eggsKg: float
  - eggsCount: int
  - deadChickenCount: int
  - notes: text
  - createdAt: timestamp
  - updatedAt: timestamp
- Relasi:
  - recordings N - 1 kandang
- Sumber mock:
  - src/lib/mock/types.ts
  - src/lib/mock/mockData.ts
  - src/lib/mock/mockDb.ts
  - src/lib/mock/calculations.ts (perhitungan FCR/HDP)
- Pemakai:
  - src/pages/Recordings.tsx
  - src/pages/RecordingNew.tsx
  - src/pages/RecordingEdit.tsx
  - src/pages/Reports.tsx
  - src/pages/Dashboard.tsx
  - src/components/dashboard/QuickAddRecording.tsx
  - src/components/dashboard/KandangStatusGrid.tsx
  - src/components/dashboard/PerformanceList.tsx
- Status implementasi:
  - Sudah dibuat di schema: db/schema.ts

### C. settings
- Deskripsi: konfigurasi global farm.
- Field:
  - farmName: string
  - defaultTargetHDPPercent: float
  - defaultTargetFCR: float
- Relasi:
  - settings 1 - 1 (singleton)
- Sumber mock:
  - src/lib/mock/types.ts
  - src/lib/mock/mockData.ts
  - src/lib/mock/mockDb.ts
- Pemakai:
  - src/pages/Settings.tsx
  - src/pages/Kandang.tsx
  - src/components/layout/Header.tsx
- Status implementasi:
  - Sudah dibuat di schema: db/schema.ts

## 5) View/derived metrics (bukan tabel utama)
Disarankan sebagai view atau query agregat:
- daily_metrics:
  - Sumber: src/lib/mock/calculations.ts
  - Menggunakan: recordings + kandang
- dashboard_summary, kandang_status, ranking:
  - Sumber: src/lib/services/reportService.ts
  - Menggunakan: recordings + kandang
