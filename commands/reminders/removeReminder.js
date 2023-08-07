const { SlashCommandBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-reminder')
        .setDescription('Elimina un recordatorio segun su numero de id')
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('ID del recordatorio que deseas eliminar')
                .setRequired(true),
        ),
    async execute(interaction) {
        try {
            const reminderID = interaction.options.getString('id');
            const id = interaction.user.id;
            const deleteStatement = db.prepare(`
                DELETE FROM reminders
                WHERE reminder_id = ? AND discord_id = ?
            `).run(reminderID, id);
            if (deleteStatement.changes === 0) {
                return await interaction.reply('Nada que eliminar, \n recuerda usar el comando /my-reminders para visualizar tus recordatorios');
            }
            await interaction.reply(`Recordatorio con el ID #${reminderID} eliminado para <@${id}>. \n recuerda usar el comando /my-reminders para visualizar tus recordatorios`);

        } catch (error) {
            console.log(error);
            if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                return await interaction.reply(' ');
            }
            await interaction.reply('Ha ocurrido un error');
        }
    },
};