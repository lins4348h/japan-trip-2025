"""中世紀奇幻室內道具：家具、火把、吊燈、武器架、盔甲、藥水、寶箱、地圖、書籍、旗幟。"""
import math
import random
import numpy as np

from .meshutil import (MeshData, box, cylinder, revolve, uv_sphere, torus, cone,
                       prism_roof, extrude_poly, tube_along, stairs, translate,
                       rot_z, rot_y, rot_x, scale, chain, TAU, loft)

WOOD = "wood_furniture"
DARK = "wood_dark"


# ------------------------------------------------------------------ 燈火
def torch(md, M=np.eye(4), lit=True, wall=True):
    if wall:
        md.add(box(0.16, 0.16, 0.34, z0=0.0), "iron", M)
        md.add(tube_along([(0.05, 0, 0.2), (0.30, 0, 0.30), (0.42, 0, 0.52)], 0.035, n=6),
               "iron", M)
        base = translate(0.42, 0, 0.52)
    else:
        base = np.eye(4)
    md.add(revolve([(0.10, 0.0), (0.16, 0.16), (0.13, 0.30)], 10), "iron", M @ base)
    md.add(cylinder(0.055, 0.35, 8, z0=-0.32), DARK, M @ base)
    if lit:
        md.add(uv_sphere(0.15, 10, 7), "flame",
               M @ base @ chain(translate(0, 0, 0.34), scale(0.8, 0.8, 1.7)))
        md.add(uv_sphere(0.07, 8, 5), "flame_core", M @ base @ translate(0, 0, 0.36))


def candle(md, M=np.eye(4), h=0.22):
    md.add(cylinder(0.028, h, 8), "paper", M)
    md.add(uv_sphere(0.035, 8, 5), "flame_core",
           M @ chain(translate(0, 0, h + 0.03), scale(0.7, 0.7, 2.0)))


def chandelier(md, M=np.eye(4), r=0.85, arms=6, drop=1.6):
    md.add(tube_along([(0, 0, drop), (0, 0, 0.1)], 0.02, n=6), "iron", M)
    md.add(torus(r, 0.05, 20, 6), "iron", M)
    md.add(torus(r * 0.55, 0.045, 16, 6), "iron", M @ translate(0, 0, 0.22))
    for i in range(arms):
        a = TAU * i / arms
        md.add(tube_along([(0, 0, 0.30), (r * 0.6, 0, 0.16), (r, 0, 0.06)], 0.028, n=5),
               "iron", M @ rot_z(a))
        md.add(revolve([(0.10, 0.0), (0.13, 0.05), (0.06, 0.09)], 8), "iron",
               M @ chain(rot_z(a), translate(r, 0, 0.06)))
        candle(md, M @ chain(rot_z(a), translate(r, 0, 0.12)), h=0.24)
    for i in range(arms):
        a = TAU * i / arms + math.pi / arms
        md.add(tube_along([(0, 0, 0.36), (r * 0.4, 0, 0.30), (r * 0.55, 0, 0.24)],
                          0.024, n=5), "iron", M @ rot_z(a))
        candle(md, M @ chain(rot_z(a), translate(r * 0.55, 0, 0.26)), h=0.20)


def lantern(md, M=np.eye(4)):
    md.add(box(0.20, 0.20, 0.05), "iron", M)
    for sx in (-1, 1):
        for sy in (-1, 1):
            md.add(box(0.022, 0.022, 0.28, z0=0.05), "iron",
                   M @ translate(sx * 0.085, sy * 0.085, 0))
    md.add(box(0.16, 0.16, 0.26, z0=0.06), "lamp_glass", M)
    md.add(cone(0.16, 0.10, 4, z0=0.33), "iron", M)
    md.add(tube_along([(0, 0, 0.43), (0, 0, 0.60)], 0.012, n=5), "iron", M)


def brazier(md, M=np.eye(4), r=0.55, h=1.1):
    md.add(revolve([(r * 0.5, 0), (r * 0.22, h * 0.25), (r * 0.30, h * 0.72),
                    (r, h), (r * 0.92, h * 0.86)], 14), "iron", M)
    for i in range(3):
        a = TAU * i / 3
        md.add(box(0.08, r * 1.2, 0.08, z0=0.02), "iron", M @ rot_z(a))
    md.add(revolve([(0, h * 0.84), (r * 0.85, h * 0.9)], 14), "stone_dark", M)
    md.add(uv_sphere(r * 0.75, 12, 8), "flame",
           M @ chain(translate(0, 0, h * 0.95), scale(1, 1, 1.5)))
    md.add(uv_sphere(r * 0.35, 10, 6), "flame_core", M @ translate(0, 0, h * 1.0))


# ------------------------------------------------------------------ 家具
def table(md, M=np.eye(4), w=1.9, d=0.95, h=0.78, style="tavern"):
    md.add(box(w, d, 0.075, z0=h - 0.075), WOOD, M)
    md.add(box(w * 0.96, d * 0.5, 0.05, z0=h - 0.13), DARK, M)
    if style == "tavern":
        for sx in (-1, 1):
            md.add(box(0.10, d * 0.85, h - 0.1, z0=0), DARK, M @ translate(sx * (w / 2 - 0.16), 0, 0))
            md.add(box(0.14, d * 1.0, 0.09, z0=0), DARK, M @ translate(sx * (w / 2 - 0.16), 0, 0))
        md.add(box(w * 0.7, 0.10, 0.10, z0=0.16), DARK, M)
    else:
        for sx in (-1, 1):
            for sy in (-1, 1):
                md.add(box(0.09, 0.09, h - 0.075), DARK,
                       M @ translate(sx * (w / 2 - 0.13), sy * (d / 2 - 0.13), 0))


def chair(md, M=np.eye(4), w=0.46, d=0.46, h=0.46, back=0.55):
    md.add(box(w, d, 0.055, z0=h), WOOD, M)
    for sx in (-1, 1):
        for sy in (-1, 1):
            md.add(box(0.055, 0.055, h), DARK,
                   M @ translate(sx * (w / 2 - 0.05), sy * (d / 2 - 0.05), 0))
    for sy in (-1, 1):
        md.add(box(0.055, 0.055, back, z0=h + 0.05), DARK,
               M @ translate(-(w / 2 - 0.05), sy * (d / 2 - 0.05), 0))
    for k in range(3):
        md.add(box(0.05, d - 0.1, 0.07, z0=h + 0.16 + k * 0.16), WOOD,
               M @ translate(-(w / 2 - 0.05), 0, 0))


def bench(md, M=np.eye(4), w=1.9, d=0.38, h=0.44):
    md.add(box(w, d, 0.07, z0=h), WOOD, M)
    for sx in (-1, 1):
        md.add(box(0.09, d, h), DARK, M @ translate(sx * (w / 2 - 0.14), 0, 0))
    md.add(box(w * 0.8, 0.06, 0.08, z0=0.14), DARK, M)


def barrel(md, M=np.eye(4), r=0.34, h=0.86):
    prof = [(r * 0.82, 0), (r, h * 0.3), (r, h * 0.7), (r * 0.82, h)]
    md.add(revolve(prof, 14, cap_start=True, cap_end=True), WOOD, M)
    for z in (h * 0.16, h * 0.5, h * 0.84):
        md.add(torus(r * 0.99, 0.022, 14, 5), "iron", M @ translate(0, 0, z))


def crate(md, M=np.eye(4), s=0.62):
    md.add(box(s, s, s), "wood_plank", M)
    t = 0.045
    for sx in (-1, 1):
        md.add(box(t, s * 1.01, t, z0=s * 0.12), DARK, M @ translate(sx * s / 2, 0, 0))
        md.add(box(t, s * 1.01, t, z0=s * 0.82), DARK, M @ translate(sx * s / 2, 0, 0))
        md.add(box(s * 1.01, t, t, z0=s * 0.12), DARK, M @ translate(0, sx * s / 2, 0))
        md.add(box(s * 1.01, t, t, z0=s * 0.82), DARK, M @ translate(0, sx * s / 2, 0))


def _axis_zxy():
    """把 (X,Y,Z) 對映到 (Z,X,Y)：讓 extrude_poly 的擠出軸變成 +X。"""
    m = np.eye(4)
    m[:3, :3] = np.array([[0.0, 0.0, 1.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0]])
    return m


def chest(md, M=np.eye(4), w=0.95, d=0.55, h=0.45, open_lid=False):
    md.add(box(w, d, h), "wood_plank", M)
    md.add(box(w * 1.01, d * 1.01, 0.05, z0=h - 0.05), DARK, M)
    arc = [(-d / 2, 0.0)]
    for k in range(11):
        a = math.pi * k / 10
        arc.append((-d / 2 * math.cos(a), d * 0.46 * math.sin(a)))
    V, F = extrude_poly(arc, w)
    LM = M @ chain(translate(0, 0, h), _axis_zxy(), translate(0, 0, -w / 2))
    if open_lid:
        LM = M @ chain(translate(0, -d / 2, h), rot_x(-1.15), translate(0, d / 2, 0),
                       _axis_zxy(), translate(0, 0, -w / 2))
    md.add((V, F), "wood_plank", LM)
    for sx in (-1, 1):
        md.add(box(w * 1.02, 0.05, h * 1.02), "iron", M @ translate(0, sx * d * 0.30, 0))
    md.add(box(0.10, d * 0.30, h * 0.42, z0=h * 0.28), "bronze",
           M @ translate(w / 2, 0, 0))
    md.add(box(0.07, 0.14, 0.14, z0=h * 0.52), "gold", M @ translate(w / 2 + 0.03, 0, 0))
    for sx in (-1, 1):
        md.add(torus(0.07, 0.018, 10, 5), "iron",
               M @ chain(translate(sx * w / 2, 0, h * 0.6), rot_x(math.pi / 2)))


def treasure_pile(md, rng, M=np.eye(4), r=0.9):
    md.add(revolve([(0, 0.22), (r * 0.5, 0.16), (r, 0.0)], 14, cap_start=True),
           "gold", M)
    for i in range(rng.randint(10, 22)):
        a = rng.uniform(0, TAU)
        rr = rng.uniform(0, r)
        md.add(cylinder(0.035, 0.008, 8), "gold",
               M @ chain(translate(rr * math.cos(a), rr * math.sin(a),
                                   0.2 * (1 - rr / r) + 0.01),
                         rot_x(rng.uniform(0, 1.2)), rot_z(rng.uniform(0, TAU))))
    for i in range(rng.randint(2, 5)):
        a = rng.uniform(0, TAU)
        md.add(uv_sphere(rng.uniform(0.04, 0.08), 8, 5),
               rng.choice(["crystal_blue", "potion_red", "silver"]),
               M @ translate(rng.uniform(-r, r) * 0.6, rng.uniform(-r, r) * 0.6, 0.2))


def shelf(md, md_rng, M=np.eye(4), w=1.6, d=0.34, h=1.9, rows=4, fill="books"):
    md.add(box(w, d, 0.06, z0=h), DARK, M)
    for sx in (-1, 1):
        md.add(box(0.06, d, h), DARK, M @ translate(sx * (w / 2 - 0.03), 0, 0))
    md.add(box(w, 0.05, h), DARK, M @ translate(0, -d / 2, 0))
    for r in range(rows):
        zz = 0.12 + r * (h - 0.2) / rows
        md.add(box(w - 0.12, d, 0.045, z0=zz), DARK, M)
        x = -w / 2 + 0.12
        while x < w / 2 - 0.14:
            if fill == "books" and md_rng.random() < 0.85:
                bw = md_rng.uniform(0.035, 0.075)
                bh = md_rng.uniform(0.18, 0.30)
                col = md_rng.choice(["fabric_red", "fabric_blue", "fabric_green",
                                     "leather", "wood_dark", "parchment"])
                md.add(box(bw, d * 0.75, bh, z0=zz + 0.045), col,
                       M @ chain(translate(x, 0, 0), rot_z(md_rng.uniform(-0.05, 0.05))))
                x += bw + 0.008
            elif fill == "potions":
                potion(md, md_rng, M @ translate(x, md_rng.uniform(-0.05, 0.05), zz + 0.045))
                x += 0.13
            else:
                x += 0.09
    return md


def potion(md, rng, M=np.eye(4), s=1.0):
    col = rng.choice(["potion_red", "potion_blue", "potion_green"])
    prof = [(0.0, 0.0), (0.045, 0.005), (0.052, 0.055), (0.030, 0.085),
            (0.018, 0.105), (0.020, 0.135)]
    prof = [(r * s, z * s) for r, z in prof]
    md.add(revolve(prof, 10, cap_start=True), "glass", M)
    md.add(revolve([(0.0, 0.006 * s), (0.042 * s, 0.010 * s), (0.046 * s, 0.052 * s),
                    (0.024 * s, 0.080 * s)], 10, cap_start=True, cap_end=True), col, M)
    md.add(cylinder(0.019 * s, 0.022 * s, 8, z0=0.132 * s), "bark", M)


def books_stack(md, rng, M=np.eye(4), n=3):
    z = 0.0
    for i in range(n):
        w = rng.uniform(0.16, 0.24)
        d = rng.uniform(0.12, 0.18)
        h = rng.uniform(0.030, 0.055)
        col = rng.choice(["fabric_red", "fabric_blue", "leather", "wood_dark"])
        md.add(box(w, d, h, z0=z), col, M @ rot_z(rng.uniform(-0.3, 0.3)))
        md.add(box(w * 0.94, d * 0.94, h * 0.7, z0=z + h * 0.15), "paper",
               M @ rot_z(rng.uniform(-0.3, 0.3)))
        z += h + 0.004


def open_book(md, M=np.eye(4), s=1.0):
    md.add(box(0.34 * s, 0.24 * s, 0.028 * s), "leather", M)
    for sx in (-1, 1):
        V = np.array([(0.005 * s * sx, -0.11 * s, 0.028 * s),
                      (0.16 * s * sx, -0.11 * s, 0.040 * s),
                      (0.16 * s * sx, 0.11 * s, 0.040 * s),
                      (0.005 * s * sx, 0.11 * s, 0.028 * s)])
        md.add((V, [(0, 1, 2, 3)]), "paper", M)


def scroll_map(md, M=np.eye(4), w=0.7, d=0.5):
    md.add(box(w, d, 0.006), "parchment", M @ translate(0, 0, 0.003))
    for sx in (-1, 1):
        md.add(cylinder(0.022, d * 1.15, 10), "wood_dark",
               M @ chain(translate(sx * w / 2, 0, 0.02), rot_x(math.pi / 2),
                         translate(0, 0, -d * 1.15 / 2)))
    md.add(box(w * 0.55, d * 0.4, 0.002), "wood_dark", M @ translate(0.05, 0.02, 0.008))
    md.add(box(w * 0.2, d * 0.16, 0.002), "fabric_red", M @ translate(-0.12, -0.08, 0.008))


def weapon_rack(md, rng, M=np.eye(4), w=2.0, n=6):
    md.add(box(w, 0.42, 0.10), DARK, M)
    md.add(box(w, 0.10, 1.85), DARK, M @ translate(0, 0.18, 0))
    md.add(box(w, 0.16, 0.10, z0=1.6), DARK, M @ translate(0, 0.10, 0))
    for i in range(n):
        x = -w / 2 + w * (i + 0.5) / n
        k = rng.random()
        MM = M @ chain(translate(x, 0.05, 0.10), rot_x(rng.uniform(-0.05, 0.05)))
        if k < 0.45:      # 劍
            md.add(box(0.055, 0.16, 1.05, z0=0.25), "steel", MM)
            md.add(box(0.05, 0.05, 0.25), DARK, MM @ translate(0, 0, 0.0))
            md.add(box(0.05, 0.42, 0.06, z0=0.22), "bronze", MM)
            md.add(uv_sphere(0.045, 8, 5), "bronze", MM @ translate(0, 0, -0.02))
        elif k < 0.7:     # 長槍
            md.add(cylinder(0.030, 1.75, 8), DARK, MM)
            md.add(revolve([(0.0, 1.72), (0.055, 1.82), (0.0, 2.10)], 6), "steel", MM)
        elif k < 0.88:    # 斧
            md.add(cylinder(0.033, 1.15, 8), DARK, MM)
            md.add(box(0.04, 0.30, 0.34, z0=0.86), "steel", MM @ translate(0, 0.12, 0))
        else:             # 盾
            md.add(revolve([(0.0, 0.0), (0.30, 0.03), (0.34, 0.30), (0.0, 0.34)], 12),
                   "iron", MM @ chain(translate(0, 0, 0.55), rot_x(math.pi / 2),
                                      rot_z(0)))
            md.add(uv_sphere(0.09, 8, 5), "bronze", MM @ translate(0, -0.06, 0.55))


def armor_stand(md, M=np.eye(4), s=1.0):
    md.add(revolve([(0.28, 0), (0.30, 0.05), (0.10, 0.10)], 12), DARK, M @ scale(s))
    md.add(cylinder(0.06 * s, 0.85 * s, 8), DARK, M)
    # 軀幹
    md.add(revolve([(0.0, 0.85), (0.24, 0.95), (0.27, 1.20), (0.22, 1.42), (0.0, 1.48)],
                   14), "steel", M @ scale(s))
    md.add(revolve([(0.0, 1.44), (0.16, 1.50), (0.14, 1.58), (0.0, 1.60)], 12),
           "iron", M @ scale(s))
    # 頭盔
    md.add(revolve([(0.0, 1.60), (0.15, 1.66), (0.16, 1.80), (0.10, 1.90), (0.0, 1.93)],
                   14), "steel", M @ scale(s))
    md.add(box(0.03, 0.20, 0.05, z0=1.72 * s), "iron", M @ translate(0.14 * s, 0, 0))
    # 肩甲與臂
    for sy in (-1, 1):
        md.add(revolve([(0.0, 0.0), (0.16, 0.04), (0.17, 0.14), (0.0, 0.17)], 12),
               "steel", M @ translate(0, sy * 0.28 * s, 1.36 * s) @ scale(s))
        md.add(cylinder(0.075 * s, 0.5 * s, 8), "iron",
               M @ translate(0, sy * 0.28 * s, 0.86 * s))
        md.add(box(0.10 * s, 0.14 * s, 0.16 * s, z0=0.78 * s), "iron",
               M @ translate(0, sy * 0.28 * s, 0))
    # 腿甲
    for sy in (-1, 1):
        md.add(cylinder(0.09 * s, 0.8 * s, 8), "iron", M @ translate(0, sy * 0.12 * s, 0.06 * s))


def banner(md, M=np.eye(4), w=1.2, h=3.0, mat="fabric_red", pole=True):
    if pole:
        md.add(cylinder(0.05, w * 1.5, 8), "iron",
               M @ chain(rot_y(math.pi / 2), translate(0, 0, -w * 0.75)))
    rings = []
    for i in range(7):
        t = i / 6.0
        zz = -h * t
        wob = 0.10 * math.sin(t * 6.0) * h * 0.1
        ww = w * (1.0 - 0.12 * t)
        pts = []
        for k in range(5):
            u = -ww / 2 + ww * k / 4
            pts.append((wob * math.sin(k * 1.3 + t * 3), u, zz - (0.4 * h * 0.06 if False else 0)))
        rings.append(np.array(pts))
    md.add(loft(rings, closed_ring=False), mat, M)
    md.add(loft(rings, closed_ring=False, flip=True), mat, M @ translate(0.02, 0, 0))
    V = np.array([(0, -w * 0.44, -h), (0, w * 0.44, -h), (0, 0, -h * 1.12)])
    md.add((V, [(0, 1, 2)]), mat, M)


def rug(md, M=np.eye(4), w=3.0, d=2.0, mat="fabric_red"):
    md.add(box(w, d, 0.012), mat, M)
    md.add(box(w * 0.88, d * 0.82, 0.004, z0=0.012), "fabric_blue", M)
    md.add(box(w * 0.62, d * 0.55, 0.004, z0=0.014), mat, M)


def fireplace(md, M=np.eye(4), w=2.6, h=2.4, d=1.0):
    md.add(box(d, w, h), "stone_wall", M)
    md.add(box(d * 0.9, w * 0.55, h * 0.62, z0=0.0), "stone_dark",
           M @ translate(0.12, 0, 0))
    md.add(box(d * 1.3, w * 1.15, 0.22, z0=h * 0.64), "stone_dark", M)
    md.add(box(d * 1.25, w * 1.1, 0.14, z0=-0.07), "stone_dark", M)
    for i in range(5):
        md.add(cylinder(0.07, 0.7, 6), "bark",
               M @ chain(translate(0.08, -0.2 + i * 0.1, 0.12 + (i % 2) * 0.1),
                         rot_x(math.pi / 2 + 0.3 * i), rot_z(0.4 * i)))
    md.add(uv_sphere(0.42, 12, 8), "flame",
           M @ chain(translate(0.05, 0, 0.25), scale(0.7, 1.5, 1.2)))
    md.add(uv_sphere(0.2, 8, 6), "flame_core", M @ translate(0.05, 0, 0.2))


def bar_counter(md, rng, M=np.eye(4), w=5.0, d=0.8, h=1.12):
    md.add(box(d, w, h - 0.06), "wood_plank", M)
    md.add(box(d * 1.25, w * 1.02, 0.09, z0=h - 0.06), WOOD, M)
    md.add(box(d * 0.2, w * 1.0, 0.5, z0=0.1), DARK, M @ translate(-d * 0.55, 0, 0))
    for i in range(4):
        md.add(box(0.35, w * 0.96, 0.05, z0=0.25 + i * 0.42), DARK,
               M @ translate(-d * 0.9, 0, 0))
        x = -w / 2 + 0.2
        while x < w / 2 - 0.2:
            if rng.random() < 0.7:
                potion(md, rng, M @ translate(-d * 0.9, x, 0.30 + i * 0.42), s=1.4)
            x += rng.uniform(0.16, 0.3)
    for i in range(3):
        barrel(md, M @ translate(-d * 0.2, -w * 0.3 + i * w * 0.3, h - 0.06),
               r=0.26, h=0.55)


def cauldron(md, M=np.eye(4), r=0.5):
    md.add(revolve([(0, 0.05), (r * 0.8, 0.12), (r, 0.45), (r * 0.95, 0.62),
                    (r * 1.05, 0.66)], 16), "iron", M)
    for i in range(3):
        a = TAU * i / 3
        md.add(cylinder(0.05, 0.3, 6), "iron",
               M @ chain(rot_z(a), translate(r * 0.7, 0, 0), rot_y(0.4)))
    md.add(revolve([(0, 0.5), (r * 0.9, 0.52)], 16), "potion_green", M)


def bed(md, M=np.eye(4), w=1.1, l=2.0):
    md.add(box(l, w, 0.28, z0=0.24), "wood_plank", M)
    for sx in (-1, 1):
        for sy in (-1, 1):
            md.add(box(0.10, 0.10, 0.55), DARK,
                   M @ translate(sx * (l / 2 - 0.06), sy * (w / 2 - 0.06), 0))
    md.add(box(0.10, w, 0.85, z0=0.24), DARK, M @ translate(-l / 2 + 0.05, 0, 0))
    md.add(box(l * 0.95, w * 0.95, 0.16, z0=0.52), "canvas", M)
    md.add(box(l * 0.6, w * 0.95, 0.10, z0=0.60), "fabric_blue", M @ translate(l * 0.15, 0, 0))
    md.add(box(0.42, w * 0.6, 0.14, z0=0.62), "paper", M @ translate(-l / 2 + 0.35, 0, 0))


def anvil(md, M=np.eye(4)):
    md.add(box(0.6, 0.45, 0.45), DARK, M)
    md.add(box(0.7, 0.3, 0.14, z0=0.45), "iron", M)
    md.add(box(0.5, 0.24, 0.14, z0=0.59), "iron", M)
    md.add(revolve([(0.12, 0), (0.10, 0.14)], 8), "iron",
           M @ chain(translate(0.45, 0, 0.66), rot_y(math.pi / 2)))


def stool(md, M=np.eye(4), h=0.55, r=0.20):
    md.add(cylinder(r, 0.05, 12, z0=h), WOOD, M)
    for i in range(3):
        a = TAU * i / 3
        md.add(cylinder(0.035, h, 6), DARK,
               M @ chain(rot_z(a), translate(r * 0.65, 0, 0), rot_y(-0.12)))


def statue(md, M=np.eye(4), s=1.0, mat="marble"):
    md.add(box(1.2 * s, 1.2 * s, 0.30 * s), mat, M)
    md.add(box(1.0 * s, 1.0 * s, 0.16 * s, z0=0.30 * s), mat, M)
    B = M @ translate(0, 0, 0.46 * s)
    md.add(revolve([(0.30 * s, 0), (0.26 * s, 0.9 * s), (0.30 * s, 1.35 * s),
                    (0.22 * s, 1.55 * s)], 12), mat, B)
    md.add(uv_sphere(0.19 * s, 12, 8), mat, B @ translate(0, 0, 1.72 * s))
    for sy in (-1, 1):
        md.add(cylinder(0.075 * s, 0.75 * s, 8), mat,
               B @ chain(translate(0, sy * 0.3 * s, 1.45 * s), rot_x(sy * 0.25),
                         rot_y(math.pi)))
    md.add(box(0.10 * s, 0.24 * s, 1.5 * s, z0=0.2 * s), "steel",
           B @ translate(0.22 * s, 0.34 * s, 0))
    md.add(revolve([(0, 0), (0.34 * s, 0.05 * s), (0.30 * s, 0.5 * s), (0, 0.55 * s)], 12),
           "bronze", B @ chain(translate(0.10 * s, -0.36 * s, 0.7 * s), rot_x(math.pi / 2)))


def bones(md, rng, M=np.eye(4), n=6):
    for i in range(n):
        p = (rng.uniform(-1.2, 1.2), rng.uniform(-1.2, 1.2), 0.03)
        md.add(cylinder(0.035, rng.uniform(0.25, 0.5), 6), "paper",
               M @ chain(translate(*p), rot_y(math.pi / 2), rot_z(rng.uniform(0, TAU))))
    md.add(uv_sphere(0.12, 10, 7), "paper", M @ translate(0.4, -0.3, 0.10))
