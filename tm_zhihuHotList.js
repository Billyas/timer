/**
 * 知乎热榜
 * name: 知乎热榜
 * 定时规则
 * cron: 11 6 * * *
 */
const got = require('got');
const { sendNotify } = require('./utils/notify');

// 爬取知乎热榜并推送
async function crawlZhihuHotList() {
    try {
        // 知乎热榜API（返回前五条）
        const response = await got('https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=5&desktop=true', {
            responseType: 'json',
            headers: {
                'Cookie': process.env.ZHIHU_TOKEN
            }
        });

        // 提取热榜数据
        const hotList = response.body.data || [];
        if (hotList.length === 0) {
            console.log('未获取到知乎热榜数据');
            return;
        }

        // 第一条作为标题，前五条整理为内容
        const firstItem = hotList[0].target;
        const title = firstItem.title || '知乎热榜';
        const content = hotList.slice(0, 3).map((item, index) => {
            const target = item.target;
            return `- **${target.title}**\n  摘要：${target.excerpt || '无摘要'}\n  [查看详情](https://www.zhihu.com/question/${target.id})`;
        }).join('\n\n');
        console.log('知乎热榜内容:', content);
        // 调用通知模块推送
        await sendNotify(title, content);
    } catch (error) {
        console.error('知乎热榜爬取或推送失败:', error.message);
    }
}

// 导出函数供定时调用
module.exports = { crawlZhihuHotList };

// 也支持直接运行
if (require.main === module) {
    crawlZhihuHotList();
}
