# Merchant Templates

Use this file when selecting the template and collecting a merchant spec.

## Shared required fields

Every merchant spec must provide:

- `merchant_slug`
- `merchant_name`
- `template_id`
- `intro`
- `hours`
- `locations`
- `contact_channels`
- `catalog_items`
- `visit_info`
- `service_info`
- `policy_info`
- `latest_updates`

Optional but strongly recommended:

- `brand_voice`
- `brand_keywords`
- `blind_spot_guidance`

## Template guide

### `cafe`

Best for coffee shops and roasters.

Collect these concepts:

- signature drinks or beans
- seating, plugs, Wi-Fi, quietness
- dine-in vs takeaway
- pet policy or laptop friendliness
- workshop or community events

Typical user questions:

- “What should I order?”
- “Is there Wi-Fi and plugs?”
- “Can I work there?”
- “Do you have beans for takeaway?”

### `bar`

Best for cocktail bars, taprooms, and music bars.

Collect these concepts:

- signature drinks
- reservation flow
- opening hours and late-night cutoff
- minimum spend or cover charge
- performance or DJ schedule

Typical user questions:

- “Do I need a reservation?”
- “Is there a minimum spend?”
- “What are your signature drinks?”
- “What time is the live set?”

### `restaurant`

Best for restaurants and casual dining stores.

Collect these concepts:

- signature dishes or category highlights
- reservation or queue method
- takeaway or delivery
- room or seating notes
- dietary reminders or taboos

Typical user questions:

- “What should I order?”
- “Can I book a table?”
- “Do you offer delivery?”
- “Where is the store?”

### `florist`

Best for flower shops and bouquet studios.

Collect these concepts:

- bouquet types or floral styles
- budget range
- same-day delivery or pickup
- festival ordering rules
- flower care guidance

Typical user questions:

- “What bouquet fits this budget?”
- “Can you do same-day delivery?”
- “How early should I reserve for a festival?”
- “How do I care for the flowers?”

### `tea_dessert`

Best for milk tea shops, dessert bars, and cake studios.

Collect these concepts:

- signature drinks or desserts
- sweetness and ice customisation
- preorder rules
- delivery
- new releases or collaborations

Typical user questions:

- “What is your signature item?”
- “Can I customise sweetness?”
- “Can I preorder a cake?”
- “Do you have any new collab items?”

### `livehouse`

Best for live houses and small performance venues.

Collect these concepts:

- schedule highlights
- ticketing path
- entry time and queue rules
- bag storage or prohibited items
- standing vs seated setup

Typical user questions:

- “Who is playing this week?”
- “How do I buy tickets?”
- “When does entry open?”
- “Is there bag storage?”

### `tabletop_experience`

Best for board-game stores, murder mystery venues, and escape rooms.

Collect these concepts:

- themes or recommended scenarios
- group size and duration
- reservation flow
- beginner suitability
- age rules, safety rules, late arrival policy

Typical user questions:

- “What do you recommend for beginners?”
- “How many people do we need?”
- “How long does it take?”
- “Do we have to book first?”

## MerchantSpec example

```json
{
  "merchant_slug": "jinguyuan-dumpling",
  "merchant_name": "金谷园饺子馆",
  "template_id": "restaurant",
  "intro": "北邮旁边的饺子馆。",
  "hours": "10:00-22:00",
  "locations": [
    {
      "name": "北邮店",
      "address": "杏坛路文教产业园K座南2层"
    }
  ],
  "contact_channels": [
    {
      "name": "大众点评",
      "label": "排队与门店信息",
      "value": "搜索 金谷园饺子馆"
    }
  ],
  "catalog_items": [
    {
      "name": "鲅鱼饺子",
      "summary": "皮薄馅大，现包现煮。",
      "tags": ["招牌"]
    }
  ],
  "visit_info": {
    "summary": "到店排队取号为主。",
    "bullets": [
      "可通过大众点评或美团搜索门店信息。",
      "高峰期建议提前到店。"
    ]
  },
  "service_info": {
    "summary": "支持堂食、外卖、生饺子打包。",
    "bullets": [
      "可在外卖平台搜索门店。",
      "生饺子带走后建议尽快煮或冷冻保存。"
    ]
  },
  "policy_info": {
    "summary": "请以门店现场说明为准。",
    "bullets": [
      "菜单细节和价格以现场或平台为准。"
    ]
  },
  "latest_updates": [
    {
      "title": "Skill 发布",
      "details": "商家已上线自己的 Skill。",
      "date": "2026-04-08"
    }
  ],
  "brand_voice": {
    "personality": "warm_and_honest",
    "do": ["实在", "有温度"],
    "avoid": ["夸张营销"]
  },
  "brand_keywords": ["现包现煮", "皮薄馅大"]
}
```
