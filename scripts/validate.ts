import { readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { generateMerchantRepository } from "../src/generator.js";
import { MerchantSpec } from "../src/definitions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const specsDir = path.resolve(rootDir, "examples/specs");
const outputDir = path.resolve(rootDir, ".tmp/validation");

async function main() {
  await rm(outputDir, { recursive: true, force: true });
  const specFiles = (await readdir(specsDir)).filter((file) => file.endsWith(".json")).sort();

  if (specFiles.length === 0) {
    throw new Error("No example specs found.");
  }

  for (const file of specFiles) {
    const raw = await readFile(path.join(specsDir, file), "utf8");
    const spec = JSON.parse(raw) as MerchantSpec;
    const result = await generateMerchantRepository(spec, outputDir);
    await assertRequiredFiles(result.repoDir);
    console.log(`validated scaffold: ${result.repoName}`);
  }

  const restaurantDir = path.join(outputDir, "jinguyuan-dumpling-skill");
  await assertToolNames(restaurantDir, [
    "get_restaurant_info",
    "get_signature_dishes",
    "get_queue_info",
    "get_delivery_info",
    "get_dining_rules",
    "get_latest_news"
  ]);

  const cafeDir = path.join(outputDir, "daybreak-cafe-skill");
  await assertToolNames(cafeDir, [
    "get_cafe_info",
    "get_menu_info",
    "get_workspace_info",
    "get_takeaway_info",
    "get_house_rules",
    "get_latest_news"
  ]);

  await runSmokeTest(restaurantDir);
  console.log("All validations passed.");
}

async function assertRequiredFiles(repoDir: string) {
  const requiredFiles = [
    "README.md",
    "SKILL.md",
    "skill.json",
    "merchant.config.json",
    "package.json",
    "server/index.js",
    "scripts/configure-release.mjs",
    "scripts/package-cloudbase.sh",
    "scripts/smoke-test.mjs",
    "examples/claude-desktop.json",
    "promo/install.txt",
    "promo/post.md"
  ];

  for (const relativePath of requiredFiles) {
    const target = path.join(repoDir, relativePath);
    await stat(target);
  }
}

async function runSmokeTest(repoDir: string) {
  await runCommand(process.execPath, [path.join(repoDir, "scripts/smoke-test.mjs")], repoDir);
}

async function assertToolNames(repoDir: string, expectedToolNames: string[]) {
  const skillJsonPath = path.join(repoDir, "skill.json");
  const raw = await readFile(skillJsonPath, "utf8");
  const skillJson = JSON.parse(raw) as { tools?: Array<{ name?: string }> };
  const actualToolNames = (skillJson.tools ?? []).map((tool) => tool.name);

  if (actualToolNames.length !== expectedToolNames.length) {
    throw new Error(`Unexpected tool count in ${skillJsonPath}`);
  }

  for (const expectedName of expectedToolNames) {
    if (!actualToolNames.includes(expectedName)) {
      throw new Error(`Missing expected tool ${expectedName} in ${skillJsonPath}`);
    }
  }
}

function runCommand(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed: ${command} ${args.join(" ")} (exit ${code ?? -1})`));
    });
    child.on("error", reject);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
