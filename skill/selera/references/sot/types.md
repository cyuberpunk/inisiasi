# Type, error, logging

> Terakhir diverifikasi: 2026-11-16

Scope: strict typing, validasi boundary, null safety, error, log.

## Type

- TypeScript `strict` penuh, termasuk `noUncheckedIndexedAccess` dan `exactOptionalPropertyTypes`. `any` dilarang; pakai `unknown` lalu sempitkan.
- Python: annotation di fungsi publik, `mypy` atau `pyright` di CI.
- Data dari luar (API, env, form) divalidasi di boundary dengan schema (Zod, pydantic). Setelah itu tipe dipercaya.
- Union bukan string bebas: `"pending" | "paid"`.
- `null` untuk tidak ada nilai, `undefined` untuk tidak diberikan. Pilih satu per konteks.

## Error

- Error kelas sendiri: kode mesin, pesan untuk pengguna, detail internal di `cause`.
- Result/Either untuk kegagalan yang diharapkan. Exception untuk bug dan kegagalan tak terduga.
- Jangan menelan error. `catch` tanpa aksi atau rethrow dilarang.
- Handler global di boundary: log lengkap, respons generik, tanpa stack trace.
- Fail closed untuk auth dan otorisasi.

## Log

- Level: DEBUG, INFO, WARN, ERROR. FATAL hanya untuk proses yang berhenti.
- Terstruktur JSON dengan `request_id`, `trace_id`, `user_id` (hash bila sensitif).
- Log di boundary: request masuk, panggilan keluar, error.
- Jangan log secret, token, atau PII mentah.
