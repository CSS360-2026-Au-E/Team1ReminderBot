
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
  
