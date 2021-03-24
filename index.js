const Discord = require('discord.js'),
    client = new Discord.Client({
        fetchAllMembers: true,
        partials: ['MESSAGE', 'REACTION']
    }),
    config = require('./config.json'),
    fs = require('fs'),
    humanizeDuration = require('humanize-duration'),
    cooldown = new Set()
 
client.login(config.token)
client.commands = new Discord.Collection()
client.db = require('./db.json')
 
fs.readdir('./commands', (err, files) => {
    if (err) throw err
    files.forEach(file => {
        if (!file.endsWith('.js')) return
        const command = require(`./commands/${file}`)
        client.commands.set(command.name, command)
    })
})
 
client.on('message', message => {
    if (message.type !== 'DEFAULT' || message.author.bot) return
 
    if (!message.member.hasPermission('MANAGE_MESSAGES')) {
        const duration = config.cooldown[message.channel.id]
        if (duration) {
            const id = `${message.channel.id}_${message.author.id}`
            if (cooldown.has(id)) {
                message.delete()
                return message.channel.send(`Ce salon est soumis a un cooldown de ${humanizeDuration(duration, {language: 'fr'})}.`).then(sent => sent.delete({timeout: 5e3}))
            }
            cooldown.add(id)
            setTimeout(() => cooldown.delete(id), duration)
        }
    }
 
    const args = message.content.trim().split(/ +/g)
    const commandName = args.shift().toLowerCase()
    if (!commandName.startsWith(config.prefix)) return
    const command = client.commands.get(commandName.slice(config.prefix.length))
    if (!command) return
    if (command.guildOnly && !message.guild) return message.channel.send('Cette commande ne peut être utilisée que dans un serveur.')
    command.run(message, args, client)
})
 
client.on('guildMemberAdd', member => {
    member.guild.channels.cache.get(config.greeting.channel).send(`${member}`, new Discord.MessageEmbed()
        .setDescription(`${member} a rejoint le serveur. Nous sommes désormais ${member.guild.memberCount} ! 🎉`)
        .setColor('#00ff00'))
    member.roles.add(config.greeting.role)
})
 
client.on('guildMemberRemove', member => {
    member.guild.channels.cache.get(config.greeting.channel).send(new Discord.MessageEmbed()
        .setDescription(`${member.user.tag} a quitté le serveur... 😢`)
        .setColor('#ff0000'))
})
 
client.on('messageReactionAdd', (reaction, user) => {
    if (!reaction.message.guild || user.bot) return
    const reactionRoleElem = config.reactionRole[reaction.message.id]
    if (!reactionRoleElem) return
    const prop = reaction.emoji.id ? 'id' : 'name'
    const emoji = reactionRoleElem.emojis.find(emoji => emoji[prop] === reaction.emoji[prop])
    if (emoji) reaction.message.guild.member(user).roles.add(emoji.roles)
    else reaction.users.remove(user)
})
 
client.on('messageReactionRemove', (reaction, user) => {
    if (!reaction.message.guild || user.bot) return
    const reactionRoleElem = config.reactionRole[reaction.message.id]
    if (!reactionRoleElem || !reactionRoleElem.removable) return
    const prop = reaction.emoji.id ? 'id' : 'name'
    const emoji = reactionRoleElem.emojis.find(emoji => emoji[prop] === reaction.emoji[prop])
    if (emoji) reaction.message.guild.member(user).roles.remove(emoji.roles)
})
 
client.on('ready', () => {
console.log("Demo BOT est en ligne.");
    const statuses = [
        '!help pour en savoir plus sur les bots',
        '-Grxgxry',
        '.gg/aJjbDX9Ynv',
    ]
    let i = 0
    setInterval(() => {
        client.user.setActivity(statuses[i], {type: 'WATCHING', url: 'https://youtube.com/'})
        i = ++i % statuses.length
    }, 1e4)
})
 
client.on('channelCreate', channel => {
    if (!channel.guild) return
    const muteRole = channel.guild.roles.cache.find(role => role.name === 'Muted')
    if (!muteRole) return
    channel.createOverwrite(muteRole, {
        SEND_MESSAGES: false,
        CONNECT: false,
        ADD_REACTIONS: false
    })
})

client.on("message", message => {
    if (message.author.bot) return
    if (message.channel.type == "dm") return

    var help = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("**By __-Grxgxry__**")
    .setAuthor("Bot de démonstration", "https://media.discordapp.net/attachments/809043510145187911/824376016659021834/ppdemo.jpg", "https://www.youtube.com/channel/UCo6X7rxSjtFTl0ES0ZpD1Aw/videos")
    .addField("\u200B", "\u200B")
    .addField("**__👀Qui suis-je ?👀 : __**", "\u200B")
    .addField("**・__Mon créateur__**", "- Je suis un bot crée par -Grxgxry, un développeur de bots discord")
    .addField("**・__Qui m'a donné cette idée ?__**", "- Un ami, appelé Ayeah ou Azgar qui ma donné cette passion de développeur js")
    .addField("**__😍A propos des bots😍 : __**", "\u200B")
    .addField("**・__Comment pourrais-je avoir un bot complet ?__**", "- Je suis un développeur Gratuit & Payant selon la demande de la personne qui veut un bot, le prix peut varier")
    .addField("**・__Cela coûte cher ?__**", "- Non, car un bot complet avec hébergeur coûte 15€, et 5€ pour un bot avec quelques de commandes et sans hébergeur !")
    .addField("**・__Pourquoi 15€ ?__**", "- Un hébergeur coûte en moyenne 7/10€ donc l'argent que je recevrais, une partie ira dans l'hébergeur, car ce n'est pas gratuit ! ")
    .addField("**・__Pourquoi 5/10€ et pas d'hébergeur ?__**", "- Cette somme d'argent est très peu pour financer mes études avec un hébergeur, je gagnerai même pas 5€ de la vente du bot, Donc pas d'hébergeurs ! ")
    .addField("**・__Bot gratuit ?__**", "- Oui, il y a le bot de démonstration !, Il est gratuit et permet aux personnes de voir ce dont je suis capable !, Je fais rarement des éxceptions pour offrir un bot complet sans hébergeur ! ")
    .setTimestamp()
    .setFooter("Grxgxry démo BOT", "https://media.discordapp.net/attachments/809043510145187911/824376016659021834/ppdemo.jpg")


    message.channel.send(help);
})