const { SlashCommandBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update-user')
        .setDescription('Actualiza tu usuario')
        .addStringOption(option =>
            option
                .setName('nombre')
                .setDescription('Tu nombre y apellido')
                .setRequired(true),
        ),
    async execute(interaction) {
        try {
            const name = interaction.options.getString('nombre');
            const id = interaction.user.id;
            const user = db.prepare(`
                SELECT * FROM users
                WHERE discord_id = ?
            `).get(id);

            if (!user) return await interaction.reply('No existe usuario que actualizar');
            db.prepare(`
                UPDATE users
                SET name = ?
                WHERE discord_id = ?
            `).run(name, id);
            await interaction.reply(`Cambio de nombre de "${user.name}" a "${name}" para el usuario: <@${id}>`);

        } catch (error) {
            console.log(error);
            if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                return await interaction.reply('El usuario ya existe');
            }
            await interaction.reply('Ha ocurrido un error');
        }
    },
};