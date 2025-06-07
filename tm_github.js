/**
 * name: Github热榜
 * cron: 16 5 * * *
 */
const axios = require('axios');
const cheerio = require('cheerio');
const { sendNotify } = require('./utils/notify');
// 爬取GitHub趋势页面
async function crawlGitHubTrending() {
    try {
        const response = await axios.get('https://kkgithub.com/trending');
        const $ = cheerio.load(response.data);
        const trendingItems = [];

        // 提取前三条趋势项目（根据实际页面结构调整选择器）
        $('article.Box-row').each((index, element) => {
            if (index < 3) {
                const $a = $(element).find('h2 a');
                const title = $a.text().trim().replace(/\s+/g, ' ');
                const link = 'https://github.com' + $a.attr('href'); // 获取项目链接
                const description = $(element).find('p').text().trim();
                const stars = $(element).find('[href$="stargazers"]').text().trim();
                trendingItems.push({
                    title, 
                    link, 
                    description, 
                    stars
                });
            }
        });

        // 生成Markdown内容
        let markdownContent = '# GitHub趋势前三条信息\n\n';
        trendingItems.forEach((item, index) => {
            markdownContent += `## ${index + 1}. [${item.title}](${item.link})\n`;
            markdownContent += `${item.description}\n`;
            markdownContent += `星星：${item.stars}\n\n`;
        });

        console.log(markdownContent);

        // 调用推送
        sendNotify(markdownContent);

        return trendingItems;
    } catch (error) {
        console.error('爬取失败：', error.message);
        throw error;
    }
}

// 执行爬取
crawlGitHubTrending();

// 提示：需要先安装依赖
// npm install axios cheerio
