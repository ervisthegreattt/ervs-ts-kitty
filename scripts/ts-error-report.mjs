#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

function runTsc() {
  const result = spawnSync("npx", ["tsc", "--noEmit", "--pretty", "false"], {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && result.status !== 2) {
    // tsc exits with 2 when errors are present
    throw new Error(`tsc exited with status ${result.status}`);
  }

  return `${result.stdout}${result.stderr}`;
}

function readInputFile(path) {
  const absolute = resolve(path);
  return readFileSync(absolute, "utf8");
}

function parseErrors(text) {
  const fileCounts = new Map();
  const errorPattern = /^(?<file>[^\(]+)\((?<line>\d+),(?<column>\d+)\): error TS\d+/;
  let totalErrors = 0;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(errorPattern);
    if (!match?.groups) continue;
    const file = match.groups.file.trim();
    totalErrors += 1;
    fileCounts.set(file, (fileCounts.get(file) ?? 0) + 1);
  }

  return { totalErrors, fileCounts };
}

function formatReport(totalErrors, fileCounts, limit = 20) {
  const entries = Array.from(fileCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);

  const lines = [];
  lines.push(`# TypeScript Error Report`);
  lines.push(`Total errors: ${totalErrors}`);
  lines.push(`Top files:`);
  if (entries.length === 0) {
    lines.push(`(no TypeScript errors detected)`);
  } else {
    for (const [file, count] of entries) {
      lines.push(`- ${count.toString().padStart(4, " ")} × ${file}`);
    }
  }
  return lines.join("\n");
}

function main() {
  const [, , inputPath, limitArg] = process.argv;

  let rawOutput;
  if (inputPath) {
    rawOutput = readInputFile(inputPath);
  } else {
    rawOutput = runTsc();
  }

  const limit = limitArg ? Number.parseInt(limitArg, 10) : 20;
  const { totalErrors, fileCounts } = parseErrors(rawOutput);
  const report = formatReport(totalErrors, fileCounts, Number.isNaN(limit) ? 20 : limit);
  process.stdout.write(report + "\n");
}

try {
  main();
} catch (error) {
  console.error(`[ts-error-report] ${error?.message ?? error}`);
  process.exit(1);
}
