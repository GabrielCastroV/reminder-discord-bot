# REMINDER DISCORD BOT

Tired of forgetting your daily tasks? or missing an important date just like a friend birthday (or even your own), your anniversary, your dentist appointment, etc.

well well well, i got you.

I introduce you **Remi Reminder**, your new discord bot that will remind you every single task at the exact hour you provide to it. Useful for your discord server, even your friends can use it, it is really easy!


## Getting Started

To use Remi Reminder, follow these steps:

1. Create a user by using the `/create-user` command followed by your desired username. For example:

2. Once your user is created, you can create a reminder using the `/create-reminder` command. You can specify the time in a 24-hour format and include minutes, seconds, and a description. For example:

3. Your reminders will be saved in an SQLite3 database with a unique ID.

4. You can view all your reminders in a table format using the `/my-reminders` command.

5. If you want to delete a specific reminder, use the `/delete-reminder` command followed by the ID of the reminder you want to remove. For example:

6. To delete your user and all associated reminders, use the `/delete-user` command.

7. Make sure your Discord direct messages are enabled, as the bot will send you private messages to notify you when it's time for a reminder.

## Dependencies

Remi Reminder relies on the following dependencies:

- `ascii-table3` for visual tables in Discord.
- `better-sqlite3` for the database.
- `date-fns` for date and time manipulation.
- `discord.js` for Discord integration.
- `dotenv` for environment variable management.
- `node-cron` for scheduling reminders.

## Installation

Before using Remi Reminder, make sure to install the required dependencies using npm:

```bash
npm install

npm start

__How to install:__

1st step: download Node.js https://nodejs.org/en/download make sure you choose LTS version.
2nd step: download and install Git for windows https://gitforwindows.org/ or linuxhttps://git-scm.com/download/linux
3rd step: Clone this repository typing in your terminal 'git clone git@github.com:GabrielCastroV/reminder-discord-bot.git'







