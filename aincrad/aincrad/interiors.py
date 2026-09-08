"""室內場景：房間殼體、旅館一樓酒場、工坊。"""
import math
import random
import numpy as np

from .meshutil import (MeshData, box, cylinder, revolve, uv_sphere, torus, cone,
                       prism_roof, extrude_poly, tube_along, stairs, translate,
                       rot_z, rot_y, rot_x, scale, chain, TAU, loft)
from . import props as P


def room_shell(md, w, d, h, t=0.4, floor_mat="wood_floor", wall_mat="plaster",
               base_mat="stone_wall", ceil_mat="wood_plank", beams=True,
               skirt=1.2, ceiling=True):
    """以實體板材組成的房間（法線正確、無漏光）。w 沿 X、d 沿 Y。"""
    md.add(box(w + 2 * t, d + 2 * t, t, z0=-t), floor_mat)
    for sx in (-1, 1):
        md.add(box(t, d + 2 * t, h, z0=0), wall_mat, translate(sx * (w + t) / 2, 0, 0))
        md.add(box(t * 0.55, d + 2 * t, skirt, z0=0), base_mat,
               translate(sx * (w / 2 - t * 0.27), 0, 0))
    for sy in (-1, 1):
        md.add(box(w, t, h, z0=0), wall_mat, translate(0, sy * (d + t) / 2, 0))
        md.add(box(w, t * 0.55, skirt, z0=0), base_mat,
               translate(0, sy * (d / 2 - t * 0.27), 0))
    if ceiling:
        md.add(box(w + 2 * t, d + 2 * t, t, z0=h), ceil_mat)
    if beams:
        n = max(2, int(w / 2.2))
        for i in range(n):
            x = -w / 2 + w * (i + 0.5) / n
            md.add(box(0.26, d, 0.34, z0=h - 0.36), "wood_beam", translate(x, 0, 0))
        md.add(box(w, 0.34, 0.44, z0=h - 0.46), "wood_beam")
        for i in range(n):
            x = -w / 2 + w * (i + 0.5) / n
            for sy in (-1, 1):
                L = 0.9
                md.add(box(L, 0.22, 0.22), "wood_beam",
                       chain(translate(x, sy * (d / 2 - 0.35), h - 1.0),
                             rot_x(sy * math.pi / 4) if False else np.eye(4),
                             rot_z(0)))


def _wall_window(md, M, w=1.0, h=1.5, glow=True):
    md.add(box(0.5, w + 0.3, h + 0.3, z0=-0.15), "stone_wall", M)
    md.add(box(0.12, w, h), "window_glow" if glow else "glass_dirty", M)
    md.add(box(0.16, w * 0.08, h), "wood_dark", M @ translate(0.05, 0, 0))
    md.add(box(0.16, w, h * 0.06), "wood_dark", M @ translate(0.05, 0, h * 0.5))


def tavern(rng, w=17.0, d=12.0, h=4.6):
    """旅館一樓酒場：完整室內道具。"""
    md = MeshData("Tavern")
    room_shell(md, w, d, h, t=0.45, skirt=1.35)
    # 地毯與樓梯
    P.rug(md, translate(-w * 0.22, 0, 0.006), w=4.2, d=3.0)
    V, F = stairs(1.6, 12, 0.30, 0.30)
    md.add((V, F), "wood_plank",
           chain(translate(w / 2 - 0.45, d / 2 - 2.6, 0), rot_z(math.pi / 2)))
    md.add(box(0.16, 3.7, 1.0, z0=1.1), "wood_dark",
           chain(translate(w / 2 - 2.2, d / 2 - 2.6, 0), rot_z(math.pi / 2)))
    md.add(box(3.9, 2.0, 0.3, z0=h - 0.75), "wood_plank",
           translate(w / 2 - 2.0, d / 2 - 1.4, 0))

    # 壁爐
    P.fireplace(md, chain(translate(-w / 2 + 0.55, d * 0.22, 0), rot_z(0)), w=3.0, h=2.6)
    md.add(box(0.5, 3.4, 0.28, z0=2.65), "wood_beam", translate(-w / 2 + 0.75, d * 0.22, 0))
    P.books_stack(md, rng, translate(-w / 2 + 0.85, d * 0.22 + 0.9, 2.93), n=2)
    P.candle(md, translate(-w / 2 + 0.85, d * 0.22 - 0.9, 2.93))

    # 吧台
    P.bar_counter(md, rng, chain(translate(w * 0.28, -d / 2 + 1.4, 0), rot_z(math.pi / 2)),
                  w=8.0)
    for i in range(5):
        P.stool(md, translate(w * 0.28 - 3.4 + i * 1.7, -d / 2 + 2.5, 0))
    P.cauldron(md, translate(w * 0.42, -d / 2 + 0.9, 0.0), r=0.4)

    # 桌椅群
    spots = [(-w * 0.26, -d * 0.24), (-w * 0.26, d * 0.22), (0.0, -d * 0.26),
             (0.02, d * 0.24), (w * 0.24, d * 0.26), (-w * 0.05, 0.0)]
    for i, (x, y) in enumerate(spots):
        a = rng.uniform(0, TAU)
        M = chain(translate(x, y, 0), rot_z(a))
        P.table(md, M, w=rng.uniform(1.7, 2.2), d=1.0)
        for k in range(4):
            ang = TAU * k / 4 + rng.uniform(-0.2, 0.2)
            if rng.random() < 0.25:
                continue
            CM = M @ chain(rot_z(ang), translate(1.35, rng.uniform(-0.2, 0.2), 0),
                           rot_z(math.pi))
            if k % 2 == 0:
                P.chair(md, CM)
            else:
                P.stool(md, CM)
        # 桌上物件
        for k in range(rng.randint(2, 5)):
            p = M @ translate(rng.uniform(-0.7, 0.7), rng.uniform(-0.3, 0.3), 0.78)
            r = rng.random()
            if r < 0.45:
                md.add(cylinder(0.055, 0.13, 10), "wood_furniture", p)
                md.add(torus(0.062, 0.012, 10, 5), "iron", p @ translate(0, 0, 0.10))
            elif r < 0.7:
                md.add(revolve([(0, 0), (0.11, 0.012), (0.115, 0.03)], 12), "paper", p)
            elif r < 0.85:
                P.candle(md, p, h=0.18)
            else:
                P.potion(md, rng, p, s=1.5)
        if i == 5:
            P.open_book(md, M @ translate(0.2, 0.1, 0.79))
            P.scroll_map(md, M @ chain(translate(-0.35, -0.05, 0.79), rot_z(0.3)))

    # 牆面裝飾
    for sy in (-1, 1):
        P.banner(md, chain(translate(-w * 0.42, sy * (d / 2 - 0.55), h - 0.5),
                           rot_z(-sy * math.pi / 2)), w=1.0, h=2.3,
                 mat="fabric_red" if sy > 0 else "fabric_blue")
    P.weapon_rack(md, rng, chain(translate(-w / 2 + 0.8, -d * 0.30, 0), rot_z(-math.pi / 2)),
                  w=2.4, n=7)
    P.armor_stand(md, chain(translate(w / 2 - 1.2, d * 0.05, 0), rot_z(math.pi * 0.9)))
    P.shelf(md, rng, chain(translate(w * 0.05, d / 2 - 0.5, 0), rot_z(math.pi)),
            w=2.2, h=2.1, rows=4)
    P.shelf(md, rng, chain(translate(w * 0.36, d / 2 - 0.5, 0), rot_z(math.pi)),
            w=1.4, h=1.6, rows=3, fill="potions")
    for i in range(4):
        P.barrel(md, translate(-w / 2 + 1.0 + i * 0.85, d / 2 - 0.9, 0))
    for i in range(3):
        P.crate(md, chain(translate(w / 2 - 1.1, -d / 2 + 1.0 + i * 0.7, 0.0),
                          rot_z(rng.uniform(0, 1))))
    P.chest(md, chain(translate(-w / 2 + 1.4, d * 0.42, 0.0), rot_z(0.4)))
    P.chest(md, chain(translate(w * 0.44, d * 0.40, 0.0), rot_z(2.4)), open_lid=True)
    P.treasure_pile(md, rng, translate(w * 0.44, d * 0.40, 0.05), r=0.35)

    # 燈火
    for x in (-w * 0.26, w * 0.16):
        P.chandelier(md, translate(x, 0, h - 0.5), r=0.95, arms=6)
    for sy in (-1, 1):
        for x in (-w * 0.34, 0.0, w * 0.30):
            P.torch(md, chain(translate(x, sy * (d / 2 - 0.24), 1.95),
                              rot_z(-sy * math.pi / 2)))
    # 窗
    for sy in (-1, 1):
        for x in (-w * 0.18, w * 0.14):
            _wall_window(md, chain(translate(x, sy * (d / 2 + 0.05), 1.9),
                                   rot_z(sy * math.pi / 2)), w=1.2, h=1.5)
    # 門
    md.add(box(0.5, 1.6, 2.5, z0=0.0), "wood_dark",
           translate(-w / 2 - 0.1, -d * 0.34, 0))
    return md


def inn_exterior(rng, w=17.0, d=12.0, h=4.6, floors=3):
    """包住酒場的旅館外殼（含二三樓、屋頂、招牌）。"""
    md = MeshData("Inn")
    W, D = w + 1.6, d + 1.6
    md.add(box(W + 1.0, D + 1.0, 0.7, z0=-0.75), "stone_wall")
    z = h + 0.45
    for f in range(1, floors):
        jut = 0.35 * f
        md.add(box(W + jut * 2, D + jut * 2, 3.2, z0=z), "plaster_warm")
        md.add(box(W + jut * 2 + 0.3, D + jut * 2 + 0.3, 0.3, z0=z - 0.3), "wood_beam")
        for side in range(4):
            ang = side * math.pi / 2
            span = (W if side % 2 == 0 else D) + jut * 2
            half = ((D if side % 2 == 0 else W) + jut * 2) / 2
            for i in range(max(2, int(span / 3.2))):
                u = -span / 2 + span * (i + 0.5) / max(2, int(span / 3.2))
                M = chain(rot_z(ang), translate(half, u, z + 1.5))
                md.add(box(0.24, 1.2, 1.7, z0=-0.85), "wood_dark", M)
                md.add(box(0.10, 1.0, 1.5), "window_glow" if rng.random() < 0.7
                       else "glass_dirty", M @ translate(0.08, 0, -0.75))
        z += 3.2
    md.add(prism_roof(W + 2.6, D + 2.6, 5.5, z0=z), "roof_tile")
    md.add(box(W + 2.0, D + 2.0, 0.35, z0=z - 0.35), "wood_beam")
    md.add(box(1.4, 1.4, 7.0, z0=z - 1.0), "stone_wall", translate(-W * 0.3, D * 0.25, 0))
    # 招牌
    md.add(box(0.12, 0.12, 1.2, z0=h + 1.4), "iron", translate(-w / 2 - 0.9, -d * 0.34, 0))
    md.add(box(0.12, 2.0, 0.12, z0=h + 2.5), "iron", translate(-w / 2 - 0.9, -d * 0.34 - 1.0, 0))
    md.add(box(0.10, 1.7, 1.1, z0=h + 1.3), "wood_dark",
           translate(-w / 2 - 1.6, -d * 0.34 - 1.0, 0))
    md.add(box(0.06, 1.2, 0.7, z0=h + 1.5), "bronze",
           translate(-w / 2 - 1.68, -d * 0.34 - 1.0, 0))
    P.lantern(md, translate(-w / 2 - 0.75, -d * 0.34 + 1.4, h + 1.2))
    # 門廊
    md.add(box(2.2, 3.2, 0.25, z0=-0.3), "stone_wall", translate(-W / 2 - 1.0, -d * 0.34, 0))
    for sy in (-1, 1):
        md.add(cylinder(0.16, 3.0, 8), "wood_dark",
               translate(-W / 2 - 1.8, -d * 0.34 + sy * 1.3, -0.05))
    md.add(prism_roof(3.0, 3.6, 1.0, z0=2.95), "roof_tile", translate(-W / 2 - 1.4, -d * 0.34, 0))
    return md


def workshop_interior(rng, w=11.0, d=9.0, h=4.2):
    md = MeshData("Workshop")
    room_shell(md, w, d, h, t=0.4, floor_mat="cobble", wall_mat="stone_wall",
               base_mat="stone_dark", skirt=1.0)
    # 熔爐（爐口朝向室內，火光外露）
    fx, fy = -w / 2 + 1.7, d / 2 - 1.5
    md.add(box(3.0, 2.2, 0.9, z0=0), "stone_dark", translate(fx, fy, 0))
    for sx in (-1, 1):
        md.add(box(0.9, 2.2, 1.5, z0=0.9), "stone_dark",
               translate(fx + sx * 1.05, fy, 0))
    md.add(box(3.0, 2.2, 0.5, z0=1.9), "stone_dark", translate(fx, fy, 0))
    md.add(box(3.0, 0.5, 1.0, z0=0.9), "stone_dark", translate(fx, fy + 0.85, 0))
    md.add(box(1.2, 1.0, 0.55, z0=0.92), "flame_core", translate(fx, fy - 0.2, 0))
    md.add(uv_sphere(0.55, 12, 8), "flame",
           chain(translate(fx, fy - 0.25, 1.35), scale(1.4, 1.0, 0.9)))
    md.add(revolve([(1.5, 2.4), (1.4, 3.1), (0.65, 3.4)], 4), "iron",
           chain(translate(fx, fy, 0), rot_z(math.pi / 4)))
    md.add(box(1.1, 1.1, h - 3.4, z0=3.4), "stone_dark", translate(fx, fy, 0))
    # 風箱與工具
    md.add(box(1.3, 0.8, 0.6, z0=1.0), "leather", translate(fx - 1.9, fy + 0.2, 0))
    for i in range(4):
        md.add(cylinder(0.035, 1.2, 6), "iron",
               chain(translate(fx + 1.6, fy - 1.4 + i * 0.22, 0.95), rot_y(0.35)))
    P.barrel(md, translate(fx + 2.2, fy - 0.4, 0), r=0.42, h=0.9)
    md.add(cylinder(0.55, 0.62, 12), "wood_dark", translate(-w * 0.05, d * 0.10, 0))
    P.anvil(md, chain(translate(-w * 0.05, d * 0.10, 0.62), rot_z(0.5)))
    md.add(box(0.9, 0.55, 0.12, z0=0.0), "iron",
           chain(translate(-w * 0.05 + 1.1, d * 0.10 - 0.5, 0), rot_z(0.4)))
    P.crate(md, chain(translate(-w * 0.28, d * 0.02, 0.0), rot_z(0.7)))
    P.weapon_rack(md, rng, chain(translate(-w * 0.30, -d / 2 + 0.6, 0), rot_z(0)),
                  w=2.2, n=6)
    P.table(md, chain(translate(w * 0.25, -d * 0.2, 0), rot_z(1.2)), w=2.4, d=1.1,
            style="plain")
    P.weapon_rack(md, rng, chain(translate(w / 2 - 0.7, 0, 0), rot_z(math.pi / 2)), w=3.0, n=8)
    P.shelf(md, rng, chain(translate(0, -d / 2 + 0.5, 0), rot_z(0)), w=2.4, h=2.0,
            rows=4, fill="potions")
    P.armor_stand(md, translate(w * 0.32, d * 0.30, 0))
    for i in range(3):
        P.barrel(md, translate(-w / 2 + 0.9 + i * 0.8, -d / 2 + 0.9, 0))
    P.crate(md, translate(w * 0.40, -d * 0.40, 0.0))
    for sy in (-1, 1):
        P.torch(md, chain(translate(w * 0.1, sy * (d / 2 - 0.22), 2.1),
                          rot_z(-sy * math.pi / 2)))
    P.chandelier(md, translate(0, 0, h - 0.5), r=0.8, arms=5)
    md.add(box(0.5, 2.4, 2.6, z0=0), "wood_dark", translate(-w / 2 - 0.05, -d * 0.3, 0))
    return md
