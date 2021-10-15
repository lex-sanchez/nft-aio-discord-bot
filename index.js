require('dotenv').config();

const { Client, Intents, MessageEmbed } = require('discord.js');
const { slimeText } = require('./constants');
const { getCurrentGasPrices, getFloorPriceAndSendMessage, sendCurrentGasInMessageEmbed, getFloorPrice } = require('./nftDataService');
 
const init = () => {
    try {
        const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
             
        client.on('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
        });
            
        client.login(process.env.CLIENT_TOKEN);

        client.on('message', async (msg) => {
            const { channelId, channel } = msg;

            const approvedMessagingChannels = process.env.APPROVED_MESSAGING_CHANNELS.split(',');

            if (!approvedMessagingChannels.includes(channelId)) {
                console.log('cannot message in this channel')
            } else {
                const [ command, collectionSlug ] = msg.content.split(' ');
                
                const isValidCommand = ['!floor', '!gas', '!slimetime', '!888'].includes(command);

                if (!isValidCommand) {
                    // Do nothing
                    // console.log('not a valid command');
                } else {
                    console.log('replying to degens');
                    switch(command) {
                        case '!floor':
                            getFloorPriceAndSendMessage(msg, collectionSlug);
                            break;
                        case '!gas':
                            const currentGasInGwei = await getCurrentGasPrices();
                            sendCurrentGasInMessageEmbed(channel, currentGasInGwei);
                            break;
                        case '!slimetime':
                            msg.reply(slimeText);
                            break;
                        case '!888':
                            msg.reply('888');
                            break;
                    }
                }
            }
        })
    } catch (e) {
        console.log('ERROR', e);
    }
}

init();

