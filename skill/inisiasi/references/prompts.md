# Example prompts

Copy-paste into a chat that has the `inisiasi` skill. Swap the bits in `<angle brackets>`. The skill still follows its confirmation gates: it stops after writing or changing PLAN, and again before writing ARCHITECTURE or TASKS.

## Init from an idea

Use when the repo is empty or `docs/PLAN.md` does not exist yet.

Expected: at most 5 short questions if anything is missing, then a draft `docs/PLAN.md`, then a stop for confirmation. No ARCHITECTURE or TASKS yet.

```
inisiasi dulu. Aku mau bikin <app/cli/web> buat <siapa>, intinya <tujuan>. MVP-nya <fitur 1, fitur 2>. Constraints: <misalnya offline, macOS 15, no account>. Non-goals: <yang memang nggak masuk v1>. Isi docs/PLAN.md, jangan tulis ARCHITECTURE atau TASKS sebelum aku bilang go.
```

## Init from an existing PLAN.md

Use when `docs/PLAN.md` already has the goals and you want the stack proposal.

Expected: `inspect_plan` or, if available, one `recommend_bundle` call (`root` plus a one-sentence description). If the PLAN is not ready, questions then a stop. If it is ready, a short SoT reading list (with `verified_at` and `stale`), skill recommendations with `installed` flags, coverage holes, a one-line stack, and a stop until you say go.

```
PLAN.md fuu / <project> udah ada. Jalankan inisiasi dari situ. Pakai recommend_bundle (root repo plus satu kalimat deskripsi), atau inspect_plan plus select_references plus recommend_skills. Kalau masih ada open questions, tanya aku, jangan lanjut. Kalau ready, usulin stack, skills, dan module layout, lalu berhenti. Jangan tulis ARCHITECTURE atau TASKS sebelum aku bilang go.
```

## Revisi PLAN, ARCHITECTURE, atau TASKS

Use when a decision changed and the docs need a tight edit, not a new stack.

Expected: a short diff of the sections that change, then a stop for confirmation before writing. DESIGN.md stays untouched.

```
Revisi docs inisiasi, jangan ganti stack. <Keputusan baru, misalnya: v1 lock folder apa aja yang aku pilih, external volume keluar dari v1.> Update section yang terdampak di PLAN, dan kalau ARCHITECTURE atau TASKS sudah ada, sesuaikan yang related aja. Tunjukin perubahannya dulu, tulis setelah aku setuju.
```

## Revamp the stack

Use when the current stack is wrong and you want a fresh plan. Re-run only if you explicitly ask.

Expected: a new stack proposal with rejected alternatives, skills, and the riskiest assumption. Stops before overwriting ARCHITECTURE or TASKS. Backs up existing docs if you say go.

```
Revamp stack project ini. Stack yang sekarang <stack lama> kurang pas karena <alasan>. Tetap ikut goals di PLAN.md. Usulin stack baru yang paling simple, plus alternatives yang ditolak, skills, dan risk spike. Jangan overwrite ARCHITECTURE atau TASKS sebelum aku bilang go. Kalau aku bilang go, backup file lama dulu.
```

## Refactor, plan only

Use on an existing codebase when you want a refactor plan, not code changes.

Expected: a short PLAN or ARCHITECTURE addendum (current shape, target shape, risks, ordered tasks). No app code, no installs.

```
Refactor plan aja, jangan sentuh kode. Repo ini <satu kalimat: bahasa, modul, masalahnya>. Targetnya <misalnya: pecah core dari UI, atau ganti state model>. Tulis usulan di chat dulu: state sekarang, target, risiko, dan 5-12 tasks dengan verify check. Jangan edit source sebelum aku setuju.
```

## Swimlane diagram

Use when you need who does what across a flow (app, extension, system, owner).

Expected: a mermaid swimlane (`flowchart` or `sequenceDiagram` with participant lanes) in chat. Writes a file only if you ask.

```
Buat swimlane diagram untuk <alur, misalnya lock/unlock folder di fuu>. Lane-nya: <Owner, Menu bar app, Finder extension, hdiutil, Keychain, LocalAuthentication>. Pakai mermaid, taruh di chat dulu, jangan tulis file kecuali aku minta.
```

## Flowchart

Use when you need the decision path of one flow, including failure branches.

Expected: a mermaid `flowchart` with success and failure paths, in chat.

```
Buat flowchart mermaid untuk <alur, misalnya: create encrypted image, copy, verify, baru hapus original>. Masukin cabang gagal (verify gagal, mount gagal, Touch ID cancel). Di chat aja dulu.
```

## C4 context

Use when you need the system-in-context view: users and external systems.

Expected: a mermaid C4 context diagram (or equivalent boxes and relations) in chat.

```
Buat C4 context diagram untuk <project>. Tunjukin user, sistem utamanya, dan sistem luar yang disentuh (atau ditegaskan tidak disentuh, misalnya no network). Mermaid, di chat dulu.
```

## C4 container

Use when you need the major deployable pieces and how they talk.

Expected: a mermaid C4 container diagram in chat (for example app, extension, shared core, OS services).

```
Buat C4 container diagram untuk <project>. Container-nya: <misalnya menubar app, Finder Sync extension, shared core/XPC, Keychain, disk images>. Kasih relasi dan arah datanya. Mermaid, di chat dulu.
```

## C4 component

Use when you need the internals of one container.

Expected: a mermaid C4 component diagram for the named container, in chat.

```
Buat C4 component diagram untuk container <nama, misalnya shared core> di <project>. Pecah jadi komponen: <misalnya lock service, mount service, keychain store, UI state>. Mermaid, di chat dulu.
```

## Sequence diagram

Use when you need the time-ordered messages of one use case.

Expected: a mermaid `sequenceDiagram` in chat, including error or cancel paths if they matter.

```
Buat sequence diagram mermaid untuk <use case, misalnya unlock folder dengan Touch ID, fallback ke password>. Participant: <daftar>. Masukin jalur cancel dan gagal. Di chat dulu.
```

## ADR

Use when a decision should be recorded rather than only discussed.

Expected: a draft ADR using the ADR format in `references/sot/engineering-practices.md`, shown first, written only after you agree. No em dashes.

```
Tulis ADR untuk keputusan ini: <keputusan, misalnya passphrase volume disimpan di Keychain dengan policy X>. Context, options, decision, consequences. Ikuti format ADR di engineering-practices.md (SoT). Draft di chat dulu, jangan tulis file sebelum aku setuju.
```

## Add a feature

Use when the stack stays the same and you want one feature planned into the docs.

Expected: a small PLAN/ARCHITECTURE/TASKS delta for that feature, then a stop before writing. No app code.

```
Tambah fitur ke plan, jangan ganti stack: <fitur, misalnya auto-lock on sleep, atau lock folder dari Finder right-click>. Update MVP atau non-goals kalau perlu, plus tasks baru dengan verify check. Tunjukin delta-nya, tulis setelah aku setuju. Jangan scaffold kode.
```

## Audit the docs

Use when you want a gate check on the current docs, not a rewrite.

Expected: `validate_docs` (or a manual check) plus a short list of errors and warnings. No files changed unless you ask for a fix.

```
Audit docs inisiasi di repo ini pakai validate_docs. Kasih list error dan warning (section yang kurang, TASKS bukan 5-12, task 1 bukan spike, verify check, em dash, worklog, stub ARCHITECTURE, status DESIGN.md). Jangan edit file, lapor aja. Kalau mau kubenerin, aku yang bilang.
```

## References freshness check

Use when you want to see which SoT files are stale, not to rewrite them yet.

Expected: a list of `_references` files with `Terakhir diverifikasi` dates, flagged if older than 12 months or missing the header. `select_references` already returns `verified_at` and `stale` for the shortlist; this prompt is the full-tree check. No edits unless you ask.

```
Cek freshness _references inisiasi. List file yang tanggal "Terakhir diverifikasi"-nya lebih dari 12 bulan atau header-nya hilang. Jangan edit .md-nya, lapor aja dulu.
```
