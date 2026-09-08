"""Aincrad 場景全域設定（單位：公尺）。"""

# ---------------------------------------------------------------- 巨觀尺度
BASE_RADIUS = 6100.0        # 第 1 層外緣半徑（直徑 12.2 km）
TOP_RADIUS = 185.0          # 第 100 層外緣半徑
FLOOR_COUNT = 100           # 浮游城總樓層數
FLOOR_H0 = 100.0            # 標準層高
HERO_FLOOR_H = 620.0        # 第 1 層（英雄樓層）特別加高，容納山丘與人造天空
FLOOR_H_TAPER = 0.60        # 每往上一層減少的層高
RADIUS_POWER = 1.12         # 半徑收斂指數，決定圓錐輪廓

UNDERSIDE_DEPTH = 2600.0    # 城底倒錐深度
SPIRE_TOP_EXTRA = 900.0     # 頂端紅玉宮 + 尖塔額外高度

HERO_FLOOR = 0              # 完整建構內部的「英雄樓層」索引（第 1 層）
CUTAWAY_A0 = 2.00           # 剖面缺口起始角（弧度）
CUTAWAY_A1 = 2.86           # 剖面缺口結束角
CUT_TIERS = 7               # 被切開的樓層數
CUT_INNER_R = 5000.0        # 天頂缺口的內側半徑
CUT2_A0 = 0.58              # 第二道缺口（只切最底層，展示城鎮）
CUT2_A1 = 1.22

SEED = 20261127

# ---------------------------------------------------------------- 品質分級
QUALITY = {
    "draft":  dict(tier_seg=48,  terrain_res=260, tree_count=1400, house_count=210,
                   grass_patch=0,    detail=0.55),
    "high":   dict(tier_seg=96,  terrain_res=620, tree_count=5200, house_count=560,
                   grass_patch=900,  detail=1.0),
    "ultra":  dict(tier_seg=144, terrain_res=820, tree_count=9000, house_count=820,
                   grass_patch=2200, detail=1.35),
}


def floor_height(i: int) -> float:
    if i == 0:
        return HERO_FLOOR_H
    return FLOOR_H0 - FLOOR_H_TAPER * i


def floor_z(i: int) -> float:
    """第 i 層地板上表面的 z。"""
    z = 0.0
    for k in range(i):
        z += floor_height(k)
    return z


def floor_radius(i: int) -> float:
    t = i / float(FLOOR_COUNT)
    return (BASE_RADIUS - TOP_RADIUS) * (1.0 - t) ** RADIUS_POWER + TOP_RADIUS
