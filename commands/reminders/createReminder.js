/* eslint-disable no-inline-comments */
const { SlashCommandBuilder, EmbedBuilder, GatewayIntentBits, Client } = require('discord.js');
const db = require('../../db');
const { parseISO, isFuture, isValid } = require('date-fns');
const cron = require('node-cron');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
});
client.login(process.env.TOKEN);
const createEmbed = async (hour, minute, day, month, year, description) => {
    const exampleEmbed = new EmbedBuilder()
        .setColor([0, 255, 0])
        .setTitle('Recordatorio')
        .setDescription('Has creado un nuevo recordatorio!')
        .addFields(
            { name: 'Hora', value: `${hour}:${minute.toString().padStart(2, '0')}`, inline: true },
            { name: 'Fecha', value: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`, inline: true },
        )
        .setImage('https://cdn-icons-png.flaticon.com/512/4473/4473658.png')
        .setFooter({ text: `Descripción: ${description || 'Sin descripción'}`, iconURL: 'https://media3.giphy.com/media/rbcl4Hj6LjTcUtzv7V/giphy.gif?cid=6c09b952z69k4x28vvvb7p5ki8fsbq69va613rko8b9za2op&ep=v1_stickers_related&rid=giphy.gif&ct=s' });
    return exampleEmbed;
};
const enviarRecordatorio = async (userId, fechaRecordatorio, mensajeRecordatorio, primaryKey) => {
    try {
        const consulta = db.prepare(`
        SELECT * FROM reminders
        WHERE reminder_id = ?
        `).get(primaryKey);
        if (consulta) {
            const user = await client.users.fetch(userId);
            await user.send(`¡Hola ${user.username}!\n ${mensajeRecordatorio ? 'He venido a recordarte: ' + mensajeRecordatorio : 'Tienes un recordatorio programado para esta hora!'} \n Este mensaje fue programado para ser enviado en la fecha ${fechaRecordatorio}`);
            console.log(`Mensaje enviado a ${user.username}`);
            db.prepare(`
                DELETE FROM reminders
                WHERE reminder_id = ?
            `).run(primaryKey);
        } else {
            console.log('el id fue eliminado, por lo tanto no se notificará al usuario');
        }

    } catch (error) {
        console.error(`Error al enviar mensaje a usuario con ID ${userId}: ${error}`);
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-reminder')
        .setDescription('Crea un recordatorio (Formato de 24h)')
        .addIntegerOption(option =>
            option
                .setName('hour')
                .setDescription('Hora del recordatorio (0-23)')
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option
                .setName('minutes')
                .setDescription('Minutos del recordatorio (0-59)'),
        )
        .addIntegerOption(option =>
            option
                .setName('day')
                .setDescription('Día del recordatorio (1-31)'),
        )
        .addIntegerOption(option =>
            option
                .setName('month')
                .setDescription('Mes del recordatorio (1-12)'),
        )
        .addIntegerOption(option =>
            option
                .setName('year')
                .setDescription('Año del recordatorio'),
        )
        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('Descripción opcional del recordatorio'),
        ),
    async execute(interaction) {
        try {
            const currentDate = new Date();
            const hour = interaction.options.getInteger('hour');
            const minutes = interaction.options.getInteger('minutes') !== null ? interaction.options.getInteger('minutes') : 0;
            const day = interaction.options.getInteger('day') !== null ? interaction.options.getInteger('day') : currentDate.getDate();
            const month = interaction.options.getInteger('month') !== null ? interaction.options.getInteger('month') : (currentDate.getMonth() + 1);
            const year = interaction.options.getInteger('year') !== null ? interaction.options.getInteger('year') : currentDate.getFullYear();
            const description = interaction.options.getString('description') || '';

            if (hour < 0 || hour > 23 || minutes < 0 || minutes > 59 || day < 1 || day > 31 || month < 1 || month > 12 || year < 2023) {
                await interaction.reply('Los valores ingresados para la fecha y hora no son válidos.');
                return;
            }

            const datetimeStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            const datetime = parseISO(datetimeStr);

            if (!isValid(datetime) || !isFuture(datetime)) {
                await interaction.reply('La fecha y hora proporcionadas no son válidas o ya han pasado.');
                return;
            }

            // Verificar si el día es correcto para el mes y si es un año bisiesto jeje
            const daysInMonth = new Date(year, month, 0).getDate();

            if (day > daysInMonth) {
                await interaction.reply(`El mes ${month} del año ${year} no tiene ${day} días.`);
                return;
            }

            const id = interaction.user.id;
            const result = db.prepare(`
        INSERT INTO reminders (hour, minutes, day, month, year, description, discord_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(hour, minutes, day, month, year, description, id);
            const lastId = result.lastInsertRowid;

            const embed = await createEmbed(hour, minutes, day, month, year, description);
            await interaction.reply({ embeds: [embed] });
            const fechaRecordatorio = new Date(year, month - 1, day, hour, minutes, 0, 0);

            // Modifico el formato de hora para que cron.schedule pueda leerlo.

            const cronPattern = `${minutes} ${hour} ${day} ${month} *`;
            // Aqui programo el envío del mensaje privado en la fecha y hora específicas
            cron.schedule(cronPattern, () => {
            // Código para enviar el mensaje privado al usuario en el momento exacto
                const user = interaction.user;
                enviarRecordatorio(user, fechaRecordatorio, description, lastId);
            });

        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                return await interaction.reply('El usuario no existe, debes crear un usuario para crear tu recordatorio. \n usa el comando /create-user');
            }
            console.error(error);
            await interaction.reply('Ha ocurrido un error.');
        }
    },
};
