/**
 * Exhibition data: three sections, 10 photos each.
 * caption format — "标题：正文描述"
 */
const SECTIONS = [
  {
    id:          'commercial',
    title:       '商业价值',
    subtitle:    '产业图景',
    description: '马场不只是马的居所\n更是一套完整的商业生态',
    dir:         'images/commercial',
    photos: [
      { file: '1-5.jpg',  caption: '寄养马匹特写：私人马匹托管服务，延伸产业配套营收' },
      { file: '1-2.jpg',  caption: '马具工具收纳：日常养护装备，保障马匹服务标准化输出' },
      { file: '1-3.jpg',  caption: '母马与新生马驹：良种繁育核心环节，实现资产自然增值' },
      { file: '1-4.jpg',  caption: '新生幼驹特写：血统幼驹交易，是马场核心资产收益来源' },
      { file: '1-1.jpg',  caption: '鞍具房陈列：专业马具配套，支撑全业态商业运营基础' },
      { file: '1-6.jpg',  caption: '叼羊赛事竞技：民俗竞技赛事，带动地方文旅与赛事经济' },
      { file: '1-7.jpg',  caption: '叼羊赛事竞技：民俗竞技赛事，带动地方文旅与赛事经济' },
      { file: '1-8.jpg',  caption: '森林野骑体验：沉浸式户外文旅，拓宽大众化消费赛道' },
      { file: '1-9.jpg',  caption: '雪山野骑观光：特色景观骑乘，打造差异化文旅产品' },
      { file: '1-10.jpg', caption: '学员马术课程：标准化教学体系，马场最稳定经营性收入' },
    ],
  },
  {
    id:          'human',
    title:       '互动与羁绊',
    subtitle:    '跨越物种的情感',
    description: '人与马之间，无需语言，自有默契',
    dir:         'images/human',
    photos: [
      { file: '2-6.jpg',  caption: '清理马蹄：细致的日常护理，守护马匹行走安全' },
      { file: '2-1.jpg',  caption: '静伴吃草：无言的相守，是最自然的信任流露' },
      { file: '2-2.jpg',  caption: '投喂鲜草：日常悉心照料，是人马羁绊的起点' },
      { file: '2-4.jpg',  caption: '清理马厩：重复的琐碎劳作，是长久陪伴的底色' },
      { file: '2-5.jpg',  caption: '运输粪便：平凡的后勤工作，保障马匹健康生活' },
      { file: '2-7.jpg',  caption: '亲昵互动：无声的依赖，是朝夕相伴的情感结晶' },
      { file: '2-8.jpg',  caption: '怀抱幼驹：温柔呵护新生，见证生命的美好瞬间' },
      { file: '2-9.jpg',  caption: '清洗马匹：细致的清洁养护，是日常陪伴的温柔' },
      { file: '2-10.jpg', caption: '梳理毛发：指尖的温柔触碰，传递无声的关怀' },
      { file: '2-3.jpg',  caption: '协助接生：守护新生，是跨越物种的生命责任' },
    ],
  },
  {
    id:          'horses',
    title:       '马场众生',
    subtitle:    '自然天性',
    description: '只是马，只是生命本身',
    dir:         'images/horses',
    photos: [
      { file: '3-1.jpg',  caption: '空净马房：规整的圈养空间，承载马匹日常栖居时光' },
      { file: '3-3.jpg',  caption: '幼驹休憩：慵懒沐浴暖阳，流露生灵松弛本真状态' },
      { file: '3-4.jpg',  caption: '侧卧安眠：卸下劳作疲惫，独享圈栏间的闲适片刻' },
      { file: '3-6.jpg',  caption: '小矮马饮水：平淡细碎日常，勾勒马场悠然众生图景' },
      { file: '3-7.jpg',  caption: '闲卧休息：静守一方场地，于安稳环境中自在休憩' },
      { file: '3-5.jpg',  caption: '沙地打滚：泥土舒展躯体，挣脱束缚释放天然天性' },
      { file: '3-8.jpg',  caption: '碰头摩挲：同类温情依偎，是族群与生俱来的羁绊' },
      { file: '3-9.jpg',  caption: '原野放风奔驰：奔赴辽阔草场，回归马匹原生的自由天性' },
      { file: '3-10.jpg', caption: '山隅马场：山野天地相融，定格商业之外的自然诗意' },
      { file: '3-2.jpg',  caption: '舔食盐砖：自然生理习性，方寸圈舍里的自在日常' },
    ],
  },
];
