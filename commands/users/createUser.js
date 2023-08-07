const { SlashCommandBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-user')
        .setDescription('Crea un nuevo usuario')
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
            db.prepare(`
                INSERT INTO users (discord_id, name)
                VALUES (?, ?)
            `).run(id, name);
            await interaction.reply(`Usuario creado para <@${id}>`);

        } catch (error) {
            console.log(error);
            if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                return await interaction.reply('El usuario ya existe');
            }
            await interaction.reply('Ha ocurrido un error');
        }
    },
};