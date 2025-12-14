const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const config = require('./config.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let money = require('./money.json');

function saveMoney() {
  fs.writeFileSync('./money.json', JSON.stringify(money, null, 2));
}

client.once('ready', () => {
  console.log(`Bot aktif: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, channelId } = interaction;
  const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
  const logChannel = interaction.guild.channels.cache.get(config.logChannelId);

  // 💰 BALANCE
  if (commandName === 'bal') {
    if (channelId !== config.balanceChannelId)
      return interaction.reply({ content: '❌ Bu komut sadece balance kanalında.', ephemeral: true });

    const id = interaction.user.id;
    if (!money[id]) money[id] = 0;

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('💰 Kişisel Balance')
      .setDescription(`Bakiyen: **${money[id]}**`)
      .setFooter({ text: 'Sadece sen görebilirsin' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // 🔒 YETKİLİ KONTROL
  if (channelId !== config.adminChannelId)
    return interaction.reply({ content: '❌ Bu komut sadece yetkili kanalında.', ephemeral: true });

  if (!isAdmin)
    return interaction.reply({ content: '❌ Yetkin yok.', ephemeral: true });

  // ➕ ADD MONEY
  if (commandName === 'addmoney') {
    const user = interaction.options.getUser('uye');
    const amount = interaction.options.getInteger('miktar');

    if (!money[user.id]) money[user.id] = 0;
    money[user.id] += amount;
    saveMoney();

    const embed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('➕ Balance Eklendi')
      .addFields(
        { name: 'Üye', value: user.tag, inline: true },
        { name: 'Miktar', value: `${amount}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('LOG | Balance Ekleme')
        .addFields(
          { name: 'Yetkili', value: interaction.user.tag, inline: true },
          { name: 'Üye', value: user.tag, inline: true },
          { name: 'Miktar', value: `${amount}`, inline: true }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] });
    }
  }

  // ➖ REMOVE MONEY
  if (commandName === 'removemoney') {
    const user = interaction.options.getUser('uye');
    const amount = interaction.options.getInteger('miktar');

    if (!money[user.id]) money[user.id] = 0;
    money[user.id] -= amount;
    if (money[user.id] < 0) money[user.id] = 0;
    saveMoney();

    const embed = new EmbedBuilder()
      .setColor('Orange')
      .setTitle('➖ Balance Silindi')
      .addFields(
        { name: 'Üye', value: user.tag, inline: true },
        { name: 'Miktar', value: `${amount}`, inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('LOG | Balance Silme')
        .addFields(
          { name: 'Yetkili', value: interaction.user.tag, inline: true },
          { name: 'Üye', value: user.tag, inline: true },
          { name: 'Miktar', value: `${amount}`, inline: true }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] });
    }
  }

  // 🏆 TOP MONEY
  if (commandName === 'topmoney') {
    const sorted = Object.entries(money)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    let desc = '';
    let i = 1;
    for (const [id, amt] of sorted) {
      const user = await client.users.fetch(id);
      desc += `${i}. ${user.tag} → **${amt}**\n`;
      i++;
    }

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('🏆 Balance Sıralaması')
      .setDescription(desc || 'Veri yok')
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
});

client.login(config.token);