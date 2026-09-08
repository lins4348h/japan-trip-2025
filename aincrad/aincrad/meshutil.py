"""程序化幾何工具：以 numpy 累積頂點／面，最後一次送進 Blender。

所有基本體都回傳 (V, F)：V 為 (n,3) 的 numpy 陣列，F 為 tuple 的 list。
座標系：+Z 向上。
"""
import math
import numpy as np

TAU = math.pi * 2.0


# ----------------------------------------------------------------- 變換矩陣
def ident():
    return np.eye(4)


def translate(x=0.0, y=0.0, z=0.0):
    m = np.eye(4)
    m[:3, 3] = (x, y, z)
    return m


def scale(x=1.0, y=None, z=None):
    if y is None:
        y = z = x
    if z is None:
        z = 1.0
    m = np.eye(4)
    m[0, 0], m[1, 1], m[2, 2] = x, y, z
    return m


def rot_x(a):
    c, s = math.cos(a), math.sin(a)
    m = np.eye(4)
    m[1, 1], m[1, 2], m[2, 1], m[2, 2] = c, -s, s, c
    return m


def rot_y(a):
    c, s = math.cos(a), math.sin(a)
    m = np.eye(4)
    m[0, 0], m[0, 2], m[2, 0], m[2, 2] = c, s, -s, c
    return m


def rot_z(a):
    c, s = math.cos(a), math.sin(a)
    m = np.eye(4)
    m[0, 0], m[0, 1], m[1, 0], m[1, 1] = c, -s, s, c
    return m


def chain(*mats):
    out = np.eye(4)
    for m in mats:
        out = out @ m
    return out


def xform(V, M):
    if M is None:
        return V
    V = np.asarray(V, dtype=np.float64)
    return V @ M[:3, :3].T + M[:3, 3]


def polar(r, a, z=0.0):
    return np.array((r * math.cos(a), r * math.sin(a), z))


# ------------------------------------------------------------------- 雜訊
def _value_grid(freq, seed):
    rng = np.random.default_rng(seed)
    return rng.random((freq + 2, freq + 2))


def value_noise(x, y, freq, seed):
    """x, y 皆為 [0,1] 區間的 numpy 陣列。"""
    g = _value_grid(freq, seed)
    xi = np.clip(x, 0.0, 1.0) * freq
    yi = np.clip(y, 0.0, 1.0) * freq
    x0 = np.floor(xi).astype(np.int64)
    y0 = np.floor(yi).astype(np.int64)
    tx, ty = xi - x0, yi - y0
    sx = tx * tx * (3 - 2 * tx)
    sy = ty * ty * (3 - 2 * ty)
    v00 = g[x0, y0]
    v10 = g[x0 + 1, y0]
    v01 = g[x0, y0 + 1]
    v11 = g[x0 + 1, y0 + 1]
    a = v00 + (v10 - v00) * sx
    b = v01 + (v11 - v01) * sx
    return a + (b - a) * sy


def fbm(x, y, octaves=5, freq=4, seed=0, gain=0.5, lac=2.0):
    total = np.zeros_like(np.asarray(x, dtype=np.float64))
    amp, f, norm = 1.0, freq, 0.0
    for o in range(octaves):
        total += amp * value_noise(x, y, max(1, int(f)), seed + o * 977)
        norm += amp
        amp *= gain
        f *= lac
    return total / norm


# -------------------------------------------------------------- 網格容器
class MeshData:
    """累積多個基本體，最後輸出成單一 Blender mesh。"""

    def __init__(self, name):
        self.name = name
        self._V = []
        self._F = []
        self._M = []
        self.mat_names = []
        self._mat_idx = {}
        self._n = 0

    # -- 材質槽 -------------------------------------------------------
    def mat(self, name):
        if name not in self._mat_idx:
            self._mat_idx[name] = len(self.mat_names)
            self.mat_names.append(name)
        return self._mat_idx[name]

    # -- 加入幾何 -----------------------------------------------------
    def add(self, VF, mat, M=None):
        V, F = VF
        V = xform(np.asarray(V, dtype=np.float64), M)
        base = self._n
        self._V.append(V)
        mi = self.mat(mat) if isinstance(mat, str) else mat
        for f in F:
            self._F.append(tuple(base + i for i in f))
            self._M.append(mi)
        self._n += len(V)
        return self

    def add_mesh(self, other, M=None):
        remap = {}
        for i, nm in enumerate(other.mat_names):
            remap[i] = self.mat(nm)
        V = xform(other.vertices(), M)
        base = self._n
        self._V.append(V)
        for f, mi in zip(other._F, other._M):
            self._F.append(tuple(base + i for i in f))
            self._M.append(remap[mi])
        self._n += len(V)
        return self

    def vertices(self):
        if not self._V:
            return np.zeros((0, 3))
        return np.concatenate(self._V, axis=0)

    def stats(self):
        return self._n, len(self._F)

    # -- 輸出 ---------------------------------------------------------
    def to_object(self, collection=None, matlib=None, smooth_angle=None,
                  shade_smooth=False, obj_name=None):
        import bpy
        me = bpy.data.meshes.new(self.name)
        V = self.vertices()
        me.from_pydata([tuple(v) for v in V], [], self._F)
        me.validate(verbose=False, clean_customdata=False)
        if matlib is not None:
            for nm in self.mat_names:
                me.materials.append(matlib[nm])
            if len(self.mat_names) > 1:
                me.polygons.foreach_set("material_index", self._M)
        if shade_smooth:
            me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
        me.update()
        ob = bpy.data.objects.new(obj_name or self.name, me)
        if smooth_angle is not None:
            mod = ob.modifiers.new("Smooth", 'SMOOTH_BY_ANGLE') \
                if 'SMOOTH_BY_ANGLE' in dir(bpy.types) else None
        if collection is not None:
            collection.objects.link(ob)
        return ob


# --------------------------------------------------------------- 基本體
def quad_strip(ring_a, ring_b, closed=True, flip=False):
    """兩圈同點數的環之間搭四邊形。回傳 (V, F)。"""
    a = np.asarray(ring_a, dtype=np.float64)
    b = np.asarray(ring_b, dtype=np.float64)
    n = len(a)
    V = np.concatenate([a, b], axis=0)
    F = []
    m = n if closed else n - 1
    for i in range(m):
        j = (i + 1) % n
        f = (i, j, n + j, n + i)
        F.append(f[::-1] if flip else f)
    return V, F


def loft(rings, closed_ring=True, cap_start=False, cap_end=False, flip=False):
    """把一串環（每環點數相同）縫成筒狀。"""
    rings = [np.asarray(r, dtype=np.float64) for r in rings]
    n = len(rings[0])
    V = np.concatenate(rings, axis=0)
    F = []
    m = n if closed_ring else n - 1
    for k in range(len(rings) - 1):
        o0, o1 = k * n, (k + 1) * n
        for i in range(m):
            j = (i + 1) % n
            f = (o0 + i, o0 + j, o1 + j, o1 + i)
            F.append(f[::-1] if flip else f)
    if cap_start:
        f = tuple(range(n))
        F.append(f if flip else f[::-1])
    if cap_end:
        o = (len(rings) - 1) * n
        f = tuple(o + i for i in range(n))
        F.append(f[::-1] if flip else f)
    return V, F


def ring_pts(r, n, z=0.0, a0=0.0, a1=TAU, closed=True):
    if closed:
        angs = np.linspace(a0, a1, n, endpoint=False)
    else:
        angs = np.linspace(a0, a1, n)
    return np.stack([r * np.cos(angs), r * np.sin(angs), np.full(n, z)], axis=1)


def revolve(profile, n, a0=0.0, a1=TAU, closed=True, cap_start=False,
            cap_end=False, flip=False, twist=0.0):
    """profile: [(r, z), ...] 由下往上。繞 Z 軸旋轉成面。"""
    if closed:
        angs = np.linspace(a0, a1, n, endpoint=False)
    else:
        angs = np.linspace(a0, a1, n)
    rings = []
    for k, (r, z) in enumerate(profile):
        aa = angs + twist * k
        rings.append(np.stack([r * np.cos(aa), r * np.sin(aa),
                               np.full(len(aa), z)], axis=1))
    return loft(rings, closed_ring=closed, cap_start=cap_start,
                cap_end=cap_end, flip=flip)


def cylinder(r, h, n=16, r_top=None, cap=True, z0=0.0):
    r_top = r if r_top is None else r_top
    return revolve([(r, z0), (r_top, z0 + h)], n, cap_start=cap, cap_end=cap)


def box(sx, sy, sz, center_xy=True, z0=0.0):
    x0, x1 = (-sx / 2, sx / 2) if center_xy else (0.0, sx)
    y0, y1 = (-sy / 2, sy / 2) if center_xy else (0.0, sy)
    z1 = z0 + sz
    V = np.array([
        (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
        (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)])
    F = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
         (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    return V, F


def uv_sphere(r, nu=16, nv=10):
    profile = []
    for i in range(nv + 1):
        t = math.pi * i / nv
        profile.append((r * math.sin(t), -r * math.cos(t)))
    return revolve(profile, nu)


def cone(r, h, n=12, z0=0.0):
    return revolve([(r, z0), (r * 0.02, z0 + h)], n, cap_start=True, cap_end=True)


def extrude_poly(poly2d, h, z0=0.0, cap=True):
    """凸／星形多邊形沿 Z 擠出。"""
    P = np.asarray(poly2d, dtype=np.float64)
    n = len(P)
    bot = np.concatenate([P, np.full((n, 1), z0)], axis=1)
    top = np.concatenate([P, np.full((n, 1), z0 + h)], axis=1)
    V = np.concatenate([bot, top], axis=0)
    F = []
    for i in range(n):
        j = (i + 1) % n
        F.append((i, j, n + j, n + i))
    if cap:
        F.append(tuple(range(n))[::-1])
        F.append(tuple(n + i for i in range(n)))
    return V, F


def prism_roof(sx, sy, h, z0=0.0, ridge=0.0):
    """雙斜屋頂（山牆型）。ridge=0 為對稱。"""
    x0, x1 = -sx / 2, sx / 2
    y0, y1 = -sy / 2, sy / 2
    V = np.array([
        (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
        (x0 + ridge, (y0 + y1) / 2, z0 + h), (x1 - ridge, (y0 + y1) / 2, z0 + h)])
    F = [(0, 3, 2, 1), (0, 1, 5, 4), (2, 3, 4, 5), (1, 2, 5), (3, 0, 4)]
    return V, F


def grid_surface(X, Y, Z, flip=False):
    """X, Y, Z 皆為 (nx, ny) 陣列。"""
    nx, ny = Z.shape
    V = np.stack([X.ravel(), Y.ravel(), Z.ravel()], axis=1)
    F = []
    for i in range(nx - 1):
        b0 = i * ny
        b1 = (i + 1) * ny
        for j in range(ny - 1):
            f = (b0 + j, b1 + j, b1 + j + 1, b0 + j + 1)
            F.append(f[::-1] if flip else f)
    return V, F


def torus(R, r, nu=24, nv=10):
    profile = []
    for i in range(nv + 1):
        t = TAU * i / nv
        profile.append((R + r * math.cos(t), r * math.sin(t)))
    return revolve(profile, nu)


def tube_along(points, r, n=8, closed=False):
    """沿折線掃掠圓管，適合欄杆、鐵鍊、樹枝。"""
    P = np.asarray(points, dtype=np.float64)
    rings = []
    for i in range(len(P)):
        if i == 0:
            d = P[1] - P[0]
        elif i == len(P) - 1:
            d = P[-1] - P[-2]
        else:
            d = P[i + 1] - P[i - 1]
        d = d / (np.linalg.norm(d) + 1e-9)
        up = np.array((0.0, 0.0, 1.0))
        if abs(d @ up) > 0.95:
            up = np.array((1.0, 0.0, 0.0))
        u = np.cross(d, up)
        u /= np.linalg.norm(u) + 1e-9
        v = np.cross(d, u)
        rr = r[i] if hasattr(r, "__len__") else r
        angs = np.linspace(0, TAU, n, endpoint=False)
        rings.append(P[i] + rr * (np.outer(np.cos(angs), u) + np.outer(np.sin(angs), v)))
    return loft(rings, cap_start=not closed, cap_end=not closed)


def stairs(width, steps, rise, run, z0=0.0):
    """回傳 (V, F) 的階梯。"""
    md = MeshData("stairs")
    for i in range(steps):
        md.add(box(run, width, rise * (i + 1), center_xy=False, z0=z0), 0,
               translate(i * run, -width / 2, 0))
    return md.vertices(), list(md._F)


def frame_opening(w, h, t, ow, oh, ox=0.0, oz=0.0, z0=0.0):
    """在 w x h 的牆片上開一個 ow x oh 的方形洞（牆沿 +Y 有厚度 t）。"""
    md = MeshData("wall")
    hw, hh = w / 2.0, oh
    left = -hw
    right = hw
    ol, orr = ox - ow / 2.0, ox + ow / 2.0
    ob, ot = oz, oz + oh
    # 左、右、下、上 四塊
    md.add(box(ol - left, t, h, center_xy=False, z0=z0), 0, translate(left, -t / 2, 0))
    md.add(box(right - orr, t, h, center_xy=False, z0=z0), 0, translate(orr, -t / 2, 0))
    if ob > 0:
        md.add(box(ow, t, ob, center_xy=False, z0=z0), 0, translate(ol, -t / 2, 0))
    if ot < h:
        md.add(box(ow, t, h - ot, center_xy=False, z0=z0 + ot), 0, translate(ol, -t / 2, 0))
    return md.vertices(), list(md._F)
