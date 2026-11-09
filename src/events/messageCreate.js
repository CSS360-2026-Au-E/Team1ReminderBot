
const offsets = [
  { minutes: 1440, label: "24 hours" },
  { minutes: 600, label: "10 hours" },
  { minutes: 240, label: "4 hours" },
  { minutes: 120, label: "2 hours" },
  { minutes: 30, label: "30 minutes" },
];

const event = {
  name: "messageCreate",

  async execute(message) {
    console.log("Message received:", message.content);
    if (message.author.bot || !message.guild) return;

    if (!message.content.startsWith("!addreminder ")) return;

    const parts = message.content.trim().split(/\s+/);

    if (parts.length < 4) {
      await message.reply(
        "Usage: !addreminder YYYY-MM-DD HH:MM Assignment name (UTC)"
      );
      return;
    }

    const [, date, time, ...nameParts] = parts;
    const name = nameParts.join(" ");
    const dueDate = new Date(`${date}T${time}:00Z`);

    if (Number.isNaN(dueDate.getTime()) || dueDate <= new Date()) {
      await message.reply("Please enter a valid future deadline.");
      return;
    }

    for (const offset of offsets) {
      const delay = dueDate.getTime() -
        offset.minutes * 60 * 1000 - Date.now();

      if (delay <= 0) continue;

      setTimeout(async () => {
        try {
          await message.channel.send(
            `🔔 **Upcoming Assignment Reminder!**\n` +
            `📚 **${name}**\n` +
            `⏰ Due in **${offset.label}**!\n` +
            `📅 Deadline: <t:${Math.floor(dueDate.getTime() / 1000)}:F>`
          );
        } catch (error) {
          console.error("Reminder failed:", error);
        }
      }, delay);
    }

    await message.reply(
      `✅ Reminders scheduled for **${name}**!\n` +
      `Deadline: <t:${Math.floor(dueDate.getTime() / 1000)}:F>`
    );
  },
};

export default event;
