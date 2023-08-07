const { SlashCommandBuilder, codeBlock } = require('discord.js');
const db = require('../../db');
const { AsciiTable3, AlignmentEnum } = require('ascii-table3');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('my-notes')
        .setDescription('notas'),
    async execute(interaction) {
        try {
            const id = interaction.user.id;
            const notes = db.prepare(`
                SELECT * FROM notes
                WHERE discord_id = ?
            `).all(id);
            const formatedNotes = notes.map(note => [
                note.title, note?.description || '' ]);
            const table =
            new AsciiTable3('Mis notas')
                .setHeading('title', 'description')
                .setAlign(3, AlignmentEnum.CENTER)
                .addRowMatrix(formatedNotes);
            await interaction.reply(codeBlock(table));
        } catch (error) {
            console.log(error.code);
            if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                return await interaction.reply(' ');
            }
            await interaction.reply('Ha ocurrido un error');
        }
    },
};