import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { checkUsageScreenshots } from "./check-usage-screenshots.mjs";
import { generateUsageReference } from "./generate-usage-reference.mjs";
import { filesUnder, frontendRequire, readUsageModel, repositoryRoot, translate } from "./usage-reference-model.mjs";

const MarkdownIt = frontendRequire("markdown-it");
const { default: GithubSlugger } = await import(pathToFileURL(frontendRequire.resolve("github-slugger")).href);
const markdown = new MarkdownIt({ html: true });

export function inspectMarkdown(contents) {
  const tokens = markdown.parse(contents, {});
  const anchors = new Set();
  const links = [];
  const slugger = new GithubSlugger();
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token.type === "heading_open")
      anchors.add(
        slugger.slug(
          tokens[index + 1].children
            .filter((child) => ["text", "code_inline"].includes(child.type))
            .map((child) => child.content)
            .join(""),
        ),
      );
    for (const child of [token, ...(token.children ?? [])]) {
      if (child.type === "link_open") links.push(child.attrGet("href"));
      if (child.type === "image") links.push(child.attrGet("src"));
      if (child.type.startsWith("html")) {
        for (const match of child.content.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)) anchors.add(match[1]);
        for (const match of child.content.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) links.push(match[1]);
      }
    }
  }
  return { anchors, links };
}

export function validateMarkdownLinks(file, root) {
  const { links } = inspectMarkdown(fs.readFileSync(file, "utf8"));
  for (const link of links) {
    if (/^(?:https?:|mailto:)/.test(link)) continue;
    if (/^[a-z][a-z\d+.-]*:/i.test(link)) throw new Error(`Unsupported link in ${file}: ${link}`);
    const [pathname, fragment] = link.split("#");
    const target = pathname ? path.resolve(path.dirname(file), decodeURIComponent(pathname.split("?")[0])) : file;
    if (!target.startsWith(`${root}/`) || !fs.existsSync(target)) throw new Error(`Broken link in ${file}: ${link}`);
    if (
      fragment &&
      fs.statSync(target).isFile() &&
      target.endsWith(".md") &&
      !inspectMarkdown(fs.readFileSync(target, "utf8")).anchors.has(decodeURIComponent(fragment))
    )
      throw new Error(`Broken heading in ${file}: ${link}`);
  }
}

export function validateGuide(guide, resources, readPage, anchorSource) {
  if (!/^[a-z][a-z0-9-]*$/.test(guide.id) || !/^[a-z][a-z0-9-]*\.md$/.test(guide.docPath) || !guide.steps.length)
    throw new Error(`Invalid guide: ${guide.id}`);
  const seen = new Set();
  for (const locale of ["en", "fr"]) translate(resources, locale, guide.titleKey);
  for (const step of guide.steps) {
    if (!/^[a-z][a-z0-9-]*$/.test(step.anchor) || seen.has(step.anchor))
      throw new Error(`Invalid or repeated target: ${guide.id}/${step.anchor}`);
    seen.add(step.anchor);
    if (!step.route.startsWith("/") || step.route.includes("?") || step.route.includes("#"))
      throw new Error(`Invalid route: ${step.route}`);
    if (!anchorSource.includes(`data-tour="${step.anchor}"`)) throw new Error(`Missing UI target: ${step.anchor}`);
    for (const locale of ["en", "fr"]) {
      translate(resources, locale, step.i18nKey);
      translate(resources, locale, step.titleKey);
      const page = readPage(locale, guide.docPath);
      const { anchors, links } = inspectMarkdown(page);
      if (!anchors.has(step.docAnchor)) throw new Error(`Missing doc anchor: ${guide.docPath}#${step.docAnchor}`);
      if (!links.includes(`http://pleey.localhost${step.route}?guide=${guide.id}`))
        throw new Error(`Missing tour launch link: ${guide.id}`);
    }
  }
}

export function checkUserDocs(root = repositoryRoot) {
  const { guides, resources } = readUsageModel(root);
  if (new Set(guides.map((guide) => guide.id)).size !== guides.length) throw new Error("Duplicate guide id.");
  const source = filesUnder(path.join(root, "application/frontend/src/presentation"))
    .filter((file) => file.endsWith(".tsx") && !file.endsWith(".spec.tsx"))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  const usage = path.join(root, "docs/usage");
  for (const guide of guides)
    validateGuide(
      guide,
      resources,
      (locale, page) => fs.readFileSync(path.join(usage, locale === "en" ? "" : "fr", page), "utf8"),
      source,
    );
  for (const file of [
    ...filesUnder(usage).filter((file) => file.endsWith(".md")),
    path.join(root, "docs/README.md"),
    path.join(root, "README.md"),
  ])
    validateMarkdownLinks(file, root);
  generateUsageReference(root, true);
  checkUsageScreenshots(root);
  console.log(`User documentation: ${guides.length} guides, links, locales and generated output checked.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) checkUserDocs();
