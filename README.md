# Reminder Bot

A Discord bot that helps study groups remember what matters. Set a reminder with a slash command, add early pings before the event, and the bot DMs you when it's time.

## Commands (v1.0)

| Command | What it does |
|---|---|
| `/remind amount unit message` | Quick reminder after a set amount of time, e.g. `amount:30 unit:Minutes` |
| `/reminder message amount unit` | Same, with the `before` option for early pings |
| `/reminder message date` | Remind me at a date and time (Pacific), e.g. `date:2026-11-05 14:30` |
| `before` option on `/reminder` | Extra early pings before the event, up to 5, e.g. `before:1d, 30m, 10m` |
| `/repeatreminder message repeat minutes` | A daily or weekly reminder, starting in a set number of minutes |
| `/reminders` | View your upcoming and past reminders |
| `/ping` | Check the bot is online and see its latency |
| `/testwelcome [user]` | Replay the welcome message a new member gets |

The bot also welcomes new members when they join the server.

## Known limits

- Reminders are kept in memory. If the bot restarts, saved reminders are lost.
- Dates are read as Pacific time. Discord shows the confirmed times in each person's own time zone.
- Reminders are sent by DM, so members need DMs from server members turned on.

## Running it

1. Copy your bot token into a `.env` file as `TOKEN=...` (never commit it).
2. `npm install`
3. `npm start`

Run the tests with `npm test`. They also run on every pull request.

## Project Status

- v1.0 released (Bot Project Task 3): reminders by time or date, early pings, recurring reminders, reminder history.

## Team Members

- Khang Nguyen
- Tarang (TJ) Jammalamadaka
- Sameer Ahmed Khan
- Ayman Tuaum
- Ethan Frausto
