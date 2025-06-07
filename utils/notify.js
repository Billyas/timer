const querystring = require('node:querystring');
const got = require('got');
const timeout = 15000;

const push_config = {
    //青龙环境变量获取
    PUSH_KEY: process.env.PUSH_KEY,
};

const $ = {
    post: (params, callback) => {
      const { url, ...others } = params;
      got.post(url, others).then(
        (res) => {
          let body = res.body;
          try {
            body = JSON.parse(body);
          } catch (error) {}
          callback(null, res, body);
        },
        (err) => {
          callback(err?.response?.body || err);
        },
      );
    },
    get: (params, callback) => {
      const { url, ...others } = params;
      got.get(url, others).then(
        (res) => {
          let body = res.body;
          try {
            body = JSON.parse(body);
          } catch (error) {}
          callback(null, res, body);
        },
        (err) => {
          callback(err?.response?.body || err);
        },
      );
    },
    logErr: console.log,
  };


function serverNotify(text, desp) {
    return new Promise((resolve) => {
      const { PUSH_KEY } = push_config;
      if (PUSH_KEY) {
        // 微信server酱推送通知一个\n不会换行，需要两个\n才能换行，故做此替换
        desp = desp.replace(/[\n\r]/g, '\n\n');
  
        const matchResult = PUSH_KEY.match(/^sctp(\d+)t/i);
        const options = {
          url:
            matchResult && matchResult[1]
              ? `https://${matchResult[1]}.push.ft07.com/send/${PUSH_KEY}.send`
              : `https://sctapi.ftqq.com/${PUSH_KEY}.send`,
          body: `text=${encodeURIComponent(text)}&desp=${encodeURIComponent(
            desp,
          )}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout,
        };
        $.post(options, (err, resp, data) => {
          try {
            if (err) {
              console.log('Server 酱发送通知调用API失败😞\n', err);
            } else {
              // server酱和Server酱·Turbo版的返回json格式不太一样
              if (data.errno === 0 || data.data.errno === 0) {
                console.log('Server 酱发送通知消息成功🎉\n');
              } else if (data.errno === 1024) {
                // 一分钟内发送相同的内容会触发
                console.log(`Server 酱发送通知消息异常 ${data.errmsg}\n`);
              } else {
                console.log(`Server 酱发送通知消息异常 ${JSON.stringify(data)}`);
              }
            }
          } catch (e) {
            $.logErr(e, resp);
          } finally {
            resolve(data);
          }
        });
      } else {
        resolve();
      }
    });
  }
  
function parseString(input, valueFormatFn) {
    const regex = /(\w+):\s*((?:(?!\n\w+:).)*)/g;
    const matches = {};
  
    let match;
    while ((match = regex.exec(input)) !== null) {
      const [, key, value] = match;
      const _key = key.trim();
      if (!_key || matches[_key]) {
        continue;
      }
  
      let _value = value.trim();
  
      try {
        _value = valueFormatFn ? valueFormatFn(_value) : _value;
        const jsonValue = JSON.parse(_value);
        matches[_key] = jsonValue;
      } catch (error) {
        matches[_key] = _value;
      }
    }
  
    return matches;
  }
  
  function parseHeaders(headers) {
    if (!headers) return {};
  
    const parsed = {};
    let key;
    let val;
    let i;
  
    headers &&
      headers.split('\n').forEach(function parser(line) {
        i = line.indexOf(':');
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();
  
        if (!key) {
          return;
        }
  
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      });
  
    return parsed;
  }
  
  function parseBody(body, contentType, valueFormatFn) {
    if (contentType === 'text/plain' || !body) {
      return valueFormatFn && body ? valueFormatFn(body) : body;
    }
  
    const parsed = parseString(body, valueFormatFn);
  
    switch (contentType) {
      case 'multipart/form-data':
        return Object.keys(parsed).reduce((p, c) => {
          p.append(c, parsed[c]);
          return p;
        }, new FormData());
      case 'application/x-www-form-urlencoded':
        return Object.keys(parsed).reduce((p, c) => {
          return p ? `${p}&${c}=${parsed[c]}` : `${c}=${parsed[c]}`;
        });
    }
  
    return parsed;
  }

/**
 * sendNotify 推送通知功能
 * @param text 通知头
 * @param desp 通知体
 * @param params 某些推送通知方式点击弹窗可跳转, 例：{ url: 'https://abc.com' }
 * @returns {Promise<unknown>}
 */
async function sendNotify(text, desp, params = {}) {
    // 根据标题跳过一些消息推送，环境变量：SKIP_PUSH_TITLE 用回车分隔
    let skipTitle = process.env.SKIP_PUSH_TITLE;
    if (skipTitle) {
      if (skipTitle.split('\n').includes(text)) {
        console.info(text + '在 SKIP_PUSH_TITLE 环境变量内，跳过推送');
        return;
      }
    }
  
    await Promise.all([
      serverNotify(text, desp), // 微信server酱
    ]);
  }


module.exports = {
    sendNotify,
};
