const { default: axios } = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ColorThief = require('colorthief');

const getColorDominantFromImage = async (imgUrl) => {
    try {
        const dominantColor = await ColorThief.getColor(imgUrl);
        console.log('El color dominante es:', dominantColor);
        return dominantColor;
    } catch (err) {
        console.error('Error al procesar la imagen:', err.message);
        return [0, 0, 0];
    }
};

const createEmbed = async (country, weather) => {
    const dominantColor = await getColorDominantFromImage(country.flags.png);
    const exampleEmbed = new EmbedBuilder()
        .setColor(dominantColor)
        .setTitle(country.name.common)
        .setURL(`https://en.wikipedia.org/wiki/${country.name.common}`)
        .setDescription(`El país ${country.name.common} es genial.`)
        .setThumbnail(country.flags.png)
        .addFields(
            { name: 'Capital', value: `${country.capital[0]}` },
            { name: '\u200B', value: '\u200B' },
            { name: 'Población', value: `${country.population}`, inline: true },
            { name: 'Temperatura', value: `${weather.data.main.temp}°C`, inline: true },
            { name: 'Clima', value: `${weather.data.weather[0].description}`, inline: true },
        )
        .setImage(country.flags.png)
        .setFooter({ text: 'Visitanos! :D', iconURL: `${country.flags.png}` });

    return exampleEmbed;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buscar-pais')
        .setDescription('Muestra la info de un pais')
        .addStringOption(option =>
            option
                .setName('nombre')
                .setDescription('El nombre del pais a buscar')
                .setRequired(true),
        ),
    async execute(interaction) {
        try {
            const name = interaction.options.getString('nombre');
            const { data } = await axios.get(`https://restcountries.com/v3.1/name/${name}`);
            const lat = data[0].latlng[0];
            const lon = data[0].latlng[1];
            const weather = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lang=es&lat=${lat}&lon=${lon}&appid=74c2a8f9872ea2e46f48453a09a41371&units=metric`);
            const embed = await createEmbed(data[0], weather);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.log(error.message);
            await interaction.reply('el pais no existe');
        }
    },
};
