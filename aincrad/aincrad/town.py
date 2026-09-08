"""第一層主城「初始之街」：城牆、城門、街道、廣場、住宅、商店、旅館、工坊、訓練場、城堡。"""
import math
import random
import numpy as np

from . import config as C
from . import nature as N
from .meshutil import (MeshData, box, cylinder, revolve, uv_sphere, torus, cone,
                       prism_roof, extrude_poly, tube_along, stairs, frame_opening,
                       translate, rot_z, rot_y, rot_x, scale, chain, TAU, loft,
                       ring_pts)
from .blutil import proto_mesh, instance

ORIGIN = (N.TOWN[0], N.TOWN[1], N.TOWN_Z)
WALL_R = 452.0
PLAZA_R = 56.0


# ------------------------------------------------------------ 建築零件
def _timber(md, w, d, h, z0, rng, mat="wood_beam", dens=1.9):
    """半木構造框架。"""
    t = 0.20
    for sx, sy, ln, ang in ((w / 2, 0, d, math.pi / 2), (-w / 2, 0, d, math.pi / 2),
                            (0, d / 2, w, 0.0), (0, -d / 2, w, 0.0)):
        nb = max(2, int(ln / dens))
        for i in range(nb + 1):
            u = -ln / 2 + ln * i / nb
            px = sx + (u if ang == 0.0 else 0)
            py = sy + (u if ang != 0.0 else 0)
            md.add(box(t, t, h, z0=z0), mat, translate(px, py, 0))
        for zz in (z0 + 0.05, z0 + h - t):
            md.add(box(w if ang == 0 else t, t if ang == 0 else d, t, z0=zz),
                   mat, translate(sx, sy, 0))
        for i in range(nb):
            if rng.random() < 0.45:
                u0 = -ln / 2 + ln * i / nb
                L = math.hypot(ln / nb, h * 0.8)
                a = math.atan2(h * 0.8, ln / nb)
                M = chain(translate(sx + (u0 + ln / nb / 2 if ang == 0 else 0),
                                    sy + (u0 + ln / nb / 2 if ang != 0 else 0),
                                    z0 + h * 0.5),
                          rot_z(ang), rot_y(math.pi / 2 - a))
                md.add(box(L, t, t), mat, M)


def _window(md, rng, w=0.9, h=1.35, glow_p=0.6, sill=True, mat_frame="wood_dark"):
    md.add(box(0.22, w + 0.26, h + 0.26, z0=-0.13), mat_frame, translate(0, 0, 0))
    md.add(box(0.10, w, h), "window_glow" if rng.random() < glow_p else "glass_dirty",
           translate(0.10, 0, 0))
    md.add(box(0.14, w * 0.09, h), mat_frame, translate(0.14, 0, 0))
    if sill:
        md.add(box(0.34, w + 0.44, 0.10, z0=-0.20), "stone_wall", translate(0.05, 0, 0))


def _door(md, rng, w=1.15, h=2.25):
    md.add(box(0.28, w + 0.34, h + 0.22, z0=-0.02), "stone_wall")
    md.add(box(0.12, w, h), "wood_dark", translate(0.12, 0, 0))
    for i in range(3):
        md.add(box(0.06, w * 0.96, 0.10), "iron", translate(0.19, 0, 0.35 + i * 0.75))
    md.add(uv_sphere(0.07, 6, 4), "bronze", translate(0.21, w * 0.32, h * 0.5))
    md.add(box(0.55, w + 0.8, 0.14, z0=-0.14), "stone_wall", translate(0.2, 0, 0))


def building(rng, w=8.0, d=9.0, floors=2, style="house", wall_mat=None, roof_mat=None):
    """程序化中世紀奇幻民居／店鋪。"""
    md = MeshData(f"bld_{style}")
    wall_mat = wall_mat or rng.choice(["plaster", "plaster_warm", "plaster", "sandstone"])
    roof_mat = roof_mat or rng.choice(["roof_tile", "roof_tile", "roof_slate",
                                       "roof_tile_blue", "thatch"])
    fh = 3.0
    # 石造基座 + 一樓石牆
    md.add(box(w + 0.5, d + 0.5, 0.55, z0=-0.3), "stone_wall")
    z = 0.25
    for f in range(floors):
        jut = 0.0 if f == 0 else 0.34 * f
        ww, dd = w + jut * 2, d + jut * 2
        mat = "stone_wall" if f == 0 and rng.random() < 0.55 else wall_mat
        md.add(box(ww, dd, fh, z0=z), mat)
        if f > 0:
            md.add(box(ww + 0.2, dd + 0.2, 0.22, z0=z - 0.22), "wood_beam")
            _timber(md, ww, dd, fh, z, rng)
        # 窗
        for side in range(4):
            ang = side * math.pi / 2
            span = ww if side % 2 == 0 else dd
            half = (dd if side % 2 == 0 else ww) / 2
            nwin = max(1, int(span / 3.0))
            for i in range(nwin):
                u = -span / 2 + span * (i + 0.5) / nwin
                if f == 0 and side == 0 and abs(u) < 1.2:
                    continue
                sub = MeshData("w")
                _window(sub, rng, glow_p=0.55 + 0.1 * f)
                md.add_mesh(sub, chain(rot_z(ang), translate(half, u, z + fh * 0.52)))
        z += fh
    # 門
    sub = MeshData("d")
    _door(sub, rng)
    md.add_mesh(sub, chain(rot_z(0.0), translate(d / 2, 0, 0.25)))

    top = z
    rh = w * rng.uniform(0.42, 0.62)
    over = 0.75
    md.add(prism_roof(w + over * 2 + 0.68 * (floors - 1), d + over * 2 + 0.68 * (floors - 1),
                      rh, z0=top), roof_mat)
    md.add(box(w + 0.9, d + 0.9, 0.30, z0=top - 0.30), "wood_beam")
    if rng.random() < 0.7:  # 煙囪
        cx = rng.uniform(-w * 0.3, w * 0.3)
        md.add(box(1.1, 1.1, rh + 1.5, z0=top - 0.4), "stone_wall", translate(cx, d * 0.25, 0))
        md.add(box(1.35, 1.35, 0.24, z0=top + rh + 1.0), "stone_dark",
               translate(cx, d * 0.25, 0))
    if style in ("shop", "inn") or rng.random() < 0.3:  # 招牌
        md.add(box(0.10, 0.10, 1.0, z0=top - 1.6), "iron", translate(d / 2 + 0.1, 1.6, 0))
        md.add(box(0.10, 1.3, 0.10, z0=top - 0.7), "iron", translate(d / 2 + 0.1, 2.2, 0))
        md.add(box(0.08, 1.05, 0.75, z0=top - 1.55), rng.choice(
            ["wood_dark", "wood_furniture", "bronze"]), translate(d / 2 + 0.75, 2.2, 0))
        md.add(tube_along([(d / 2 + 0.14, 2.2, top - 0.72), (d / 2 + 0.75, 2.2, top - 0.80)],
                          0.03, n=4), "iron")
    if style == "shop":  # 遮陽棚 + 攤位
        for i in range(3):
            md.add(box(0.09, 0.09, 2.3, z0=0.25), "wood_dark",
                   translate(d / 2 + 1.9, -w * 0.35 + i * w * 0.35, 0))
        V = np.array([(d / 2 + 0.2, -w * 0.45, 3.1), (d / 2 + 2.1, -w * 0.45, 2.55),
                      (d / 2 + 2.1, w * 0.45, 2.55), (d / 2 + 0.2, w * 0.45, 3.1)])
        md.add((V, [(0, 1, 2, 3)]), rng.choice(["fabric_red", "fabric_blue",
                                                "fabric_green", "canvas"]))
        md.add(box(0.9, w * 0.8, 0.14, z0=1.0), "wood_plank", translate(d / 2 + 1.0, 0, 0))
        for i in range(rng.randint(2, 5)):
            md.add(box(0.4, 0.4, 0.4, z0=1.14), "wood_furniture",
                   chain(translate(d / 2 + 1.0 + rng.uniform(-0.25, 0.25),
                                   rng.uniform(-w * 0.3, w * 0.3), 0),
                         rot_z(rng.uniform(0, 1))))
    if style == "inn":  # 燈籠與馬廄圍欄
        for s in (-1, 1):
            md.add(box(0.08, 0.08, 0.7, z0=2.4), "iron", translate(d / 2 + 0.2, s * 1.5, 0))
            md.add(uv_sphere(0.22, 8, 5), "lamp_glass", translate(d / 2 + 0.35, s * 1.5, 2.5))
    if style == "workshop":  # 大煙囪與戶外工具
        md.add(box(1.8, 1.8, rh + 4.0, z0=top - 1.0), "stone_dark",
               translate(-w * 0.3, 0, 0))
        md.add(box(2.1, 2.1, 0.3, z0=top + rh + 2.8), "stone_dark", translate(-w * 0.3, 0, 0))
        md.add(box(1.2, 0.7, 0.7, z0=0.25), "stone_dark", translate(d / 2 + 1.6, -2.2, 0))
        md.add(box(0.5, 1.4, 0.35, z0=0.95), "iron", translate(d / 2 + 1.6, -2.2, 0))
        for i in range(5):  # 柴堆
            md.add(cylinder(0.13, 1.2, 6), "bark",
                   chain(translate(d / 2 + 1.3, 2.2 + (i % 3) * 0.3, 0.3 + (i // 3) * 0.28),
                         rot_x(math.pi / 2)))
    # 門口雜物
    for i in range(rng.randint(0, 3)):
        p = (d / 2 + rng.uniform(0.8, 1.8), rng.uniform(-w * 0.4, w * 0.4), 0.25)
        if rng.random() < 0.5:
            md.add(cylinder(0.36, 0.85, 10, r_top=0.30), "wood_furniture", translate(*p))
            md.add(torus(0.37, 0.04, 10, 5), "iron", translate(p[0], p[1], p[2] + 0.6))
        else:
            md.add(box(0.7, 0.7, 0.7, z0=p[2]), "wood_plank",
                   chain(translate(p[0], p[1], 0), rot_z(rng.uniform(0, 1))))
    return md


def round_tower(rng, r=4.5, h=16.0, roof="roof_tile", crenel=True):
    md = MeshData("tower")
    md.add(cylinder(r * 1.15, 1.2, 16, r_top=r * 1.05, z0=-0.4), "stone_castle")
    md.add(cylinder(r, h, 16, r_top=r * 0.94), "stone_castle")
    md.add(revolve([(r * 0.94, h), (r * 1.22, h + 0.8), (r * 1.22, h + 1.4),
                    (r * 1.05, h + 1.8)], 16), "stone_castle")
    if crenel:
        for i in range(12):
            a = TAU * i / 12
            md.add(box(r * 0.30, r * 0.42, 1.6, z0=h + 1.8), "stone_castle",
                   chain(rot_z(a), translate(r * 0.95, 0, 0)))
    else:
        md.add(cone(r * 1.25, r * 2.4, 16, z0=h + 1.6), roof)
        md.add(cylinder(0.14, 1.4, 6, z0=h + 1.6 + r * 2.4), "iron")
    for i in range(3):
        a = TAU * i / 3 + 0.4
        md.add(box(0.6, 0.5, 1.5, z0=h * 0.35 + i * 3.2), "stone_dark",
               chain(rot_z(a), translate(r * 0.92, 0, 0)))
        md.add(box(0.2, 0.36, 1.2, z0=h * 0.35 + i * 3.2 + 0.15), "window_glow",
               chain(rot_z(a), translate(r * 1.02, 0, 0)))
    return md


# ------------------------------------------------------------ 城牆與城門
def build_walls(md, rng, gates):
    n = 48
    h = 15.0
    t = 4.5
    for i in range(n):
        a0 = TAU * i / n
        a1 = TAU * (i + 1) / n
        am = (a0 + a1) / 2
        if any(abs(((am - g + math.pi) % TAU) - math.pi) < 0.075 for g in gates):
            continue
        seg = TAU * WALL_R / n
        md.add(box(t, seg * 1.02, h, z0=0), "stone_castle", chain(rot_z(am), translate(WALL_R, 0, 0)))
        md.add(box(t + 1.0, seg * 1.02, 0.7, z0=h), "stone_castle",
               chain(rot_z(am), translate(WALL_R, 0, 0)))
        for k in range(3):  # 雉堞
            md.add(box(t * 0.5, seg * 0.24, 1.7, z0=h + 0.7), "stone_castle",
                   chain(rot_z(am), translate(WALL_R + t * 0.25, 0, 0),
                         translate(0, (k - 1) * seg * 0.33, 0)))
    # 塔樓
    tow = round_tower(rng, r=6.0, h=19.0, crenel=True)
    for i in range(10):
        a = TAU * i / 10 + 0.12
        md.add_mesh(tow, chain(rot_z(a), translate(WALL_R, 0, -0.4)))
    # 城門
    for g in gates:
        gm = MeshData("gate")
        gw = 13.0
        gm.add(box(7.0, gw, 22.0, z0=0), "stone_castle", translate(WALL_R, 0, 0))
        # 拱門洞
        arch = []
        for k in range(13):
            aa = math.pi * k / 12
            arch.append((3.2 * math.cos(aa), 6.5 + 3.2 * math.sin(aa)))
        V, F = extrude_poly([(-4.2, 0.0), (4.2, 0.0), (4.2, 6.5)] +
                            [(x, z) for x, z in arch] + [(-4.2, 6.5)], 8.0)
        gm.add((V, F), "stone_dark",
               chain(translate(WALL_R - 4.0, 0, 0), rot_x(math.pi / 2), rot_y(0)))
        for s in (-1, 1):
            gm.add_mesh(round_tower(rng, r=6.5, h=24.0, crenel=True),
                        chain(rot_z(0), translate(WALL_R, s * (gw / 2 + 5.0), -0.4)))
        for k in range(7):  # 落閘
            gm.add(box(0.22, 0.22, 7.0, z0=3.0), "iron",
                   translate(WALL_R - 3.6, -3.6 + k * 1.2, 0))
        for k in range(5):
            gm.add(box(0.22, 8.0, 0.22, z0=3.0 + k * 1.6), "iron",
                   translate(WALL_R - 3.6, 0, 0))
        gm.add(box(0.5, 3.0, 4.5, z0=14.0), "fabric_red", translate(WALL_R + 3.6, 0, 0))
        md.add_mesh(gm, rot_z(g))


def build_streets(md, rng, gates):
    """石板街道、放射狀主街與環狀街。"""
    z = 0.12
    for r in (148.0, 248.0, 348.0):
        n = 96
        pts_in = ring_pts(r - 6.5, n, z)
        pts_out = ring_pts(r + 6.5, n, z)
        V = np.concatenate([pts_in, pts_out], axis=0)
        F = [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
        md.add((V, F), "cobble")
    for i in range(12):
        a = TAU * i / 12 + 0.12
        w = 10.0 if any(abs(((a - g + math.pi) % TAU) - math.pi) < 0.2 for g in gates) else 6.5
        md.add(box(WALL_R - PLAZA_R + 10, w, 0.06, center_xy=False, z0=z - 0.06),
               "cobble", chain(rot_z(a), translate(PLAZA_R - 5, -w / 2, 0)))
    # 中央廣場
    md.add(revolve([(0, z), (PLAZA_R, z)], 72), "cobble")
    md.add(torus(PLAZA_R * 0.60, 0.8, 72, 6), "stone_dark", translate(0, 0, z))
    md.add(torus(PLAZA_R * 0.93, 1.0, 72, 6), "stone_dark", translate(0, 0, z))


def build_fountain(md, rng, S=0.55):
    md.add(revolve([(16.0 * S, 0.2), (16.0 * S, 2.2 * S), (14.6 * S, 2.2 * S),
                    (14.6 * S, 0.6 * S), (0, 0.6 * S)], 32), "marble")
    md.add(revolve([(0, 0.65 * S), (15.0 * S, 0.65 * S)], 32), "water")
    md.add(revolve([(6.0 * S, 0.6 * S), (5.2 * S, 3.4 * S), (7.4 * S, 3.8 * S),
                    (7.0 * S, 4.4 * S), (2.0 * S, 5.0 * S)], 24), "marble")
    md.add(revolve([(0, 5.0 * S), (7.0 * S, 5.2 * S), (6.4 * S, 6.0 * S),
                    (1.2 * S, 6.4 * S)], 24), "marble")
    md.add(revolve([(0, 6.4 * S), (1.6 * S, 6.5 * S)], 16), "water")
    md.add(cylinder(1.0 * S, 4.0 * S, 12, r_top=0.8 * S, z0=6.4 * S), "marble")
    md.add(uv_sphere(1.6 * S, 16, 10), "crystal_blue", translate(0, 0, 11.2 * S))
    for i in range(4):
        a = TAU * i / 4
        md.add(box(0.5 * S, 3.0 * S, 0.5 * S, z0=8.0 * S), "marble",
               chain(rot_z(a), translate(1.2 * S, 0, 0)))
    for i in range(8):
        a = TAU * i / 8 + 0.2
        md.add(cylinder(0.5, 3.6, 8, r_top=0.42), "stone_wall",
               chain(rot_z(a), translate(23.0 * S, 0, 0.2)))
        md.add(uv_sphere(0.55, 8, 6), "lamp_glass",
               chain(rot_z(a), translate(23.0 * S, 0, 4.3)))


def build_market(md, rng, r=92.0):
    """廣場周邊市集攤位。"""
    for i in range(14):
        a = TAU * i / 14 + 0.1
        M = chain(rot_z(a), translate(r + rng.uniform(-12, 12), 0, 0), rot_z(math.pi))
        w, d = 4.6, 3.6
        for sx in (-1, 1):
            for sy in (-1, 1):
                md.add(box(0.12, 0.12, 2.4), "wood_dark",
                       M @ translate(sx * w / 2, sy * d / 2, 0))
        V = np.array([(-w / 2 - 0.5, -d / 2 - 0.5, 2.4), (w / 2 + 0.5, -d / 2 - 0.5, 2.4),
                      (w / 2 + 0.5, 0, 3.4), (-w / 2 - 0.5, 0, 3.4)])
        fab = rng.choice(["fabric_red", "fabric_blue", "fabric_green", "canvas"])
        md.add((V, [(0, 1, 2, 3)]), fab, M)
        V2 = V.copy()
        V2[:, 1] *= -1
        md.add((V2, [(0, 3, 2, 1)]), fab, M)
        md.add(box(w, 1.0, 0.12, z0=0.95), "wood_plank", M @ translate(0, -d / 2 + 0.4, 0))
        for k in range(rng.randint(3, 7)):
            p = (rng.uniform(-w / 2, w / 2), rng.uniform(-d / 2, d / 2), 0.0)
            if rng.random() < 0.5:
                md.add(box(0.5, 0.5, 0.5, z0=p[2]), "wood_furniture",
                       M @ chain(translate(p[0], p[1], 0), rot_z(rng.uniform(0, 1))))
            else:
                md.add(cylinder(0.32, 0.7, 8), "wood_furniture", M @ translate(*p))


def build_lamps(md, rng, gates):
    for r in (148.0, 248.0, 348.0):
        n = int(r / 22)
        for i in range(n):
            a = TAU * i / n
            M = chain(rot_z(a), translate(r + 8.5, 0, 0))
            md.add(cylinder(0.16, 4.4, 8, r_top=0.12), "iron", M)
            md.add(box(0.5, 0.5, 0.7, z0=4.4), "iron", M)
            md.add(box(0.34, 0.34, 0.5, z0=4.5), "lamp_glass", M)
            md.add(cone(0.42, 0.4, 6, z0=5.1), "iron", M)


def build_keep(md, rng):
    """城鎮北側的領主城堡。"""
    K = chain(translate(0, 336.0, 0), rot_z(math.pi))
    md.add(box(74, 58, 4.0, z0=-1.0), "stone_castle", K)
    md.add(box(64, 48, 30.0, z0=3.0), "stone_castle", K)
    md.add(box(68, 52, 1.4, z0=33.0), "stone_castle", K)
    for i in range(16):
        for s in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            pass
    # 雉堞
    for u in np.linspace(-33, 33, 20):
        for sy in (-1, 1):
            md.add(box(2.2, 1.6, 2.4, z0=34.4), "stone_castle", K @ translate(u, sy * 25.5, 0))
    for v in np.linspace(-25, 25, 15):
        for sx in (-1, 1):
            md.add(box(1.6, 2.2, 2.4, z0=34.4), "stone_castle", K @ translate(sx * 33.5, v, 0))
    # 角塔
    for sx in (-1, 1):
        for sy in (-1, 1):
            md.add_mesh(round_tower(rng, r=9.0, h=44.0, crenel=False, roof="roof_tile_blue"),
                        K @ translate(sx * 33, sy * 25, 0))
    # 主塔
    md.add(box(26, 24, 52.0, z0=3.0), "stone_castle", K @ translate(0, 6, 0))
    md.add(box(29, 27, 1.4, z0=55.0), "stone_castle", K @ translate(0, 6, 0))
    md.add(prism_roof(29, 27, 16.0, z0=56.4), "roof_tile_blue", K @ translate(0, 6, 0))
    # 大門與階梯
    md.add(box(14, 6, 12.0, z0=3.0), "stone_dark", K @ translate(0, -27, 0))
    V, F = stairs(16.0, 8, 0.5, 1.1)
    md.add((V, F), "stone_wall", K @ chain(translate(-38, 0, -1.0), rot_z(-math.pi / 2)))
    # 窗
    for f in range(4):
        for u in np.linspace(-26, 26, 9):
            md.add(box(0.6, 1.4, 3.0, z0=8.0 + f * 7.0), "stone_dark",
                   K @ translate(u, -24.2, 0))
            md.add(box(0.2, 1.0, 2.6, z0=8.2 + f * 7.0), "window_glow",
                   K @ translate(u, -24.6, 0))
    # 旗幟
    for sx in (-1, 1):
        md.add(cylinder(0.2, 12.0, 6, z0=57.8), "iron", K @ translate(sx * 10, 6, 0))
        md.add(box(0.14, 5.0, 7.0, z0=62.0), "fabric_blue", K @ translate(sx * 10, 8.5, 0))


def build_training_ground(md, rng):
    """訓練場：圍籬、木樁、標靶、武器架、帳篷。"""
    T = translate(-266.0, -206.0, 0)
    md.add(box(120, 90, 0.12, z0=0.05), "gravel", T)
    for i in range(24):  # 圍籬
        for sy in (-1, 1):
            md.add(cylinder(0.14, 1.4, 6), "wood_dark", T @ translate(-60 + i * 5, sy * 45, 0))
        md.add(box(5.2, 0.1, 0.16, z0=1.0), "wood_plank", T @ translate(-57.5 + i * 5, 45, 0))
        md.add(box(5.2, 0.1, 0.16, z0=1.0), "wood_plank", T @ translate(-57.5 + i * 5, -45, 0))
    for i in range(18):
        for sx in (-1, 1):
            md.add(cylinder(0.14, 1.4, 6), "wood_dark", T @ translate(sx * 60, -45 + i * 5, 0))
    for i in range(8):  # 木人樁
        M = T @ chain(translate(-40 + i * 11, 18 + rng.uniform(-4, 4), 0),
                      rot_z(rng.uniform(0, TAU)))
        md.add(cylinder(0.22, 2.1, 8), "wood_dark", M)
        md.add(box(0.3, 1.7, 0.3, z0=1.5), "wood_dark", M)
        md.add(uv_sphere(0.32, 8, 5), "thatch", M @ translate(0, 0, 2.3))
        md.add(cylinder(0.36, 0.7, 8), "thatch", M @ translate(0, 0, 1.0))
    for i in range(5):  # 箭靶
        M = T @ translate(-30 + i * 15, -34, 0)
        md.add(cylinder(0.12, 1.6, 6), "wood_dark", M)
        md.add(cylinder(1.0, 0.16, 20), "thatch", M @ chain(translate(0, 0, 2.0), rot_x(math.pi / 2)))
        md.add(cylinder(0.62, 0.06, 16), "fabric_red", M @ chain(translate(0, -0.1, 2.0), rot_x(math.pi / 2)))
        md.add(cylinder(0.24, 0.06, 12), "fabric_blue", M @ chain(translate(0, -0.14, 2.0), rot_x(math.pi / 2)))
    for i in range(3):  # 武器架
        M = T @ chain(translate(20 + i * 14, 40, 0), rot_z(math.pi))
        md.add(box(2.6, 0.4, 0.3, z0=0.0), "wood_plank", M)
        md.add(box(0.2, 0.2, 1.9, z0=0.0), "wood_dark", M @ translate(-1.2, 0, 0))
        md.add(box(0.2, 0.2, 1.9, z0=0.0), "wood_dark", M @ translate(1.2, 0, 0))
        md.add(box(2.6, 0.2, 0.2, z0=1.7), "wood_dark", M)
        for k in range(6):
            xx = -1.05 + k * 0.42
            md.add(cylinder(0.05, 1.9, 6), "wood_dark", M @ translate(xx, 0, 0.2))
            md.add(box(0.10, 0.22, 0.7, z0=1.4), "steel", M @ translate(xx, 0, 0.7))
    for i in range(3):  # 帳篷
        M = T @ chain(translate(-52 + i * 10, -30, 0), rot_z(rng.uniform(0, 0.4)))
        md.add(prism_roof(6.0, 8.0, 3.2), "canvas", M)
        md.add(box(0.14, 0.14, 3.2), "wood_dark", M @ translate(0, -4, 0))


def build_bridge(rng, length=120.0, width=14.0, arches=3):
    """石拱橋（在地形上單獨放置）。"""
    bm = MeshData("bridge")
    span = length / arches
    for i in range(arches):
        cx = -length / 2 + span * (i + 0.5)
        prof = []
        for k in range(15):
            a = math.pi * k / 14
            prof.append((cx + span * 0.44 * math.cos(a), span * 0.30 * math.sin(a)))
        pts = [(cx - span * 0.48, -3.0)] + prof + [(cx + span * 0.48, -3.0)]
        V, F = extrude_poly(pts, width)
        bm.add((V, F), "stone_castle", chain(rot_x(math.pi / 2), translate(0, 0, -width / 2)))
        if i < arches - 1:
            bm.add(box(4.0, width, 10.0, z0=-9.0),
                   "stone_castle", translate(cx + span * 0.5, 0, 0))
    bm.add(box(length + 6, width, 1.2, z0=span * 0.30 - 1.2), "cobble")
    for sy in (-1, 1):  # 欄杆
        bm.add(box(length + 6, 0.9, 1.5, z0=span * 0.30), "stone_wall",
               translate(0, sy * (width / 2 - 0.45), 0))
        for k in range(int(length / 8)):
            bm.add(cylinder(0.5, 3.2, 8, r_top=0.4, z0=span * 0.30 + 1.5), "stone_wall",
                   translate(-length / 2 + 4 + k * 8, sy * (width / 2 - 0.45), 0))
            bm.add(uv_sphere(0.45, 8, 5), "lamp_glass",
                   translate(-length / 2 + 4 + k * 8, sy * (width / 2 - 0.45),
                             span * 0.30 + 3.6))
    return bm


def build_ruins(md, rng, n=26):
    """森林中的古代遺跡。"""
    for i in range(n):
        a = rng.uniform(0, TAU)
        r = rng.uniform(0, 150)
        M = chain(translate(r * math.cos(a), r * math.sin(a), 0), rot_z(rng.uniform(0, TAU)))
        k = rng.random()
        if k < 0.4:
            h = rng.uniform(4, 14)
            md.add(cylinder(1.5, h, 12, r_top=1.35), "ruin_stone", M)
            md.add(box(3.6, 3.6, 0.6, z0=-0.3), "ruin_stone", M)
            if rng.random() < 0.5:
                md.add(box(3.4, 3.4, 0.8, z0=h), "ruin_stone", M)
        elif k < 0.7:
            md.add(box(rng.uniform(6, 16), 1.8, rng.uniform(3, 9)), "ruin_stone", M)
        else:
            md.add(cylinder(1.4, rng.uniform(6, 12), 12), "ruin_stone",
                   M @ chain(rot_y(rng.uniform(1.2, 1.6)), translate(0, 0, 0)))
    md.add(revolve([(0, 0.3), (56, 0.3)], 40), "ruin_stone")
    for i in range(12):
        a = TAU * i / 12
        md.add(cylinder(1.8, rng.uniform(9, 17), 12, r_top=1.6), "ruin_stone",
               chain(rot_z(a), translate(46, 0, 0.3)))
    md.add(revolve([(10, 0.4), (16, 1.2), (14, 2.0)], 24), "ruin_stone")
    md.add(uv_sphere(3.0, 16, 10), "crystal_blue", translate(0, 0, 5.0))


# ------------------------------------------------------------------ 組裝
def build(quality, matlib, coll, terr, rng):
    q = C.QUALITY[quality]
    gates = [0.12 + TAU * k / 4 for k in range(4)]
    md = MeshData("Town_Static")
    build_walls(md, rng, gates)
    build_streets(md, rng, gates)
    build_fountain(md, rng)
    build_market(md, rng)
    build_lamps(md, rng, gates)
    build_keep(md, rng)
    build_training_ground(md, rng)
    ob = md.to_object(coll, matlib)
    ob.location = ORIGIN

    # 建築原型
    protos = []
    styles = (["house"] * 8 + ["shop"] * 4 + ["inn"] * 2 + ["workshop"] * 2)
    for i, st in enumerate(styles):
        w = rng.uniform(6.5, 11.0)
        d = rng.uniform(7.0, 12.0)
        fl = rng.choice([2, 2, 2, 3, 3, 1] if st != "inn" else [3, 3, 4])
        protos.append(proto_mesh(building(rng, w, d, fl, st), matlib, f"proto_bld_{i}"))

    # 沿街配置
    count = 0
    target = q["house_count"]
    lots = []
    for ring_r, inset in ((104, -1), (132, 1), (196, -1), (224, 1), (296, -1), (324, 1),
                          (392, -1), (420, 1)):
        n = max(8, int(TAU * ring_r / 19))
        for i in range(n):
            a = TAU * i / n + rng.uniform(-0.01, 0.01)
            lots.append((a, ring_r + inset * 11.0, a + (0 if inset < 0 else math.pi)))
    rng.shuffle(lots)
    for a, r, face in lots:
        if count >= target:
            break
        if any(abs(((a - g + math.pi) % TAU) - math.pi) < 0.055 for g in gates):
            continue
        spokes = [0.12 + TAU * k / 12 for k in range(12)]
        if any(abs(((a - sp + math.pi) % TAU) - math.pi) < 0.045 for sp in spokes):
            continue                                  # 讓開放射狀主街
        x = r * math.cos(a)
        y = r * math.sin(a)
        if math.hypot(x - 0, y - 336) < 74:   # 讓開城堡
            continue
        if math.hypot(x + 266, y + 206) < 80:  # 讓開訓練場
            continue
        if math.hypot(x - 168.0, y + 96.0) < 22 or math.hypot(x + 96.0, y - 214.0) < 20:
            continue                                  # 讓開旅館與工坊
        instance(protos[rng.randrange(len(protos))], coll,
                 (ORIGIN[0] + x, ORIGIN[1] + y, ORIGIN[2] + 0.15),
                 rz=face + rng.uniform(-0.05, 0.05), s=rng.uniform(0.92, 1.14))
        count += 1

    # 城外：石橋、遺跡、湖畔小屋
    bm = build_bridge(rng)
    bp = proto_mesh(bm, matlib, "proto_bridge")
    for i, t in enumerate((0.42, 0.72)):
        i0 = int(t * (len(N.RIVER) - 1))
        p0 = np.array(N.RIVER[i0])
        p1 = np.array(N.RIVER[min(i0 + 1, len(N.RIVER) - 1)])
        p = p0 + (p1 - p0) * 0.5
        d = p1 - p0
        z = terr.h1(p[0], p[1]) + 21.0
        instance(bp, coll, (p[0], p[1], z), rz=math.atan2(d[1], d[0]) + math.pi / 2,
                 s=1.0, name=f"Bridge_{i}")

    rm = MeshData("Ruins")
    build_ruins(rm, rng)
    ro = rm.to_object(coll, matlib)
    ro.location = (N.RUINS[0], N.RUINS[1], terr.h1(*N.RUINS))

    # 湖畔漁村
    for i in range(9):
        a = 2.5 + i * 0.16
        x = N.LAKE[0] + (N.LAKE_R + 95) * math.cos(a)
        y = N.LAKE[1] + (N.LAKE_R + 95) * math.sin(a)
        z = terr.h1(x, y)
        instance(protos[rng.randrange(8)], coll, (x, y, z),
                 rz=a + math.pi + rng.uniform(-0.3, 0.3), s=rng.uniform(0.8, 1.0))
    return count
