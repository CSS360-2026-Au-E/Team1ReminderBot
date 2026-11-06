
# Team1ReminderBot Architecture Guide

## Control Flow Graph – Reminder Command

```mermaid
flowchart TD
    A([Start: /remind command]) --> B[Get amount, unit, and message]
    B --> C{Missing required options?}
    C -->|Yes| K[Catch error]
    C -->|No| D{Valid time unit?}
    D -->|No| K
    D -->|Yes| E[Calculate duration]
    E --> F{Finite duration?}
    F -->|No| K
    F -->|Yes| G[Calculate due time]
    G --> H[Save reminder]
    H --> I[Send confirmation and log success]
    I --> J([End])
    K --> L{Already replied or deferred?}
    L -->|Yes| M[Send follow-up error]
    L -->|No| N[Send error reply]
    M --> J
    N --> J
```

### Explanation

This control flow graph shows how our Discord bot creates reminders. First, the bot gets the amount, time unit, and message from the user. It checks if any information is missing and if the time unit and duration are valid. If everything is correct, the bot calculates when the reminder is due, saves it, and sends a confirmation message. If something goes wrong, the bot catches the error and sends an error message to the user.
  
## Data Flow Diagram – View Reminders

```mermaid
flowchart LR
    U[Discord user] -->|/reminders command| D[Discord]
    D -->|interaction with user ID| C[src/commands/reminders.js]
    C -->|user ID| S[(In-memory reminders array)]
    S -->|active reminders and history| C
    C -->|formatted reminder lists| D
    D -->|ephemeral reply| U
```

### Explanation
When a user runs /reminders, Discord sends the interaction and the user's ID to src/commands/reminders.js. The command requests active reminders and reminder history for that user from src/helpers/reminderStore.js. The store filters its in-memory reminders array and returns the matching data. The command formats the results and replies ephemerally, so only that user can see the response.

Reminder data is held in memory while the bot is running and is lost when the bot restarts.
