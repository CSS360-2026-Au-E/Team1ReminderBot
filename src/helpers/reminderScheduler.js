import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import reminderStore from "./reminderStore.js";

const { getUpcomingReminders, markReminderFired } = reminderStore;

let scheduler = null;

export function startReminderScheduler(client) {
  if (scheduler) return;

  scheduler = setInterval(async () => {
    const reminders = getUpcomingRemindersForAll();

    for (const reminder of reminders) {
      if (reminder.nextRun > Date.now()) continue;

      try {
        const user = await client.users.fetch(reminder.userId);

        await user.send({
          content: `⏰ Reminder: ${reminder.message}`,
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`snooze:${reminder.id}:${reminder.nextRun}`)
                .setLabel("Snooze 5 min")
                .setStyle(ButtonStyle.Secondary)
            ),
          ],
        });

        markReminderFired(reminder);
      } catch (error) {
        console.error("Failed to send reminder:", error);
      }
    }
  }, 10000);

  console.log("Reminder scheduler started.");
}

// Get reminders that still have a scheduled time.
function getUpcomingRemindersForAll() {
  return reminderStore.getAllReminders().filter(
    (reminder) => reminder.nextRun !== null
  );
}
