import { readFile, writeFile } from "node:fs/promises";

const source = new URL("../design-tokens/coral.tokens.json", import.meta.url);
const target = new URL("../src/app/tokens.css", import.meta.url);
const document = JSON.parse(await readFile(source, "utf8"));
const tokens = new Map(Object.entries(document.tokens).flatMap(([group, values]) => Object.entries(values).map(([key, token]) => [`${group}.${key}`, token])));
const names = new Set();
const reference = /^\{([\w.-]+)\}$/;

function get(path) {
	const token = tokens.get(path);
	if (!token) throw new Error(`Unknown token: ${path}`);
	return token;
}

function validate(path, stack = []) {
	if (stack.includes(path)) throw new Error(`Circular token reference: ${[...stack, path].join(" -> ")}`);
	const token = get(path);
	const matches = JSON.stringify(token.$value).matchAll(/\{([\w.-]+)\}/g);
	for (const match of matches) validate(match[1], [...stack, path]);
}

function color(value) {
	const resolved = value.reference ? `var(${get(reference.exec(value.reference)[1]).$extensions.css.name})` : value.value.slice(6, -1);
	return `oklch(${resolved} / ${value.alpha})`;
}

function cssValue(token) {
	const value = token.$value;
	if (typeof value === "string" && reference.test(value)) return `var(${get(reference.exec(value)[1]).$extensions.css.name})`;
	switch (token.$type) {
		case "color": return token.$extensions.css.channels ? value.slice(6, -1) : value;
		case "dimension":
		case "duration": return `${value.value}${value.unit}`;
		case "number": return String(value);
		case "fontFamily": return value.map((font) => font.includes(" ") ? `"${font}"` : font).join(", ");
		case "cubicBezier": return `cubic-bezier(${value.join(", ")})`;
		case "asset": return `url("${value}")`;
		case "shadow": return value.map((layer) => `${layer.inset ? "inset " : ""}${[layer.offsetX, layer.offsetY, layer.blur, layer.spread].map((n) => `${n}${layer.unit}`).join(" ")} ${color(layer.color)}`).join(", ");
		default: throw new Error(`Unsupported token type: ${token.$type}`);
	}
}

for (const [path, token] of tokens) {
	const { name, scope } = token.$extensions.css;
	if (!/^--[\w-]+$/.test(name) || !["theme", "root"].includes(scope) || names.has(name)) throw new Error(`Invalid or duplicate CSS mapping: ${path}`);
	names.add(name);
	validate(path);
}

const sections = ["/* Generated from design-tokens/coral.tokens.json. Do not edit; run node scripts/generate-coral-tokens.mjs. */"];
for (const scope of ["theme", "root"]) {
	const declarations = [...tokens.values()].filter((token) => token.$extensions.css.scope === scope).map((token) => `\t${token.$extensions.css.name}: ${cssValue(token)};`);
	sections.push(`${scope === "theme" ? "@theme static" : ":root"} {\n${scope === "root" ? "\tcolor-scheme: light;\n" : ""}${declarations.join("\n")}\n}`);
}
for (const rule of document.responsive) {
	const width = cssValue(get(reference.exec(rule.maxWidth)[1]));
	const declarations = Object.entries(rule.overrides).map(([path, value]) => `\t\t${get(path).$extensions.css.name}: ${value};`).join("\n");
	sections.push(`@media (max-width: ${width}) {\n\t:root {\n${declarations}\n\t}\n}`);
}
const output = `${sections.join("\n")}\n`;
if (process.argv.includes("--check")) {
	if (await readFile(target, "utf8") !== output) throw new Error("Coral CSS is stale. Run node scripts/generate-coral-tokens.mjs.");
	console.log(`Coral tokens valid; ${tokens.size} CSS mappings current.`);
} else {
	await writeFile(target, output);
	console.log(`Generated ${tokens.size} Coral CSS mappings.`);
}
