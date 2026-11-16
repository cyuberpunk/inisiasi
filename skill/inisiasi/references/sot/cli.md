# CLI dan tool terminal

> Terakhir diverifikasi: 2026-11-16

Scope: program command line dan TUI: parser, kontrak output, distribusi, tes.

## Default

| Bahasa | Parser | TUI |
|--------|--------|-----|
| Rust | `clap` (derive) | `ratatui` |
| Go | `cobra`, atau `urfave/cli` untuk tool kecil | `bubbletea` |
| TypeScript | `commander`, atau `oclif` jika butuh plugin | `ink` |
| Python | `typer` | `textual` |

## Kontrak output

- Data ke stdout, pesan dan error ke stderr.
- `--json` untuk konsumsi mesin. `--quiet` untuk senyap. Hormati `NO_COLOR`.
- Exit code berbeda per jenis gagal (0 sukses, 1 error umum, 2 pemakaian salah). Jangan pakai 1 untuk semuanya.
- `--version` dan shell completion (bash, zsh, fish).

## Aturan

- Urutan config: flag > env > file (`~/.config/<app>/`) > default.
- Aksi destruktif: `--dry-run` dan konfirmasi eksplisit.
- Pesan error menyebut apa yang salah dan apa langkah berikutnya.
- Distribusi: binary tunggal. Rilis: goreleaser (Go), cargo-dist (Rust), npm untuk TS, Homebrew tap, plus checksum.
- Tes CLI: `assert_cmd` / `trycmd` (Rust), `bats` (shell), snapshot output di CI.
- TUI hanya jika interaksi memang berulang dan butuh layar. Tool satu perintah cukup flag.

## Hindari

TUI untuk tool yang bisa satu perintah. Self-update otomatis kecuali produk butuh. Config global tanpa nama aplikasi. Prompt interaktif saat input dari pipe.
