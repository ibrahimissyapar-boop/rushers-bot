const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require('discord.js');
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
            name: '.gg/rushers',
            type: ActivityType.Streaming,
            url: 'https://www.twitch.tv/discord'
        }],
        status: 'online',
    });

    // 2. Ses Kanalına Bağlanma
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
            console.log('Belirtilen ID bir ses kanalı değil veya bulunamadı!');
        }
    } catch (err) {
        console.error('Ses kanalına bağlanırken hata oluştu:', err.message);
    }
});

// 3. Sunucuya Katılan Kullanıcıya Otomatik Rol Verme ve SADECE DM Mesajı Gönderme
client.on('guildMemberAdd', async (member) => {
    const totalMembers = member.guild.memberCount;
    let roleName = 'Belirtilen Rol';

    // A) Otomatik Rol Verme
    try {
        const role = member.guild.roles.cache.get(config.rolId);
        if (role) {
            await member.roles.add(role);
            roleName = role.name;
            console.log(`\({member.user.tag} kullanıcısına\){role.name} rolü verildi.`);
        }
    } catch (error) {
        console.error('Rol verilirken hata oluştu:', error);
    }

    // B) Sadece DM (Özel Mesaj) Gönderme
    try {
        const dmEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`🎉 ${member.guild.name} Sunucusuna Hoş Geldin!`)
            .setDescription(`Aramıza katıldığın için teşekkür ederiz ${member}!`)
            .addFields(
                { name: '🎭 Verilen Rol', value: `**${roleName}**`, inline: true },
                { name: '📊 Sunucu Üye Sayısı', value: `Seninle birlikte **${totalMembers}** kişiyiz!`, inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'RUSHERS - Keyifli vakit geçirmeni dileriz!' })
            .setTimestamp();

        await member.send({ embeds: [dmEmbed] });
        console.log(`${member.user.tag} kullanıcısına DM mesajı gönderildi.`);
    } catch (dmError) {
        // Kullanıcının DM kutusu kapalıysa botun çökmemesi için
        console.log(`${member.user.tag} kullanıcısının DM kutusu kapalı olduğu için mesaj iletilemedi.`);
    }
});

client.login(process.env.BOT_TOKEN || config.token);
