const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.js');

const commands = [
  new SlashCommandBuilder()
    .setName('bal')
    .setDescription('Kendi bakiyeni görürsün'),

  new SlashCommandBuilder()
    .setName('addmoney')
    .setDescription('Üyeye balance eklersin')
    .addUserOption(o =>
      o.setName('uye')
        .setDescription('Üye')
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('miktar')
        .setDescription('Eklenecek miktar')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('removemoney')
    .setDescription('Üyeden balance silersin')
    .addUserOption(o =>
      o.setName('uye')
        .setDescription('Üye')
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('miktar')
        .setDescription('Silinecek miktar')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('topmoney')
    .setDescription('Balance sıralamasını gösterir')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('Slash komutlar yükleniyor...');
    await rest.put(
      Routes.applicationGuildCommands(
        config.clientId,
        config.guildId
      ),
      { body: commands }
    );
    console.log('Slash komutlar başarıyla yüklendi!');
  } catch (error) {
    console.error(error);
  }
})();