"""第一層的自然地形：丘陵、草原、湖泊、河流、森林、岩石、瀑布。"""
import math
import random
import numpy as np

from . import config as C
from .meshutil import (MeshData, box, cylinder, revolve, uv_sphere, torus, cone,
                       grid_surface, tube_along, translate, rot_z, rot_y, rot_x,
                       scale, chain, TAU, fbm, loft)
from .blutil import proto_mesh, instance

FLOOR_R = C.floor_radius(0)

# --------------------------------------------------------------- 地標座標
TOWN = (FLOOR_R * 0.80 * math.cos(0.88), FLOOR_R * 0.80 * math.sin(0.88))
TOWN_R = 830.0
TOWN_Z = 34.0
LAKE = (FLOOR_R * 0.58 * math.cos(0.60), FLOOR_R * 0.58 * math.sin(0.60))
LAKE_R = 720.0
LAKE_Z = 9.0
TOWER = (FLOOR_R * 0.44 * math.cos(1.18), FLOOR_R * 0.44 * math.sin(1.18))
RUINS = (FLOOR_R * 0.86 * math.cos(0.28), FLOOR_R * 0.86 * math.sin(0.28))
TEMPLE = (FLOOR_R * 0.62 * math.cos(1.42), FLOOR_R * 0.62 * math.sin(1.42))
DUNGEON = (FLOOR_R * 0.50 * math.cos(0.30), FLOOR_R * 0.50 * math.sin(0.30))

RIVER = [(LAKE[0] + 520 * math.cos(0.05), LAKE[1] + 520 * math.sin(0.05)),
         (FLOOR_R * 0.66 * math.cos(0.46), FLOOR_R * 0.66 * math.sin(0.46)),
         (FLOOR_R * 0.78 * math.cos(0.40), FLOOR_R * 0.78 * math.sin(0.40)),
         (FLOOR_R * 0.90 * math.cos(0.345), FLOOR_R * 0.90 * math.sin(0.345)),
         (FLOOR_R * 0.965 * math.cos(0.30), FLOOR_R * 0.965 * math.sin(0.30))]


def smoothstep(a, b, x):
    t = np.clip((np.asarray(x, dtype=np.float64) - a) / (b - a + 1e-9), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def dist_polyline(x, y, pts):
    x = np.asarray(x, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64)
    best = np.full(x.shape, 1e18)
    for i in range(len(pts) - 1):
        ax, ay = pts[i]
        bx, by = pts[i + 1]
        dx, dy = bx - ax, by - ay
        L2 = dx * dx + dy * dy + 1e-9
        t = np.clip(((x - ax) * dx + (y - ay) * dy) / L2, 0.0, 1.0)
        px, py = ax + t * dx, ay + t * dy
        best = np.minimum(best, np.hypot(x - px, y - py))
    return best


class Terrain:
    """第一層地表高度場（解析式，可向量化查詢）。"""

    def __init__(self, seed=C.SEED):
        self.seed = seed
        self.R = FLOOR_R

    def height(self, x, y):
        x = np.asarray(x, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64)
        u = np.clip(x / (2 * self.R) + 0.5, 0, 1)
        v = np.clip(y / (2 * self.R) + 0.5, 0, 1)
        rr = np.hypot(x, y)

        h = 8.0 + 78.0 * fbm(u, v, octaves=6, freq=3, seed=self.seed)
        h += 38.0 * fbm(u, v, octaves=4, freq=9, seed=self.seed + 3331) - 19.0

        # 外緣山脈
        m = smoothstep(self.R * 0.80, self.R * 0.995, rr)
        h += 235.0 * m * (0.50 + 0.50 * fbm(u, v, octaves=5, freq=14,
                                           seed=self.seed + 77))
        # 內側緩降，避免中央過高
        h -= 26.0 * smoothstep(self.R * 0.45, 0.0, rr)

        # 湖盆
        dl = np.hypot(x - LAKE[0], y - LAKE[1])
        h -= 52.0 * (1.0 - smoothstep(0.0, LAKE_R * 1.28, dl))
        # 湖畔淺灘
        h -= 12.0 * (1.0 - smoothstep(LAKE_R * 0.9, LAKE_R * 1.9, dl))

        # 河谷
        dr = dist_polyline(x, y, RIVER)
        h -= 44.0 * (1.0 - smoothstep(0.0, 200.0, dr))

        # 城鎮台地
        dt = np.hypot(x - TOWN[0], y - TOWN[1])
        w = 1.0 - smoothstep(TOWN_R * 0.94, TOWN_R * 1.55, dt)
        h = h * (1.0 - w) + TOWN_Z * w

        # 迷宮塔基座台地
        dtw = np.hypot(x - TOWER[0], y - TOWER[1])
        w2 = 1.0 - smoothstep(320.0, 620.0, dtw)
        h = h * (1.0 - w2) + (h * 0.3 + 62.0) * w2

        # 神殿台地
        dtp = np.hypot(x - TEMPLE[0], y - TEMPLE[1])
        w3 = 1.0 - smoothstep(220.0, 480.0, dtp)
        h = h * (1.0 - w3) + 96.0 * w3

        return np.clip(h, -56.0, 330.0)

    def h1(self, x, y):
        return float(self.height(np.array([x]), np.array([y]))[0])

    def slope(self, x, y, d=12.0):
        hx = self.height(x + d, y) - self.height(x - d, y)
        hy = self.height(x, y + d) - self.height(x, y - d)
        return np.hypot(hx, hy) / (2 * d)


# ------------------------------------------------------------------ 地表
def build_ground(md, terr, res):
    """圓形樓板地表：只生成圓盤範圍內的面。"""
    R = FLOOR_R * 0.972
    g = np.linspace(-R, R, res)
    X, Y = np.meshgrid(g, g, indexing="ij")
    Z = terr.height(X, Y)
    rr = np.hypot(X, Y)
    edge = smoothstep(R * 0.93, R, rr)
    Z = Z * (1 - edge) + (Z + 120.0) * edge
    V = np.stack([X.ravel(), Y.ravel(), Z.ravel()], axis=1)
    nx, ny = Z.shape
    F = []
    for i in range(nx - 1):
        for j in range(ny - 1):
            cx = 0.5 * (X[i, j] + X[i + 1, j + 1])
            cy = 0.5 * (Y[i, j] + Y[i + 1, j + 1])
            if cx * cx + cy * cy > R * R:
                continue
            F.append((i * ny + j, (i + 1) * ny + j, (i + 1) * ny + j + 1, i * ny + j + 1))
    md.add((V, F), "terrain")
    # 外緣護牆
    n = 260
    a = np.linspace(0, TAU, n, endpoint=False)
    top = np.stack([R * 0.995 * np.cos(a), R * 0.995 * np.sin(a),
                    terr.height(R * 0.995 * np.cos(a), R * 0.995 * np.sin(a)) + 120.0],
                   axis=1)
    bot = top.copy()
    bot[:, 2] = -40.0
    md.add(loft([top, bot]), "stone_hull_dark")
    return Z


def build_water(md, terr):
    # 湖面
    md.add(revolve([(0.0, LAKE_Z), (LAKE_R * 1.12, LAKE_Z)], 72),
           "water", translate(LAKE[0], LAKE[1], 0))
    # 河面：沿折線的帶狀
    pts = []
    for i in range(len(RIVER) - 1):
        a = np.array(RIVER[i])
        b = np.array(RIVER[i + 1])
        for t in np.linspace(0, 1, 16, endpoint=(i == len(RIVER) - 2)):
            pts.append(a + (b - a) * t)
    rings = []
    for i, p in enumerate(pts):
        if i == 0:
            d = pts[1] - pts[0]
        elif i == len(pts) - 1:
            d = pts[-1] - pts[-2]
        else:
            d = pts[i + 1] - pts[i - 1]
        d = d / (np.linalg.norm(d) + 1e-9)
        nvec = np.array([-d[1], d[0]])
        w = 46.0 + 12.0 * math.sin(i * 0.28)
        z = float(terr.h1(p[0], p[1])) + 5.0
        rings.append(np.array([
            (p[0] - nvec[0] * w, p[1] - nvec[1] * w, z),
            (p[0] - nvec[0] * w * 0.5, p[1] - nvec[1] * w * 0.5, z),
            (p[0] + nvec[0] * w * 0.5, p[1] + nvec[1] * w * 0.5, z),
            (p[0] + nvec[0] * w, p[1] + nvec[1] * w, z)]))
    md.add(loft(rings, closed_ring=False), "water")


# ------------------------------------------------------------- 樹木原型
def tree_broadleaf(rng, scale_m=16.0, autumn=False):
    md = MeshData("tree")
    h = scale_m
    trunk = [(0, 0, 0), (h * 0.02, h * 0.03, h * 0.22), (h * 0.05, h * 0.02, h * 0.45),
             (h * 0.04, -h * 0.02, h * 0.62)]
    md.add(tube_along(trunk, [h * 0.055, h * 0.042, h * 0.032, h * 0.026], n=7), "bark")
    leaf = "foliage_autumn" if autumn else "foliage"
    for i in range(rng.randint(5, 8)):
        a = rng.uniform(0, TAU)
        rr = rng.uniform(0.05, 0.34) * h
        zz = h * rng.uniform(0.55, 0.95)
        s = h * rng.uniform(0.17, 0.30)
        V, F = uv_sphere(s, 10, 6)
        V = np.asarray(V)
        nz = fbm(np.clip(V[:, 0] / (2 * s) + 0.5, 0, 1),
                 np.clip(V[:, 1] / (2 * s) + 0.5, 0, 1), octaves=3, freq=4,
                 seed=rng.randint(0, 9999))
        V *= (0.72 + 0.56 * nz)[:, None]
        md.add((V, F), leaf,
               chain(translate(rr * math.cos(a), rr * math.sin(a), zz),
                     scale(1.0, rng.uniform(0.8, 1.2), rng.uniform(0.6, 0.9))))
    for i in range(rng.randint(2, 4)):
        a = rng.uniform(0, TAU)
        p0 = (0, 0, h * rng.uniform(0.35, 0.5))
        p1 = (h * 0.16 * math.cos(a), h * 0.16 * math.sin(a), h * 0.62)
        p2 = (h * 0.26 * math.cos(a), h * 0.26 * math.sin(a), h * 0.74)
        md.add(tube_along([p0, p1, p2], [h * 0.022, h * 0.014, h * 0.008], n=5), "bark")
    return md


def tree_pine(rng, scale_m=20.0):
    md = MeshData("pine")
    h = scale_m
    md.add(cylinder(h * 0.030, h * 0.95, 7, r_top=h * 0.010), "bark")
    layers = rng.randint(6, 9)
    for i in range(layers):
        t = i / layers
        zz = h * (0.16 + 0.76 * t)
        rr = h * (0.30 - 0.22 * t) * rng.uniform(0.9, 1.1)
        hh = h * 0.24
        md.add(cone(rr, hh, 9, z0=zz), "foliage_pine")
    return md


def tree_dead(rng, scale_m=13.0):
    md = MeshData("dead")
    h = scale_m
    md.add(tube_along([(0, 0, 0), (h * 0.04, 0, h * 0.4), (0, h * 0.05, h * 0.8)],
                      [h * 0.05, h * 0.03, h * 0.02], n=6), "bark")
    for i in range(rng.randint(3, 6)):
        a = rng.uniform(0, TAU)
        z0 = h * rng.uniform(0.35, 0.75)
        md.add(tube_along([(0, 0, z0),
                           (h * 0.18 * math.cos(a), h * 0.18 * math.sin(a), z0 + h * 0.14),
                           (h * 0.30 * math.cos(a), h * 0.30 * math.sin(a), z0 + h * 0.20)],
                          [h * 0.016, h * 0.010, h * 0.004], n=5), "bark")
    return md


def bush(rng, scale_m=3.0):
    md = MeshData("bush")
    for i in range(rng.randint(3, 6)):
        md.add(uv_sphere(scale_m * rng.uniform(0.4, 0.8), 8, 5), "foliage",
               chain(translate(rng.uniform(-1, 1) * scale_m * 0.5,
                               rng.uniform(-1, 1) * scale_m * 0.5,
                               scale_m * rng.uniform(0.2, 0.5)),
                     scale(1, 1, 0.7)))
    return md


def rock(rng, scale_m=4.0, mat="rock"):
    md = MeshData("rock")
    V, F = uv_sphere(scale_m, 10, 7)
    V = np.asarray(V)
    n = fbm(np.clip(V[:, 0] / (2 * scale_m) + 0.5, 0, 1),
            np.clip(V[:, 1] / (2 * scale_m) + 0.5, 0, 1),
            octaves=3, freq=4, seed=rng.randint(0, 9999))
    V *= (0.7 + 0.6 * n)[:, None]
    V[:, 2] = V[:, 2] * 0.72 + scale_m * 0.3
    md.add((V, F), mat)
    return md


def grass_patch(rng, n=26, size=3.0):
    """交叉草片，近景用。"""
    md = MeshData("grass_patch")
    for i in range(n):
        x, y = rng.uniform(-size, size), rng.uniform(-size, size)
        hgt = rng.uniform(0.35, 0.85)
        w = rng.uniform(0.12, 0.24)
        for a in (0.0, math.pi / 2):
            V = np.array([(-w, 0, 0), (w, 0, 0), (w * 0.5, 0, hgt), (-w * 0.5, 0, hgt)])
            md.add((V, [(0, 1, 2, 3)]), "grass",
                   chain(translate(x, y, 0), rot_z(a + rng.uniform(0, 0.6))))
    return md


# ------------------------------------------------------------------ 散佈
def scatter(coll, matlib, terr, rng, quality):
    q = C.QUALITY[quality]
    protos = []
    for i in range(3):
        protos.append((proto_mesh(tree_broadleaf(rng, rng.uniform(14, 22)), matlib,
                                  f"proto_tree_{i}"), (0.75, 1.35), "broad"))
    protos.append((proto_mesh(tree_broadleaf(rng, 18, autumn=True), matlib,
                              "proto_tree_autumn"), (0.8, 1.3), "broad"))
    for i in range(2):
        protos.append((proto_mesh(tree_pine(rng, rng.uniform(18, 28)), matlib,
                                  f"proto_pine_{i}"), (0.8, 1.4), "pine"))
    protos.append((proto_mesh(tree_dead(rng), matlib, "proto_dead"), (0.8, 1.2), "dead"))
    bush_p = proto_mesh(bush(rng), matlib, "proto_bush")
    rock_p = [proto_mesh(rock(rng, rng.uniform(2.5, 9.0)), matlib, f"proto_rock_{i}")
              for i in range(4)]
    grass_p = proto_mesh(grass_patch(rng), matlib, "proto_grass")

    R = FLOOR_R
    placed = 0
    target = q["tree_count"]
    tries = 0
    while placed < target and tries < target * 30:
        tries += 1
        a = rng.uniform(0, TAU)
        rr = R * math.sqrt(rng.uniform(0.02, 0.985))
        x, y = rr * math.cos(a), rr * math.sin(a)
        # 觀景扇形內密度高，其餘稀疏
        in_hero = -0.35 < a < 3.15
        if not in_hero and rng.random() > 0.22:
            continue
        if np.hypot(x - TOWN[0], y - TOWN[1]) < TOWN_R * 1.12:
            continue
        if np.hypot(x - LAKE[0], y - LAKE[1]) < LAKE_R * 1.18:
            continue
        if np.hypot(x - TOWER[0], y - TOWER[1]) < 340:
            continue
        if dist_polyline(np.array([x]), np.array([y]), RIVER)[0] < 70:
            continue
        z = terr.h1(x, y)
        if z < LAKE_Z + 1.0:
            continue
        sl = float(terr.slope(np.array([x]), np.array([y]))[0])
        if sl > 0.85:
            continue
        dens = fbm(np.array([x / (2 * R) + 0.5]), np.array([y / (2 * R) + 0.5]),
                   octaves=4, freq=7, seed=C.SEED + 501)[0]
        if rng.random() > dens * 1.5:
            continue
        high = z > 135.0
        pool = [p for p in protos if (p[2] == "pine") == high] or protos
        mesh, srange, kind = pool[rng.randrange(len(pool))]
        instance(mesh, coll, (x, y, z - 0.5), rz=rng.uniform(0, TAU),
                 s=rng.uniform(*srange))
        placed += 1
        if rng.random() < 0.45:
            instance(bush_p, coll, (x + rng.uniform(-14, 14), y + rng.uniform(-14, 14),
                                    z - 0.3), rz=rng.uniform(0, TAU),
                     s=rng.uniform(0.8, 2.2))

    for i in range(int(520 * q["detail"])):
        a = rng.uniform(0, TAU)
        rr = R * math.sqrt(rng.uniform(0.05, 0.99))
        x, y = rr * math.cos(a), rr * math.sin(a)
        if np.hypot(x - TOWN[0], y - TOWN[1]) < TOWN_R * 1.05:
            continue
        z = terr.h1(x, y)
        if z < LAKE_Z - 6:
            continue
        instance(rock_p[rng.randrange(4)], coll, (x, y, z - 1.0),
                 rz=rng.uniform(0, TAU), s=rng.uniform(0.6, 3.0))

    for i in range(q["grass_patch"]):
        a = rng.uniform(0.2, 1.6)
        rr = rng.uniform(R * 0.55, R * 0.95)
        x, y = rr * math.cos(a), rr * math.sin(a)
        z = terr.h1(x, y)
        if z < LAKE_Z + 1:
            continue
        instance(grass_p, coll, (x, y, z - 0.2), rz=rng.uniform(0, TAU),
                 s=rng.uniform(0.8, 1.6))
    return placed
