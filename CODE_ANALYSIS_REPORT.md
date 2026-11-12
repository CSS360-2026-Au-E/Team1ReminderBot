# Team1ReminderBot Code Analysis Report

## Purpose

This report reviews the bot for design issues, security risks, and possible improvements.

## Team Contributions

### Khang Nguyen

- **Analysis areas:** #3 Cohesion and Coupling; #5 Threat Model
- **Contribution:** Reviewed the reminder command, reminder store, and interaction handler. Documented module responsibilities, dependencies, in-memory data risks, and possible protections.
- **Report sections:** [Cohesion and Coupling](#cohesion-and-coupling), [Threat Model](#threat-model)

### Technical Debt and Unit Tests

### Cyclomatic Complexity and Smoke Test

### Cohesion and Coupling
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

This review covers the two files listed above. It does not measure coupling across every part of the bot.

#### Files reviewed

- [`src/commands/reminder.js`](https://github.com/CSS360-2026-Au-E/Team1ReminderBot/blob/main/src/commands/reminder.js)
- [`src/helpers/reminderStore.js`](https://github.com/CSS360-2026-Au-E/Team1ReminderBot/blob/main/src/helpers/reminderStore.js)
- [`ARCHITECTURE.md`](https://github.com/CSS360-2026-Au-E/Team1ReminderBot/blob/main/ARCHITECTURE.md)

### Threat Model
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
