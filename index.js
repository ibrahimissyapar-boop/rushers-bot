const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once('ready', async () => {
    console.log(`${client.user.tag} olarak başarıyla giriş yapıldı!`);

    // 1. Yayın Yapıyor (Streaming) Durumu
    client.user.setPresence({
        activities: [{
            name: 'R U S H E R S',
            type: ActivityType.Streaming,
            url: 'https://www.twitch.tv/discord' // Yayın ikonu için geçerli bir Twitch/YouTube bağlantısı
        }],
        status: 'online',
    });

    // 2. Ses Kanalına Bağlanma
    try {
        const guild = client.guilds.cache.first();
        if (guild) {
            const channel = guild.channels.cache.get(config.sesKanalId);
            if (channel) {
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator,
                    selfDeaf: true,
                    selfMute: false
                });
                console.log(`Ses kanalına bağlanıldı: ${channel.name}`);
            } else {
                console.log('Ses kanalı bulunamadı! config.json dosyasındaki sesKanalId bilgisini kontrol edin.');
            }
        }
    } catch (err) {
        console.error('Sese bağlanırken hata oluştu:', err);
    }
});

// 3. Otomatik Rol Verme
client.on('guildMemberAdd', async (member) => {
    try {
        const role = member.guild.roles.cache.get(config.rolId);
        if (role) {
            await member.roles.add(role);
            console.log(`\({member.user.tag} sunucuya katıldı ve\){role.name} rolü verildi.`);
        } else {
            console.log('Verilecek rol bulunamadı! config.json dosyasındaki rolId bilgisini kontrol edin.');
        }
    } catch (error) {
        console.error('Rol verilirken hata oluştu:', error);
    }
});

client.login(config.token);