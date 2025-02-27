import { Option, PageSection, Property, SectionStyle } from "@suwatte/daisuke";

export const SORT_OPTIONS: Option[] = [
  { title: "更新時間", id: "datetime_updated" },
  { title: "熱門", id: "popular" },
];

export const STATUS_OPTIONS = [
  { title: "全部", id: "-1" },
  { title: "連載中", id: "0" },
  { title: "已完結", id: "1" },
  { title: "短篇", id: "2" },
];

export const REGION_OPTIONS = [
  { title: "全部", id: "-1" },
  { title: "日漫", id: "0" },
  { title: "韓漫", id: "1" },
  { title: "美漫", id: "2" },
];

export const THEME_OPTIONS = [
  { title: "全部", id: "" },
  { title: "愛情", id: "aiqing" },
  { title: "歡樂向", id: "huanlexiang" },
  { title: "冒險", id: "maoxian" },
  { title: "奇幻", id: "qihuan" },
  { title: "百合", id: "baihe" },
  { title: "校園", id: "xiaoyuan" },
  { title: "科幻", id: "kehuan" },
  { title: "東方", id: "dongfang" },
  { title: "耽美", id: "danmei" },
  { title: "生活", id: "shenghuo" },
  { title: "格鬥", id: "gedou" },
  { title: "輕小說", id: "qingxiaoshuo" },
  { title: "懸疑", id: "xuanyi" },
  { title: "其他", id: "qita" },
  { title: "神鬼", id: "shengui" },
  { title: "職場", id: "zhichang" },
  { title: "TL", id: "teenslove" },
  { title: "萌系", id: "mengxi" },
  { title: "治癒", id: "zhiyu" },
  { title: "長條", id: "changtiao" },
  { title: "四格", id: "sige" },
  { title: "節操", id: "jiecao" },
  { title: "艦娘", id: "jianniang" },
  { title: "競技", id: "jingji" },
  { title: "搞笑", id: "gaoxiao" },
  { title: "偽娘", id: "weiniang" },
  { title: "熱血", id: "rexue" },
  { title: "勵志", id: "lizhi" },
  { title: "性轉換", id: "xingzhuanhuan" },
  { title: "彩色", id: "COLOR" },
  { title: "後宮", id: "hougong" },
  { title: "美食", id: "meishi" },
  { title: "偵探", id: "zhentan" },
  { title: "AA", id: "aa" },
  { title: "音樂舞蹈", id: "yinyuewudao" },
  { title: "魔幻", id: "mohuan" },
  { title: "戰爭", id: "zhanzheng" },
  { title: "歷史", id: "lishi" },
  { title: "異世界", id: "yishijie" },
  { title: "驚悚", id: "jingsong" },
  { title: "機戰", id: "jizhan" },
  { title: "都市", id: "dushi" },
  { title: "穿越", id: "chuanyue" },
  { title: "恐怖", id: "kongbu" },
  { title: "C100", id: "comiket100" },
  { title: "重生", id: "chongsheng" },
  { title: "C99", id: "comiket99" },
  { title: "C101", id: "comiket101" },
  { title: "C97", id: "comiket97" },
  { title: "C96", id: "comiket96" },
  { title: "生存", id: "shengcun" },
  { title: "宅系", id: "zhaixi" },
  { title: "武俠", id: "wuxia" },
  { title: "C98", id: "C98" },
  { title: "C95", id: "comiket95" },
  { title: "FATE", id: "fate" },
  { title: "轉生", id: "zhuansheng" },
  { title: "無修正", id: "Uncensored" },
  { title: "仙俠", id: "xianxia" },
  { title: "LoveLive", id: "loveLive" },
];

export const getProperties = () => {
  const properties: Property[] = [];

  // Theme
  properties.push({
    id: "theme",
    title: "題材",
    tags: THEME_OPTIONS,
  });

  // Status
  properties.push({
    id: "status",
    title: "狀態",
    tags: STATUS_OPTIONS,
  });

  // Region
  properties.push({
    id: "region",
    title: "地區",
    tags: REGION_OPTIONS,
  });

  return properties;
};

export const EXPLORE_COLLECTIONS: PageSection[] = [
  {
    id: "latest",
    title: "最新更新",
    style: SectionStyle.PADDED_LIST,
  },
  {
    id: "popular",
    title: "熱門漫畫",
    style: SectionStyle.INFO,
  },
];

// AES Decryption Key
export const DECRYPT_KEY = "xxxmanga.woo.key";

// Default limit for manga per page
export const LIMIT = 30;

// Listing types
export const LISTING_TYPES = {
  DAY_RANK: "day",
  WEEK_RANK: "week",
  MONTH_RANK: "month",
  TOTAL_RANK: "total",
  RECS: "recs",
  NEWEST: "newest",
};

export const DOMAINS = {
  China: "mangacopy.com",
  Global: "copymanga.tv",
};
