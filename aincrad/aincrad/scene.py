"""場景組裝：幾何、燈光、世界、攝影機。"""
import math
import random
import numpy as np
import bpy

from . import config as C
from . import materials, exterior, nature as N, town, dungeon, interiors, props as P
from .meshutil import MeshData, translate, rot_z, chain, TAU, revolve, uv_sphere
from .blutil import new_collection, proto_mesh, instance

CEIL_Z = C.floor_height(0) - 2.0


# ------------------------------------------------------------------ 工具
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for d in (bpy.data.meshes, bpy.data.materials, bpy.data.objects, bpy.data.lights,
              bpy.data.cameras, bpy.data.worlds):
        for x in list(d):
            d.remove(x)


def look_at(loc, target):
    d = np.array(target, dtype=float) - np.array(loc, dtype=float)
    n = np.linalg.norm(d) + 1e-9
    u = d / n
    rx = math.acos(max(-1.0, min(1.0, -u[2])))
    rz = math.atan2(-u[0], u[1])
    return (rx, 0.0, rz)


def add_camera(name, loc, target, lens=40.0, dof=None, fstop=2.8, shift=(0, 0)):
    cam = bpy.data.cameras.new(name)
    cam.lens = lens
    cam.clip_start = 0.05
    cam.clip_end = 200000.0
    cam.shift_x, cam.shift_y = shift
    if dof:
        cam.dof.use_dof = True
        cam.dof.focus_distance = dof
        cam.dof.aperture_fstop = fstop
    ob = bpy.data.objects.new(name, cam)
    ob.location = loc
    ob.rotation_euler = look_at(loc, target)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def add_point(coll, loc, energy, color=(1.0, 0.62, 0.32), radius=0.4):
    l = bpy.data.lights.new("pt", 'POINT')
    l.energy = energy
    l.color = color
    l.shadow_soft_size = radius
    ob = bpy.data.objects.new("pt", l)
    ob.location = loc
    coll.objects.link(ob)
    return ob


# ------------------------------------------------------------------ 世界
def link_lights(sun_ext, sun_int, ext_colls, int_colls):
    """以 light linking 分離內外光照，避免互相干擾。"""
    ext = bpy.data.collections.new("LL_Exterior")
    inn = bpy.data.collections.new("LL_Interior")
    for c in ext_colls:
        for ob in c.all_objects:
            if ob.type == 'MESH':
                ext.objects.link(ob)
    for c in int_colls:
        for ob in c.all_objects:
            if ob.type == 'MESH':
                inn.objects.link(ob)
    sun_ext.light_linking.receiver_collection = ext
    if sun_int is not None:
        sun_int.light_linking.receiver_collection = inn
    return ext, inn


def build_inner_sun_lamp(coll, elev=46.0, rot=0.95, energy=13.0):
    l = bpy.data.lights.new("SunInner", 'SUN')
    l.energy = energy
    l.color = (1.0, 0.93, 0.82)
    l.angle = math.radians(2.2)
    ob = bpy.data.objects.new("SunInner", l)
    e = math.radians(elev)
    d = (-math.cos(e) * math.cos(rot), -math.cos(e) * math.sin(rot), -math.sin(e))
    ob.rotation_euler = look_at((0, 0, 0), d)
    ob.location = (0, 0, CEIL_Z - 20)
    coll.objects.link(ob)
    return ob


def build_world(sun_elev=9.0, sun_rot=2.35, strength=0.6):
    w = bpy.data.worlds.new("Sky")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.location = (-200, 0)
    bg.inputs["Strength"].default_value = strength
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.location = (-500, 0)
    sky.sky_type = 'NISHITA'
    sky.sun_elevation = math.radians(sun_elev)
    sky.sun_rotation = sun_rot
    sky.altitude = 3000.0
    sky.air_density = 1.15
    sky.dust_density = 1.1
    sky.ozone_density = 1.0
    sky.sun_intensity = 0.35
    sky.sun_size = math.radians(1.2)
    nt.links.new(sky.outputs["Color"], bg.inputs["Color"])
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])

    sun = bpy.data.lights.new("Sun", 'SUN')
    sun.energy = 5.5
    sun.color = (1.0, 0.78, 0.52)
    sun.angle = math.radians(1.6)
    so = bpy.data.objects.new("Sun", sun)
    e = math.radians(sun_elev)
    d = (-math.cos(e) * math.cos(sun_rot), -math.cos(e) * math.sin(sun_rot), -math.sin(e))
    so.rotation_euler = look_at((0, 0, 0), d)
    so.location = (0, 0, C.floor_z(C.FLOOR_COUNT) + 2000)
    bpy.context.scene.collection.objects.link(so)
    return so


# --------------------------------------------------- 第一層天頂（人造天空）
def build_ceiling(coll, matlib, cut):
    """第一層天頂：發光的人造天空，剖面缺口處開孔。"""
    md = MeshData("Floor1_Ceiling")
    R = C.floor_radius(0) * 0.985
    nr, na = 16, 220
    radii = np.linspace(0.0, R, nr)
    angs = np.linspace(0.0, TAU, na, endpoint=False)
    X = np.outer(radii, np.cos(angs))
    Y = np.outer(radii, np.sin(angs))
    V = np.stack([X.ravel(), Y.ravel(), np.full(X.size, CEIL_Z)], axis=1)
    F = []
    for a_i in range(na):
        b_i = (a_i + 1) % na
        am = TAU * (a_i + 0.5) / na
        for r_i in range(nr - 1):
            if cut and cut[0] < am < cut[1] and radii[r_i] > C.CUT_INNER_R:
                continue
            F.append((r_i * na + b_i, r_i * na + a_i,
                      (r_i + 1) * na + a_i, (r_i + 1) * na + b_i))
    md.add((V, F), "sky_ceiling")
    ob = md.to_object(coll, matlib)
    ob.visible_shadow = False       # 不阻擋內部太陽
    return ob


def build_inner_sun(coll, matlib, pos, r=140.0):
    """人造太陽：天頂上的高亮圓盤，提供方向性光影。"""
    md = MeshData("Floor1_InnerSun")
    md.add(revolve([(0.0, CEIL_Z - 3.0), (r, CEIL_Z - 3.0)], 48),
           "sky_sun")
    ob = md.to_object(coll, matlib)
    ob.location = (pos[0], pos[1], 0.0)
    ob.visible_shadow = False
    return ob


# ------------------------------------------------------------------ 主流程
def build(quality="high", clouds=True):
    reset()
    sc = bpy.context.scene
    rng = random.Random(C.SEED)
    matlib = materials.build_library()
    q = C.QUALITY[quality]
    cut = (C.CUTAWAY_A0, C.CUTAWAY_A1)
    info = {}

    col_ext = new_collection("01_Exterior")
    col_ter = new_collection("02_Terrain")
    col_veg = new_collection("03_Vegetation")
    col_town = new_collection("04_Town")
    col_dun = new_collection("05_Dungeon")
    col_int = new_collection("06_Interiors")
    col_lit = new_collection("07_Lights")

    # --- 浮游城外殼 -------------------------------------------------
    exterior.build(quality, matlib, col_ext)
    if clouds:
        md = MeshData("Clouds")
        exterior.build_clouds(md, rng, count=int(70 * q["detail"]))
        md.to_object(col_ext, matlib)

    # --- 第一層地形 -------------------------------------------------
    terr = N.Terrain()
    md = MeshData("Floor1_Ground")
    N.build_ground(md, terr, q["terrain_res"])
    md.to_object(col_ter, matlib)
    md = MeshData("Floor1_Water")
    N.build_water(md, terr)
    md.to_object(col_ter, matlib)
    build_ceiling(col_ter, matlib, cut)
    isun_a, isun_r = 0.72, C.floor_radius(0) * 0.62
    build_inner_sun(col_ter, matlib,
                    (isun_r * math.cos(isun_a), isun_r * math.sin(isun_a)))

    # --- 植被 -------------------------------------------------------
    info["trees"] = N.scatter(col_veg, matlib, terr, rng, quality)

    # --- 城鎮 -------------------------------------------------------
    info["houses"] = town.build(quality, matlib, col_town, terr, rng)

    # --- 迷宮塔、迷宮、地下城、神殿、Boss 房 -------------------------
    tz = terr.h1(*N.TOWER)
    md = dungeon.labyrinth_tower(rng, ceiling_z=CEIL_Z, base_z=tz)
    ob = md.to_object(col_dun, matlib)
    ob.location = (N.TOWER[0], N.TOWER[1], tz)

    md = dungeon.stone_maze(rng, cells=19, cell=12.0)
    ob = md.to_object(col_dun, matlib)
    ma = 1.18 + 0.30
    ob.location = (N.TOWER[0] + 320 * math.cos(ma), N.TOWER[1] + 320 * math.sin(ma),
                   terr.h1(N.TOWER[0] + 320 * math.cos(ma), N.TOWER[1] + 320 * math.sin(ma)))

    md = dungeon.dungeon_entrance(rng)
    ob = md.to_object(col_dun, matlib)
    ob.location = (N.DUNGEON[0], N.DUNGEON[1], terr.h1(*N.DUNGEON))

    md = dungeon.temple(rng)
    ob = md.to_object(col_dun, matlib)
    tpz = terr.h1(*N.TEMPLE)
    ob.location = (N.TEMPLE[0], N.TEMPLE[1], tpz)
    info["temple_z"] = tpz

    boss_z = tz - 62.0
    md = dungeon.boss_room(rng)
    ob = md.to_object(col_dun, matlib)
    ob.location = (N.TOWER[0], N.TOWER[1], boss_z)
    info["boss_z"] = boss_z

    # --- 旅館（含完整室內酒場）與工坊 --------------------------------
    inn_local = (168.0, -96.0)
    inn_a = math.atan2(inn_local[1], inn_local[0]) + math.pi
    inn_pos = (town.ORIGIN[0] + inn_local[0], town.ORIGIN[1] + inn_local[1],
               town.ORIGIN[2] + 0.15)
    tv = interiors.tavern(rng)
    ob = tv.to_object(col_int, matlib)
    ob.location = inn_pos
    ob.rotation_euler = (0, 0, inn_a)
    inn = interiors.inn_exterior(rng)
    ob2 = inn.to_object(col_int, matlib)
    ob2.location = inn_pos
    ob2.rotation_euler = (0, 0, inn_a)
    info["inn_pos"] = inn_pos
    info["inn_rot"] = inn_a

    ws_local = (-96.0, 214.0)
    ws_a = math.atan2(ws_local[1], ws_local[0]) + math.pi
    ws_pos = (town.ORIGIN[0] + ws_local[0], town.ORIGIN[1] + ws_local[1],
              town.ORIGIN[2] + 0.15)
    ws = interiors.workshop_interior(rng)
    ob = ws.to_object(col_int, matlib)
    ob.location = ws_pos
    ob.rotation_euler = (0, 0, ws_a)
    info["ws_pos"] = ws_pos
    info["ws_rot"] = ws_a

    # --- 燈光 -------------------------------------------------------
    sun_ext = build_world()
    sun_int = build_inner_sun_lamp(col_lit)
    link_lights(sun_ext, sun_int, [col_ext],
                [col_ter, col_veg, col_town, col_dun, col_int])
    # 酒場內部
    for lx, ly, lz, e, col in ((-4.4, 0.0, 3.9, 900, (1.0, 0.63, 0.30)),
                               (2.7, 0.0, 3.9, 900, (1.0, 0.63, 0.30)),
                               (-7.6, 2.6, 1.3, 420, (1.0, 0.45, 0.16)),
                               (4.8, -4.6, 2.2, 260, (1.0, 0.72, 0.42))):
        p = np.array((lx, ly, 0.0))
        c, s = math.cos(inn_a), math.sin(inn_a)
        add_point(col_lit, (inn_pos[0] + c * lx - s * ly, inn_pos[1] + s * lx + c * ly,
                            inn_pos[2] + lz), e, col, radius=0.5)
    # 工坊
    c, s = math.cos(ws_a), math.sin(ws_a)
    for lx, ly, lz, e in ((-4.0, 3.2, 1.4, 700), (0.0, 0.0, 3.5, 400)):
        add_point(col_lit, (ws_pos[0] + c * lx - s * ly, ws_pos[1] + s * lx + c * ly,
                            ws_pos[2] + lz), e, (1.0, 0.55, 0.22), radius=0.6)
    # Boss 房
    for lx, ly, lz, e, col in ((-37, -26, 4.0, 7000, (1.0, 0.5, 0.2)),
                               (37, -26, 4.0, 7000, (1.0, 0.5, 0.2)),
                               (-37, 26, 4.0, 7000, (1.0, 0.5, 0.2)),
                               (37, 26, 4.0, 7000, (1.0, 0.5, 0.2)),
                               (0, 24, 24.0, 14000, (1.0, 0.18, 0.10)),
                               (0, 0, 20.0, 9000, (0.35, 0.55, 1.0))):
        add_point(col_lit, (N.TOWER[0] + lx, N.TOWER[1] + ly, boss_z + lz), e, col,
                  radius=2.0)
    # 神殿
    add_point(col_lit, (N.TEMPLE[0], N.TEMPLE[1] + 6, tpz + 15.0), 30000,
              (0.45, 0.7, 1.0), radius=3.0)
    # 廣場噴泉
    add_point(col_lit, (town.ORIGIN[0], town.ORIGIN[1], town.ORIGIN[2] + 8.0),
              9000, (0.4, 0.7, 1.0), radius=2.0)
    return dict(info=info, terr=terr, matlib=matlib)
