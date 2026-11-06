const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

// Temporary storage while the bot is running.
const reminders = [];

function addReminder(userId, message, time, repeat = "none") {
  const reminder = {
    id: `${Date.now()}-${Math.random()}`,
    userId,
    message,
    nextRun: new Date(time).getTime(),
    repeat,
    history: [],
    completedAt: null,
  };

  if (!Number.isFinite(reminder.nextRun)) {
    throw new Error("Invalid reminder date");
  }

  if (!["none", "daily", "weekly"].includes(repeat)) {
    throw new Error("Invalid repeat option");
  }

  reminders.push(reminder);
  return reminder;
}

function getUpcomingReminders(userId) {
  return reminders.filter(
    (reminder) =>
      reminder.userId === userId &&
      reminder.nextRun !== null
  );
}

function getPastReminders(userId) {
  return reminders
    .filter((reminder) => reminder.userId === userId)
    .flatMap((reminder) => [
      ...reminder.history.map((time) => ({
        message: reminder.message,
        time,
        status: "sent",
      })),
      ...(reminder.completedAt
        ? [
            {
              message: reminder.message,
              time: reminder.completedAt,
              status: "done",
            },
          ]
        : []),
    ]);
}

function markReminderDone(userId, reminderId) {
  const reminder = reminders.find(
    (item) =>
      item.id === reminderId &&
      item.userId === userId &&
      item.nextRun !== null
  );

  if (!reminder) return false;

  reminder.nextRun = null;
  reminder.completedAt = Date.now();
  return true;
}

function markReminderFired(reminder) {
  if (reminder.nextRun === null) return;

  reminder.history.push(reminder.nextRun);

  if (reminder.repeat === "daily") {
    reminder.nextRun += DAY;
  } else if (reminder.repeat === "weekly") {
    reminder.nextRun += WEEK;
  } else {
    reminder.nextRun = null;
  }
}

function getAllReminders() {
  return reminders;
}

module.exports = {
  addReminder,
  getUpcomingReminders,
  getPastReminders,
  markReminderDone,
  markReminderFired,
  getAllReminders,
};