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


## 添加 MailChannel 的 DKIM 支持

1. 使用`openssl`生成 DKIM 凭据 （包含公钥、私钥）

    ```shell
    openssl genrsa 2048 | tee private_key.pem | openssl rsa -outform der | openssl base64 -A > private_key.txt
    ```

    `openssl genrsa 2048`生成 2048 位 RSA 密钥。 输出被传递到 `tee private_key.pem`，它将密钥写入 `private_key.pem` 文件，并将密钥传递给 `openssl rsa -outform der | openssl base 64 -A`，它将密钥从 PEM 格式转换为 DER 格式，然后对其进行 Base64 编码。 将此输出带入 `> private_key.txt` 将内容保存到 `private_key.txt`. 

    ```shell
    echo -n "v=DKIM1;p=" > dkim_record.txt && openssl rsa -in private_key.pem -pubout -outform der | openssl base64 -A >> dkim_record.txt
    ```
    这会根据私钥创建公钥（ `openssl rsa -in priv_key.pem -pubout -outform der` )，将其编码为 base64 ( `openssl base 64 -A`），最后将其写入 `dkim_record.txt` 文件。 

1. 在 “帐户主页” 中，选择您要为其添加 DKIM 记录的网站。
2. 选择 DNS > 记录 > 添加记录 。
3. 添加以下 TXT DNS 记录：

   | Type | Name | Content                                                                    |
   | ---- | ---- | -------------------------------------------------------------------------- |
   | TXT  | mailchannels._domainkey    | `dkim_record.txt`中的内容 |

   >  `._domainkey`前可以设置任何值 因为使用 `mailchannels`发送邮件 为了方便标识记忆，所以推荐使用`mailchannels._domainkey`

4. 修改`_dmarc`DNS记录

   | Type | Name | Content                                                                    |
   | ---- | ---- | -------------------------------------------------------------------------- |
   | TXT  | _dmarc    | "v=DMARC1; p=reject; adkim=s; aspf=s; pct=100; fo=1;" |

   - `p=reject`：策略指示，当邮件未能通过DMARC验证时，接收邮件服务器应拒绝此邮件。其他可能的值包括`none`（无特殊处理）和`quarantine`（将邮件标记为垃圾邮件）。
   - `adkim=s`：DKIM（DomainKeys Identified Mail）对齐模式，s表示严格对齐，要求DKIM签名域必须完全匹配。
   - `aspf=s`：SPF（Sender Policy Framework）对齐模式，s表示严格对齐，要求SPF的Return-Path域必须完全匹配。
   - `rua=mailto: xxxx@mail.com`
：Aggregate（汇总）报告的接收地址，域名所有者希望接收DMARC汇总报告的邮箱地址，汇总报告包含发送和接收的统计信息。
   - `ruf=mailto: xxxx@mail.com`
：Forensic（法证）报告的接收地址，域名所有者希望接收DMARC法证报告的邮箱地址，法证报告包含每封未通过DMARC验证的邮件的详细信息。
   - `pct=100`：策略的适用百分比，这里是100%，表示DMARC策略适用于所有的邮件。
   - `fo=1`：Failure reporting options（失败报告选项），fo=1表示只要有DMARC验证失败的情况就会生成法证报告。其他可能的值包括0（从不生成法证报告）、d（只有DKIM失败时生成法证报告）和s（只有SPF失败时生成法证报告）。

## 部署

1. 克隆该项目

   `git clone https://github.com/devcxl/cloudflare-email-sender`

2. 修改 wrangeler 配置

   将`wrangler.example.toml` 重命名为 `wrangler.toml`

   修改`wrangler.toml`中的配置项
   - `SENDER_EMAIL`：发送邮件的邮箱
   - `SENDER_NAME`：发信人名称
   - `DKIM_DOMAIN`：DKIM发信二级域名
   - `DKIM_SELECTOR`：DKIM选择器 设置`._domainkey`前对应的值即可


3. 部署

   1. 运行`npm i`安装依赖。
   2. 运行`npm run deploy`并根据提示登陆你的 Cloudfalre 账号并部署
   3. 运行`openssl rand -base64 32`生成随机密钥
   4. 运行`npx wrangler secret put ACCESS_TOKEN`设置访问随机密钥
   5. 运行`npx wrangler secret put DKIM_PRIVATE_KEY`设置DKIM生成的私钥文本文件`private_key.txt`中的内容

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

### 发送纯文本邮件

```shell
curl -X POST -L https://custom.yourdomain.com/v1/send \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer {ACCESS_TOKEN}' \
-d '{
    "to": "you@example.com",
    "name": "Jone",
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
- https://blog.mailchannels.com/what-is-dmarc/
- https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/
- https://www.cloudflare.com/en-ca/learning/dns/dns-records/dns-dkim-record/
- https://github.com/cloudsecurityalliance/webfinger.io/blob/main/docs.webfinger.io/DKIM-setup.md