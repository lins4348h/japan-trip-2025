"""艾恩葛朗特外部結構：百層環狀樓層、外殼、扶壁、城底倒錐、中央主塔、頂端宮殿。"""
import math
import random
import numpy as np

from . import config as C
from .meshutil import (MeshData, box, cylinder, revolve, ring_pts, loft, torus,
                       uv_sphere, extrude_poly, tube_along, translate, rot_z,
                       rot_y, rot_x, scale, chain, TAU, fbm, cone, grid_surface,
                       stairs, frame_opening, prism_roof, quad_strip)


# --------------------------------------------------------------- 小工具
def quad_yz(w, h, z0=0.0):
    """位於 X=0 平面、朝 +X 的單一四邊形。"""
    V = np.array([(0, -w / 2, z0), (0, w / 2, z0), (0, w / 2, z0 + h), (0, -w / 2, z0 + h)])
    return V, [(0, 1, 2, 3)]


def at(angle, radius, z=0.0, extra=None):
    m = chain(rot_z(angle), translate(radius, 0.0, z))
    return m if extra is None else m @ extra


def in_cuts(a, cuts):
    if not cuts:
        return False
    for c in cuts:
        if c[0] < a < c[1]:
            return True
    return False


def ring(md, profile, n, mat, cuts=None, flip=False):
    """整圈或帶多道缺口的旋轉面。"""
    if not cuts:
        md.add(revolve(profile, n, flip=flip), mat)
        return
    cs = sorted(cuts)
    for i in range(len(cs)):
        a0 = cs[i][1]
        a1 = cs[(i + 1) % len(cs)][0] + (TAU if i + 1 == len(cs) else 0.0)
        if a1 - a0 < 1e-3:
            continue
        nn = max(6, int(n * (a1 - a0) / TAU))
        md.add(revolve(profile, nn, a0=a0, a1=a1, closed=False, flip=flip), mat)


def seg_count(r, base):
    n = int(base * (max(r, 1.0) / C.BASE_RADIUS) ** 0.55)
    n = max(24, min(base, n))
    return n - (n % 8)


# ---------------------------------------------------------- 單一環狀樓層
def build_tier(md, i, seg_base, detail=1.0, cutaway=None):
    r = C.floor_radius(i)
    z0 = C.floor_z(i)
    h = C.floor_height(i)
    n = seg_count(r, seg_base)
    major = (i % 10 == 0)          # 每十層為「主層」，裝飾更繁複
    rng = random.Random(C.SEED + i * 7919)

    z_rim = z0 + h * 0.16
    z_wall = z0 + h * 0.74
    z_col = z0 + h * 0.94
    r_wall = r * 0.985
    r_drum = r * 0.905
    r_col = r * 0.965

    # 1. 底部飛簷 / 樓板外緣
    rim = [(r * 0.965, z0), (r * 1.012, z0 + h * 0.045),
           (r * 1.020, z0 + h * 0.085), (r * 1.004, z0 + h * 0.125),
           (r_wall, z_rim)]
    ring(md, rim, n, "stone_hull_dark", cutaway)

    # 2. 主牆（多面體，呈現稜面感）；過高的樓層再細分成數道樓帶
    bands = max(1, int(round((z_wall - z_rim) / 150.0)))
    for b in range(bands):
        zb0 = z_rim + (z_wall - z_rim) * b / bands
        zb1 = z_rim + (z_wall - z_rim) * (b + 1) / bands
        ring(md, [(r_wall, zb0), (r_wall * 0.999, zb1)], n, "stone_hull", cutaway)
        if b < bands - 1:
            ring(md, [(r_wall, zb1 - 4.0), (r_wall * 1.012, zb1 - 1.0),
                      (r_wall * 1.012, zb1 + 1.0), (r_wall, zb1 + 4.0)], n,
                 "stone_rib", cutaway)

    # 3. 內縮暗層 + 柱列（層與層之間的招牌陰影帶）
    ring(md, [(r_drum, z_wall), (r_drum, z_col)], n, "stone_hull_dark", cutaway)
    col_w = TAU * r_col / n * 0.42
    col_d = (r_col - r_drum) * 1.25
    for k in range(n):
        a = TAU * k / n
        if in_cuts(a, cutaway):
            continue
        md.add(box(col_d, col_w, z_col - z_wall, center_xy=False, z0=z_wall),
               "stone_rib", at(a, r_drum))
    # 柱頭 / 柱腳線腳
    ring(md, [(r_drum, z_wall - 2.0), (r_col * 1.01, z_wall + 1.2),
              (r_col * 1.005, z_wall + 3.0)], n, "stone_rib", cutaway)
    ring(md, [(r_col * 1.005, z_col - 3.0), (r_col * 1.015, z_col - 1.2),
              (r_drum, z_col + 1.5)], n, "stone_rib", cutaway)

    # 4. 頂部簷口
    cor = [(r_drum, z_col), (r * 1.006, z_col + h * 0.02),
           (r * 1.014, z_col + h * 0.042), (r * 0.99, z0 + h)]
    ring(md, cor, n, "stone_hull_dark", cutaway)

    # 5. 外部巨大扶壁（每隔數個分段一支）
    nb = max(8, n // 6)
    step = n // nb
    out = r * (0.055 if major else 0.038)
    for k in range(0, n, step):
        a = TAU * (k + 0.5) / n
        if in_cuts(a, cutaway):
            continue
        w0 = TAU * r / n * 1.25
        rings = []
        for t, wf, of, zz in ((0.00, 1.00, 1.00, z0 - h * 0.02),
                              (0.18, 0.95, 0.92, z0 + h * 0.18),
                              (0.55, 0.82, 0.62, z0 + h * 0.55),
                              (0.86, 0.70, 0.30, z0 + h * 0.86),
                              (1.00, 0.62, 0.12, z0 + h * 1.01)):
            w = w0 * wf
            o = out * of
            rings.append(np.array([
                (r_wall * 0.99, -w / 2, zz), (r_wall * 0.99 + o, -w * 0.34, zz),
                (r_wall * 0.99 + o, w * 0.34, zz), (r_wall * 0.99, w / 2, zz)]))
        md.add(loft(rings, closed_ring=True, cap_start=True, cap_end=True),
               "stone_rib", rot_z(a))

    # 6. 窗帶（發光）
    if detail > 0.4:
        r_face = r_wall * math.cos(math.pi / n) + 0.6
        rows = 3 if major else 2
        wh = min(h, (z_wall - z_rim) / bands) * 0.16
        for k in range(n):
            a = TAU * (k + 0.5) / n
            if in_cuts(a, cutaway):
                continue
            if rng.random() > 0.88:
                continue
            for b in range(bands):
                zb0 = z_rim + (z_wall - z_rim) * b / bands
                zb1 = z_rim + (z_wall - z_rim) * (b + 1) / bands
                for q in range(2):
                    for rr_ in range(rows):
                        zz = zb0 + (zb1 - zb0) * (0.20 + 0.26 * rr_)
                        ww = TAU * r / n * 0.10
                        off = (q - 0.5) * TAU * r / n * 0.34
                        m = chain(rot_z(a), translate(r_face, off, 0))
                        md.add(quad_yz(ww, wh, z0=zz),
                               "window_glow" if rng.random() < 0.62 else "glass_dirty", m)

    # 7. 主層額外裝飾：巨型拱窗、外挑平台與塔樓
    if major and detail > 0.4:
        for k in range(0, n, max(4, n // 12)):
            a = TAU * (k + 2.0) / n
            if in_cuts(a, cutaway):
                continue
            # 外挑碼頭平台
            pw = TAU * r / n * 1.6
            pd = r * 0.030
            md.add(box(pd, pw, h * 0.05, center_xy=False, z0=z0 + h * 0.30),
                   "stone_rib", at(a, r * 1.00))
            for s in (-1, 1):
                md.add(box(pd * 0.9, pw * 0.06, h * 0.16, center_xy=False,
                           z0=z0 + h * 0.35), "stone_rib",
                       at(a, r * 1.00, 0, translate(0, s * pw * 0.45, 0)))
            md.add(box(pd * 1.05, pw * 1.05, h * 0.02, center_xy=False,
                       z0=z0 + h * 0.50), "stone_rib", at(a, r * 0.995))
        # 主層腰帶
        ring(md, [(r * 1.004, z0 + h * 0.60), (r * 1.030, z0 + h * 0.645),
                  (r * 1.030, z0 + h * 0.685), (r * 1.004, z0 + h * 0.73)], n,
             "stone_rib", cutaway)
    if cutaway:
        for a in [x for c in cutaway for x in c]:
            md.add(box(r - r_drum + r * 0.02, 7.0, h, center_xy=False, z0=z0),
                   "stone_hull_dark", at(a, r_drum))
            md.add(box(r - r_drum + r * 0.02, 8.5, 3.0, center_xy=False, z0=z0 + h - 3.0),
                   "stone_rib", at(a, r_drum))
    return dict(r=r, z0=z0, h=h, n=n)


# ------------------------------------------------------------ 城底倒錐
def build_underside(md, seg_base, detail=1.0):
    r0 = C.floor_radius(0)
    D = C.UNDERSIDE_DEPTH
    n = seg_base
    steps = 26
    prof = []
    for k in range(steps + 1):
        t = k / steps
        rr = r0 * ((1.0 - t) ** 1.15) * (1.0 - 0.035 * math.sin(t * 9.0)) + 60.0 * (1.0 - t)
        zz = -D * (t ** 1.06)
        prof.append((max(rr, 12.0), zz))
    prof = prof[::-1]
    md.add(revolve(prof, n, flip=True), "stone_hull_dark")

    # 同心環肋
    for k in range(2, steps, 2):
        t = k / steps
        rr = r0 * ((1.0 - t) ** 1.15) + 60.0 * (1.0 - t)
        zz = -D * (t ** 1.06)
        md.add(torus(rr, max(6.0, rr * 0.012), nu=n, nv=6), "stone_rib",
               translate(0, 0, zz))

    # 放射狀巨肋
    nrib = max(16, n // 3)
    for k in range(nrib):
        a = TAU * k / nrib
        rings = []
        for s in range(0, steps + 1, 2):
            t = s / steps
            rr = r0 * ((1.0 - t) ** 1.15) + 60.0 * (1.0 - t)
            zz = -D * (t ** 1.06)
            w = max(8.0, rr * 0.022)
            d = max(6.0, rr * 0.016)
            rings.append(np.array([
                (rr - d, -w, zz), (rr + d * 0.3, -w * 0.6, zz),
                (rr + d * 0.3, w * 0.6, zz), (rr - d, w, zz)]))
        md.add(loft(rings, cap_start=True, cap_end=True), "stone_rib", rot_z(a))

    # 底部核心（能源結晶）
    md.add(revolve([(180, -D - 40), (240, -D + 90), (150, -D + 260), (60, -D + 420)],
                   n // 2, cap_start=True), "stone_dark")
    md.add(uv_sphere(150, 24, 14), "crystal_blue", translate(0, 0, -D - 30))
    for k in range(12):
        a = TAU * k / 12
        md.add(revolve([(30, 0), (46, 120), (12, 300)], 6, cap_start=True, cap_end=True),
               "crystal_blue", chain(rot_z(a), translate(200, 0, -D + 60), rot_y(0.5)))


# ------------------------------------------------------------ 中央主塔
def build_central_tower(md, detail=1.0):
    z_top = C.floor_z(C.FLOOR_COUNT)
    n = 16
    segs = [(-C.UNDERSIDE_DEPTH * 0.35, 360.0), (z_top * 0.25, 300.0),
            (z_top * 0.55, 235.0), (z_top * 0.80, 175.0), (z_top, 140.0)]
    prof = [(rr, zz) for zz, rr in segs]
    md.add(revolve(prof, n), "stone_castle")

    # 塔身垂直肋
    for k in range(n):
        a = TAU * k / n
        rings = []
        for zz, rr in segs:
            w = rr * 0.10
            rings.append(np.array([(rr - 10, -w, zz), (rr + rr * 0.05, -w * 0.5, zz),
                                   (rr + rr * 0.05, w * 0.5, zz), (rr - 10, w, zz)]))
        md.add(loft(rings, cap_start=True, cap_end=True), "stone_rib", rot_z(a))

    # 環形陽台
    k = 0
    zz = 300.0
    while zz < z_top - 400:
        t = zz / z_top
        rr = 360.0 + (140.0 - 360.0) * t
        md.add(revolve([(rr * 1.02, zz), (rr * 1.26, zz + 26), (rr * 1.26, zz + 46),
                        (rr * 1.0, zz + 70)], n * 2), "stone_hull_dark")
        for j in range(n * 2):
            a = TAU * j / (n * 2)
            md.add(box(20, 14, 34, center_xy=False, z0=zz + 46), "stone_rib",
                   at(a, rr * 1.14))
        if k % 2 == 0:
            md.add(torus(rr * 1.05, 8, nu=n * 2, nv=6), "rune_glow",
                   translate(0, 0, zz + 90))
        zz += 620.0
        k += 1

    # 頂端：紅玉宮 + 尖塔
    E = C.SPIRE_TOP_EXTRA
    md.add(revolve([(210, z_top), (250, z_top + 40), (240, z_top + 70),
                    (180, z_top + 110)], n * 2), "marble")
    md.add(revolve([(180, z_top + 110), (196, z_top + 140), (150, z_top + 250),
                    (70, z_top + 330), (26, z_top + 380)], n * 2), "roof_tile")
    for k in range(8):
        a = TAU * k / 8
        md.add(revolve([(34, z_top + 60), (44, z_top + 120), (30, z_top + 260),
                        (10, z_top + 330)], 8, cap_start=True, cap_end=True),
               "marble", chain(rot_z(a), translate(215, 0, 0)))
        md.add(cone(22, 70, 8, z0=z_top + 330), "roof_tile",
               chain(rot_z(a), translate(215, 0, 0)))
    md.add(revolve([(26, z_top + 380), (40, z_top + 420), (16, z_top + 520),
                    (5, z_top + E)], 16, cap_end=True), "gold")
    md.add(uv_sphere(46, 20, 12), "crystal_blue", translate(0, 0, z_top + 430))


# --------------------------------------------------- 外圍浮空平台與雲層
def build_floating_islands(root_md, rng, count=9):
    r0 = C.floor_radius(0)
    for i in range(count):
        a = rng.uniform(0, TAU)
        rad = rng.uniform(r0 * 1.9, r0 * 3.8)
        zz = rng.uniform(-C.UNDERSIDE_DEPTH * 0.9, C.floor_z(C.FLOOR_COUNT) * 0.5)
        s = rng.uniform(380, 1150)
        md = root_md
        M = chain(translate(rad * math.cos(a), rad * math.sin(a), zz), rot_z(rng.uniform(0, TAU)))
        # 島體：上平下尖的岩塊
        nseg = 14
        prof = [(s * 0.10, -s * 1.05), (s * 0.62, -s * 0.42), (s * 0.95, -s * 0.10),
                (s * 1.0, 0.0), (s * 0.86, s * 0.07)]
        V, F = revolve(prof, nseg, cap_end=True, twist=0.06)
        V = np.asarray(V)
        h = fbm(np.clip((V[:, 0] / (s * 2) + 0.5), 0, 1),
                np.clip((V[:, 1] / (s * 2) + 0.5), 0, 1), octaves=4, freq=3,
                seed=i * 31 + 7)
        V[:, 0] *= 1.0 + 0.22 * (h - 0.5)
        V[:, 1] *= 1.0 + 0.22 * (h - 0.5)
        V[:, 2] += (h - 0.5) * s * 0.22
        md.add((V, F), "cliff", M)
        md.add(revolve([(s * 0.88, s * 0.09), (s * 0.80, s * 0.13)], nseg), "grass", M)
        # 島上遺跡：柱列與斷垣
        for k in range(rng.randint(3, 8)):
            aa = rng.uniform(0, TAU)
            rr = rng.uniform(0, s * 0.6)
            hh = rng.uniform(s * 0.10, s * 0.32)
            md.add(cylinder(s * 0.030, hh, 8, r_top=s * 0.026, z0=s * 0.10),
                   "ruin_stone", chain(M, translate(rr * math.cos(aa), rr * math.sin(aa), 0)))
        md.add(box(s * 0.5, s * 0.5, s * 0.05, z0=s * 0.10), "ruin_stone", M)


def build_clouds(md, rng, count=90):
    r0 = C.floor_radius(0)
    top = C.floor_z(C.FLOOR_COUNT)
    for i in range(count):
        a = rng.uniform(0, TAU)
        rad = rng.uniform(r0 * 1.15, r0 * 6.0)
        zz = rng.uniform(-C.UNDERSIDE_DEPTH * 1.6, top * 0.75)
        s = rng.uniform(320, 1500)
        M = chain(translate(rad * math.cos(a), rad * math.sin(a), zz),
                  rot_z(rng.uniform(0, TAU)), scale(1.0, rng.uniform(0.5, 1.2), rng.uniform(0.06, 0.13)))
        for b in range(rng.randint(4, 9)):
            off = (rng.uniform(-s, s), rng.uniform(-s * 0.6, s * 0.6),
                   rng.uniform(-s * 0.2, s * 0.2))
            rr_ = s * rng.uniform(0.45, 0.95)
            V, F = uv_sphere(rr_, 14, 8)
            V = np.asarray(V)
            nz = fbm(np.clip(V[:, 0] / (2 * rr_) + 0.5, 0, 1),
                     np.clip(V[:, 1] / (2 * rr_) + 0.5, 0, 1), octaves=4, freq=3,
                     seed=rng.randint(0, 9999))
            V *= (0.70 + 0.60 * nz)[:, None]
            md.add((V, F), "cloud", M @ translate(*off))


def build_upper_plates(md, cut, tiers, seg=140):
    """為被切開的上層加上樓板：底面是下層的人造天空，頂面是該層地表。"""
    for i in tiers:
        r = C.floor_radius(i) * 0.985
        z0 = C.floor_z(i)
        thick = 18.0
        nr, na = 22, seg
        radii = np.linspace(0.0, r, nr)
        angs = np.linspace(0.0, TAU, na, endpoint=False)
        ca, sa = np.cos(angs), np.sin(angs)
        X = np.outer(radii, ca)
        Y = np.outer(radii, sa)
        u = np.clip(X / (2 * r) + 0.5, 0, 1)
        v = np.clip(Y / (2 * r) + 0.5, 0, 1)
        hh = fbm(u, v, octaves=5, freq=4, seed=C.SEED + i * 131)
        rim = np.clip((radii[:, None] / r - 0.82) / 0.18, 0, 1)
        Z = z0 + thick + (6.0 + 24.0 * hh) * (1.0 - rim) + 22.0 * rim ** 2
        Vt = np.stack([X.ravel(), Y.ravel(), Z.ravel()], axis=1)
        Vb = Vt.copy()
        Vb[:, 2] = z0
        nv = len(Vt)
        V = np.concatenate([Vt, Vb], axis=0)
        F = []
        for a_i in range(na):
            b_i = (a_i + 1) % na
            am = TAU * (a_i + 0.5) / na
            for r_i in range(nr - 1):
                rr = radii[r_i]
                if cut and cut[0] < am < cut[1] and rr > r * 0.42:
                    continue
                p0 = r_i * na + a_i
                p1 = r_i * na + b_i
                p2 = (r_i + 1) * na + b_i
                p3 = (r_i + 1) * na + a_i
                F.append((p0, p1, p2, p3))
                F.append((nv + p3, nv + p2, nv + p1, nv + p0))
        md.add((V, F), "terrain")
        # 底面改為發光天頂
        top_faces = len(F) // 2
        for k in range(len(md._F) - len(F), len(md._F)):
            if (k - (len(md._F) - len(F))) % 2 == 1:
                md._M[k] = md.mat("sky_ceiling")
        # 外緣封邊
        ring_out = []
        for a_i in range(na):
            ring_out.append((X[-1, a_i], Y[-1, a_i], Z[-1, a_i]))
        ring_bot = [(x, y, z0) for x, y, _ in ring_out]
        md.add(loft([np.array(ring_out), np.array(ring_bot)]), "stone_hull_dark")


def build(quality, matlib, collection):
    import bpy
    q = C.QUALITY[quality]
    rng = random.Random(C.SEED)
    cut = (C.CUTAWAY_A0, C.CUTAWAY_A1)

    objs = {}
    # 為了控制單一 mesh 大小，把百層分成數塊
    chunk = 20
    for c0 in range(0, C.FLOOR_COUNT, chunk):
        md = MeshData(f"Aincrad_Tiers_{c0:03d}")
        for i in range(c0, min(c0 + chunk, C.FLOOR_COUNT)):
            cuts = None
            if i == 0:
                cuts = [cut, (C.CUT2_A0, C.CUT2_A1)]
            elif i <= C.CUT_TIERS:
                cuts = [cut]
            build_tier(md, i, q["tier_seg"], q["detail"], cutaway=cuts)
        objs[md.name] = md.to_object(collection, matlib)

    md = MeshData("Aincrad_UpperPlates")
    build_upper_plates(md, cut, range(1, C.CUT_TIERS + 2))
    ob = md.to_object(collection, matlib)
    ob.visible_shadow = False
    objs["plates"] = ob

    md = MeshData("Aincrad_Underside")
    build_underside(md, q["tier_seg"], q["detail"])
    objs["under"] = md.to_object(collection, matlib)

    md = MeshData("Aincrad_CentralTower")
    build_central_tower(md, q["detail"])
    objs["tower"] = md.to_object(collection, matlib)

    md = MeshData("Aincrad_Islands")
    build_floating_islands(md, rng, count=int(16 * q["detail"]))
    objs["islands"] = md.to_object(collection, matlib)
    return objs
