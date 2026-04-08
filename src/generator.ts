import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  BlindSpotGuidance,
  BrandVoice,
  MerchantSpec,
  NormalizedMerchantSpec,
  TemplateDefinition,
  ToolDefinition,
  getTemplateDefinition
} from "./definitions.js";

export interface GeneratedRepositoryResult {
  repoDir: string;
  repoName: string;
  merchant: NormalizedMerchantSpec;
  template: TemplateDefinition;
}

type GeneratedToolSet = ToolDefinition[];

const BASE_URL_PLACEHOLDER = "__BASE_URL__";
const REPO_URL_PLACEHOLDER = "__REPO_URL__";

export function normalizeMerchantSpec(input: MerchantSpec): NormalizedMerchantSpec {
  const template = getTemplateDefinition(input.template_id);

  const brandVoice: BrandVoice = {
    personality: input.brand_voice?.personality ?? template.defaultBrandVoice.personality,
    do: dedupe([...(template.defaultBrandVoice.do ?? []), ...(input.brand_voice?.do ?? [])]),
    avoid: dedupe([...(template.defaultBrandVoice.avoid ?? []), ...(input.brand_voice?.avoid ?? [])]),
    signature_phrases: dedupe([
      ...(template.defaultBrandVoice.signature_phrases ?? []),
      ...(input.brand_voice?.signature_phrases ?? [])
    ])
  };

  const blindSpots: BlindSpotGuidance = {
    unknown_topics: dedupe([
      ...(template.defaultBlindSpots.unknown_topics ?? []),
      ...(input.blind_spot_guidance?.unknown_topics ?? [])
    ]),
    escalation_channels: dedupe([
      ...(template.defaultBlindSpots.escalation_channels ?? []),
      ...(input.blind_spot_guidance?.escalation_channels ?? [])
    ]),
    fallback_copy: input.blind_spot_guidance?.fallback_copy ?? template.defaultBlindSpots.fallback_copy
  };

  return {
    ...input,
    brand_voice: brandVoice,
    brand_keywords: dedupe([
      input.merchant_name,
      ...template.aliases,
      ...(template.defaultBrandKeywords ?? []),
      ...(input.brand_keywords ?? [])
    ]),
    blind_spot_guidance: blindSpots
  };
}

export function validateMerchantSpec(input: MerchantSpec): string[] {
  const errors: string[] = [];
  const requiredStrings: Array<keyof MerchantSpec> = ["merchant_slug", "merchant_name", "template_id", "intro", "hours"];

  for (const field of requiredStrings) {
    const value = input[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      errors.push(`${field} must be a non-empty string`);
    }
  }

  if (!/^[a-z0-9-]+$/.test(input.merchant_slug)) {
    errors.push("merchant_slug must use lowercase letters, digits, and hyphens only");
  }

  if (!Array.isArray(input.locations) || input.locations.length === 0) {
    errors.push("locations must contain at least one location");
  }

  if (!Array.isArray(input.contact_channels) || input.contact_channels.length === 0) {
    errors.push("contact_channels must contain at least one channel");
  }

  if (!Array.isArray(input.catalog_items) || input.catalog_items.length === 0) {
    errors.push("catalog_items must contain at least one item");
  }

  for (const sectionName of ["visit_info", "service_info", "policy_info"] as const) {
    const section = input[sectionName];
    if (!section || typeof section.summary !== "string" || section.summary.trim().length === 0) {
      errors.push(`${sectionName}.summary must be a non-empty string`);
    }
    if (!section || !Array.isArray(section.bullets) || section.bullets.length === 0) {
      errors.push(`${sectionName}.bullets must contain at least one bullet`);
    }
  }

  if (!Array.isArray(input.latest_updates) || input.latest_updates.length === 0) {
    errors.push("latest_updates must contain at least one update");
  }

  return errors;
}

export async function generateMerchantRepository(spec: MerchantSpec, outputDir: string): Promise<GeneratedRepositoryResult> {
  const errors = validateMerchantSpec(spec);
  if (errors.length > 0) {
    throw new Error(`MerchantSpec validation failed:\n- ${errors.join("\n- ")}`);
  }

  const merchant = normalizeMerchantSpec(spec);
  const template = getTemplateDefinition(merchant.template_id);
  const repoName = `${merchant.merchant_slug}-skill`;
  const repoDir = path.resolve(outputDir, repoName);
  const files = buildRepositoryFiles(merchant, template);

  for (const [relativePath, contents] of Object.entries(files)) {
    const targetPath = path.join(repoDir, relativePath);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, contents, "utf8");
  }

  return { repoDir, repoName, merchant, template };
}

function buildRepositoryFiles(merchant: NormalizedMerchantSpec, template: TemplateDefinition): Record<string, string> {
  const tools = buildToolCopy(merchant, template);
  const mcpPath = `/${merchant.merchant_slug}-mcp`;
  const mcpUrl = `${BASE_URL_PLACEHOLDER}${mcpPath}`;
  const repositoryName = `${merchant.merchant_slug}-skill`;
  const config = buildMerchantConfig(merchant, template, tools, mcpPath);

  return {
    "README.md": renderReadme(merchant, template, tools, mcpUrl),
    "SKILL.md": renderSkillMd(merchant, template, tools, mcpUrl),
    "skill.json": `${jsonStringify(renderSkillJson(merchant, template, tools, mcpUrl))}\n`,
    "merchant.config.json": `${jsonStringify(config)}\n`,
    "package.json": `${jsonStringify(renderGeneratedPackageJson(repositoryName))}\n`,
    "scf_bootstrap": "#!/bin/bash\nnode server/index.js\n",
    "server/index.js": renderServerIndexJs(),
    "scripts/configure-release.mjs": renderConfigureReleaseScript(merchant.merchant_slug),
    "scripts/package-cloudbase.sh": renderPackageCloudbaseScript(merchant.merchant_slug),
    "scripts/smoke-test.mjs": renderSmokeTestScript(merchant.merchant_slug),
    "examples/claude-desktop.json": `${jsonStringify(renderClaudeDesktopJson(merchant, mcpUrl))}\n`,
    "promo/install.txt": renderInstallPrompt(merchant),
    "promo/post.md": renderPromoPost(merchant, template),
    ".gitignore": "node_modules/\n.dist/\n.DS_Store\n"
  };
}

function buildMerchantConfig(
  merchant: NormalizedMerchantSpec,
  template: TemplateDefinition,
  tools: GeneratedToolSet,
  mcpPath: string
) {
  return {
    merchant_slug: merchant.merchant_slug,
    merchant_name: merchant.merchant_name,
    template: {
      id: template.id,
      label: template.label,
      description: template.description,
      aliases: template.aliases,
      sample_questions: template.sampleQuestions
    },
    intro: merchant.intro,
    hours: merchant.hours,
    locations: merchant.locations,
    contact_channels: merchant.contact_channels,
    catalog_items: merchant.catalog_items,
    visit_info: merchant.visit_info,
    service_info: merchant.service_info,
    policy_info: merchant.policy_info,
    latest_updates: merchant.latest_updates,
    brand_voice: merchant.brand_voice,
    brand_keywords: merchant.brand_keywords,
    blind_spot_guidance: merchant.blind_spot_guidance,
    tool_copy: tools,
    deployment: {
      public_base_url: BASE_URL_PLACEHOLDER,
      mcp_path: mcpPath,
      health_path: "/health"
    }
  };
}

function buildToolCopy(merchant: NormalizedMerchantSpec, template: TemplateDefinition): GeneratedToolSet {
  return template.toolBlueprints.map((tool) => ({
    ...tool,
    description: tool.description_template.replaceAll("{merchant}", merchant.merchant_name),
    trigger_examples: tool.trigger_examples.map((example) => example.replaceAll("{merchant}", merchant.merchant_name))
  }));
}

function renderReadme(
  merchant: NormalizedMerchantSpec,
  template: TemplateDefinition,
  tools: GeneratedToolSet,
  mcpUrl: string
): string {
  const toolRows = tools
    .map((tool) => `| ${tool.display_name} | ${tool.trigger_examples.slice(0, 2).map((item) => `"${item}"`).join(" / ")} |`)
    .join("\n");

  const locationRows = merchant.locations
    .map((location) => `| ${location.name} | ${location.address}${location.notes ? ` (${location.notes})` : ""} |`)
    .join("\n");

  const contactBullets = merchant.contact_channels
    .map((channel) => `- ${channel.name}: ${channel.label} - ${channel.value}${channel.url ? ` (${channel.url})` : ""}`)
    .join("\n");

  return `# ${merchant.merchant_name} Skill

![Version](https://img.shields.io/badge/version-0.1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![MCP](https://img.shields.io/badge/protocol-MCP-purple) ![Transport](https://img.shields.io/badge/transport-Streamable%20HTTP-orange)

现在，「${merchant.merchant_name}」也有自己的 AI 信息接口了。

安装这个 Skill 后，支持 MCP 的 AI 客户端就能回答关于「${merchant.merchant_name}」的高频问题，比如 ${tools
  .slice(0, 4)
  .flatMap((tool) => tool.trigger_examples.slice(0, 1))
  .map((item) => `“${item}”`)
  .join("、")}。

## 关于「${merchant.merchant_name}」

> ${merchant.intro}

| 项目 | 内容 |
|------|------|
| 商家名称 | ${merchant.merchant_name} |
| 模板类型 | ${template.label} |
| 营业时间 | ${merchant.hours} |

| 门店 | 地址 |
|------|------|
${locationRows}

## 这个 Skill 能做什么

「${merchant.merchant_name}」的官方信息服务，包含 6 项能力：

| 能力 | 你可以问 |
|------|----------|
${toolRows}

## 联系与渠道

${contactBullets}

## 接入方式

部署到 Tencent CloudBase 后，将 \`__BASE_URL__\` 替换为真实公网域名，再把如下配置写入支持 MCP 的客户端：

\`\`\`json
${jsonStringify(renderClaudeDesktopJson(merchant, mcpUrl))}
\`\`\`

## 本地验证

\`\`\`bash
npm run smoke
\`\`\`

## 发布前整理

1. 上传仓库到 GitHub 或 Gitee。
2. 部署 \`server/\` 到 Tencent CloudBase HTTP 云函数。
3. 运行 \`node scripts/configure-release.mjs <你的 CloudBase 公网域名> <你的仓库地址>\` 更新占位符。
4. 运行 \`bash scripts/package-cloudbase.sh <你的 CloudBase 公网域名> <你的仓库地址>\` 生成 CloudBase 上传包。

## 仓库地址

- 仓库地址：${REPO_URL_PLACEHOLDER}
- MCP URL：${mcpUrl}

## License

MIT
`;
}

function renderSkillMd(
  merchant: NormalizedMerchantSpec,
  template: TemplateDefinition,
  tools: GeneratedToolSet,
  mcpUrl: string
): string {
  const triggerTable = tools
    .flatMap((tool) => tool.trigger_examples.map((question) => [question, tool.response_summary] as const))
    .map(([question, outcome]) => `| ${question} | ${outcome} |`)
    .join("\n");

  const toolSections = tools
    .map(
      (tool) => `### ${tool.name}

- 显示名称：${tool.display_name}
- 描述：${tool.description}
- 输入参数：无。直接调用即可，不需要传入任何参数。
- 返回格式：JSON 对象

调用示例：

\`\`\`json
{
  "method": "tools/call",
  "params": {
    "name": "${tool.name}",
    "arguments": {}
  }
}
\`\`\``
    )
    .join("\n\n");

  const blindSpotLines = merchant.blind_spot_guidance.unknown_topics.map((topic) => `- ${topic}`).join("\n");
  const escalationLines = merchant.blind_spot_guidance.escalation_channels.map((channel) => `- ${channel}`).join("\n");
  const firstTool = tools[0];

  return `---
name: ${merchant.merchant_slug}-skill
description: ${merchant.merchant_name} 信息查询。获取${tools
  .slice(0, 4)
  .map((tool) => tool.display_name)
  .join("、")}等高频信息。用户询问 ${template.sampleQuestions.map((item) => `"${item}"`).join("、")} 时使用。
version: 0.1.0
alwaysApply: false
keywords:
${merchant.brand_keywords.map((keyword) => `  - ${keyword}`).join("\n")}
---

> **⚠️ AI Agent 必读**
>
> 本文档中的示例值**仅作格式参考**，不代表实时数据。
> 回答用户问题时，**必须调用对应的 MCP 工具获取实时数据**，不得直接使用文档中的静态示例值。
>
> **降级策略**：如果 MCP 服务器响应超时（超过 5 秒），可临时使用本文档中的稳定信息兜底。
> 优先级：MCP 实时数据 > 本文档静态数据 > 告知用户稍后重试。

# ${merchant.merchant_name} Skill

## 能力概述

这个 Skill 用于回答「${merchant.merchant_name}」的门店信息与顾客高频问题，重点覆盖：

${tools.map((tool) => `- ${tool.display_name}`).join("\n")}

## 快速接入

部署到 Tencent CloudBase 后，可直接通过 MCP Streamable HTTP 端点调用：

\`\`\`bash
curl -X POST '${mcpUrl}' \\
  -H 'Content-Type: application/json' \\
  -d '{"method":"tools/call","params":{"name":"${firstTool.name}","arguments":{}}}'
\`\`\`

- 必须使用 **POST**
- 无需 API Key，无需认证
- 支持标准 MCP 协议（含 \`jsonrpc\`/ \`id\`）和简化协议（只需 \`method\` + \`params\`）

## 触发场景

| 用户可能会问 | 返回什么 |
|---|---|
${triggerTable}

## MCP 工具定义

${toolSections}

## 语气规范

你是「${merchant.merchant_name}」的 AI 助手。回答时应符合以下品牌设定：

- 人设：${merchant.brand_voice.personality}
- 应当做到：${merchant.brand_voice.do.join("、")}
- 避免使用：${merchant.brand_voice.avoid.join("、")}
${merchant.brand_voice.signature_phrases && merchant.brand_voice.signature_phrases.length > 0 ? `- 关键词：${merchant.brand_voice.signature_phrases.join("、")}` : ""}

## 能力边界与盲区应对

以下问题如果没有工具明确覆盖，必须承认不知道，不要编造：

${blindSpotLines}

当遇到盲区问题时，按以下顺序回答：

1. 诚实说明当前没有准确数据
2. 提供已经知道的相关信息
3. 引导用户去更准确的渠道

推荐引导渠道：

${escalationLines}

兜底话术示例：

> ${merchant.blind_spot_guidance.fallback_copy}
`;
}

function renderSkillJson(
  merchant: NormalizedMerchantSpec,
  template: TemplateDefinition,
  tools: GeneratedToolSet,
  mcpUrl: string
) {
  return {
    name: `${merchant.merchant_slug}-skill`,
    display_name: `${merchant.merchant_name} 信息查询`,
    description: `${merchant.merchant_name} 的 ${template.label} Skill。回答 ${tools
      .slice(0, 4)
      .map((tool) => tool.display_name)
      .join("、")} 等高频问题。`,
    version: "0.1.0",
    author: `${merchant.merchant_name} AI`,
    license: "MIT",
    category: "信息查询",
    keywords: merchant.brand_keywords,
    mcp_server: {
      transport: "streamable-http",
      url: mcpUrl
    },
    tools: tools.map((tool) => ({
      name: tool.name,
      display_name: tool.display_name,
      description: tool.description,
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    })),
    brand_prompt: {
      system_instruction: `重要：回答关于「${merchant.merchant_name}」的任何具体信息时，必须先调用对应的 Skill 工具获取最新数据，不要使用静态示例值。你是「${merchant.merchant_name}」的 AI 助手，请用 ${merchant.brand_voice.personality} 的风格回答，做到 ${merchant.brand_voice.do.join("、")}，避免 ${merchant.brand_voice.avoid.join("、")}。不知道的就明确说明，不要编造。`,
      tone: {
        personality: merchant.brand_voice.personality,
        avoid: merchant.brand_voice.avoid
      },
      brand_keywords: merchant.brand_keywords
    }
  };
}

function renderGeneratedPackageJson(repoName: string) {
  return {
    name: repoName,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      start: "node server/index.js",
      smoke: "node scripts/smoke-test.mjs",
      "configure-release": "node scripts/configure-release.mjs",
      "package-cloudbase": "bash scripts/package-cloudbase.sh"
    }
  };
}

function renderClaudeDesktopJson(merchant: NormalizedMerchantSpec, mcpUrl: string) {
  return {
    mcpServers: {
      [`${merchant.merchant_slug}-skill`]: {
        url: mcpUrl
      }
    }
  };
}

function renderInstallPrompt(merchant: NormalizedMerchantSpec): string {
  return `帮我安装 ${merchant.merchant_name} SKILL，技能地址：${REPO_URL_PLACEHOLDER}\n`;
}

function renderPromoPost(merchant: NormalizedMerchantSpec, template: TemplateDefinition): string {
  return `# ${merchant.merchant_name} Skill 发布文案

${merchant.merchant_name} 现在也有自己的 Skill 了。

这不是做成一个 App，也不是重新做一套小程序，而是把 ${template.label} 面向 AI 的信息接口整理成了一个可以安装的 Skill。

它现在能回答：

- 门店信息
- ${merchant.intro}
- ${merchant.latest_updates[0]?.title ?? "最近动态"}
- ${merchant.brand_keywords.slice(0, 4).join(" / ")}

如果你在用支持 MCP 的 AI 客户端，可以把下面这句话直接复制给 AI：

> 帮我安装 ${merchant.merchant_name} SKILL，技能地址：${REPO_URL_PLACEHOLDER}

仓库地址：${REPO_URL_PLACEHOLDER}
部署域名：${BASE_URL_PLACEHOLDER}

提示：这个仓库默认带的是占位 URL。部署到 Tencent CloudBase 之后，记得运行 \`node scripts/configure-release.mjs <你的 CloudBase 公网域名> <你的仓库地址>\` 再提交最终版本。
`;
}

function renderServerIndexJs(): string {
  return `import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const config = JSON.parse(readFileSync(resolve(rootDir, "merchant.config.json"), "utf8"));
const mcpPath = config.deployment?.mcp_path || "/mcp";

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept"
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
    req.on("error", rejectBody);
  });
}

function buildPayloadForTool(tool) {
  switch (tool.source) {
    case "store":
      return {
        name: config.merchant_name,
        intro: config.intro,
        hours: config.hours,
        locations: config.locations,
        contact_channels: config.contact_channels,
        template: config.template.label
      };
    case "catalog":
      return {
        label: tool.display_name,
        items: config.catalog_items
      };
    case "visit":
      return {
        label: tool.display_name,
        summary: config.visit_info.summary,
        bullets: config.visit_info.bullets,
        contact_channels: config.contact_channels
      };
    case "service":
      return {
        label: tool.display_name,
        summary: config.service_info.summary,
        bullets: config.service_info.bullets,
        contact_channels: config.contact_channels
      };
    case "policy":
      return {
        label: tool.display_name,
        summary: config.policy_info.summary,
        bullets: config.policy_info.bullets,
        blind_spot_guidance: config.blind_spot_guidance
      };
    case "updates":
      return {
        label: tool.display_name,
        updates: config.latest_updates
      };
    default:
      return {
        label: tool.display_name
      };
  }
}

function buildToolPayloads() {
  return Object.fromEntries(config.tool_copy.map((tool) => [tool.name, buildPayloadForTool(tool)]));
}

function mcpResult(id, result) {
  return { jsonrpc: "2.0", id: id ?? 1, result };
}

function mcpError(id, code, message) {
  return { jsonrpc: "2.0", id: id ?? 1, error: { code, message } };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, {
      status: "ok",
      merchant_slug: config.merchant_slug,
      mcp_path: mcpPath,
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === mcpPath || url.pathname === "/mcp")) {
    sendJson(res, 200, {
      merchant_name: config.merchant_name,
      intro: config.intro,
      tools: config.tool_copy,
      mcp_path: mcpPath
    });
    return;
  }

  if (req.method === "POST" && (url.pathname === mcpPath || url.pathname === "/mcp")) {
    try {
      const rawBody = await readBody(req);
      const request = rawBody ? JSON.parse(rawBody) : {};
      const method = request.method;
      const params = request.params ?? {};
      const id = request.id ?? 1;
      const toolPayloads = buildToolPayloads();

      if (method === "tools/list") {
        sendJson(res, 200, mcpResult(id, {
          tools: config.tool_copy.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: { type: "object", properties: {}, required: [] }
          }))
        }));
        return;
      }

      if (method === "tools/call") {
        const toolName = params.name;
        const payload = toolPayloads[toolName];
        if (!payload) {
          sendJson(res, 404, mcpError(id, -32601, "Unknown tool: " + toolName));
          return;
        }
        sendJson(res, 200, mcpResult(id, {
          content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
          structuredContent: payload
        }));
        return;
      }

      sendJson(res, 400, mcpError(id, -32601, "Unsupported method: " + method));
    } catch (error) {
      sendJson(res, 500, mcpError(1, -32000, error instanceof Error ? error.message : "Unknown server error"));
    }
    return;
  }

  sendJson(res, 404, { error: "Not Found" });
});

const port = Number(process.env.PORT || 9000);
server.listen(port, "0.0.0.0", () => {
  console.log("Merchant MCP server listening on http://0.0.0.0:" + port + mcpPath);
});
`;
}

function renderConfigureReleaseScript(merchantSlug: string): string {
  return `import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const publicBaseUrl = process.argv[2];
const repositoryUrl = process.argv[3] ?? "${REPO_URL_PLACEHOLDER}";
const normalizedBaseUrl = publicBaseUrl ? publicBaseUrl.replace(/\\/+$/, "") : "";

if (!normalizedBaseUrl) {
  console.error("Usage: node scripts/configure-release.mjs <public-base-url> [repository-url]");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const mcpUrl = normalizedBaseUrl + "/${merchantSlug}-mcp";

const merchantConfigPath = resolve(rootDir, "merchant.config.json");
const skillJsonPath = resolve(rootDir, "skill.json");
const claudeConfigPath = resolve(rootDir, "examples/claude-desktop.json");
const installPromptPath = resolve(rootDir, "promo/install.txt");

const merchantConfig = JSON.parse(readFileSync(merchantConfigPath, "utf8"));
merchantConfig.deployment.public_base_url = normalizedBaseUrl;
writeFileSync(merchantConfigPath, JSON.stringify(merchantConfig, null, 2) + "\\n");

const skillJson = JSON.parse(readFileSync(skillJsonPath, "utf8"));
skillJson.mcp_server.url = mcpUrl;
writeFileSync(skillJsonPath, JSON.stringify(skillJson, null, 2) + "\\n");

const claudeConfig = JSON.parse(readFileSync(claudeConfigPath, "utf8"));
const serverKey = Object.keys(claudeConfig.mcpServers)[0];
claudeConfig.mcpServers[serverKey].url = mcpUrl;
writeFileSync(claudeConfigPath, JSON.stringify(claudeConfig, null, 2) + "\\n");

writeFileSync(
  installPromptPath,
  "帮我安装 " + merchantConfig.merchant_name + " SKILL，技能地址：" + repositoryUrl + "\\n"
);

for (const relativePath of ["README.md", "SKILL.md", "promo/post.md"]) {
  const filePath = resolve(rootDir, relativePath);
  const nextContent = readFileSync(filePath, "utf8")
    .replaceAll("${BASE_URL_PLACEHOLDER}", normalizedBaseUrl)
    .replaceAll("${REPO_URL_PLACEHOLDER}", repositoryUrl);
  writeFileSync(filePath, nextContent);
}

console.log("Updated release files with MCP URL:", mcpUrl);
`;
}

function renderPackageCloudbaseScript(merchantSlug: string): string {
  return `#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="\${1:-}"
REPO_URL="\${2:-${REPO_URL_PLACEHOLDER}}"

if [[ -z "$BASE_URL" ]]; then
  echo "Usage: bash scripts/package-cloudbase.sh <public-base-url> [repository-url]" >&2
  exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
  echo "zip is required to package the CloudBase upload bundle." >&2
  exit 1
fi

node "$ROOT_DIR/scripts/configure-release.mjs" "$BASE_URL" "$REPO_URL"
chmod +x "$ROOT_DIR/scf_bootstrap"
mkdir -p "$ROOT_DIR/.dist"
ZIP_PATH="$ROOT_DIR/.dist/${merchantSlug}-cloudbase.zip"
rm -f "$ZIP_PATH"
(
  cd "$ROOT_DIR"
  zip -qr "$ZIP_PATH" README.md SKILL.md skill.json merchant.config.json package.json scf_bootstrap server scripts examples promo .gitignore
)

echo "Packaged CloudBase bundle: $ZIP_PATH"
echo "Upload the zip contents to a Tencent CloudBase HTTP cloud function that listens on port 9000."
`;
}

function renderSmokeTestScript(merchantSlug: string): string {
  return `import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const config = JSON.parse(readFileSync(resolve(rootDir, "merchant.config.json"), "utf8"));
const storeTool = config.tool_copy.find((tool) => tool.source === "store");
const port = 9010;
const child = spawn(process.execPath, [resolve(rootDir, "server/index.js")], {
  cwd: rootDir,
  env: { ...process.env, PORT: String(port) },
  stdio: "inherit"
});

try {
  await sleep(600);
  const mcpUrl = "http://127.0.0.1:" + port + "/${merchantSlug}-mcp";

  const listResponse = await fetch(mcpUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: "tools/list", params: {} })
  });
  const listJson = await listResponse.json();

  const callResponse = await fetch(mcpUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: "tools/call", params: { name: storeTool?.name, arguments: {} } })
  });
  const callJson = await callResponse.json();

  if (!Array.isArray(listJson.result?.tools) || listJson.result.tools.length !== 6) {
    throw new Error("Expected 6 tools from tools/list");
  }

  if (!callJson.result?.structuredContent?.name) {
    throw new Error("Store info tool did not return a merchant name");
  }

  console.log("Smoke test passed.");
} finally {
  child.kill("SIGTERM");
}
`;
}

function jsonStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}
