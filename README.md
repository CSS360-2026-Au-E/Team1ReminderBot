# Reminder Bot

A Discord bot that helps study groups remember what matters. Set a reminder with a slash command, add early pings before the event, and the bot DMs you when it's time.

## Commands

| Command | What it does |
|---|---|
| `/remind amount unit message` | Sets a quick reminder after a chosen amount of time, for example `amount:30 unit:Minutes`. |
| `/reminder message amount unit [place]` | Sets a reminder after a chosen amount of time. The optional `before` option adds early reminders, and `place` attaches a place such as `Library`. |
| `/reminder message date [place]` | Sets a reminder for a date and time in Pacific time, for example `date:2026-11-05 14:30`. The optional `place` attaches a place. |
| `before` option on `/reminder` | Adds up to five early reminders, for example `before:1d, 30m, 10m`. |
| `place` option on `/reminder` | Attaches a manually entered place to the reminder, such as `Library` or `Grocery Store`. |
| `/place-reminders place` | Shows your upcoming reminders for the selected place. |
| `/repeatreminder message repeat minutes` | Sets a daily or weekly reminder, starting after a chosen number of minutes. |
| `/reminders` | Shows your upcoming and past reminders. Use its button to mark an upcoming reminder done. |
| `/ping` | Checks whether the bot is online and shows its latency. |
| `/testwelcome [user]` | Replays the welcome message for a new member. |

The bot also welcomes new members when they join the server.

## Known limits

- Reminders are kept in memory. If the bot restarts, saved reminders are lost.
- Place names are entered manually. The bot does not detect arrival or use GPS.
- Place matching ignores capitalization and extra spaces.
- Dates are read as Pacific time. Discord shows confirmed times in each person's own time zone.
- Reminders are sent by DM, so members need DMs from server members turned on.

## Running it

1. Copy your bot token into a `.env` file as `TOKEN=...`. Never commit the token.
2. Install dependencies with `npm install`.
3. Start the bot with `npm start`.

Run the tests with `npm test`. Build the bot with `npm run build`. Tests also run on pull requests.

## Project status

- **v1.0 released** for Bot Project Task 3: reminders by time or date, early reminders, recurring reminders, and reminder history.
- **v2.0 in progress** for Bot Project Task 6: reminders can have a place, and `/place-reminders` shows the caller's upcoming reminders for that place. Users can mark reminders done with `/reminders`.

## Team members

- Khang Nguyen
- Tarang (TJ) Jammalamadaka
- Sameer Ahmed Khan
- Ayman Tuaum
- Ethan Frausto