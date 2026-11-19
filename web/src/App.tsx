import { useMemo, useState } from "react";
import { Tab, TabList, TabPanel, Tabs, type Key, type Selection } from "react-aria-components";
import { TreeView, TreeViewCollection, TreeViewItem } from "@/components/base/tree-view/tree-view";
import { Chip } from "@/components/Chip";
import { SkillDetail } from "@/components/SkillDetail";
import { DocsPage } from "@/components/DocsPage";
import { casesSections, stackSections, standardsGaps, standardsSections } from "@/lib/docs";
import { byId, creatorTree, domainTree, skills, type Node } from "@/lib/catalog";

// Skill rows show domain and category chips; folder rows show a count.
const trailing = (n: Node) =>
  n.skill ? (
    <span className="flex gap-1">
      <Chip tone="indigo">{n.skill.domain}</Chip>
      <Chip>{n.skill.niche}</Chip>
      {n.skill.verified === false && <Chip tone="amber">unverified</Chip>}
    </span>
  ) : n.trailing;

const renderNode = (n: Node) => (
  <TreeViewItem id={n.id} label={n.name} trailingContent={trailing(n)}>
    <TreeViewCollection items={n.children ?? []}>{renderNode}</TreeViewCollection>
  </TreeViewItem>
);

function Browser({ data, label }: { data: Node[]; label: string }) {
  const [expanded, setExpanded] = useState<Set<Key>>(new Set());
  const [selected, setSelected] = useState<Selection>(new Set());
  const skill = selected === "all" ? undefined : byId.get([...selected][0] as string);
  const branchIds = useMemo(() => {
    const ids: Key[] = [];
    const walk = (ns: Node[]) => { for (const n of ns) if (n.children?.length) { ids.push(n.id); walk(n.children); } };
    walk(data);
    return ids;
  }, [data]);
  const allOpen = expanded.size >= branchIds.length;
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,26rem)_1fr]">
      <div>
      <button type="button" aria-pressed={allOpen} onClick={() => setExpanded(allOpen ? new Set() : new Set(branchIds))}
        className="mb-2 rounded-md border px-2.5 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2">
        {allOpen ? "Collapse all" : "Expand all"}
      </button>
      <TreeView aria-label={label} items={data} expandedKeys={expanded} onExpandedChange={setExpanded}
        selectedKeys={selected} onSelectionChange={setSelected} size="sm">
        {renderNode}
      </TreeView>
      </div>
      <section aria-live="polite" className="md:sticky md:top-4 md:max-h-[calc(100vh-2rem)] md:self-start md:overflow-y-auto">{skill ? <SkillDetail skill={skill} /> : <p className="text-sm opacity-70">Select a skill.</p>}</section>
    </div>
  );
}

const tab = "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium outline-none data-[selected]:bg-slate-900 data-[selected]:text-white data-[focus-visible]:ring-2 dark:data-[selected]:bg-slate-100 dark:data-[selected]:text-slate-900";

export default function App() {
  const domains = useMemo(domainTree, []);
  const creators = useMemo(creatorTree, []);
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-lg font-semibold">inisiasi catalog</h1>
      <p className="mb-4 text-sm opacity-70">{skills.length} skills, {domains.length} domains, {creators.length} creators</p>
      <Tabs>
        <TabList aria-label="View" className="mb-4 flex gap-1">
          <Tab id="domain" className={tab}>By domain</Tab>
          <Tab id="creator" className={tab}>By creator</Tab>
          <Tab id="stack" className={tab}>Stack</Tab>
          <Tab id="standards" className={tab}>Standards</Tab>
          <Tab id="cases" className={tab}>Cases</Tab>
        </TabList>
        <TabPanel id="domain"><Browser data={domains} label="Skills by domain" /></TabPanel>
        <TabPanel id="creator"><Browser data={creators} label="Skills by creator" /></TabPanel>
        <TabPanel id="stack"><DocsPage label="Stack references" sections={stackSections} /></TabPanel>
        <TabPanel id="standards"><DocsPage label="Standards and practices" sections={standardsSections} gaps={standardsGaps} /></TabPanel>
        <TabPanel id="cases"><DocsPage label="Use cases and problem cases" sections={casesSections} /></TabPanel>
      </Tabs>
    </main>
  );
}
