---
name: merchant-skill-generator
description: Generate GitHub-ready merchant Skill repositories similar to the 金谷园 public Skill pattern. Use when the user wants to create a merchant Skill for a cafe, bar, restaurant, florist, tea shop, dessert shop, live house, board-game venue, murder mystery venue, or escape room.
---

# Merchant Skill Generator

Use this Skill when the user wants a **merchant Skill repository**, not a hosted product.

The outcome of this Skill is a folder containing a complete merchant Skill project that the user can later upload to GitHub or Gitee and deploy to Tencent CloudBase.

## Workflow

1. Pick the closest template from the 7 built-in options.
2. Collect the merchant details needed for the generated repository.
3. Write a `MerchantSpec` JSON file.
4. Run the generator script.
5. Return the output path and explain that GitHub upload and CloudBase deployment are manual follow-up steps.

When generating the merchant repository, prefer the template's business-specific tool names over generic abstractions. The output should feel like a finished store Skill, not a neutral SDK wrapper.

## Template selection

Read [references/templates.md](references/templates.md) before collecting merchant details.

The built-in template IDs are:

- `cafe`
- `bar`
- `restaurant`
- `florist`
- `tea_dessert`
- `livehouse`
- `tabletop_experience`

## Generation command

Install local dependencies if needed:

```bash
cd merchant-skill-generator
npm install
```

Generate a merchant repository from a spec file:

```bash
npm run generate -- --spec /absolute/path/to/merchant-spec.json --out /absolute/path/to/output-dir
```

The generated repository will be written to:

```text
/output-dir/<merchant-slug>-skill
```

## Required behavior

- Generate a merchant repository only after the merchant spec is complete enough to fill all required fields.
- Prefer the built-in templates over inventing a new industry variant.
- Keep the generated repository standalone: do not assume access to this generator repository at runtime.
- Do not auto-deploy or auto-publish.
- Make it explicit that the generated merchant Skill still needs:
  - GitHub or Gitee upload
  - Tencent CloudBase deployment
  - final replacement of placeholder URLs with the real public domain

## Validation

Before handing off the result, prefer running:

```bash
npm run validate
```

This regenerates all example repositories into a temporary directory and smoke-tests the restaurant sample's MCP server.
