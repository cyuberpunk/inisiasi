# AI dan LLM

> Terakhir diverifikasi: 2026-11-16

Scope: memakai model di produk: SDK, streaming, structured output, RAG, biaya, keamanan, eval.

## Default

| Kebutuhan | Pakai |
|-----------|-------|
| TS multi-provider | Vercel AI SDK |
| Satu provider saja | SDK resmi (OpenAI, Anthropic) |
| Python multi-provider | LiteLLM |
| Orkestrasi kompleks | LangGraph. LangChain hanya jika rantai tool sudah rumit |

Langkah terakhir ini sengaja: kebanyakan produk hanya butuh satu panggilan + streaming.

## Aturan

- Streaming ke klien lewat SSE. Batalkan saat koneksi putus. Tampilkan status (mengetik, selesai, gagal).
- Structured output lewat tool calling atau JSON schema, divalidasi Zod di boundary. Jangan parse teks bebas.
- RAG: `pgvector` dulu. Chunk 300-800 token dengan overlap, rerank sebelum masuk context, simpan sumber.
- Biaya: prompt caching, model kecil untuk tugas ringan, cap pemakaian plus alert, jangan kirim context sama berulang.
- Riwayat percakapan di database, bukan state proses. Batasi panjang per sesi.
- Eval: `promptfoo` di CI, dataset kecil stabil. Ukur regresi sebelum ganti model atau prompt.

## Keamanan

Prompt injection dan aksi berbahaya dari LLM: [problems-critical.md](problems-critical.md).

- Isi dokumen atau halaman pengguna tidak tepercaya. Prompt injection tidak boleh mengubah otorisasi atau akses tool.
- Tool dengan least privilege. Aksi berisiko (transfer, hapus, kirim) butuh approval manusia.
- Redaksi PII dan secret di log. Jangan taruh secret di prompt.
- Batas biaya per pengguna untuk mencegah penyalahgunaan.

## Hindari

Streaming tanpa pembatalan. RAG tanpa rerank untuk korpus lebih dari ratusan dokumen. Menyimpan output model langsung ke DB tanpa validasi.
