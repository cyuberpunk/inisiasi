# Git dan kolaborasi

> Terakhir diverifikasi: 2026-11-16

Scope: commit, branch, PR, merge, komentar review.

## Commit

Conventional Commits: `type(scope): ringkasan`. Type: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `build`, `ci`. Imperatif, huruf kecil, tanpa titik akhir, judul 72 karakter.

Satu commit satu alasan. Commit reformat dipisah dari commit logika. Ticket ID di footer.

## Branch

Trunk-based default: branch pendek dari `main`, merge dalam hitungan hari. GitHub Flow jika review wajib. Git Flow hanya untuk rilis terjadwal.

Nama: `feat/order-export`, `fix/pool-timeout`, `chore/bump-deps`.

## PR

- Maksimal 400 baris diff di luar file generated. Lebih dari itu pecah.
- Deskripsi: apa, kenapa, cara uji, risiko.
- Review pakai label: `issue:`, `suggestion:`, `nit:`, `question:`, `praise:`.
- Merge: squash, rebase, atau merge commit. Pilih satu per repo.

## Hindari

Commit "fix", "update", "wip". Force-push ke branch bersama. Merge dengan CI merah. Review hanya kosmetik.
