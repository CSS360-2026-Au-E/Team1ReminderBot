# Team1ReminderBot Code Analysis Report

## Purpose

This report reviews the bot for design issues, security risks, and possible improvements.

## Team Contributions

### Khang Nguyen

- **Analysis areas:** #3 Cohesion and Coupling; #5 Threat Model
- **Contribution:** Reviewed the reminder command, reminder store, and interaction handler. Documented module responsibilities, dependencies, in-memory data risks, and possible protections.
- **Report sections:** [Cohesion and Coupling](#cohesion-and-coupling), [Threat Model](#threat-model)

### Sameer Khan

- **Analysis areas:** #1 Technical Debt and Code Smells; #7 Unit Tests
- **Contribution:** Ran ESLint, identified code problems, fixed a test import error, and successfully ran 3 reminder unit tests.
- **Report section:** [Technical Debt and Unit Tests](#technical-debt-and-unit-tests)
  
## Technical Debt and Unit Tests
**Contributor:** Sameer Khan

### Technical Debt and Code Smells

I ran `npx eslint src tests` to check the bot's code. ESLint found 11 errors and 0 warnings.

Two errors were unused variables in guildMemberAdd.js and reminderScheduler.js. The other nine errors came from ESLint not recognizing the Mocha test functions describe and it.

These issues show that the code needs cleanup and better ESLint configuration.

### Unit Tests

I checked three reminder unit tests:
1. Completed reminders appear in history.
2. Daily reminders schedule their next run correctly.
3. Weekly reminders schedule their next run correctly.

At first, npm test failed because reminderStore.spec.js used require() in an ES module environment. I changed it to an import statement.

After fixing the problem, I ran npm test again and all 7 tests passed.

### Findings and Improvements

The bot's reminder tests are working, but there are still some issues to fix. We should clean up unused variables and update ESLint to recognize test functions. This would make the code easier to maintain and test.

### Evidence

- ESLint: 11 errors, 0 warnings.
- Unit tests: 7 passing.
- Fix commit: https://github.com/CSS360-2026-Au-E/Team1ReminderBot/commit/f35f06a

## Cyclomatic Complexity and Smoke Test
### Contributor: Atuaum

**Analysis Areas:** #2 Cyclomatic Complexity and #8 Smoke Test

### Cyclomatic Complexity

I examined two JavaScript files in Team1ReminderBot: `src/events/messageCreate.js` and `src/events/interactionCreate.js`.

I manually calculated cyclomatic complexity by starting with 1 and counting decision points, including `if` statements, loops, and logical operators (`&&` and `||`).

**Results:**

| File | Cyclomatic Complexity |
|---|---|
| `messageCreate.js` | 9 |
| `interactionCreate.js` | 10 |

Both functions have moderate complexity.

I found that `messageCreate.js` handles several responsibilities, including checking commands, validating deadlines, scheduling reminders, and sending messages.

The `interactionCreate.js` file handles both slash commands and button interactions. It also repeats similar error-handling code.

**Suggested Improvements:**

The bot could be easier to maintain if input validation, reminder scheduling, and error handling were separated into smaller functions.

### Smoke Test

I created a new test file called `tests/smoke.spec.js` to verify four important bot features:

1. `/ping` responds with latency information.
2. `/testwelcome` produces a welcome message.
3. `/reminders` displays an upcoming reminder.
4. `!addreminder` schedules assignment reminders.

I ran the automated tests using GitHub Actions.

**Results:** All 25 tests passed, including my four new smoke tests.

These tests use simulated Discord interactions, so they do not verify that the live bot sends notifications successfully.

### Findings and Improvements

The automated tests show that the tested bot functions work correctly in the test environment.

However, the bot could be improved by simplifying complex functions, expanding test coverage, and ensuring scheduled reminders survive bot restarts.

### Evidence

**Pull Request #30:** https://github.com/CSS360-2026-Au-E/Team1ReminderBot/pull/30

**Smoke Test File:** `tests/smoke.spec.js`

**Test Results:** 25 passing tests in GitHub Actions.
## Cohesion and Coupling
**Contributor:** Khang Nguyen

#### Scope

I reviewed `src/commands/reminder.js` and `src/helpers/reminderStore.js`. This review focuses on how these two files divide their work and depend on each other.

#### Findings

The two files have clear main jobs. `reminder.js` handles the Discord command. It reads the user's choices, asks the time helper to build a reminder plan, adds each reminder to the store, and sends a reply. `reminderStore.js` keeps reminder data and provides functions to add, find, and update reminders.

This gives the code good cohesion: each file groups work related to one main purpose. It also keeps the command from directly managing the reminder list.

The files are connected through the `addReminder` function. The command must know how to call this function and what information to pass to it. If the store changes this function or the reminder data it expects, the command may also need to change. This is coupling between the command and the store.

#### Limitation and possible improvement

The store keeps reminders in an in-memory array. This means the data is lost when the bot stops or restarts. The architecture guide also says this. A future improvement could move storage into a database while keeping the same store functions. This could protect the command from details about where reminder data is saved.

#### Review limit

This review focuses on two implementation files. I also used ARCHITECTURE.md as supporting context. It does not measure coupling across every part of the bot.

#### Files reviewed

- [`src/commands/reminder.js`](https://github.com/CSS360-2026-Au-E/Team1ReminderBot/blob/main/src/commands/reminder.js)
- [`src/helpers/reminderStore.js`](https://github.com/CSS360-2026-Au-E/Team1ReminderBot/blob/main/src/helpers/reminderStore.js)
- [`ARCHITECTURE.md`](https://github.com/CSS360-2026-Au-E/Team1ReminderBot/blob/main/ARCHITECTURE.md)

## Threat Model
**Contributor:** Khang Nguyen

#### Scope

This review covers the reminder commands, the interaction handler, and the reminder store that I reviewed. Users create reminders through Discord slash commands. The bot stores reminder data in an in-memory array and later uses it to send reminders.

#### Assets to protect

- The Discord bot token and the access it gives the bot.
- Reminder messages, user IDs, scheduled times, and reminder history.
- The bot's ability to stay online and send reminders on time.

#### Threat actors and entry points

A Discord user who can use the bot can send input through commands such as `/remind`, `/reminder`, and `/repeatreminder`. The bot also uses its Discord token to connect to Discord. Anyone who obtains that token could act through the bot, depending on its permissions.

#### Threats and possible protections

1. **Too many reminders**  
   The reviewed commands add reminders to the store. I did not find a cooldown or a maximum number of reminders per user in the files reviewed. Repeated requests could make the in-memory list grow and use more memory. A per-user limit and a command cooldown could reduce this risk.

2. **Growing reminder history**  
   When a reminder fires, the store adds its time to the reminder's history. The reviewed code does not remove old history. A long-running daily or weekly reminder could keep adding history entries. The bot could limit how much history it keeps or remove old entries.

3. **Reminder data loss**  
   The store keeps data in memory. If the bot stops or restarts, reminders and their history are lost. Saving reminders in persistent storage would help them survive restarts.

4. **Private information in reminder messages**  
   Users may put private details in reminder messages. The bot stores those messages and sends reminders through Discord. Users should avoid putting sensitive information in reminders. The project should also keep reminder data private and avoid logging message contents.

5. **Bot token exposure**  
   If the bot token is exposed, someone may use the bot with its Discord permissions. The token should be kept out of source control, the bot should have only the permissions it needs, and an exposed token should be replaced. I did not review the project's secret settings, so I cannot confirm how the token is stored.

### Existing protections seen in the reviewed code

The commands use Discord slash-command options to limit some input. For example, `/repeatreminder` allows only daily or weekly repetition and sets a maximum wait of 10,080 minutes for its first reminder. The `/reminder` command limits its message to 1,500 characters and handles errors from its time helper. The reminder store checks that the scheduled time and repeat option are valid.

#### Review limits

This review covers only the files I examined. I did not check every file, the live bot's Discord permissions, or how its token is stored. The finding about missing limits applies only to the reviewed files; another file may add a limit.

#### Files reviewed

- [`src/commands/reminder.js`](https://github.com/CSS360-2026-Au-E/Team1ReminderBot/blob/main/src/commands/reminder.js)
- [`src/commands/remind.js`](https://github.com/CSS360-2026-Au-E/Team1ReminderBot/blob/main/src/commands/remind.js)
- [`src/commands/repeatReminder.js`](https://github.com/CSS360-2026-Au-E/Team1ReminderBot/blob/main/src/commands/repeatReminder.js)
- [`src/events/interactionCreate.js`](https://github.com/CSS360-2026-Au-E/Team1ReminderBot/blob/main/src/events/interactionCreate.js)
- [`src/helpers/reminderStore.js`](https://github.com/CSS360-2026-Au-E/Team1ReminderBot/blob/main/src/helpers/reminderStore.js)

## Cyclomatic Complexity and Test Coverage (Tarang)
**Contributor:** Tarang Jammalamadaka

**Analysis areas:** #2 Cyclomatic Complexity; #4 Test Coverage

I measured cyclomatic complexity for every function in `src/` with ESLint, and I measured test coverage for every source file with c8. I used the current team main branch, commit `6739a73` (https://github.com/CSS360-2026-Au-E/Team1ReminderBot/commit/6739a73), so these numbers match the shared repo this report lives in. That commit already includes the v1.0 reminder work and the smoke tests from pull request #30. `npm test` reported 25 passing tests before I started the measurements.

### Cyclomatic Complexity

I installed ESLint in a local copy of the repo (I did not commit that install) and ran it with the `complexity` rule set to a maximum of 0. That setting makes ESLint print the complexity of every function, not just the ones that go over a limit.

Command:

```bash
npx eslint -c eslint.complexity.config.mjs "src/**/*.js"
```

The config enables `globals.node` and this rule: `complexity: ["error", 0]`.

ESLint uses McCabe cyclomatic complexity (decision points plus 1). In class we used this risk scale: 1-10 low, 11-20 moderate, 21-50 high, and over 50 untestable. I flagged anything over 10.

ESLint reported 68 functions in `src/`. Most are small (CC 1-5), including a lot of one-line arrow functions for slash-command option setup. Two functions are over 10, and one more sits right on the low/moderate boundary.

**Functions at or above the low/moderate boundary:**

| CC | Risk | Function | Location |
|---:|------|----------|----------|
| 16 | moderate | `buildReminderTimes` | `src/helpers/reminderTime.js:94` |
| 13 | moderate | `execute` (interaction handler) | `src/events/interactionCreate.js:3` |
| 10 | low (at the boundary) | `execute` (`/remind`) | `src/commands/remind.js:35` |
| 9 | low | `execute` (`!addreminder`) | `src/events/messageCreate.js:13` |
| 9 | low | `parseDateInZone` | `src/helpers/reminderTime.js:67` |

The riskiest function is `buildReminderTimes`. It checks whether the user gave a date, an amount and unit, or both, then parses the date or duration, rejects times in the past or more than 5 years ahead, and builds the "before" reminder list. All of that lives in one function, which is why the complexity is 16.

The next one is `interactionCreate`'s `execute` method, at CC 13. It handles reminder buttons and slash commands in the same function, and it duplicates the same "already replied or deferred" error-reply logic in both paths.

`/remind`'s `execute` is CC 10. It is still in the low range, but it is doing validation, time math, saving, and error replies in one method. `messageCreate`'s `execute` is CC 9, and `parseDateInZone` is also CC 9 because of the date format, overflow, and daylight-saving checks.

A teammate already estimated complexity for two event files by hand and got 9 for `messageCreate.js` and 10 for `interactionCreate.js`. My ESLint result matches the 9 for `messageCreate`. ESLint gives `interactionCreate` a 13, not a 10. I think the difference is that ESLint also counts things like `&&`, `||`, and optional chaining (`?.`), which a hand count can miss. The tool-based pass also found `buildReminderTimes` at 16, which did not show up in the two-file hand review.

**Other named functions worth listing (CC 4 or 5):** `createReply` and `handleButton` in `reminders.js` (both 5), `loadEvents` (5), `/reminder` `execute` (5), the scheduler interval callback (4), `addReminder` (4), `markReminderFired` (4), and `parseOffsets` (4). The full list of all 68 functions can be reproduced with the command above.

### Test Coverage

The project's test command is `mocha -r esbuild-runner/register ./tests/*.spec.js --exit`. I first ran exactly this:

```bash
npx c8 npm test
```

That report was not usable for the whole bot. c8 only printed coverage for `src/helpers/reminderStore.js` (92.92% statements, 85.71% branches, 83.33% functions, 92.92% lines, uncovered lines 19-20, 23-24, and 88-90). When I forced c8 to list every file under `src/` (`npx c8 --all --src src npm test`), the overall number was 9.93% statements (92/926), but almost every file showed 0%, including command files that the tests clearly run, and `reminderStore.js` showed up under a duplicate path, `src/helpers/src/helpers/reminderStore.js`. This happens because `esbuild-runner` transpiles the ESM files in memory, so V8 coverage never sees the original `src/` paths (except for `reminderStore.js`, which is already CommonJS). I am not using 9.93% as the team's coverage number.

To get a reliable per-file number, I transpiled `src/` and `tests/` to CommonJS with source maps, then ran the same 25 tests under c8. All 25 still passed. Commands:

```bash
npx esbuild $(find src tests -name '*.js' | sort) --platform=node --format=cjs --sourcemap --sources-content=true --outdir=cov-build --outbase=.
npx c8 --all --include 'src/**' --exclude 'tests/**' --exclude 'cov-build/**' --exclude 'node_modules/**' --exclude-after-remap --reporter=text --reporter=text-summary npx mocha cov-build/tests/*.spec.js --exit
```

**Overall coverage for `src/` (25 tests, reliable run):**

| Statements | Branches | Functions | Lines |
|------------|----------|-----------|-------|
| 52.37% (485/926) | 80% (108/135) | 63.04% (29/46) | 52.37% (485/926) |

**Coverage per file:**

| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered lines |
|------|--------:|---------:|--------:|--------:|-----------------|
| `src/app.js` | 0 | 0 | 0 | 0 | 1-22 |
| `src/commands/ping.js` | 100 | 100 | 100 | 100 | |
| `src/commands/remind.js` | 0 | 0 | 0 | 0 | 1-105 |
| `src/commands/reminder.js` | 97.56 | 93.75 | 100 | 97.56 | 72-73 |
| `src/commands/reminders.js` | 77.06 | 68.75 | 100 | 77.06 | 50-64, 92-97, 102-105 |
| `src/commands/repeatReminder.js` | 0 | 0 | 0 | 0 | 1-52 |
| `src/commands/testwelcome.js` | 100 | 100 | 100 | 100 | |
| `src/events/guildMemberAdd.js` | 47.45 | 100 | 33.33 | 47.45 | 9-18, 35-48, 51-57 |
| `src/events/interactionCreate.js` | 0 | 0 | 0 | 0 | 1-50 |
| `src/events/messageCreate.js` | 71.87 | 28.57 | 100 | 71.87 | 22-26, 33-35, 44-53 |
| `src/events/ready.js` | 0 | 0 | 0 | 0 | 1-35 |
| `src/helpers/index.js` | 0 | 0 | 0 | 0 | 1-3 |
| `src/helpers/loadCommands.js` | 0 | 0 | 0 | 0 | 1-18 |
| `src/helpers/loadEvents.js` | 0 | 0 | 0 | 0 | 1-29 |
| `src/helpers/loadFiles.js` | 0 | 0 | 0 | 0 | 1-7 |
| `src/helpers/reminderScheduler.js` | 0 | 0 | 0 | 0 | 1-37 |
| `src/helpers/reminderStore.js` | 92.92 | 86.95 | 83.33 | 92.92 | 19-20, 23-24, 88-90 |
| `src/helpers/reminderTime.js` | 100 | 94.54 | 83.33 | 100 | 18, 24, 68 (branches) |

The tests we have are pretty strong for time parsing and the reminder store. `reminderTime.js` is at 100% statements and lines (94.54% branches). `reminderStore.js` is at 92.92% statements. `/ping`, `/testwelcome`, and most of `/reminder` and `/reminders` are covered.

The gaps are more serious. Several user-facing features have 0% coverage: `/remind` (`remind.js`), `/repeatreminder`, the slash-command interaction router (`interactionCreate.js`), the startup and command-registration path (`ready.js` and `app.js`), and the scheduler that actually DMs people (`reminderScheduler.js`). If the scheduler is broken, users just will not get reminders, and our tests would still pass.

Partial gaps I looked at in the source:

- `reminder.js` lines 72-73: the "skipped a before-time because it already passed" message is never tested.
- `reminders.js` lines 50-64, 92-97, and 102-105: pagination and the "this reminder is not yours or is no longer active" button path are untested.
- `messageCreate.js` lines 22-26, 33-35, and 44-53: bad `!addreminder` input is untested, and the timer callback that would send the assignment reminder is never run (the smoke test only checks that `setTimeout` was called).
- `guildMemberAdd.js` lines 9-18 and 35-57: the real join event and the unused meme helpers are untested. Only `getWelcomeMessage` is covered.
- `reminderStore.js` lines 19-20, 23-24, and 88-90: invalid date and invalid repeat throws, plus `getAllReminders`, are untested.

These coverage percentages also should not be read as "the live bot works." The tests use fake interactions. They do not talk to Discord, and they do not prove that DMs are delivered.

### Technical debt I noticed while reading the code

These are extra issues I ran into while doing the two analyses. I did not treat them as a full code-smell pass.

1. The bot has two different reminder systems. Slash commands go through `reminderStore` and `reminderScheduler` (`src/helpers/reminderScheduler.js`). `!addreminder` in `src/events/messageCreate.js` uses `setTimeout` and never puts the reminder in the store. Those reminders do not show up in `/reminders`, and they disappear if the bot restarts (the in-memory store already has this problem, but `setTimeout` is a second, separate version of it). The usage text also says UTC (`messageCreate.js:23`), while `/reminder` uses Pacific time.
2. `guildMemberAdd` can crash the event if the welcome channel is missing. In `src/events/guildMemberAdd.js:17`, the code calls `channel.send(welcomeMessage)` without checking whether `channel` was found. If `CHANNEL_NAME` is unset or no channel has that name, `channel` is `undefined` and this throws. The meme welcome helpers in the same file are unused dead code (lines 34-57), and there is a TODO saying to switch to them.
3. `/remind` and `/reminder` overlap, and the time math is duplicated. `src/commands/remind.js` is CommonJS and has its own millisecond multipliers (lines 47-52) instead of calling `durationMs` in `reminderTime.js`. `reminderStore.js` is also CommonJS, while most of the bot is ESM. That mix is part of why coverage tooling is painful.
4. `messageCreate.js:14` logs every message's content (`console.log("Message received:", message.content)`). That is noisy, and it can write private message text into logs.
5. There is no test for the path that actually sends a reminder DM. Combined with 0% coverage on `reminderScheduler.js`, a regression in notification sending would be easy to miss.

### Findings and recommendations

1. Split `buildReminderTimes` (`src/helpers/reminderTime.js:94`, CC 16) into smaller helpers, such as "read the event time from the options" and "build the before-times list." Keep the existing tests, and they should make this refactor safer. This is the highest-complexity function in the bot.
2. Follow up on the interaction handler as well (`src/events/interactionCreate.js:3`, CC 13). Pull the button path and the shared error-reply logic into smaller functions. A teammate already opened a related story for the event handlers.
3. Add tests first for the 0% files that users depend on: `reminderScheduler.js` (DM sending, with a fake Discord user and a fake clock), `/remind`, and `/repeatreminder`. Then add cases for pagination, skipped "before" times, bad `!addreminder` input, and the missing welcome channel.
4. Pick one reminder pipeline. Either teach `!addreminder` to use the store and scheduler, or drop it once `/reminder` covers assignment deadlines. Also add a coverage script that does not depend on the misleading `npx c8 npm test` result, so the next person does not have to rediscover the `esbuild-runner` issue.

### Evidence

- Repo and commit: https://github.com/CSS360-2026-Au-E/Team1ReminderBot/commit/6739a73
- Tests: `npm test` (25 passing)
- Complexity command: `npx eslint -c eslint.complexity.config.mjs "src/**/*.js"` (68 functions, highest CC 16)
- Coverage command (default, not reliable for the whole bot): `npx c8 npm test`
- Coverage command (reliable, `src/` only): esbuild source-map transpile, then `npx c8 ... mocha cov-build/tests/*.spec.js` as written above
- Overall reliable coverage: 52.37% statements/lines, 80% branches, 63.04% functions

I also think a later improvement is to add a `test:coverage` script once we have a command that reports `src/` correctly, so nobody has to rely on the default `npx c8 npm test` output.
