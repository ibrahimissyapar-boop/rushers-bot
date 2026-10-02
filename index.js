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
            name: 'RUSHERS 🚀',
            type: ActivityType.Streaming,
            url: 'https://www.twitch.tv/discord' // Geçerli bir Twitch/YouTube adresi
        }],
        status: 'online',
    });

    // 2. Ses Kanalına Doğrudan Bağlanma (Fetch Yöntemi)
    try {
        const channel = await client.channels.fetch(config.sesKanalId);
        if (channel && channel.isVoiceBased()) {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false
            });
            console.log(`Ses kanalına başarıyla bağlanıldı: ${channel.name}`);
        } else {
            console.log('Belirtilen ID bir ses kanalı değil veya kanal bulunamadı!');
        }
    } catch (err) {
        console.error('Ses kanalına bağlanırken hata oluştu:', err.message);
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
            console.log('Verilecek rol bulunamadı! config.json içindeki rolId bilgisini kontrol edin.');
        }
    } catch (error) {
        console.error('Rol verilirken hata oluştu:', error);
    }
});

// Render ortam değişkeni varsa onu, yoksa config içindeki token'ı kullanır
client.login(process.env.BOT_TOKEN || config.token);
