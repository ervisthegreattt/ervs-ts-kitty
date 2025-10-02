# Workflow

A practical guide for running the Erv's TS Kitty from start to finish.

## 1. Prerequisites
- Node.js 18+
- `typescript` installed locally (`npm install --save-dev typescript`)
- Access to an AI coding assistant that can execute shell commands or provide fix summaries
- Optional: GNU coreutils (`grep`, `cut`, `sort`) or PowerShell equivalents

## 2. Baseline Assessment
1. Run the compiler to capture current error counts:
   ```bash
   npx tsc --noEmit > logs/tsc-initial.txt
   ```
2. Use the helper script to rank files:
   ```bash
   node scripts/ts-error-report.mjs logs/tsc-initial.txt > logs/top-files.txt
   ```
   PowerShell alternative:
   ```powershell
   node scripts/ts-error-report.mjs logs/tsc-initial.txt | Tee-Object logs/top-files.txt
   ```
3. Review high-risk files manually (events, state, precision maths, security) and tag them for human handling.

## 3. Launch A Batch
1. Open `agents/batch-coordinator.md` and follow the checklist
2. Pick four files (adjust for hardware) that are low-to-medium risk
3. For each file, spin up a `typescript-fixer` agent with the guardrails
4. After fixes, hand results to the `type-reviewer`
5. Update `docs/patterns/` via the `pattern-doc` agent if new lessons emerge

## 4. Verification
1. Run `npm run type-check` (or `npx tsc --noEmit`) and capture the diff
2. Execute targeted tests for any high-risk area touched during the batch
3. Confirm behavioural guardrails:
   - Events still fire (`rg -n "emit\(" src`)
   - State mutations remain (`rg -n "set[A-Z]" <file>`)
   - Precision maths untouched (`rg -n "Decimal" <file>`)
4. Document the batch (errors fixed, files touched, guardrail results, next targets)

## 5. Iterate
- Repeat the batch cycle until you hit your milestone (80%, 90%, etc.)
- Keep riskier files for later or pair with human reviewers
- Refresh the top-file list every few batches to account for newly introduced errors

## 6. Publishing Checklist
- Sanitize any product- or client-specific details in prompts and logs
- Add licensing and contribution guidelines
- Include before/after metrics (error counts, time taken)
- Provide a template progress log (e.g., `templates/PROGRESS_LOG.md`)

## 7. PowerShell Command Equivalents
| Purpose | POSIX | PowerShell |
|---------|-------|------------|
| Count errors | `npx tsc --noEmit 2>&1 \| grep -c "error TS"` | `(npx tsc --noEmit 2>&1) -match 'error TS' \| Measure-Object` |
| Find event usages | `rg -n "emit\(" src` | `rg -n "emit\(" src` (same) |
| Top offender files | `... | cut -d"(" -f1 | sort | uniq -c | sort -rn` | `... | ForEach-Object { ($_ -split '\(')[0] } | Group-Object | Sort-Object Count -Descending` |

Feel free to automate these steps with your own scripts or CI jobs.
