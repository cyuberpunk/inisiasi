<script>
  import { Checkbox } from "bits-ui";
  import skills from "./data.json";

  const STORE = "catalog-curation-v1";
  const saved = typeof localStorage !== "undefined" ? JSON.parse(localStorage.getItem(STORE) || "{}") : {};

  let overrides = $state(saved.overrides || {});
  let checked = $state(new Set(saved.checked || skills.map((s) => s.id)));
  let dark = $state(typeof localStorage !== "undefined" && localStorage.getItem("theme") === "dark");
  let q = $state("");
  let tierFilter = $state("all");
  let copied = $state(false);
  let openCats = $state(new Set());

  $effect(() => {
    localStorage.setItem(STORE, JSON.stringify({ overrides, checked: [...checked] }));
  });
  $effect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  });

  const view = (s) => ({ ...s, ...(overrides[s.id] || {}) });
  const live = $derived(skills.map(view));
  const all = $derived(live.filter((s) => !s.removed));

  const matches = (s) => {
    if (tierFilter === "removed") return s.removed === true;
    if (s.removed) return false;
    return (tierFilter === "all" ? true : tierFilter === "unscored" ? s.score == null : s.tier === tierFilter) &&
      (!q || s.name.toLowerCase().includes(q.toLowerCase()) || (s.creator || "").toLowerCase().includes(q.toLowerCase()));
  };

  const visible = $derived(live.filter(matches));
  const selectedIds = $derived(visible.filter((s) => checked.has(s.id)).map((s) => s.id));

  const groups = $derived.by(() => {
    const cats = new Map();
    for (const s of visible) {
      const tier = s.tier || "support";
      if (!cats.has(s.category)) cats.set(s.category, new Map());
      const tiers = cats.get(s.category);
      if (!tiers.has(tier)) tiers.set(tier, []);
      tiers.get(tier).push(s);
    }
    return [...cats.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, tiers]) => ({
        name,
        tiers: [...tiers.entries()]
          .sort((a, b) => (a[0] === "main" ? -1 : 1) - (b[0] === "main" ? -1 : 1))
          .map(([tier, list]) => ({ tier, list: list.sort((x, y) => (y.score ?? -1) - (x.score ?? -1) || x.name.localeCompare(y.name)) })),
      }));
  });

  function act(id, patch) {
    overrides = { ...overrides, [id]: { ...(overrides[id] || {}), ...patch } };
  }
  function reset(id) {
    const next = { ...overrides };
    delete next[id];
    overrides = next;
  }
  function toggle(id) {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    checked = next;
  }
  function setMany(ids, on) {
    const next = new Set(checked);
    for (const id of ids) on ? next.add(id) : next.delete(id);
    checked = next;
  }
  const toggleOpen = (key) => {
    const next = new Set(openCats);
    next.has(key) ? next.delete(key) : next.add(key);
    openCats = next;
  };
  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(selectedIds, null, 2));
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {}
  }
  const stat = $derived({
    total: skills.length,
    live: all.length,
    removed: skills.length - all.length,
    main: all.filter((s) => s.tier === "main").length,
    support: all.filter((s) => s.tier !== "main").length,
  });
</script>

<main class="mx-auto max-w-4xl px-5 py-8">
  <header class="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
    <h1 class="text-xl font-semibold tracking-tight">Skills catalog</h1>
    <div class="flex flex-wrap items-center gap-2 text-xs">
      <input bind:value={q} placeholder="Filter skill or creator" class="w-52 rounded-md border border-line bg-white px-2 py-1 dark:border-mute dark:bg-ink" />
      {#each ["all", "main", "support", "unscored", "removed"] as t}
        <button onclick={() => (tierFilter = t)} class="rounded-md border px-2 py-1 {tierFilter === t ? 'border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink' : 'border-line bg-white dark:border-mute dark:bg-ink'}">
          {t}{#if t === "removed"} <span class="opacity-60">{skills.length - all.length}</span>{:else if t !== "all" && t !== "unscored"} <span class="opacity-60">{stat[t]}</span>{/if}
        </button>
      {/each}
      <button onclick={() => (dark = !dark)} class="rounded-md border border-line bg-white px-2 py-1 dark:border-mute dark:bg-ink dark:text-paper">{dark ? "Light" : "Dark"}</button>
    </div>
  </header>

  <p class="mt-2 text-xs text-mute tabular-nums">
    {stat.live} live, {stat.removed} removed, {stat.main} main, {stat.support} support, {selectedIds.length} checked
  </p>

  <ul class="mt-3">
    {#each groups as cat (cat.name)}
      <li class="border-b border-line/70">
        <div class="flex items-center gap-2 py-2">
          <button onclick={() => toggleOpen(cat.name)} class="w-4 text-mute">{openCats.has(cat.name) ? "−" : "+"}</button>
          <Checkbox.Root
            checked={cat.tiers.flatMap((t) => t.list).every((s) => checked.has(s.id))}
            onCheckedChange={() => {
              const ids = cat.tiers.flatMap((t) => t.list).map((s) => s.id);
              setMany(ids, !ids.every((i) => checked.has(i)));
            }}
            aria-label={cat.name}
            class="grid size-4 place-items-center rounded border border-mute/60 bg-white text-[10px] data-[state=checked]:border-ink data-[state=checked]:bg-ink data-[state=checked]:text-paper dark:bg-ink"
          ><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Root>
          <button onclick={() => toggleOpen(cat.name)} class="font-semibold">{cat.name}</button>
          <span class="text-xs text-mute tabular-nums">{cat.tiers.flatMap((t) => t.list).length}</span>
        </div>

        {#if openCats.has(cat.name)}
          {#each cat.tiers as group (group.tier)}
            <div class="ml-6 border-l border-line/70 pl-4">
              <p class="py-1 text-[11px] font-medium uppercase tracking-wide text-mute">{group.tier} · {group.list.length}</p>
              <ul>
                {#each group.list as s (s.id)}
                  <li class="flex items-start gap-2 border-b border-line/40 py-2">
                    <Checkbox.Root checked={checked.has(s.id)} onCheckedChange={() => toggle(s.id)} aria-label={s.name}
                      class="mt-0.5 grid size-3.5 flex-none place-items-center rounded border border-mute/60 bg-white text-[9px] data-[state=checked]:border-ink data-[state=checked]:bg-ink data-[state=checked]:text-paper dark:bg-ink">
                      <Checkbox.Indicator>✓</Checkbox.Indicator>
                    </Checkbox.Root>
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-baseline gap-x-1.5">
                        <a href={s.url} target="_blank" rel="noreferrer" class="text-sm font-medium underline decoration-line underline-offset-2 hover:decoration-ink">{s.name}</a>
                        <span class="text-[11px] text-mute">{s.creator}</span>
                        {#if s.score != null}<span class="text-[11px] tabular-nums text-mute">{s.score.toFixed(1)}</span>{/if}
                        {#if overrides[s.id]}<span class="text-[10px] text-accent">edited</span>{/if}
                      </div>
                      <p class="text-xs leading-snug text-mute">{s.desc}</p>
                      <div class="mt-1 flex flex-wrap gap-1">
                        <button onclick={() => act(s.id, { tier: s.tier || "support" })} class="rounded border border-line px-1.5 py-0.5 text-[10px] hover:border-ink dark:border-mute">Keep</button>
                        <button onclick={() => act(s.id, { tier: "main" })} class="rounded border px-1.5 py-0.5 text-[10px] {s.tier === 'main' ? 'border-ink bg-ink text-paper dark:bg-paper dark:text-ink' : 'border-line dark:border-mute'}">Main</button>
                        <button onclick={() => act(s.id, { tier: "support" })} class="rounded border px-1.5 py-0.5 text-[10px] {s.tier !== 'main' ? 'border-ink bg-ink text-paper dark:bg-paper dark:text-ink' : 'border-line dark:border-mute'}">Support</button>
                        {#if s.removed}
                          <button onclick={() => act(s.id, { removed: false })} class="rounded border border-ink px-1.5 py-0.5 text-[10px]">Restore</button>
                        {:else}
                          <button onclick={() => act(s.id, { removed: true })} class="rounded border border-red-300 px-1.5 py-0.5 text-[10px] text-red-700 hover:bg-red-50">Remove</button>
                        {/if}
                        {#if overrides[s.id]}<button onclick={() => reset(s.id)} class="rounded border border-line px-1.5 py-0.5 text-[10px] text-mute dark:border-mute">Reset</button>{/if}
                      </div>
                    </div>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        {/if}
      </li>
    {/each}
  </ul>

  <footer class="sticky bottom-4 mt-6 flex justify-end">
    <button onclick={copy} class="rounded-md bg-ink px-3.5 py-2 text-sm text-paper shadow-sm hover:opacity-90 dark:bg-paper dark:text-ink">
      {copied ? "Copied" : `Copy checked ids (${selectedIds.length})`}
    </button>
  </footer>
</main>
