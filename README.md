<div align="center">

# 门店.skill

### 把线下门店蒸馏成 AI Skill

![License](https://img.shields.io/badge/license-MIT-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-black) ![MCP](https://img.shields.io/badge/output-MCP%20Skill-purple)

你的店开了很多年，顾客还是只能在地图、点评、团购和公众号里一点点拼出你是谁？  
菜单、活动、营业时间、排队方式散落在不同平台，AI 问起来却只能得到一段模糊介绍？  
你的店明明有自己的风格、自己的规则、自己的招牌，但在 AI 眼里还只是“附近的一家店”？  

让线下门店也拥有自己的 Skill。  

提供商家的原材料，加上你的主观描述  
生成一个真正像这家店的 AI Skill  
让 AI 知道它卖什么、几点开门、怎么排队、什么能说、什么不能乱说  

`门店.skill` 是一个用来生成商家 Skill 的 Skill。  
仓库名：`merchant-skill-generator`

[效果示例](#效果示例) · [支持类目](#支持类目) · [安装](#安装) · [使用](#使用)

</div>

* * *

## 效果示例

下面不是“它大概能答什么”，而是更接近真实安装后的使用感受。

你得到的不是一组冷冰冰的字段，而是一个：

- 会串联多个工具回答问题的门店 Skill
- 知道门店风格和说话方式的 AI 助手
- 遇到盲区会收住，不会乱编的商家代理

### 示例 1：餐厅 · 像一个真的店员

用户：

```text
今晚想去金谷园吃，北邮店还开着吗？第一次去推荐点什么？高峰怎么排队？
```

Skill 背后调用：

```text
get_restaurant_info
get_signature_dishes
get_queue_info
```

AI 回答效果：

```text
可以，金谷园每天 10:00-22:00 营业，北邮店在杏坛路文教产业园 K 座南 2 层。

如果你第一次去，可以先从店里的招牌饺子和锅贴点起，比较稳，也最能吃到这家店的感觉。

堂食高峰建议早点到店取号，具体排队节奏还是以门店当天情况为准。
如果你不想扑空，也可以先去大众点评或美团看一下门店实时信息。
```

这个感觉更像：

- 一个熟悉门店信息的店员
- 不是地图摘要
- 也不是一段泛泛的美食介绍

### 示例 2：咖啡店 · 不只是会答，还会给氛围判断

用户：

```text
我下午想带电脑过去坐两三个小时，有插座吗？第一次去点什么合适？如果喜欢的话能顺手买豆子带走吗？
```

Skill 背后调用：

```text
get_workspace_info
get_menu_info
get_takeaway_info
```

AI 回答效果：

```text
可以，工作日白天会更适合。店里有 Wi-Fi 和插座，靠窗的位置插座会更多一些。

如果你是第一次去，比较稳的点法可以先从店里的招牌拿铁或者当周手冲开始，看你更想要轻松一点还是更想喝到豆子的风味线索。

如果喝得喜欢，店里也支持咖啡豆零售，可以按 100g 或 250g 带走。
如果你想久坐，尽量避开周末下午的高峰时段。
```

这类回答的重点不是“把字段念出来”，而是：

- 既回答事实
- 也回答场景判断
- 听起来像真的懂这家店会怎么被使用

### 示例 3：Live House · 知道边界，不乱装懂

用户：

```text
周末那场怎么买票？几点进场？能寄包吗？相机能不能带进去？
```

Skill 背后调用：

```text
get_ticket_info
get_on_site_info
get_entry_rules
```

AI 回答效果：

```text
建议提前在票务平台买票，演出日通常会提前开放入场。
一般至少提前 30 分钟到场更稳，热门专场可能会有排队安检。

寄存和现场服务要看当晚安排，部分活动会在公告里单独写清楚。

相机这类入场限制，我不建议先替现场拍板。这个最好以当晚公告或场地方实时通知为准，
这样不会让你白跑一趟。
```

这一段很重要，因为它展示了这个项目真正想做的事：

- 不只是把商家资料做成问答
- 而是把门店整理成一个像“商家定制 AI 助手”那样的 Skill
- 它知道事实、知道语气、也知道哪些地方不能乱说

* * *

## 支持类目

V1 内置 7 个模板：

- `cafe`
- `bar`
- `restaurant`
- `florist`
- `tea_dessert`
- `livehouse`
- `tabletop_experience`

覆盖的典型场景：

- 咖啡店
- 酒吧
- 餐厅
- 花店
- 奶茶店 / 甜品店
- Live House
- 桌游店 / 剧本杀 / 密室

它们不是只换字段名。  
每个模板都会生成更接近门店成品 Skill 的业务化工具名。

例如：

### `restaurant`

- `get_restaurant_info`
- `get_signature_dishes`
- `get_queue_info`
- `get_delivery_info`
- `get_dining_rules`
- `get_latest_news`

### `cafe`

- `get_cafe_info`
- `get_menu_info`
- `get_workspace_info`
- `get_takeaway_info`
- `get_house_rules`
- `get_latest_news`

### `livehouse`

- `get_livehouse_info`
- `get_schedule_info`
- `get_ticket_info`
- `get_on_site_info`
- `get_entry_rules`
- `get_latest_news`

* * *

## 使用场景

### 场景 1：快速生成一个餐厅 Skill

```text
帮我生成一个像金谷园那样的餐厅 Skill。
店名是金谷园饺子馆，北邮和五道口各有一家店。
希望它能回答门店信息、排队、外卖和最近动态。
```

### 场景 2：给一家咖啡馆做成 AI 可调用对象

```text
我想给一家社区咖啡馆做 Skill。
重点是招牌咖啡、插座 Wi-Fi、工作友好度、外带和活动。
最后给我 GitHub-ready 仓库。
```

### 场景 3：给 Live House 做演出 Skill

```text
帮一家 Live House 生成 Skill。
要覆盖排期、购票、入场、寄存和现场须知。
最后给我安装文案和 CloudBase 部署脚本。
```

### 场景 4：批量造商家样板

```text
按同样风格，分别帮我生成咖啡店、酒吧、花店、桌游店四个样板仓库。
```

* * *

## 安装

### Claude Code

> 重要：Claude Code 会从当前 git 仓库根目录的 `.claude/skills/` 查找 skill。请在正确的位置执行。

安装到当前项目：

```bash
mkdir -p .claude/skills
git clone https://github.com/<your-name>/merchant-skill-generator .claude/skills/merchant-skill-generator
```

安装到全局：

```bash
git clone https://github.com/<your-name>/merchant-skill-generator ~/.claude/skills/merchant-skill-generator
```

### 本地依赖

```bash
cd merchant-skill-generator
npm install
```

* * *

## 环境要求

- Node.js 18+
- Claude Code 或其他支持本地 Skill 工作流的环境
- 如果你要跑 CLI 生成器，需要本地可执行 `npm`
- 如果你要把生成出来的 Skill 变成公网可用版本，需要自行部署 Tencent CloudBase

不需要：

- Docker
- GPU
- 自建模型
- 在线后台

* * *

## 使用

### 方式一：把它当作 Skill 使用

安装到 Claude Code 后，直接用自然语言描述你的目标。

例如：

```text
帮我生成一个像金谷园那样的餐厅 Skill
```

```text
我要给一家 Live House 做 Skill，覆盖排期、票务、入场和现场须知
```

```text
根据这份商家资料，生成一个咖啡店 Skill 仓库，最后给我部署说明
```

推荐输入内容包括：

- 商家名称
- 一句话介绍
- 营业时间
- 门店地址
- 联系渠道
- 主售内容 / 招牌内容
- 到店方式
- 服务方式
- 规则说明
- 最新动态
- 品牌语气
- 不能乱说的边界

### 方式二：直接走 CLI

如果你已经有结构化商家资料，可以直接用 CLI 生成：

```bash
npm run generate -- \
  --spec examples/specs/jinguyuan-restaurant.json \
  --out ./.tmp/output
```

输出目录：

```text
./.tmp/output/<merchant-slug>-skill
```

* * *

## 运行逻辑

这个项目的运行逻辑可以概括成 6 步：

1. 选择模板  
   先确定它更像咖啡店、酒吧、餐厅、花店还是演出空间。

2. 采集商家资料  
   包括门店信息、招牌内容、服务方式、规则说明、品牌语气和盲区边界。

3. 匹配模板工具  
   不是统一生成抽象工具，而是按行业产出更贴近业务的工具名和问法。

4. 生成仓库  
   写出 `README.md`、`SKILL.md`、`skill.json`、MCP 后端和部署脚本。

5. 作者部署  
   作者自己上传 GitHub / Gitee，并部署 CloudBase。

6. 最终用户使用  
   用户只需要在客户端里配置 MCP 地址，然后直接提问。

也就是说，这个项目明确区分了两层体验：

- **作者体验**：生成、上传、部署
- **终端用户体验**：安装、提问、得到回答

* * *

## 生成出来以后怎么用

这里分两层。

### 1. 你作为作者

生成器会产出一个新的商家 Skill 仓库。  
你接下来要做的是：

1. 上传到 GitHub 或 Gitee
2. 部署 `server/` 到 Tencent CloudBase
3. 运行发布脚本替换占位 URL
4. 把最终仓库公开出去

### 2. 终端用户

终端用户不会接触生成过程。  
他们看到的是一个已经成型的商家 Skill 仓库，然后：

1. 把 MCP URL 配进客户端
2. 直接问问题
3. AI 自动调工具返回答案

这也是整个项目的目标：

> 生成出来的 `xxx Skill`，最终使用体验尽量接近已经公开出圈的商家 Skill。

* * *

## 功能特性

### 1. 行业模板化

内置 7 个高频线下门店模板，不需要从零定义协议。

### 2. 业务化工具生成

每个模板生成的是行业语义明确的工具，不是统一抽象工具名。

### 3. 品牌语气建模

生成结果会带上品牌口吻、避免用语、关键词和盲区边界。

### 4. 一店一后端

每个商家生成自己的独立 Skill 仓库和 MCP 后端，不走共享多租户。

### 5. GitHub-ready

生成结果不是片段 prompt，而是一整个可发布仓库。

### 6. CloudBase-ready

默认输出适合 Tencent CloudBase 的部署辅助脚本。

### 7. 内容传播友好

除了技术文件，还会生成：

- 安装文案
- 发布文案
- MCP 客户端配置示例

### 8. 本地可验证

支持重新生成样例并启动本地 MCP 服务进行 smoke test。

* * *

## 本地验证

生成并验证全部样例：

```bash
npm run validate
```

这会做三件事：

1. 重新生成 7 个模板样例
2. 校验关键文件是否存在
3. 对餐厅样例启动本地 MCP 服务并跑 smoke test

当前内置样例包括：

- `jinguyuan-dumpling`
- `daybreak-cafe`
- `haze-bar`
- `bloom-florist`
- `cloud-tea-dessert`
- `echo-livehouse`
- `night-owl-tabletop`

* * *

## 项目结构

```text
merchant-skill-generator/
├── SKILL.md
├── README.md
├── src/
│   ├── definitions.ts
│   └── generator.ts
├── scripts/
│   ├── generate.ts
│   └── validate.ts
├── examples/
│   └── specs/
├── evals/
│   └── evals.json
└── references/
    └── templates.md
```

* * *

## 它不做什么

这个项目明确 **不负责**：

- 自动托管
- 自动发版
- 在线商家后台
- 多租户管理
- 预约、支付、下单
- 代替商家维护实时业务系统

它只负责一件事：

> 生成一个像公开成品一样的商家 Skill 仓库。

* * *

## 致谢

这个项目的直接灵感，来自已经公开出圈的商家 Skill 形态，尤其是：

- [JinGuYuan/jinguyuan-dumpling-skill](https://github.com/JinGuYuan/jinguyuan-dumpling-skill)
- [JinGuYuan/jinguyuan-dumpling-skill](https://gitee.com/JinGuYuan/jinguyuan-dumpling-skill)

感谢这个原始 Skill 提供了一个非常清楚的启发：

> 一家线下门店，也可以被整理成一个 AI 能接触、能调用、能转述的对象。

## License

MIT
