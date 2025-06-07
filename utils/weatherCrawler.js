const got = require('got');  
const { sendNotify } = require('./notify'); 

// 定义爬取并推送天气信息的函数
async function crawlAndPushWeather() {
    try {
        // 目标天气页面 URL
        const targetUrl = 'https://i.browser.heytapmobi.com/weather/indexDfw/data/v2?cityKey=57966&pageId=livingindexV2';

        // 1. 发送请求获取页面内容
        const response = await got(targetUrl);
        // 解析JSON响应
        const pageData = JSON.parse(response.body);
        // 获取今日数据（第一个为今日）
        const todayData = pageData.data[0];
        // 查找穿衣指数项
        const dressingIndex = todayData.indexInfoV2List.find(item => item.indexEnName === 'dressing');
        // 提取信息
        const infoText = dressingIndex?.indexInfo || '未获取到穿衣指数信息';
        const descText = dressingIndex?.indexDesc || '未获取到穿衣指数描述';

        await sendNotify(infoText, descText);
    } catch (error) {
        console.error('爬取或推送失败:', error.message);
    }
}

// 导出函数供其他文件调用
module.exports = { crawlAndPushWeather };