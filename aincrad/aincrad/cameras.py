"""鏡頭清單：從宇宙級遠景到室內特寫。"""
import math
import numpy as np

from . import config as C
from . import nature as N, town
from .scene import add_camera, CEIL_Z

R0 = C.floor_radius(0)
TOP = C.floor_z(C.FLOOR_COUNT)


def _local(pos, rot, p):
    c, s = math.cos(rot), math.sin(rot)
    return (pos[0] + c * p[0] - s * p[1], pos[1] + s * p[0] + c * p[1], pos[2] + p[2])


def shot_list(ctx):
    info = ctx["info"]
    terr = ctx["terr"]
    T = N.TOWN
    S = []

    def add(name, loc, tgt, lens=40.0, dof=None, fstop=2.8, samples=None, note=""):
        S.append(dict(name=name, loc=loc, target=tgt, lens=lens, dof=dof,
                      fstop=fstop, samples=samples, note=note))

    a = 0.30
    add("01_aincrad_full", (22000 * math.cos(a), 22000 * math.sin(a), 1100),
        (0, 0, 2350), lens=40, note="浮游城全景：完整百層圓錐輪廓")

    a = -0.55
    add("02_underbelly", (11500 * math.cos(a), 11500 * math.sin(a), -5400),
        (0, 0, 900), lens=35, note="城底倒錐與能源結晶，仰視壓迫感")

    r40 = C.floor_radius(34)
    z40 = C.floor_z(34)
    a = 0.80
    add("03_tier_detail", ((r40 + 3300) * math.cos(a), (r40 + 3300) * math.sin(a),
                           z40 - 900),
        (r40 * math.cos(a + 0.22), r40 * math.sin(a + 0.22), z40 + 500), lens=105,
        note="外殼特寫：層層樓板與簷口交疊出的巨大尺度")

    a = 0.5 * (C.CUTAWAY_A0 + C.CUTAWAY_A1)
    add("04_cutaway", (11800 * math.cos(a), 11800 * math.sin(a), 2050),
        (2600 * math.cos(a), 2600 * math.sin(a), 420), lens=52,
        note="剖面缺口：層層樓板與第一層地表的橫切面")

    add("05_town_aerial", (T[0] - 1250, T[1] - 640, 300),
        (T[0] + 60, T[1] + 240, 45), lens=38, note="初始之街全景與人造天頂")

    sa = 0.12 + math.pi / 3.0  # 對齊放射狀主街
    add("06_town_street", _local(town.ORIGIN, 0.0,
                                 (300 * math.cos(sa), 300 * math.sin(sa), 1.72)),
        _local(town.ORIGIN, 0.0, (0, 0, 5.0)), lens=24, dof=200, fstop=5.6,
        note="街道視角：石板路、店鋪、廣場噴泉")

    p0 = np.array(N.RIVER[2])
    p1 = np.array(N.RIVER[3])
    bp = p0 + (p1 - p0) * 0.5
    d = p1 - p0
    d = d / np.linalg.norm(d)
    nv = np.array([-d[1], d[0]])
    cam = bp + nv * 210 - d * 130
    add("07_bridge", (cam[0], cam[1], terr.h1(cam[0], cam[1]) + 34),
        (bp[0], bp[1], terr.h1(bp[0], bp[1]) + 14), lens=50,
        note="河谷石橋與遠方城牆")

    ip, ir = info["inn_pos"], info["inn_rot"]
    add("08_tavern", _local(ip, ir, (6.9, -4.3, 2.55)),
        _local(ip, ir, (-4.2, 1.6, 1.15)), lens=24, dof=9.0, fstop=2.2,
        note="旅館酒場室內：家具、吊燈、武器架、寶箱")

    wp, wr = info["ws_pos"], info["ws_rot"]
    add("09_workshop", _local(wp, wr, (4.2, -3.2, 2.3)),
        _local(wp, wr, (-3.2, 2.2, 1.2)), lens=24, dof=7.0, fstop=2.2,
        note="鐵匠工坊室內：熔爐、鐵砧、武器架")

    tz = terr.h1(*N.TOWER)
    a = 1.18 - 0.62
    cx = N.TOWER[0] + 520 * math.cos(a)
    cy = N.TOWER[1] + 520 * math.sin(a)
    add("10_labyrinth", (cx, cy, terr.h1(cx, cy) + 26),
        (N.TOWER[0], N.TOWER[1], tz + 150), lens=30,
        note="迷宮塔：黑色主塔直抵樓層天頂")

    bz = info["boss_z"]
    add("11_boss_room", (N.TOWER[0] + 2, N.TOWER[1] - 30, bz + 9.5),
        (N.TOWER[0], N.TOWER[1] + 24, bz + 8.0), lens=24,
        note="Boss 房間：巨門、列柱、王座與紅色符文")

    tp = N.TEMPLE
    tpz = info["temple_z"]
    dl = np.array(N.LAKE) - np.array(tp)
    dl = dl / np.linalg.norm(dl)
    cam = np.array(tp) - dl * 190
    add("12_temple", (cam[0], cam[1], tpz + 26),
        (tp[0], tp[1], tpz + 22), lens=35, note="山丘神殿與遠方湖泊")

    dv = np.array(N.TOWER) - np.array(N.LAKE)
    dv = dv / np.linalg.norm(dv)
    cp = np.array(N.LAKE) - dv * (N.LAKE_R + 190)
    add("13_lake", (cp[0], cp[1], terr.h1(cp[0], cp[1]) + 26),
        (N.TOWER[0], N.TOWER[1], tz + 90), lens=45,
        note="湖泊、森林、草原與遠方迷宮塔")

    a = 0.5 * (C.CUTAWAY_A0 + C.CUTAWAY_A1)
    add("14_floor_edge", (R0 * 1.10 * math.cos(a - 0.16), R0 * 1.10 * math.sin(a - 0.16),
                          260),
        (R0 * 0.84 * math.cos(a + 0.02), R0 * 0.84 * math.sin(a + 0.02), -40),
        lens=35, note="世界的邊緣：缺口處的地表斷崖與雲海")

    a = 0.55
    add("15_ruins", (N.RUINS[0] - 190 * math.cos(a), N.RUINS[1] - 190 * math.sin(a),
                     terr.h1(N.RUINS[0], N.RUINS[1]) + 34),
        (N.RUINS[0], N.RUINS[1], terr.h1(*N.RUINS) + 8), lens=40,
        note="森林中的古代遺跡與魔法水晶")

    ta = math.atan2(T[1], T[0])
    add("17_town_cutaway", (8200 * math.cos(ta), 8200 * math.sin(ta), 1330),
        (T[0], T[1], 45), lens=50,
        note="從城牆缺口望進第一層：初始之街全貌")

    a = 1.6
    add("16_sky_wide", (30000 * math.cos(a), 30000 * math.sin(a), 8200),
        (0, 0, 3400), lens=55, note="高空俯視：浮空平台與雲海環繞")
    return S


def build_cameras(ctx):
    cams = []
    for s in shot_list(ctx):
        ob = add_camera(s["name"], s["loc"], s["target"], lens=s["lens"],
                        dof=s["dof"], fstop=s["fstop"])
        cams.append((s, ob))
    return cams
