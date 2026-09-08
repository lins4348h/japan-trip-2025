"""迷宮塔、地下城入口、神殿與 Boss 房間。"""
import math
import random
import numpy as np

from . import config as C
from . import nature as N
from . import props as P
from .interiors import room_shell
from .meshutil import (MeshData, box, cylinder, revolve, uv_sphere, torus, cone,
                       prism_roof, extrude_poly, tube_along, stairs, translate,
                       rot_z, rot_y, rot_x, scale, chain, TAU, loft, ring_pts)


# ------------------------------------------------------------- 迷宮塔
def labyrinth_tower(rng, ceiling_z=100.0, base_z=0.0):
    """黑色迷宮塔：自平台直達該層天頂並貫穿而上。"""
    md = MeshData("LabyrinthTower")
    H = ceiling_z - base_z + 26.0
    n = 8
    # 基座堡壘
    md.add(revolve([(112, -6), (108, 0), (104, 16), (96, 18)], n * 2), "stone_dark")
    for i in range(n * 2):
        a = TAU * i / (n * 2) + 0.1
        md.add(box(7, 9, 4.0, z0=18), "stone_dark", chain(rot_z(a), translate(101, 0, 0)))
    for i in range(n):
        a = TAU * i / n + math.pi / n
        md.add(revolve([(13, 0), (11, 34), (14, 37), (9, 40)], 8), "stone_dark",
               chain(rot_z(a), translate(96, 0, 0)))
        md.add(cone(11, 26, 8, z0=40), "roof_slate", chain(rot_z(a), translate(96, 0, 0)))
        md.add(uv_sphere(2.2, 8, 6), "boss_glow", chain(rot_z(a), translate(96, 0, 64)))
    # 主塔身
    prof = [(58, 14), (54, H * 0.35), (46, H * 0.62), (40, H * 0.86), (36, H)]
    md.add(revolve(prof, n), "stone_dark")
    for i in range(n):
        a = TAU * i / n
        rings = []
        for r, z in prof:
            w = r * 0.20
            rings.append(np.array([(r - 6, -w, z), (r + r * 0.10, -w * 0.5, z),
                                   (r + r * 0.10, w * 0.5, z), (r - 6, w, z)]))
        md.add(loft(rings, cap_start=True, cap_end=True), "stone_rib", rot_z(a))
        # 尖刺
        for k in range(4):
            zz = H * (0.25 + 0.2 * k)
            rr = 58 + (36 - 58) * (zz / H)
            md.add(cone(6.0, 22.0, 6), "stone_dark",
                   chain(rot_z(a + math.pi / n), translate(rr, 0, zz), rot_y(1.15)))
    # 飛扶壁
    for i in range(n):
        a = TAU * i / n + math.pi / n
        pts = [(96, 0, 20), (86, 0, 46), (72, 0, 60), (58, 0, 66)]
        md.add(tube_along(pts, [7.0, 5.5, 4.5, 4.0], n=6), "stone_rib", rot_z(a))
    # 環帶與符文
    for k in range(1, 5):
        zz = H * k / 5.0
        rr = 58 + (36 - 58) * (zz / H)
        md.add(revolve([(rr * 1.02, zz - 3), (rr * 1.16, zz), (rr * 1.16, zz + 4),
                        (rr * 1.02, zz + 7)], n * 3), "stone_rib")
        md.add(torus(rr * 1.10, 1.2, n * 6, 6), "boss_glow", translate(0, 0, zz + 2))
    # 大門
    gm = MeshData("gate")
    gm.add(box(18, 34, 30, z0=0), "stone_dark", translate(58, 0, 0))
    arc = [(-9.5, 0.0)]
    for k in range(13):
        aa = math.pi * k / 12
        arc.append((-9.5 * math.cos(aa), 13.0 + 9.5 * math.sin(aa)))
    V, F = extrude_poly(arc + [(9.5, 0.0)], 22.0)
    gm.add((V, F), "boss_glow",
           chain(translate(66, 0, 0), rot_x(math.pi / 2), translate(0, 0, -11)))
    for s in (-1, 1):
        gm.add(cylinder(5.0, 34, 10, r_top=4.2), "stone_dark", translate(64, s * 15, 0))
        gm.add(cone(6.0, 12, 10, z0=34), "stone_dark", translate(64, s * 15, 0))
        P.brazier(gm, translate(76, s * 20, 0), r=3.0, h=6.0)
    V, F = stairs(30.0, 14, 1.2, 1.6)
    gm.add((V, F), "stone_dark", chain(translate(96, 0, -1.0), rot_z(math.pi)))
    md.add_mesh(gm)
    # 塔頂
    md.add(revolve([(36, H), (44, H + 6), (40, H + 12), (24, H + 20)], n * 2), "stone_dark")
    md.add(cone(24, 40, n * 2, z0=H + 20), "roof_slate")
    md.add(uv_sphere(6.0, 12, 8), "boss_glow", translate(0, 0, H + 64))
    return md


# ------------------------------------------------------------ 地下城入口
def dungeon_entrance(rng):
    md = MeshData("DungeonEntrance")
    # 岩壁
    V, F = uv_sphere(26.0, 16, 10)
    V = np.asarray(V)
    V[:, 2] *= 0.55
    V[:, 0] *= 1.3
    md.add((V, F), "cliff", translate(0, 0, 2.0))
    # 門洞與階梯下行
    md.add(box(16, 14, 12, z0=-12), "stone_dark", translate(6, 0, 0))
    arc = [(-4.0, -10.0)]
    for k in range(13):
        aa = math.pi * k / 12
        arc.append((-4.0 * math.cos(aa), 5.0 + 4.0 * math.sin(aa)))
    V, F = extrude_poly(arc + [(4.0, -10.0)], 10.0)
    md.add((V, F), "stone_dark", chain(translate(2, 0, 0), rot_x(math.pi / 2),
                                       translate(0, 0, -5)))
    V, F = stairs(7.0, 12, -0.55, 0.9)
    md.add((V, F), "stone_wall", chain(translate(-2.0, 0, 0), rot_z(math.pi)))
    # 門框與雕飾
    for s in (-1, 1):
        md.add(box(1.6, 1.6, 11.0, z0=-1.0), "ruin_stone", translate(2.4, s * 5.2, 0))
        md.add(revolve([(1.0, 0), (1.6, 1.2), (0.8, 2.4)], 8), "ruin_stone",
               translate(2.4, s * 5.2, 10.0))
        P.torch(md, chain(translate(3.4, s * 6.6, 4.0), rot_z(s * math.pi / 2)))
        md.add(uv_sphere(0.9, 10, 7), "paper", translate(2.4, s * 5.2, 12.6))
    md.add(box(1.4, 11.0, 1.6, z0=10.0), "ruin_stone", translate(2.4, 0, 0))
    md.add(box(0.4, 6.0, 1.0, z0=10.3), "rune_glow", translate(1.9, 0, 0))
    # 鐵柵門（半開）
    for k in range(8):
        md.add(box(0.2, 0.2, 6.0, z0=0.5), "iron", translate(1.2, -3.2 + k * 0.9, 0))
    # 碎石與遺骸
    for i in range(18):
        a = rng.uniform(0, TAU)
        r = rng.uniform(8, 24)
        md.add(uv_sphere(rng.uniform(0.4, 1.6), 8, 5), "rock",
               chain(translate(r * math.cos(a), r * math.sin(a), 0.3),
                     scale(1, 1, rng.uniform(0.5, 0.9))))
    P.bones(md, rng, translate(9, 5, 0), n=7)
    return md


# ------------------------------------------------------------------ 神殿
def temple(rng):
    md = MeshData("Temple")
    W, D = 46.0, 68.0
    # 階梯基座
    for i in range(5):
        md.add(box(W + 16 - i * 3, D + 16 - i * 3, 1.2, z0=i * 1.2), "marble")
    base = 6.0
    md.add(box(W + 4, D + 4, 1.6, z0=base), "marble")
    # 柱廊
    nx, ny = 6, 10
    for i in range(nx):
        for j in range(ny):
            if 0 < i < nx - 1 and 0 < j < ny - 1:
                continue
            x = -W / 2 + W * i / (nx - 1)
            y = -D / 2 + D * j / (ny - 1)
            M = translate(x, y, base + 1.6)
            md.add(cylinder(1.5, 1.0, 16, r_top=1.35), "marble", M)
            md.add(revolve([(1.30, 1.0), (1.22, 15.0)], 20, twist=0.0), "marble", M)
            for k in range(20):  # 凹槽
                a = TAU * k / 20
                md.add(cylinder(0.16, 14.0, 5), "marble_dark",
                       M @ chain(rot_z(a), translate(1.26, 0, 1.0)))
            md.add(revolve([(1.22, 15.0), (1.75, 16.2), (1.75, 17.0), (1.5, 17.6)], 20),
                   "marble", M)
    # 楣樑與屋頂
    md.add(box(W + 5, D + 5, 2.4, z0=base + 19.2), "marble")
    md.add(box(W + 6, D + 6, 1.0, z0=base + 21.6), "marble")
    md.add(prism_roof(W + 7, D + 7, 9.0, z0=base + 22.6), "roof_tile_blue")
    for sy in (-1, 1):  # 山牆
        V = np.array([(-(W + 7) / 2, sy * (D + 7) / 2, base + 22.6),
                      ((W + 7) / 2, sy * (D + 7) / 2, base + 22.6),
                      (0, sy * (D + 7) / 2, base + 31.6)])
        md.add((V, [(0, 1, 2)]), "marble")
    # 內殿
    md.add(box(W - 14, D - 20, 17.0, z0=base + 1.6), "marble")
    md.add(box(W - 20, 1.0, 11.0, z0=base + 1.6), "stone_dark",
           translate(0, -(D - 20) / 2, 0))
    md.add(box(W - 22, 0.6, 9.5, z0=base + 1.8), "rune_glow",
           translate(0, -(D - 20) / 2 - 0.3, 0))
    # 祭壇與水晶
    A = translate(0, 6.0, base + 1.6)
    md.add(box(7.0, 5.0, 1.2), "marble_dark", A)
    md.add(box(5.6, 3.8, 0.5, z0=1.2), "gold", A)
    md.add(revolve([(1.2, 1.7), (1.6, 3.4), (0.8, 4.6)], 12), "gold", A)
    md.add(uv_sphere(2.2, 20, 12), "crystal_blue", A @ translate(0, 0, 7.0))
    for i in range(6):
        a = TAU * i / 6
        md.add(cone(0.8, 4.0, 6), "crystal_blue",
               A @ chain(rot_z(a), translate(3.4, 0, 4.2), rot_y(0.6)))
    # 神像與火盆
    for s in (-1, 1):
        P.statue(md, translate(s * (W / 2 - 9), -D * 0.18, base + 1.6), s=3.2)
        P.brazier(md, translate(s * (W / 2 - 3), -D * 0.42, base + 1.6), r=1.6, h=3.2)
        P.brazier(md, translate(s * (W / 2 + 6), -D / 2 - 6, 6.0), r=1.8, h=3.6)
        P.banner(md, chain(translate(s * (W / 2 - 8.2), -(D - 20) / 2 - 0.6, base + 16.0),
                           rot_z(-math.pi / 2)), w=2.4, h=9.0, mat="fabric_blue")
    return md


# ------------------------------------------------------------- Boss 房間
def boss_room(rng, w=104.0, d=76.0, h=28.0):
    md = MeshData("BossRoom")
    room_shell(md, w, d, h, t=1.8, floor_mat="stone_dark", wall_mat="stone_castle",
               base_mat="stone_dark", ceil_mat="stone_dark", beams=False, skirt=3.0)
    # 地面圖騰
    md.add(revolve([(0, 0.05), (26.0, 0.05)], 60), "marble_dark")
    md.add(torus(24.0, 0.5, 60, 6), "boss_glow", translate(0, 0, 0.08))
    md.add(torus(15.0, 0.4, 48, 6), "rune_glow", translate(0, 0, 0.08))
    for i in range(8):
        a = TAU * i / 8
        md.add(box(24.0, 0.7, 0.14, center_xy=False, z0=0.06), "boss_glow",
               chain(rot_z(a), translate(0, -0.35, 0)))
    # 列柱
    for sx in (-1, 1):
        for i in range(5):
            y = -d * 0.34 + i * d * 0.17
            M = translate(sx * (w * 0.36), y, 0)
            md.add(cylinder(3.4, 2.0, 12, r_top=3.0), "stone_castle", M)
            md.add(cylinder(2.8, h - 6.0, 12, r_top=2.5, z0=2.0), "stone_castle", M)
            md.add(revolve([(2.5, h - 4.0), (3.8, h - 2.6), (3.8, h - 1.8),
                            (3.0, h - 1.0)], 12), "stone_castle", M)
            P.brazier(md, M @ translate(-sx * 5.5, 0, 0), r=1.4, h=2.8)
            P.banner(md, chain(translate(sx * (w / 2 - 1.0), y, h - 3.0),
                               rot_z(0 if sx < 0 else math.pi)),
                     w=3.2, h=12.0, mat="fabric_red")
    # 王座台
    T = translate(0, d * 0.32, 0)
    for i in range(4):
        md.add(box(34 - i * 5, 18 - i * 3, 1.1, z0=i * 1.1), "stone_dark", T)
    md.add(box(6.0, 5.0, 7.0, z0=4.4), "marble_dark", T)
    md.add(box(5.0, 1.2, 8.0, z0=11.4), "marble_dark", T @ translate(0, 2.0, 0))
    md.add(uv_sphere(2.6, 16, 10), "boss_glow", T @ translate(0, 0, 22.0))
    for i in range(5):
        a = math.pi * i / 4 + math.pi / 2
        md.add(cone(1.0, 6.0, 6), "boss_glow",
               T @ chain(rot_z(a), translate(5.0, 0, 16.0), rot_y(0.9)))
    # 巨門（入口）
    G = translate(0, -d / 2 - 0.6, 0)
    md.add(box(30, 2.4, 22.0), "stone_dark", G)
    for s in (-1, 1):
        md.add(box(13.5, 1.2, 20.0, z0=0.4), "iron", G @ translate(s * 7.2, 0.8, 0))
        for k in range(5):
            md.add(box(12.0, 0.4, 0.8, z0=2.0 + k * 4.0), "bronze",
                   G @ translate(s * 7.2, 1.4, 0))
        md.add(torus(1.6, 0.35, 12, 6), "bronze",
               G @ chain(translate(s * 2.6, 1.6, 11.0), rot_x(math.pi / 2)))
    md.add(box(34, 3.0, 3.0, z0=22.0), "stone_dark", G)
    md.add(box(24, 1.0, 1.6, z0=22.6), "boss_glow", G @ translate(0, -1.6, 0))
    # 場景細節：寶箱、骸骨、破碎武器、鐵鍊
    P.chest(md, chain(translate(6.0, d * 0.20, 0), rot_z(0.3)), w=2.4, d=1.4, h=1.2,
            open_lid=True)
    P.treasure_pile(md, rng, translate(6.0, d * 0.20, 0.05), r=1.4)
    for i in range(14):
        a = rng.uniform(0, TAU)
        r = rng.uniform(6, 34)
        P.bones(md, rng, translate(r * math.cos(a), r * math.sin(a) * 0.7, 0.05), n=4)
    for i in range(10):
        a = rng.uniform(0, TAU)
        r = rng.uniform(10, 38)
        M = chain(translate(r * math.cos(a), r * math.sin(a) * 0.7, 0.1),
                  rot_z(rng.uniform(0, TAU)), rot_y(rng.uniform(1.2, 1.6)))
        md.add(box(0.14, 0.4, rng.uniform(1.5, 2.6)), "steel", M)
    for sx in (-1, 1):
        for i in range(3):
            y = -d * 0.2 + i * d * 0.2
            pts = [(sx * (w / 2 - 2.5), y, h - 2.0), (sx * (w / 2 - 12), y, h - 9.0),
                   (sx * (w / 2 - 16), y, h - 16.0)]
            md.add(tube_along(pts, 0.30, n=6), "iron")
    # 天頂吊燈
    for x in (-w * 0.22, w * 0.22):
        for y in (-d * 0.2, d * 0.2):
            P.chandelier(md, translate(x, y, h - 3.0), r=3.4, arms=8, drop=3.0)
    return md


# ------------------------------------------------------------------ 迷宮區
def stone_maze(rng, cells=17, cell=11.0, wall_h=7.0, wall_t=1.4):
    """迷宮塔外圍的石牆迷宮（遞迴回溯法生成）。"""
    md = MeshData("Maze")
    n = cells
    visited = [[False] * n for _ in range(n)]
    vwall = [[True] * (n + 1) for _ in range(n)]   # 垂直牆 (x 方向格線)
    hwall = [[True] * (n + 1) for _ in range(n)]   # 水平牆
    stack = [(0, 0)]
    visited[0][0] = True
    while stack:
        x, y = stack[-1]
        nb = []
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < n and not visited[nx][ny]:
                nb.append((nx, ny, dx, dy))
        if not nb:
            stack.pop()
            continue
        nx, ny, dx, dy = nb[rng.randrange(len(nb))]
        if dx == 1:
            vwall[x][y] = False if False else vwall[x][y]
            vwall[nx][ny] = vwall[nx][ny]
            vwall[x + 1 - 1][y] = vwall[x][y]
        if dx != 0:
            vwall[max(x, nx)][y] = False
        else:
            hwall[x][max(y, ny)] = False
        visited[nx][ny] = True
        stack.append((nx, ny))
    off = -n * cell / 2
    for x in range(n):
        for y in range(n + 1):
            if hwall[x][y] and rng.random() < 0.93:
                md.add(box(cell + wall_t, wall_t, wall_h * rng.uniform(0.85, 1.1)),
                       "ruin_stone",
                       translate(off + (x + 0.5) * cell, off + y * cell, 0))
    for x in range(n + 1):
        for y in range(n):
            if x < n and vwall[x][y] and rng.random() < 0.93:
                md.add(box(wall_t, cell + wall_t, wall_h * rng.uniform(0.85, 1.1)),
                       "ruin_stone",
                       translate(off + x * cell, off + (y + 0.5) * cell, 0))
    for x in (0, n):
        for y in range(n):
            md.add(box(wall_t, cell + wall_t, wall_h),
                   "ruin_stone", translate(off + x * cell, off + (y + 0.5) * cell, 0))
    for i in range(int(n * n * 0.10)):
        x = rng.uniform(off, -off)
        y = rng.uniform(off, -off)
        P.torch(md, chain(translate(x, y, 3.4), rot_z(rng.uniform(0, TAU))))
    return md
