# cloudflare-email-sender


> 自 2024 年 8 月 31 日起，MailChannels 不再为 Cloudflare Workers 用户提供免费电子邮件发送服务 [MailChannels原文](https://support.mailchannels.com/hc/en-us/articles/26814255454093-End-of-Life-Notice-Cloudflare-Workers)  
> 由于mailchannels不再免费 且申请免费账户需信用卡成本较高，因此放弃继续使用，转为Resend发信服务  
> 如仍需要mailchannels发信, 请查看 `old/mailchannels` 分支

使用 cloudflare 免费发送邮件

## 前置条件

- 一个 Cloudflare 帐户
- 一个 Resend 账户
- 一个可以被 Cloudflare 管理的域名
- npm 软件包 create-cloudflare、resend
- git
- openssl（可选）

## Resend 相关

如果您还没有 Resend 帐户，可以注册一个 [Resend 免费帐户](https://resend.com/signup) 。注册后，前往 Domains 菜单项，然后点击`Add Domain`，输入要添加的域，然后选择一个区域。

随后在 Cloudflare 中的 DNS 中配置 Resend 中需要的 DNS 记录

![](https://developers.cloudflare.com/_astro/verified_domain.ouYLJaQl_Z2eLlGH.webp)

配置并校验完成后，在 Resend 菜单中找到 `API Keys` 创建一个 key 记下这个 key 随后项目中会用到。

> 注意 Resend免费计划用户 每天有100封的发信限制 每月有3000封的发信限制。
> 如果需要发送更多邮件请升级 Resend 的计划

## 创建邮件发送服务

1. 克隆项目到本地

   ```
   git clone https://github.com/devcxl/cloudflare-email-sender
   ```

2. 编辑 `wrangler.toml` 中的变量
   ```
   # 自定义域名的发信邮件地址
   SENDER_EMAIL = "do-not-replay@example.com"
   # 发信人简称/名字
   SENDER_NAME = "Example"
   ```
3. 运行 `openssl rand -base64 32` 生成一个随机密钥（可选，可以自己设置密钥）

   ![image](https://file.devcxl.cn/blog/images/2024111600182427-20241116001824.png)

4. 运行 `npx wrangler secret put ACCESS_TOKEN` 设置上一步生成的随机密钥

   ![image](https://file.devcxl.cn/blog/images/2024111600201505-20241116002014.png)

5. 运行 `npx wrangler secret put RESEND_APIKEY` 设置 Resend 中得到的 key
   ![image](https://file.devcxl.cn/blog/images/2024111600143187-20241116001431.png)

6. 部署项目
    ```
    npm run deploy
    ```

## 使用示例

### 发送HTML邮件

```shell
curl -X POST -L https://custom.yourdomain.com/v1/send \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer {ACCESS_TOKEN}' \
-d '{
    "to": "you@example.com",
    "title": "Just Test Message",
    "content": "<h1>Hello This is test message</h1>",
    "type": "text/html"
}'
```

### 发送纯文本邮件

```shell
curl -X POST -L https://custom.yourdomain.com/v1/send \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer {ACCESS_TOKEN}' \
-d '{
    "to": "you@example.com",
    "title": "Just Test Message",
    "content": "Hello This is test message. ",
    "type": "text/plain"
}'
```

### 发送模板邮件

```shell

curl -X POST -L https://custom.yourdomain.com/v1/send/activation \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer {ACCESS_TOKEN}' \
-d '{
    "to": "you@example.com",
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
- https://blog.mailchannels.com/what-is-dmarc/
- https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/
- https://www.cloudflare.com/en-ca/learning/dns/dns-records/dns-dkim-record/
- https://github.com/cloudsecurityalliance/webfinger.io/blob/main/docs.webfinger.io/DKIM-setup.md