import { access, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { generateMerchantRepository } from "../src/generator.js";
import { MerchantSpec, TEMPLATE_DEFINITIONS } from "../src/definitions.js";

interface Args {
  spec?: string;
  out?: string;
  force?: boolean;
  listTemplates?: boolean;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.listTemplates) {
    for (const template of Object.values(TEMPLATE_DEFINITIONS)) {
      console.log(`${template.id}: ${template.label} - ${template.description}`);
    }
    return;
  }

  if (!args.spec || !args.out) {
    throw new Error("Usage: npm run generate -- --spec /abs/path/to/spec.json --out /abs/path/to/output-dir [--force]");
  }

  const rawSpec = await readFile(path.resolve(args.spec), "utf8");
  const spec = JSON.parse(rawSpec) as MerchantSpec;
  const repoDir = path.resolve(args.out, `${spec.merchant_slug}-skill`);

  if (args.force) {
    await rm(repoDir, { recursive: true, force: true });
  } else {
    try {
      await access(repoDir);
      throw new Error(`Output directory already exists: ${repoDir}. Re-run with --force to overwrite.`);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("ENOENT")) {
        throw error;
      }
    }
  }

  const result = await generateMerchantRepository(spec, args.out);
  console.log(`Generated ${result.repoName}`);
  console.log(`Template: ${result.template.id}`);
  console.log(`Output: ${result.repoDir}`);
}

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    switch (value) {
      case "--spec":
        args.spec = argv[index + 1];
        index += 1;
        break;
      case "--out":
        args.out = argv[index + 1];
        index += 1;
        break;
      case "--force":
        args.force = true;
        break;
      case "--list-templates":
        args.listTemplates = true;
        break;
      default:
        throw new Error(`Unknown argument: ${value}`);
    }
  }
  return args;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
