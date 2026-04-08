export type TemplateId =
  | "cafe"
  | "bar"
  | "restaurant"
  | "florist"
  | "tea_dessert"
  | "livehouse"
  | "tabletop_experience";

export type ToolSource = "store" | "catalog" | "visit" | "service" | "policy" | "updates";

export interface MerchantLocation {
  name: string;
  address: string;
  notes?: string;
}

export interface ContactChannel {
  name: string;
  label: string;
  value: string;
  url?: string;
}

export interface CatalogItem {
  name: string;
  summary: string;
  price_note?: string;
  tags?: string[];
}

export interface SectionInfo {
  summary: string;
  bullets: string[];
}

export interface UpdateItem {
  title: string;
  details: string;
  date?: string;
}

export interface BrandVoice {
  personality: string;
  do: string[];
  avoid: string[];
  signature_phrases?: string[];
}

export interface BlindSpotGuidance {
  unknown_topics: string[];
  escalation_channels: string[];
  fallback_copy: string;
}

export interface MerchantSpec {
  merchant_slug: string;
  merchant_name: string;
  template_id: TemplateId;
  intro: string;
  hours: string;
  locations: MerchantLocation[];
  contact_channels: ContactChannel[];
  catalog_items: CatalogItem[];
  visit_info: SectionInfo;
  service_info: SectionInfo;
  policy_info: SectionInfo;
  latest_updates: UpdateItem[];
  brand_voice?: Partial<BrandVoice>;
  brand_keywords?: string[];
  blind_spot_guidance?: Partial<BlindSpotGuidance>;
}

export interface ToolDefinition {
  source: ToolSource;
  name: string;
  display_name: string;
  description: string;
  trigger_examples: string[];
  response_summary: string;
}

export interface ToolBlueprint extends Omit<ToolDefinition, "description"> {
  description_template: string;
}

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  aliases: string[];
  description: string;
  requiredConcepts: string[];
  optionalConcepts: string[];
  sampleQuestions: string[];
  defaultBrandVoice: BrandVoice;
  defaultBrandKeywords: string[];
  defaultBlindSpots: BlindSpotGuidance;
  toolBlueprints: ToolBlueprint[];
}

export interface NormalizedMerchantSpec
  extends Omit<MerchantSpec, "brand_voice" | "blind_spot_guidance" | "brand_keywords"> {
  brand_voice: BrandVoice;
  brand_keywords: string[];
  blind_spot_guidance: BlindSpotGuidance;
}

export const TEMPLATE_DEFINITIONS: Record<TemplateId, TemplateDefinition> = {
  cafe: {
    id: "cafe",
    label: "咖啡店",
    aliases: ["咖啡店", "咖啡馆", "roastery", "cafe"],
    description: "适合咖啡店、烘焙咖啡吧和有明显社群属性的门店。",
    requiredConcepts: ["招牌咖啡或豆单", "座位与插座", "Wi-Fi 与工作友好度", "外带或堂食规则"],
    optionalConcepts: ["宠物友好", "社区活动", "豆子零售"],
    sampleQuestions: ["有什么招牌咖啡？", "有 Wi-Fi 和插座吗？", "适合办公吗？", "可以带豆子走吗？"],
    defaultBrandVoice: {
      personality: "calm_and_curated",
      do: ["具体", "有品味", "不端着"],
      avoid: ["过度营销", "空泛形容词", "冒充咖啡专家语气"],
      signature_phrases: ["今日推荐", "店内氛围", "风味线索"]
    },
    defaultBrandKeywords: ["手冲", "特调", "社区感", "到店坐坐"],
    defaultBlindSpots: {
      unknown_topics: ["豆子库存实时数量", "临时座位变动", "未公开折扣"],
      escalation_channels: ["电话联系门店", "到店咨询", "查看官方社媒"],
      fallback_copy: "这个细节我不敢替店里临时拍板。建议直接联系门店，能拿到更准确的答复。"
    },
    toolBlueprints: [
      {
        source: "store",
        name: "get_cafe_info",
        display_name: "门店信息",
        description_template: "查询“{merchant}”的基本信息。返回门店简介、营业时间、地址和联系渠道。",
        trigger_examples: ["介绍一下{merchant}", "{merchant}在哪？", "{merchant}几点开门？"],
        response_summary: "返回咖啡馆简介、营业时间和地址"
      },
      {
        source: "catalog",
        name: "get_menu_info",
        display_name: "菜单与豆单",
        description_template: "获取“{merchant}”的招牌咖啡、豆单亮点和推荐项。",
        trigger_examples: ["有什么招牌咖啡？", "这周豆单有什么？", "第一次去点什么？"],
        response_summary: "返回招牌咖啡、豆单亮点和推荐项"
      },
      {
        source: "visit",
        name: "get_workspace_info",
        display_name: "到店与座位",
        description_template: "获取“{merchant}”的到店氛围、座位、插座、Wi-Fi 和工作友好度信息。",
        trigger_examples: ["有 Wi-Fi 和插座吗？", "适合带电脑吗？", "周末容易满座吗？"],
        response_summary: "返回座位、插座、Wi-Fi 和到店氛围"
      },
      {
        source: "service",
        name: "get_takeaway_info",
        display_name: "外带与零售",
        description_template: "获取“{merchant}”的外带、零售咖啡豆和活动服务信息。",
        trigger_examples: ["可以外带吗？", "咖啡豆能带走吗？", "店里有什么活动？"],
        response_summary: "返回外带、零售和活动服务信息"
      },
      {
        source: "policy",
        name: "get_house_rules",
        display_name: "门店规则",
        description_template: "获取“{merchant}”的到店提醒、宠物友好和使用规则。",
        trigger_examples: ["店里有什么要注意的？", "宠物友好吗？", "长时间办公有限制吗？"],
        response_summary: "返回到店提醒和使用规则"
      },
      {
        source: "updates",
        name: "get_latest_news",
        display_name: "最新动态",
        description_template: "获取“{merchant}”最近公开更新的活动、上新和特别营业安排。",
        trigger_examples: ["最近有什么新活动？", "最近有什么上新？", "这周有特别安排吗？"],
        response_summary: "返回最新活动、上新和特别营业安排"
      }
    ]
  },
  bar: {
    id: "bar",
    label: "酒吧",
    aliases: ["酒吧", "cocktail bar", "taproom", "bar"],
    description: "适合鸡尾酒吧、精酿吧和有演出/驻场的夜生活门店。",
    requiredConcepts: ["招牌酒单", "订位方式", "营业时段", "低消或入场规则"],
    optionalConcepts: ["DJ/驻唱", "Happy Hour", "包场"],
    sampleQuestions: ["要预约吗？", "有什么招牌酒？", "有没有低消？", "今晚有驻唱吗？"],
    defaultBrandVoice: {
      personality: "sharp_and_grounded",
      do: ["直接", "有氛围", "不装腔"],
      avoid: ["浮夸夜店文案", "含糊其辞", "过量饮酒暗示"],
      signature_phrases: ["今晚氛围", "招牌酒", "入场提醒"]
    },
    defaultBrandKeywords: ["signature cocktail", "夜场", "订位", "现场氛围"],
    defaultBlindSpots: {
      unknown_topics: ["实时座位库存", "未公布嘉宾", "临时酒单替换"],
      escalation_channels: ["店内电话", "官方社媒", "门店前台"],
      fallback_copy: "这个我不想替现场做不准的判断。建议直接联系门店确认，当天信息最准。"
    },
    toolBlueprints: [
      {
        source: "store",
        name: "get_bar_info",
        display_name: "门店信息",
        description_template: "查询“{merchant}”的基本信息。返回门店简介、营业时间、地址和联系渠道。",
        trigger_examples: ["介绍一下{merchant}", "{merchant}在哪？", "{merchant}营业到几点？"],
        response_summary: "返回酒吧简介、营业时间和地址"
      },
      {
        source: "catalog",
        name: "get_drink_menu_info",
        display_name: "酒单与招牌",
        description_template: "获取“{merchant}”的招牌酒、酒单亮点和推荐点单方向。",
        trigger_examples: ["有什么招牌酒？", "第一次去喝什么？", "酒单有什么亮点？"],
        response_summary: "返回招牌酒和酒单亮点"
      },
      {
        source: "visit",
        name: "get_reservation_info",
        display_name: "订位与到场",
        description_template: "获取“{merchant}”的订位方式、walk-in 情况和到场建议。",
        trigger_examples: ["要预约吗？", "walk-in 可以吗？", "几点去比较合适？"],
        response_summary: "返回订位方式、walk-in 情况和到场建议"
      },
      {
        source: "service",
        name: "get_private_booking_info",
        display_name: "包场与服务",
        description_template: "获取“{merchant}”的包场、店内服务和当晚推荐方式。",
        trigger_examples: ["可以包场吗？", "店里会做口味推荐吗？", "有什么额外服务？"],
        response_summary: "返回包场和店内服务信息"
      },
      {
        source: "policy",
        name: "get_entry_rules",
        display_name: "低消与规则",
        description_template: "获取“{merchant}”的低消、入场提醒和门店规则。",
        trigger_examples: ["有没有低消？", "未成年人能进吗？", "入场有什么要注意的？"],
        response_summary: "返回低消、入场提醒和门店规则"
      },
      {
        source: "updates",
        name: "get_latest_news",
        display_name: "最新动态",
        description_template: "获取“{merchant}”最近公开更新的活动、驻场和特别安排。",
        trigger_examples: ["今晚有活动吗？", "最近有什么新安排？", "这周有 DJ 吗？"],
        response_summary: "返回最近活动、驻场和特别安排"
      }
    ]
  },
  restaurant: {
    id: "restaurant",
    label: "餐厅",
    aliases: ["餐厅", "饭馆", "restaurant", "diner"],
    description: "适合餐厅、小馆子和具备堂食/外卖能力的线下门店。",
    requiredConcepts: ["招牌菜或菜单结构", "排队或订位方式", "营业时间", "外卖或打包能力"],
    optionalConcepts: ["包间", "忌口提醒", "节日菜单"],
    sampleQuestions: ["推荐点什么？", "可以订位吗？", "怎么排队？", "支持外卖吗？"],
    defaultBrandVoice: {
      personality: "warm_and_honest",
      do: ["实在", "清楚", "像热心店员"],
      avoid: ["夸张营销", "没把握还硬答", "生硬客服腔"],
      signature_phrases: ["店里招牌", "到店方便", "建议以现场为准"]
    },
    defaultBrandKeywords: ["招牌", "到店", "热乎", "门店信息"],
    defaultBlindSpots: {
      unknown_topics: ["实时排队人数", "未公开菜品价格", "临时售罄"],
      escalation_channels: ["到店咨询", "大众点评/美团", "电话联系门店"],
      fallback_copy: "这个细节我没法替门店临时确认，怕说错耽误你。建议直接联系门店或看平台实时信息。"
    },
    toolBlueprints: [
      {
        source: "store",
        name: "get_restaurant_info",
        display_name: "餐厅信息",
        description_template: "查询“{merchant}”的基本信息。返回餐厅名称、简介、营业时间、所有门店地址。",
        trigger_examples: ["介绍一下{merchant}", "{merchant}在哪？", "{merchant}几点开门？"],
        response_summary: "返回餐厅名称、简介、营业时间和地址"
      },
      {
        source: "catalog",
        name: "get_signature_dishes",
        display_name: "菜单与招牌",
        description_template: "获取“{merchant}”的招牌菜、推荐点法和菜单亮点。",
        trigger_examples: ["推荐点什么？", "有什么招牌？", "第一次去怎么点？"],
        response_summary: "返回招牌菜、推荐点法和菜单亮点"
      },
      {
        source: "visit",
        name: "get_queue_info",
        display_name: "排队与到店",
        description_template: "获取“{merchant}”的排队、订位、取号和到店建议。",
        trigger_examples: ["怎么排队？", "怎么取号？", "高峰期怎么去更稳？"],
        response_summary: "返回排队、取号和到店建议"
      },
      {
        source: "service",
        name: "get_delivery_info",
        display_name: "外卖与打包",
        description_template: "获取“{merchant}”的外卖、打包带走和相关服务方式。",
        trigger_examples: ["能送外卖吗？", "可以打包吗？", "怎么点外卖？"],
        response_summary: "返回外卖、打包和服务方式"
      },
      {
        source: "policy",
        name: "get_dining_rules",
        display_name: "门店规则",
        description_template: "获取“{merchant}”的门店规则、体验须知和到店边界说明。",
        trigger_examples: ["有没有需要提前知道的规则？", "价格和库存以什么为准？", "店里有什么注意事项？"],
        response_summary: "返回门店规则和体验须知"
      },
      {
        source: "updates",
        name: "get_latest_news",
        display_name: "最新动态",
        description_template: "获取“{merchant}”最近公开更新的活动、上新和特别营业安排。",
        trigger_examples: ["最近有什么新消息？", "最近有什么活动？", "最近有什么更新？"],
        response_summary: "返回最近活动、上新和特别营业安排"
      }
    ]
  },
  florist: {
    id: "florist",
    label: "花店",
    aliases: ["花店", "florist", "bouquet studio"],
    description: "适合鲜花店、花艺工作室和节日预订型门店。",
    requiredConcepts: ["花束类型", "预算区间", "配送或自提", "养护建议"],
    optionalConcepts: ["节日档期", "定制花礼", "企业订花"],
    sampleQuestions: ["这个预算可以买什么花束？", "支持同城配送吗？", "节日要提前多久订？", "花怎么养？"],
    defaultBrandVoice: {
      personality: "gentle_and_practical",
      do: ["有画面感", "不矫情", "给实用建议"],
      avoid: ["空泛浪漫句子", "夸大花语", "承诺不确定时效"],
      signature_phrases: ["适合送谁", "预算范围", "养护提醒"]
    },
    defaultBrandKeywords: ["花束", "同城配送", "节日预订", "养护"],
    defaultBlindSpots: {
      unknown_topics: ["实时花材库存", "临时配送时段", "未确认定制细节"],
      escalation_channels: ["微信咨询", "电话联系", "门店客服"],
      fallback_copy: "这个要看当天花材和档期，我不想替店里先拍板。直接联系门店会更准。"
    },
    toolBlueprints: [
      {
        source: "store",
        name: "get_florist_info",
        display_name: "门店信息",
        description_template: "查询“{merchant}”的基本信息。返回门店简介、营业时间、地址和联系渠道。",
        trigger_examples: ["介绍一下{merchant}", "{merchant}在哪？", "几点可以联系你们？"],
        response_summary: "返回花店简介、营业时间和地址"
      },
      {
        source: "catalog",
        name: "get_bouquet_info",
        display_name: "花束与款式",
        description_template: "获取“{merchant}”的花束类型、预算方向和推荐款式。",
        trigger_examples: ["这个预算可以买什么花束？", "你们主打什么风格？", "适合送朋友的花束有哪些？"],
        response_summary: "返回花束类型、预算方向和推荐款式"
      },
      {
        source: "visit",
        name: "get_pickup_info",
        display_name: "自提与预订",
        description_template: "获取“{merchant}”的到店自提、预订节奏和节日前建议。",
        trigger_examples: ["可以到店自提吗？", "节日要提前多久订？", "什么时候联系比较稳？"],
        response_summary: "返回自提、预订和节日前建议"
      },
      {
        source: "service",
        name: "get_delivery_info",
        display_name: "配送与定制",
        description_template: "获取“{merchant}”的同城配送、定制花礼和企业订花服务信息。",
        trigger_examples: ["支持同城配送吗？", "可以做定制花礼吗？", "企业订花怎么沟通？"],
        response_summary: "返回配送、定制和企业订花服务信息"
      },
      {
        source: "policy",
        name: "get_care_guide",
        display_name: "养护与须知",
        description_template: "获取“{merchant}”的养护建议、档期提醒和下单须知。",
        trigger_examples: ["花怎么养？", "当天花材能保证吗？", "有什么需要提前知道的？"],
        response_summary: "返回养护建议、档期提醒和下单须知"
      },
      {
        source: "updates",
        name: "get_latest_news",
        display_name: "最新动态",
        description_template: "获取“{merchant}”最近公开更新的上新、节日预售和特别安排。",
        trigger_examples: ["最近有什么上新？", "节日预售开始了吗？", "最近有什么消息？"],
        response_summary: "返回最近上新、节日预售和特别安排"
      }
    ]
  },
  tea_dessert: {
    id: "tea_dessert",
    label: "奶茶甜品店",
    aliases: ["奶茶店", "甜品店", "tea", "dessert"],
    description: "适合奶茶店、甜品店、蛋糕工作室等偏年轻消费的门店。",
    requiredConcepts: ["招牌单品", "甜度/冰量或口味定制", "预订规则", "配送能力"],
    optionalConcepts: ["联名活动", "节日限定", "蛋糕定制"],
    sampleQuestions: ["你们招牌是什么？", "可以调甜度吗？", "蛋糕能预订吗？", "最近有新品吗？"],
    defaultBrandVoice: {
      personality: "bright_but_clear",
      do: ["轻快", "不幼稚", "信息明确"],
      avoid: ["过头可爱", "含糊其辞", "强行制造稀缺感"],
      signature_phrases: ["今日推荐", "定制选项", "上新提醒"]
    },
    defaultBrandKeywords: ["上新", "联名", "甜度", "预订"],
    defaultBlindSpots: {
      unknown_topics: ["实时库存", "临时售罄", "未公开联名时间"],
      escalation_channels: ["小程序/外卖平台", "门店电话", "官方社媒"],
      fallback_copy: "这个我不敢替店里临时确认，建议直接看门店当天上架信息会更准确。"
    },
    toolBlueprints: [
      {
        source: "store",
        name: "get_shop_info",
        display_name: "门店信息",
        description_template: "查询“{merchant}”的基本信息。返回门店简介、营业时间、地址和联系渠道。",
        trigger_examples: ["介绍一下{merchant}", "{merchant}在哪？", "几点营业？"],
        response_summary: "返回门店简介、营业时间和地址"
      },
      {
        source: "catalog",
        name: "get_menu_info",
        display_name: "菜单与招牌",
        description_template: "获取“{merchant}”的招牌饮品、甜品亮点和推荐点单方向。",
        trigger_examples: ["你们招牌是什么？", "第一次来点什么？", "最近主推哪款甜品？"],
        response_summary: "返回招牌饮品、甜品亮点和推荐点单方向"
      },
      {
        source: "visit",
        name: "get_ordering_info",
        display_name: "到店与点单",
        description_template: "获取“{merchant}”的到店点单、甜度冰量和口味定制信息。",
        trigger_examples: ["可以调甜度吗？", "冰量能选吗？", "到店怎么点比较方便？"],
        response_summary: "返回点单、甜度冰量和口味定制信息"
      },
      {
        source: "service",
        name: "get_delivery_info",
        display_name: "配送与预订",
        description_template: "获取“{merchant}”的外卖配送、甜品预订和定制服务信息。",
        trigger_examples: ["可以配送吗？", "蛋糕能预订吗？", "整盒甜品怎么订？"],
        response_summary: "返回配送、预订和定制服务信息"
      },
      {
        source: "policy",
        name: "get_order_rules",
        display_name: "点单规则",
        description_template: "获取“{merchant}”的供应规则、售罄提醒和点单须知。",
        trigger_examples: ["限定会提前卖完吗？", "配送时效看哪里？", "有什么需要提前知道的？"],
        response_summary: "返回供应规则、售罄提醒和点单须知"
      },
      {
        source: "updates",
        name: "get_latest_news",
        display_name: "最新动态",
        description_template: "获取“{merchant}”最近公开更新的新品、联名和特别活动安排。",
        trigger_examples: ["最近有什么新品？", "最近有联名吗？", "最近有什么新消息？"],
        response_summary: "返回新品、联名和特别活动安排"
      }
    ]
  },
  livehouse: {
    id: "livehouse",
    label: "Live House",
    aliases: ["live house", "livehouse", "演出空间", "现场演出"],
    description: "适合 Live House、独立演出空间和小型音乐现场。",
    requiredConcepts: ["演出排期", "购票方式", "入场时间", "寄存或违禁提醒"],
    optionalConcepts: ["站席/坐席", "酒水服务", "周边"],
    sampleQuestions: ["这周谁演？", "怎么买票？", "几点进场？", "能寄包吗？"],
    defaultBrandVoice: {
      personality: "direct_and_scene_aware",
      do: ["现场感强", "信息明确", "不煽情"],
      avoid: ["虚假售罄感", "制造焦虑", "模糊演出规则"],
      signature_phrases: ["本周排期", "进场提醒", "现场须知"]
    },
    defaultBrandKeywords: ["演出排期", "进场", "票务", "现场须知"],
    defaultBlindSpots: {
      unknown_topics: ["临时嘉宾", "临时改期", "未公布票务库存"],
      escalation_channels: ["票务平台", "官方社媒", "场地方客服"],
      fallback_copy: "这个要以场地方当天公告为准，我先不替现场下结论。建议直接看官方票务或社媒。"
    },
    toolBlueprints: [
      {
        source: "store",
        name: "get_livehouse_info",
        display_name: "场地信息",
        description_template: "查询“{merchant}”的基本信息。返回场地简介、营业时段、地址和联系渠道。",
        trigger_examples: ["介绍一下{merchant}", "场地在哪？", "演出日几点开门？"],
        response_summary: "返回场地简介、营业时段和地址"
      },
      {
        source: "catalog",
        name: "get_schedule_info",
        display_name: "演出排期",
        description_template: "获取“{merchant}”的演出排期、演出内容和近期亮点。",
        trigger_examples: ["这周谁演？", "最近有什么专场？", "排期怎么安排？"],
        response_summary: "返回演出排期和近期亮点"
      },
      {
        source: "visit",
        name: "get_ticket_info",
        display_name: "票务与到场",
        description_template: "获取“{merchant}”的购票方式、到场时间和排队建议。",
        trigger_examples: ["怎么买票？", "几点进场？", "需要提前多久到？"],
        response_summary: "返回购票方式、到场时间和排队建议"
      },
      {
        source: "service",
        name: "get_on_site_info",
        display_name: "现场服务",
        description_template: "获取“{merchant}”的现场酒水、周边、寄存和服务信息。",
        trigger_examples: ["能寄包吗？", "现场有酒水吗？", "会卖周边吗？"],
        response_summary: "返回现场酒水、周边、寄存和服务信息"
      },
      {
        source: "policy",
        name: "get_entry_rules",
        display_name: "入场规则",
        description_template: "获取“{merchant}”的入场规则、违禁提醒和现场须知。",
        trigger_examples: ["入场有什么要注意的？", "有什么不能带？", "站席还是坐席？"],
        response_summary: "返回入场规则、违禁提醒和现场须知"
      },
      {
        source: "updates",
        name: "get_latest_news",
        display_name: "最新动态",
        description_template: "获取“{merchant}”最近公开更新的演出通知、加场和特别安排。",
        trigger_examples: ["最近有什么新消息？", "有加场吗？", "最近有新公告吗？"],
        response_summary: "返回最近演出通知、加场和特别安排"
      }
    ]
  },
  tabletop_experience: {
    id: "tabletop_experience",
    label: "桌游剧本密室店",
    aliases: ["桌游", "剧本杀", "密室", "board game", "escape room"],
    description: "适合桌游店、剧本杀门店、密室等偏体验型门店。",
    requiredConcepts: ["推荐主题", "人数与时长", "预约方式", "新手是否适合"],
    optionalConcepts: ["年龄限制", "安全提醒", "迟到规则"],
    sampleQuestions: ["新手玩什么？", "几个人合适？", "一场多久？", "需要预约吗？"],
    defaultBrandVoice: {
      personality: "enthusiastic_but_structured",
      do: ["清楚说明规则", "推荐具体", "照顾新手"],
      avoid: ["过度剧透", "夸大难度", "模糊安全规则"],
      signature_phrases: ["新手推荐", "人数建议", "体验时长"]
    },
    defaultBrandKeywords: ["预约", "新手推荐", "人数", "时长"],
    defaultBlindSpots: {
      unknown_topics: ["实时空场", "临时主题维护", "未公布包场价格"],
      escalation_channels: ["门店客服", "预约平台", "店内微信"],
      fallback_copy: "这个要看当天档期和房态，我先不乱说。直接联系门店确认最稳。"
    },
    toolBlueprints: [
      {
        source: "store",
        name: "get_venue_info",
        display_name: "门店信息",
        description_template: "查询“{merchant}”的基本信息。返回门店简介、营业时间、地址和联系渠道。",
        trigger_examples: ["介绍一下{merchant}", "店在哪？", "营业到几点？"],
        response_summary: "返回门店简介、营业时间和地址"
      },
      {
        source: "catalog",
        name: "get_theme_info",
        display_name: "主题与推荐",
        description_template: "获取“{merchant}”的主题、项目亮点和推荐玩法。",
        trigger_examples: ["你们有什么主题？", "推荐玩什么？", "新手适合哪个项目？"],
        response_summary: "返回主题、项目亮点和推荐玩法"
      },
      {
        source: "visit",
        name: "get_booking_info",
        display_name: "预约与到场",
        description_template: "获取“{merchant}”的预约方式、人数建议和到场安排。",
        trigger_examples: ["需要预约吗？", "几个人合适？", "迟到怎么办？"],
        response_summary: "返回预约方式、人数建议和到场安排"
      },
      {
        source: "service",
        name: "get_new_player_info",
        display_name: "新手与服务",
        description_template: "获取“{merchant}”的新手引导、拼场、包场和店员支持信息。",
        trigger_examples: ["新手能玩吗？", "可以拼场吗？", "店员会带新手吗？"],
        response_summary: "返回新手引导、拼场、包场和店员支持信息"
      },
      {
        source: "policy",
        name: "get_house_rules",
        display_name: "规则与安全",
        description_template: "获取“{merchant}”的剧透边界、安全提醒和体验规则。",
        trigger_examples: ["有什么规则？", "有没有年龄限制？", "有什么安全提醒？"],
        response_summary: "返回剧透边界、安全提醒和体验规则"
      },
      {
        source: "updates",
        name: "get_latest_news",
        display_name: "最新动态",
        description_template: "获取“{merchant}”最近公开更新的新主题、活动和特别安排。",
        trigger_examples: ["最近有什么新主题？", "最近有什么活动？", "有什么新消息？"],
        response_summary: "返回最近新主题、活动和特别安排"
      }
    ]
  }
};

export function getTemplateDefinition(templateId: string): TemplateDefinition {
  const template = TEMPLATE_DEFINITIONS[templateId as TemplateId];
  if (!template) {
    throw new Error(`Unsupported template_id: ${templateId}`);
  }
  return template;
}
