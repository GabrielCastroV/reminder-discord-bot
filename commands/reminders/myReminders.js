const { SlashCommandBuilder, codeBlock } = require('discord.js');
const db = require('../../db');
const { AsciiTable3, AlignmentEnum } = require('ascii-table3');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('my-reminders')
        .setDescription('mis recordatorios'),
    async execute(interaction) {
        try {
            const id = interaction.user.id;
            const reminders = db.prepare(`
                SELECT * FROM reminders
                WHERE discord_id = ?
            `).all(id);
            const formatedReminders = reminders.map(reminder => [
                reminder.reminder_id, Number(reminder.hour.toString()) + ':' + ((reminder.minutes < 10 & reminder.minutes >= 0) ? '0' + Number(reminder.minutes.toString()) : Number(reminder.minutes.toString())), Number(reminder.day.toString()) + '/' + (reminder.month > 0 && reminder.month < 10 ? '0' + Number(reminder.month.toString()) : Number(reminder.month.toString())) + '/' + Number(reminder.year.toString()), reminder.description]);
            const table =
            new AsciiTable3('Mis recordatorios')
                .setHeading('id', 'hour', 'date', 'description')
                .setAlign(8, AlignmentEnum.CENTER)
                .addRowMatrix(formatedReminders);
            await interaction.reply(codeBlock(table));
        } catch (error) {
            console.log(error);
            if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                return await interaction.reply(' ');
            }
            await interaction.reply('Ha ocurrido un error');
        }
    },
};