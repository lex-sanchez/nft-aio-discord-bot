const { shorthandMappings } = require('./constants');
const axios = require('axios');
const OpenseaScraper = require("opensea-scraper");
const { MessageEmbed } = require('discord.js');

export const getCurrentGasPrices = async () => {
    try {
        const gasInfo = await axios.get('https://blocknative-api.herokuapp.com/data');
        const { estimatedPrices } = gasInfo.data;
        const fastest = estimatedPrices.find(price => price.confidence === 99);
        const fast = estimatedPrices.find(price => price.confidence === 90);
        const slow = estimatedPrices.find(price => price.confidence === 70);
    
        return {
            fastestGwei: fastest.price,
            fastGwei: fast.price,
            slowGwei: slow.price,
        }
    } catch (e) {
        console.log('Failed to fetch gas prices');
    }
}

export const sendCurrentGasInMessageEmbed = async (channel, gasData) => {
    const messageEmbed = new MessageEmbed()
    .setColor('#3EE83C')
    .setTitle('Current gas prices')
    .setDescription(`Base fee per gas for current block: ${gasData.baseFee} GWEI`)
    .addFields(
        { name: 'Fastest', value: `${gasData.fastestGwei} GWEI (99% probability)` },
        { name: 'Fast', value: `${gasData.fastGwei} GWEI (90% probability)` },
        { name: 'Slow', value: `${gasData.slowGwei} GWEI (70% probability)` },
    );

    channel.send({ embeds: [messageEmbed] })
}

// TODO: Figure out how to implement puppeteer in server
export const getFloorPriceAndSendMessage = async (msg, collectionSlug) => {
    try {
        let collectionUrlSlug;
        const shorthandCollectionNames = Object.keys(shorthandMappings);

        shorthandCollectionNames.includes(collectionSlug) ? collectionUrlSlug = shorthandMappings[collectionSlug] : collectionUrlSlug = collectionSlug;

        const floorPrice = await OpenseaScraper.floorPrice(collectionUrlSlug);
        console.log(await OpenseaScraper.basicInfo(collectionUrlSlug))

        floorPrice ? msg.reply(`${collectionSlug} floor price is ${floorPrice} eth`) : msg.reply('Invalid collection slug, or unknown error');
    } catch (e) {
        console.log('error', e);
        msg.reply('Invalid collection slug, or unknown error');
    }
}

// Alternative way to get floor price from opensea API
export const getFloorPrice = async (slug) => {
    try {
        const url = `https://api.opensea.io/collection/${slug}`;
        const response = await axios.get(url);
        return response.data.collection.stats.floor_price;
    } catch(err) {
        console.log(err);
        return undefined;
    }
  }