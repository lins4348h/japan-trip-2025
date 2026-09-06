# -*- coding: utf-8 -*-
from plan_build import build

M = lambda s: '<span class="mv">%s</span>' % s          # 移動方式
E = lambda s: '<span class="tagline-eat">%s</span>' % s  # 用餐

CLASSIC = dict(
    file='04-plan-classic', tag='A', zh='經典首訪', en='CLASSIC BANGKOK',
    accent='#B5342B', accent2='#C08B2A', accent3='#3E7A6E', tint='#FDF1DF',
    lead='王城、河岸、水上市場、天際線——第一次來曼谷該看的都排進去了。',
    who='適合：第一次到曼谷／想一次看齊經典景點',
    days=[
        ('Day 1', '抵達．暹羅商圈', 'SIAM・RATCHATHEWI', [
            ('13:00', '蘇凡納布機場', 'BKK', '入境後直接搭 ' + M('ARL 機場快線 → Phaya Thai，26 分鐘 45B')),
            ('15:00', 'Siam 一帶飯店 Check-in', '', '住 Siam／Ratchathewi，五天都靠 BTS 移動最省時。'),
            ('16:30', '金湯普森泰絲之家', 'Jim Thompson House', '柚木老宅導覽 25 分鐘，市中心的綠洲。' + M('BTS National Stadium 步行 8 分')),
            ('18:30', 'Siam Paragon ＋ MBK', '', '高檔與平價一次逛完，空橋連通不用曬太陽。'),
            ('19:30', E('晚餐：Nara Thai Cuisine') + '（Paragon G 樓）', '', '第一餐吃安全牌泰菜，冬蔭功與打拋豬都穩。'),
            ('21:00', '四面佛', 'Erawan Shrine', '24 小時開放，回程順路許個願。' + M('BTS Chit Lom 出口直達')),
        ]),
        ('Day 2', '王城與河岸', 'RATTANAKOSIN', [
            ('08:00', '出發老城區', '', M('Grab 約 25 分鐘 150B，比塞車時段的船快')),
            ('08:30', '大皇宮 ＋ 玉佛寺', 'Wat Phra Kaew', '一開門就進場避人潮，門票 500B；覆肩過膝。'),
            ('11:00', '臥佛寺', 'Wat Pho', '46 公尺臥佛與 108 個銅缽，門票 300B。' + M('步行 10 分')),
            ('12:30', E('午餐：Err Urban Rustic Thai'), '', '臥佛寺旁的現代泰式小館，炸豬皮與烤肉必點。'),
            ('14:00', '鄭王廟', 'Wat Arun', '瓷片佛塔可登塔，門票 200B。' + M('Tha Tien 渡船 5B，3 分鐘')),
            ('16:00', E('河景咖啡：Sala Rattanakosin'), '', '正對鄭王廟的露台，午後最好拍。'),
            ('18:00', E('晚餐：Supanniga Eating Room') + '（Tha Tien 店）', '', '看著鄭王廟點燈吃東部菜，建議先訂位。'),
        ]),
        ('Day 3', '水上市場一日遊', 'MAEKLONG・AMPHAWA', [
            ('07:00', '包車／一日團出發', '', '前一晚訂 Klook 或包車，' + M('車程約 1.5 小時')),
            ('09:00', '美功鐵道市集', 'Maeklong Railway Market', '看火車穿過菜市場，攤販收傘的瞬間最精彩。'),
            ('11:00', '丹能莎朵水上市場', 'Damnoen Saduak', '划船遊河 1 小時，船上買椰子冰與現烤海鮮。'),
            ('13:00', E('午餐：市場船麵 ＋ 烤大頭蝦'), '', '一碗船麵 20B，配泰式奶茶剛好。'),
            ('17:30', 'Asiatique 河濱夜市', '', M('Saphan Taksin 碼頭免費接駁船，16:00 起每 30 分鐘一班')),
            ('19:00', E('晚餐：Baan Khanitha') + ' ＋ 摩天輪', '', '河岸老牌泰菜，飯後搭摩天輪看夜景。'),
        ]),
        ('Day 4', '現代曼谷．天際線', 'CHATUCHAK・SATHORN', [
            ('09:30', '恰圖恰週末市集', 'JJ Market', '15,000 攤，非週末改去 ICONSIAM。' + M('MRT 甘烹碧站 2 號出口')),
            ('12:00', E('午餐：Viva 8 西班牙海鮮飯') + '（JJ 市集內）', '', '大鍋現炒海鮮飯，配一杯 Sangria 休息。'),
            ('14:30', '王權雲頂 SkyWalk', 'Mahanakhon 78F', '玻璃地板與露天酒吧，880B 起。' + M('BTS Chong Nonsi 出口直達')),
            ('16:30', '泰式按摩：Health Land Sathorn', '', '1.5 小時約 650B，走了兩天該保養。'),
            ('18:30', E('晚餐：Somboon Seafood 建興酒家'), '', '招牌咖哩螃蟹 900B／隻，先訂位免排隊。'),
            ('20:30', '天台酒吧：Vertigo & Moon Bar', '', '61 樓露天吧，注意服裝規定（不可短褲拖鞋）。'),
        ]),
        ('Day 5', '採買與收尾', 'PRATUNAM・AIRPORT', [
            ('09:00', E('早餐：After You 或 Roast') + '（EmQuartier）', '', '甜點早餐，順便逛 EmSphere。'),
            ('10:30', '水門市場 Platinum Fashion Mall', '', '成衣批發，三件以上有批價。' + M('BTS Chit Lom 步行 10 分')),
            ('12:00', E('午餐：水門海南雞飯 Go-Ang'), '', '粉紅制服那家，一份 60B，雞油飯必加。'),
            ('14:00', 'Let\'s Relax 足底按摩', '（Terminal 21）', '最後一小時放鬆，順路買伴手禮。'),
            ('16:00', '回飯店取行李 → 機場', '', M('ARL 機場快線 45B，或 Grab 約 400B')),
        ]),
    ],
    notes=[
        '<b>住宿建議</b>：Siam／Ratchathewi 一帶，BTS 與 ARL 都在同一條線上，五天不用換飯店。',
        '<b>Day 3 </b>水上市場離市區遠，包車（約 2,500B／車）比自己搭車省一半時間。',
        '<b>要先訂位</b>：Somboon 建興酒家、Supanniga、Mahanakhon SkyWalk（線上票較便宜）。',
        '<b>週末調整</b>：恰圖恰只有週六日開，若 Day 4 不是週末，改去 ICONSIAM ＋ SookSiam 室內水上市場。',
        '<b>穿著</b>：Day 2 全天跑寺廟，務必覆肩過膝、好穿脫的鞋。',
    ],
)

FOODIE = dict(
    file='05-plan-foodie', tag='B', zh='市場美食獵人', en='STREET FOOD HUNTER',
    accent='#C2551E', accent2='#9A6B1F', accent3='#6E7A38', tint='#FDF0E2',
    lead='米其林街邊攤、中國城宵夜、廚藝課與早市——這五天為胃而排。',
    who='適合：把「吃」當主行程／不排斥排隊與走路',
    days=[
        ('Day 1', '抵達．通羅夜食', 'THONGLOR・SUKHUMVIT', [
            ('15:00', 'Asok／Thonglor 飯店 Check-in', '', '住 BTS 沿線，晚上吃完宵夜好回家。'),
            ('17:00', 'EmQuartier ＋ Bearhouse 珍奶', '', '先補一杯冷飲，順便逛超市看調味料。'),
            ('18:30', E('晚餐：Soul Food Mahanakorn') + '（Thonglor Soi 55）', '', '現代泰式小酒館，烤豬頸肉與冬蔭功雞翅必點。'),
            ('20:30', E('甜點：Mae Varee 芒果糯米'), '', '通羅站口 24 小時，芒果甜度最穩定，150B。'),
            ('21:30', E('宵夜：Sukhumvit Soi 38 烤肉串'), '', '街邊 Moo Ping 一支 10B，配糯米飯剛好。'),
        ]),
        ('Day 2', '老城小吃 ＋ 中國城', 'YAOWARAT', [
            ('08:00', E('早餐：Jok Prince 廣東粥'), '', '必比登推薦，炭火煮的粥帶焦香，一碗 50B。'),
            ('09:30', '臥佛寺', 'Wat Pho', '吃飽走走，順便看 46 公尺臥佛。' + M('Grab 10 分鐘')),
            ('11:00', '鄭王廟', 'Wat Arun', M('Tha Tien 渡船 5B') + '，登塔看河景。'),
            ('12:30', E('午餐：勝利紀念碑船麵') + '（或 Err）', '', '一碗兩三口、20B，戰績堆碗塔是傳統。'),
            ('15:00', 'Talad Noi 老巷 ＋ Mother Roaster', '', '鐵工廠老街咖啡，頂樓可看河。'),
            ('18:00', E('晚餐：耀華力路掃街'), 'Yaowarat', 'T&K 烤海鮮 → Nai Ek 豬肉粥 → Guay Jub Ouan 捲粉湯。'),
            ('21:00', E('甜品：Odean 圓環芒果糯米'), '', '中國城牌樓旁收尾，冰的最舒服。'),
        ]),
        ('Day 3', '廚藝課 ＋ 生鮮市場', 'SILOM・OR TOR KOR', [
            ('08:30', 'Silom Thai Cooking School', '', '含市場採買，一天學 5–6 道菜，約 1,200B。'),
            ('13:00', E('午餐：吃自己做的四菜一湯'), '', '課程附食譜，回台灣可以複製。'),
            ('14:30', 'Or Tor Kor 高級生鮮市場', '', '全球前十市場，榴槤、山竹、乾貨伴手禮。' + M('MRT 甘烹碧站')),
            ('16:30', 'The Commons Thonglor', '', '文青飲食聚落，二樓精釀與甜點。'),
            ('18:30', E('晚餐：Jay Fai 痣姐蟹肉蛋'), '', '米其林一星路邊攤，1,000B 起，務必提前訂位。'),
            ('21:00', '琴酒吧 Teens of Thailand', '', '老城小酒吧，泰國香料調酒，走路可到 Ku Bar。'),
        ]),
        ('Day 4', '米其林街頭 ＋ 河岸', 'PRATUNAM・ICONSIAM', [
            ('09:00', E('早餐：水門海南雞飯 Go-Ang'), '', '粉紅制服老店，60B 開啟一天。'),
            ('10:30', '水門市場 Platinum', '', '批發成衣，逛完再走去搭 BTS。'),
            ('12:30', E('午餐：Pe Aor 冬蔭功蝦湯麵'), '', '整隻大蝦＋濃蝦膏湯，250B，排隊也值得。' + M('BTS Ratchathewi 步行 8 分')),
            ('15:00', 'ICONSIAM ＋ SookSiam', '', '室內水上市場，泰國 77 府小吃一次收。' + M('Saphan Taksin 免費接駁船')),
            ('17:30', E('河岸咖啡：Warehouse 30'), '', '倉庫改建選物與咖啡，等日落。'),
            ('19:00', E('晚餐：Prachak 百年燒鴨') + '（Bang Rak）', '', '1909 年開到現在，燒鴨麵一碗 90B。'),
        ]),
        ('Day 5', '早市 ＋ 伴手禮', 'WANG LANG・AIRPORT', [
            ('07:30', E('早市：Wang Lang Market'), '', '在地人的早餐街，椰子煎餅與泰奶。' + M('渡船到 Wang Lang 碼頭')),
            ('10:00', 'Tha Maharaj 河岸商場', '', '喝杯咖啡看船，人少好拍。'),
            ('11:30', E('午餐：Krua Apsorn'), '', '米其林推薦老泰菜，蟹肉炒咖哩與螃蟹粉絲。'),
            ('14:00', 'Big C ＋ Gourmet Market 採買', '', '泡麵、醬料、乾燥香料，行李箱留空間。'),
            ('16:00', 'Let\'s Relax 按摩 1 小時', '', '吃五天了，最後躺一下再出發。'),
            ('17:30', '前往機場', '', M('ARL 機場快線 45B，尖峰時段別叫車')),
        ]),
    ],
    notes=[
        '<b>一定要訂位</b>：Jay Fai 痣姐（提前 1 個月）、Silom Cooking School（前 3 天）。備案是 Thipsamai 泰式炒河粉。',
        '<b>週一店休</b>：Jay Fai 週日、週一休；Jok Prince 部分分店週一休，出發前查一下。',
        '<b>腸胃保險</b>：街邊攤挑人多、翻桌快的；只喝瓶裝水，冰塊選有孔的製冰廠冰。',
        '<b>中國城</b>晚上 18:00 後才熱鬧，白天去等於白跑；建議 Grab 到牌樓再開始走。',
        '<b>錢包</b>：小攤只收現金，備 20B／100B 小鈔，一天抓 800–1,200B 吃很飽。',
    ],
)

SLOW = dict(
    file='06-plan-slow', tag='C', zh='河岸慢活．SPA', en='SLOW & SPA',
    accent='#2F6B6B', accent2='#A08133', accent3='#8A5A2B', tint='#EDF4F2',
    lead='河岸日落、綠肺單車、老宅咖啡與兩場 SPA——把假期還給身體。',
    who='適合：想放鬆不趕行程／帶長輩或第二次來曼谷',
    days=[
        ('Day 1', '抵達．河岸日落', 'RIVERSIDE', [
            ('15:00', '河岸飯店 Check-in', 'Saphan Taksin 一帶', '選有泳池與接駁船的河岸飯店，五天都靠船移動。'),
            ('17:00', '搭免費接駁船到 ICONSIAM', '', M('Sathorn 碼頭每 15 分鐘一班，免費')),
            ('18:00', 'River Park 河畔散步', '', '18:30 與 20:00 各一場水舞秀，河風很舒服。'),
            ('19:30', E('晚餐：Sirimahannop 帆船餐廳'), '', '停在河上的三桅帆船，泰式融合菜，記得訂靠河位。'),
            ('21:30', '回飯店泡泳池', '', '第一天不排滿，讓身體先適應天氣。'),
        ]),
        ('Day 2', '老城慢遊 ＋ SPA', 'RATTANAKOSIN', [
            ('09:30', '臥佛寺', 'Wat Pho', '早場人少，順便在寺內按摩學校做 30 分鐘肩頸。'),
            ('12:00', E('午餐：Sala Rattanakosin'), '', '正對鄭王廟的河景餐廳，慢慢吃到下午。'),
            ('14:00', 'The Jam Factory 河岸文創', '', '倉庫改建的書店、選物與植栽院子。' + M('Tha Tien 渡船轉接駁')),
            ('16:00', E('咖啡：Blue Whale Café'), '', '蝶豆花拿鐵的發源店，老屋二樓安靜。'),
            ('18:00', 'Divana Nurture Spa', '（Asok）', '2 小時療程約 3,500B，務必提前預約。' + M('Grab 約 30 分')),
            ('20:30', E('晚餐：Karmakamet Diner'), '', '香氛品牌開的餐廳，甜點與氣氛都好。'),
        ]),
        ('Day 3', '綠肺單車日', 'BANG KRACHAO', [
            ('09:00', '曼谷綠肺 Bang Krachao', '', '渡船 4B 到對岸，租單車 100B／日，走高架木棧道。'),
            ('12:00', E('午餐：Bangkok Tree House'), '', '河邊樹屋餐廳，有機蔬食與冰咖啡。'),
            ('15:00', '回市區、Lumpini Park 散步', '', '傍晚有跑者與大蜥蜴，公園旁就有按摩店。'),
            ('17:00', E('咖啡：Rocket Coffeebar S.12'), '', '北歐風早午餐店，下午人少好坐。'),
            ('19:00', E('晚餐：Issaya Siamese Club'), '', '百年老宅改建的名廚泰菜，需訂位。'),
            ('21:00', '月亮酒吧 Vertigo & Moon Bar', '', '從 Issaya 步行可到，61 樓看夜景收尾。'),
        ]),
        ('Day 4', '藝文與選物', 'SIAM・SATHORN', [
            ('10:00', '金湯普森泰絲之家', 'Jim Thompson House', '柚木老宅與泰絲故事，導覽 25 分鐘。'),
            ('11:30', '曼谷藝術文化中心', 'BACC', '免費展覽與小書店。' + M('BTS National Stadium 空橋直達')),
            ('13:00', E('午餐：Somtum Der') + '（或 Nara Thai）', '', '米其林一星青木瓜沙拉，辣度可調。'),
            ('15:00', 'Siam Discovery ＋ ICONCRAFT', '', '泰國設計選物，伴手禮質感最好的一站。'),
            ('17:00', 'Health Land 泰式按摩 2 小時', '', '約 900B，做完直接吃晚餐。'),
            ('19:30', E('晚餐：Baan Somtum 或 Err'), '', '輕鬆收尾，別排太滿。'),
        ]),
        ('Day 5', '公園早晨 ＋ 收尾', 'BENJAKITTI・AIRPORT', [
            ('08:00', '飯店早餐 ＋ 泳池', '', '最後一天不早起趕行程。'),
            ('10:00', 'Benjakitti 森林公園空中步道', '', '濕地棧道與湖景，走 40 分鐘剛好。' + M('MRT Queen Sirikit 站')),
            ('11:30', E('午餐：Roast') + '（EmQuartier）', '', '早午餐名店，鬆餅與冷萃咖啡。'),
            ('13:30', 'Let\'s Relax 足底按摩 1 小時', '', '上飛機前最後保養，約 500B。'),
            ('15:00', 'EmSphere／Terminal 21 採買', '', '超市買伴手禮，行李寄放櫃檯。'),
            ('17:00', '前往機場', '', M('ARL 機場快線 45B，約 30 分鐘')),
        ]),
    ],
    notes=[
        '<b>住宿建議</b>：河岸飯店（Saphan Taksin 一帶）有免費接駁船，慢活路線靠船移動最舒服。',
        '<b>SPA 要預約</b>：Divana、Health Land 熱門時段常滿，出發前一週線上訂。',
        '<b>Day 3 </b>綠肺租單車請穿長褲與運動鞋，木棧道窄、雨後濕滑。',
        '<b>訂位</b>：Issaya、Sirimahannop 建議提前 3–5 天；靠河位要指定。',
        '<b>節奏</b>：每天只排 5 個點、下午留白，這條路線的重點是不趕。',
    ],
)

for p in (CLASSIC, FOODIE, SLOW):
    build(p)
