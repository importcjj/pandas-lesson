import type { ApiItem, PatternItem, PitfallItem } from "./types";

type Lang = "zh" | "en";

export function apiDetailMarkdown(item: ApiItem, lang: Lang): string {
  const lines: string[] = [];

  lines.push(`# ${item.name}`);
  lines.push("");
  lines.push(item.desc[lang]);
  lines.push("");

  // Signature
  lines.push("```python");
  lines.push(item.signature);
  lines.push("```");
  lines.push("");

  // Parameters
  if (item.params && item.params.length > 0) {
    lines.push(`### ${lang === "zh" ? "参数" : "Parameters"}`);
    lines.push("");
    lines.push(`| ${lang === "zh" ? "参数" : "Param"} | Type | Default | ${lang === "zh" ? "说明" : "Description"} |`);
    lines.push("|------|------|---------|------|");
    for (const p of item.params) {
      lines.push(`| \`${p.name}\` | \`${p.type}\` | ${p.default ? `\`${p.default}\`` : "—"} | ${p.desc[lang]} |`);
    }
    lines.push("");
  }

  // Example
  lines.push(`### ${lang === "zh" ? "示例" : "Example"}`);
  lines.push("");
  lines.push("```python");
  lines.push(item.example);
  lines.push("```");

  if (item.output) {
    lines.push("");
    lines.push(`**${lang === "zh" ? "输出" : "Output"}:**`);
    lines.push("```");
    lines.push(item.output);
    lines.push("```");
  }

  return lines.join("\n");
}

export function patternDetailMarkdown(item: PatternItem, lang: Lang): string {
  const lines: string[] = [];

  lines.push(`# ${item.title[lang]}`);
  lines.push("");
  lines.push("```python");
  lines.push(item.code);
  lines.push("```");
  lines.push("");
  lines.push(`> ${item.note[lang]}`);

  return lines.join("\n");
}

export function pitfallDetailMarkdown(item: PitfallItem, lang: Lang): string {
  const lines: string[] = [];

  lines.push(`# ${item.title[lang]}`);
  lines.push("");

  lines.push(`### ❌ ${lang === "zh" ? "错误写法" : "Wrong"}`);
  lines.push("");
  lines.push("```python");
  lines.push(item.wrong.code);
  lines.push("```");
  lines.push(`> ${item.wrong.note[lang]}`);
  lines.push("");

  lines.push(`### ✅ ${lang === "zh" ? "正确写法" : "Correct"}`);
  lines.push("");
  lines.push("```python");
  lines.push(item.right.code);
  lines.push("```");
  lines.push(`> ${item.right.note[lang]}`);

  return lines.join("\n");
}
