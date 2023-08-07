const { SlashCommandBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-user')
        .setDescription('Elimina tu usuario'),
    async execute(interaction) {
        try {
            const id = interaction.user.id;
            const deleteStatement = db.prepare(`
                DELETE FROM users
                WHERE discord_id = ?
            `).run(id);
            if (deleteStatement.changes === 0) {
                return await interaction.reply('Nada que eliminar');
            }
            await interaction.reply(`Usuario eliminado para <@${id}>`);

        } catch (error) {
            console.log(error.code);
            if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                return await interaction.reply(' ');
            }
            await interaction.reply('Ha ocurrido un error');
        }
    },
};