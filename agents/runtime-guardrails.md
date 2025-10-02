# TypeScript Fix Guardrails

## Critical Runtime Rules
- Never change business logic just to satisfy TypeScript
- Leave regulatory thresholds, pricing constants, or risk weights untouched unless product owners approve
- Preserve Decimal.js or other precision math helpers; do not replace them with primitive numbers
- Keep currency conversion and data integrity helpers exactly as implemented

## Global Expectations For Every Agent

### 1. Runtime Behaviour Contract
- A fix that alters business logic must be rejected
- A fix that stops events from firing must be rejected
- A fix that drops state updates must be rejected
- A fix that changes calculation outputs must be rejected

### 2. Event System Integrity
Whenever touching anything that emits or listens for events:
```bash
rg -n "<event-name>" src
rg -n "ws.send.*<message-type>" src
rg -n "ENGINE_.*READY|CALCULATION_.*" src
```
Confirm emitters and listeners still line up.

### 3. State Management Verification
Keep `setState`, `dispatch`, `setData`, `updateRecord`, `setCalculationResult`, and similar mutations intact.
```bash
rg -n "set[A-Z].*\(" <filename>
rg -n "dispatch\(" <filename>
```

### 4. Cross-File Impact Check
After every fix:
```bash
npx tsc --noEmit 2>&1 | grep "<filename>"
```
If you adjust exports or imports, verify all consumers:
```bash
rg -l "from.*<module-name>" src
```

## Batch Coordinator Checklist

### Pre-Assignment Scan
Flag high-risk files that contain any of the following:
- `EventBus`, `eventEmitter`, `WebSocket`
- Precision math: `Decimal`, `BigNumber`, `calculate`
- Domain-critical keywords supplied by your team (e.g. `RiskEngine`, `Pricing`, `Payments`)
- Core state structures such as `Account`, `Portfolio`, `Order`

### Verification Requirements
Each `typescript-fixer` report must include:
1. Events touched (with the `rg` output)
2. Confirmation that state mutations remain (snippets or commands)
3. Verification that calculations are untouched (diff or explanation)
4. Filtered `tsc` output for the edited file
5. Dependent files that were checked

## typescript-fixer Mandatory Commands

### Before Editing
```bash
rg -n "emit\(|on\(|send\(|dispatch\(" <filename>
rg -n "calculate|Decimal|\.times\(|\.plus\(|\.minus\(" <filename>
rg -n "set[A-Z].*\(|dispatch\(|update.*\(" <filename>
```

### After Editing
```bash
diff <original> <fixed> | grep -E "emit|on|send|dispatch|calculate"
npx tsc --noEmit 2>&1 | grep <filename>
rg -l "from.*<module>" src | xargs -I {} npx tsc --noEmit {} 2>&1
```

### Response Template
- [ ] Events touched: [list] or "none"
- [ ] State mutations preserved: [list] or "none"
- [ ] Calculations unchanged: "verified" or explanation
- [ ] Type-check output: attach relevant lines
- [ ] Dependent files checked: count and status

## High-Risk Patterns To Avoid

### 1. Event Name Changes
```typescript
// Dangerous unless every listener is updated
- emit('CALCULATION_COMPLETE', data)
+ emit(EventTypes.CALCULATION_COMPLETE, data)
```

### 2. Precision Loss
```typescript
// Never convert precision math to primitive numbers
- const total = amount.times(rate)
+ const total = Number(amount) * Number(rate)
```

### 3. Removing "Unused" Hooks
```typescript
// Could be invoked indirectly by the runtime
- handleResult(data: Result) { setResults(data) }
```

## Escalation Triggers
Stop and get human approval when:
1. A fix requires altering calculation logic
2. Thresholds or risk weights need to change
3. Event flows must be renamed or refactored
4. More than five dependent files break
5. WebSocket or message formats change
6. Authentication or security code is involved

## Validation Commands
Run these after each batch:
```bash
npm run type-check 2>&1 | grep -c "error TS"
npm test -- --testPathPattern="calculation|compliance|critical"
rg -A2 -B2 "emit\(|on\(" src | grep -c "<event-name>"
```

## Remember
Every TypeScript error you fix can introduce a bug. Verify everything.
