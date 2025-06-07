/**
 * 每日早报推送
 * 每天早上6:16推送
 * name: 每日早报
 * 定时规则
 * cron: 16 6 * * *
 */

const { sendNotify } = require('./utils/notify');
const {crawlAndPushWeather} = require('./weatherCrawler');

//穿衣指数
crawlAndPushWeather();

