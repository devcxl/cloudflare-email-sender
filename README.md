# cloudflare-email-sender

使用 cloudflare 免费发送邮件

## 前置条件

- 一个 Cloudflare 帐户
- 一个可以被 Cloudflare 管理的域名
- npm 软件包 create-cloudflare
- git
- openssl（可选）

## 为你的 Clouflare 帐户启用 MailChannels

首先，找到您的帐户 `workers.dev`子域：

1. 登录 Cloudflare 仪表板 并选择你的帐户。
2. 选择 工作人员和页面 > 概述 。
3. 在概述的右侧 ，记下您的 `workers.dev` 子域 。类似于 `myaccount.workers.dev`

当你找到你的 `workers.dev`子域，添加 MailChannels DNS 记录：

1. 在 “帐户主页” 中，选择您要为其添加 SPF 记录的网站。
2. 选择 DNS > 记录 > 添加记录 。
3. 添加以下 TXT DNS 记录，替换 `myaccount.workers.dev` 与你自己的 `workers.dev` 子域

   | Type | Name           | Content                                              |
   | ---- | -------------- | ---------------------------------------------------- |
   | TXT  | \_mailchannels | v=mc1 cfid=myaccount.workers.dev cfid=yourdomain.com |

> `yourdomain.com`应设置为 worker 自定义域的二级域名

## 添加 MailChannel 的 SPF 支持

要同时使用 MailChannels 和 Cloudflare 电子邮件路由：

1. 在 “帐户主页” 中，选择您要为其添加 SPF 记录的网站。
2. 选择 DNS > 记录 > 添加记录 。
3. 添加以下 TXT DNS 记录：

   | Type | Name | Content                                                                    |
   | ---- | ---- | -------------------------------------------------------------------------- |
   | TXT  | @    | v=spf1 include:\_spf.mx.cloudflare.net include:relay.mailchannels.net -all |

## 部署

1. 克隆该项目

   `git clone https://github.com/devcxl/cloudflare-email-sender`

2. 修改 wrangeler 配置

   将`wrangler.example.toml` 重命名为 `wrangler.toml`

   修改`wrangler.toml`配置中的`SENDER_EMAIL`和`SENDER_NAME`

3. 部署

   1. 运行`npm i`安装依赖。
   2. 运行`npm run deploy`并根据提示登陆你的 Cloudfalre 账号并部署
   3. 运行`openssl rand -base64 32`生成随机密钥
   4. 运行`npx wrangler secret put ACCESS_TOKEN`设置访问随机密钥

## 使用示例

### 发送自定义邮件

```shell
curl -X POST -L https://custom.yourdomain.com/v1/send \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer {ACCESS_TOKEN}' \
-d '{
    "to": "you@example.com",
    "name": "Jone",
    "title": "Just Test Message",
    "content": "<h1>Hello This is test message</h1>",
    "type": "text/html"
}'
```

### 发送模板邮件

```shell

curl -X POST -L https://custom.yourdomain.com/v1/send/activation \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer {ACCESS_TOKEN}' \
-d '{
    "to": "you@example.com",
    "name": "Example",
    "title": "Just Test Message",
    "site_name": "Test Title",
    "url": "https://www.google.com/search?q=devcxl"
}'
```

## 参考

- https://community.cloudflare.com/t/send-email-from-workers-using-mailchannels-for-free/361973/63
- https://www.fadhil-blog.dev/blog/cloudflare-worker-send-email/
- https://medium.com/@tristantrommer/how-to-send-free-transactional-emails-with-worker-mailchannels-via-cloudflare-workers-818b787b33f9
- https://developers.cloudflare.com/pages/functions/plugins/mailchannels/
- https://www.breakp.dev/blog/email-flare-send-from-worker-for-free/