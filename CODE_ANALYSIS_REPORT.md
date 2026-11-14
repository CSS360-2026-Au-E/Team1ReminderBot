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


### Ethan Frausto

- **Analysis areas:** #4 Test Coverage; #6 Fuzz Testing
- **Contribution:** Measured coverage for the bot's source files and added seeded fuzz tests for reminder-time input and scheduling.
- **Report section:** [Test Coverage and Fuzz Testing](#Test-Coverage)(#Fuzz-Testing)

### Test Coverage
**Contributor:** Ethan Frausto
I ran the project's Mocha tests with c8. For a reliable number, I scoped coverage to `src/helpers/reminderTime.js`, which is directly exercised by the reminder-time tests. It showed **64.03% statements, 67.74% branches, 60% functions, and 64.03% lines**.

I also tried measuring every file in `src`. That report showed 17.81% statements overall, but it reported 0% for command files that the tests execute and listed the reminder store under a duplicate path. Because the project uses `esbuild-runner`, I do not think that full-source result is reliable. The 64.03% number is specifically for the reminder-time helper, not the whole bot.

The tests cover reminder time parsing and scheduling, reminder storage, and a few slash-command behaviors using fake interactions. Real Discord/network behavior is not covered, so the coverage percentage should not be treated as proof that every bot feature works.

### Fuzz Testing
**Contributor:** Ethan Frausto
I added a seeded fuzzer for the reminder-time helper. It checks generated valid offsets, malformed offset strings, and generated reminder plans. The seed makes the runs repeatable if a case fails. Across the three checks it tries 1,500 generated inputs and verifies that offsets stay positive, unique, and ordered, bad offset inputs are rejected, and scheduled times remain ordered and after the current time.

This is a small fuzzer focused on parsing and schedule calculations. It does not test Discord API failures, long-running scheduler behavior, or persistence after a restart.

### Findings and Improvements

The existing tests cover important reminder behavior, but the project did not have a coverage command or generated-input tests. The new coverage script and fuzzer make it easier to notice gaps and edge cases in reminder-time handling. A next step would be tests for scheduler failures and persistent storage.

### Evidence

- Coverage command: `npm run test:coverage` (scoped to `src/helpers/reminderTime.js`).
- Coverage result: 64.03% statements/lines, 67.74% branches, and 60% functions.
- Fuzz tests: `tests/reminderTime.fuzz.spec.js` (1,500 deterministic generated cases).

## Cyclomatic Complexity and Smoke Test

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
