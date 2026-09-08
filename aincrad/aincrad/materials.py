"""全程序化材質庫（不依賴任何外部貼圖）。"""
import bpy


# ------------------------------------------------------------------ 基礎
def _new(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (900, 0)
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.location = (560, 0)
    nt.links.new(b.outputs["BSDF"], out.inputs["Surface"])
    return m, nt, b


def _coord(nt, size_m, loc=(-1100, 0), obj=True):
    tc = nt.nodes.new("ShaderNodeTexCoord")
    tc.location = loc
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.location = (loc[0] + 180, loc[1])
    s = 1.0 / max(size_m, 1e-4)
    mp.inputs["Scale"].default_value = (s, s, s)
    nt.links.new(tc.outputs["Object" if obj else "Generated"], mp.inputs["Vector"])
    return mp


def _noise(nt, vec, detail=6.0, rough=0.55, distort=0.0, loc=(-700, 0), scale=1.0):
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.location = loc
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = detail
    n.inputs["Roughness"].default_value = rough
    n.inputs["Distortion"].default_value = distort
    if vec is not None:
        nt.links.new(vec, n.inputs["Vector"])
    return n


def _ramp(nt, src, stops, loc=(-460, 0)):
    r = nt.nodes.new("ShaderNodeValToRGB")
    r.location = loc
    el = r.color_ramp.elements
    while len(el) > 1:
        el.remove(el[-1])
    el[0].position, el[0].color = stops[0][0], stops[0][1]
    for p, c in stops[1:]:
        e = el.new(p)
        e.color = c
    nt.links.new(src, r.inputs["Fac"])
    return r


def _bump(nt, height, strength, bsdf, loc=(360, -320), dist=0.06):
    b = nt.nodes.new("ShaderNodeBump")
    b.location = loc
    b.inputs["Strength"].default_value = strength
    b.inputs["Distance"].default_value = dist
    nt.links.new(height, b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], bsdf.inputs["Normal"])
    return b


def _mix_rgb(nt, fac, a, b, loc=(-260, 0)):
    m = nt.nodes.new("ShaderNodeMixRGB")
    m.location = loc
    m.inputs[1].default_value = (*a, 1.0)
    m.inputs[2].default_value = (*b, 1.0)
    if fac is not None:
        nt.links.new(fac, m.inputs["Fac"])
    return m


# ------------------------------------------------------------ 通用石材/表面
def rough_surface(name, c1, c2, rough=0.8, rough2=None, metal=0.0,
                  size=3.0, bump_str=0.3, detail=8.0, distort=0.4, spec=0.5):
    m, nt, b = _new(name)
    vec = _coord(nt, size)
    n = _noise(nt, vec.outputs["Vector"], detail=detail, distort=distort)
    mix = _mix_rgb(nt, n.outputs["Fac"], c1, c2)
    nt.links.new(mix.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Metallic"].default_value = metal
    b.inputs["Specular IOR Level"].default_value = spec
    if rough2 is None:
        b.inputs["Roughness"].default_value = rough
    else:
        rr = _ramp(nt, n.outputs["Fac"],
                   [(0.0, (rough, rough, rough, 1)), (1.0, (rough2, rough2, rough2, 1))],
                   loc=(-260, -260))
        nt.links.new(rr.outputs["Color"], b.inputs["Roughness"])
    fine = _noise(nt, vec.outputs["Vector"], detail=10.0, distort=0.2,
                  loc=(-700, -420), scale=7.0)
    _bump(nt, fine.outputs["Fac"], bump_str, b)
    return m


def block_stone(name, c1, c2, block=(2.4, 1.2), mortar=0.055, rough=0.85,
                bump_str=0.7, size=3.0):
    """以磚縫格線模擬石砌塊。"""
    m, nt, b = _new(name)
    vec = _coord(nt, 1.0)
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    sep.location = (-880, 0)
    nt.links.new(vec.outputs["Vector"], sep.inputs["Vector"])
    # 以 Z 分列，奇數列水平位移，形成錯縫
    row = nt.nodes.new("ShaderNodeMath")
    row.operation = "MULTIPLY"
    row.location = (-700, -200)
    row.inputs[1].default_value = 1.0 / block[1]
    nt.links.new(sep.outputs["Z"], row.inputs[0])
    fl = nt.nodes.new("ShaderNodeMath")
    fl.operation = "FLOOR"
    fl.location = (-560, -200)
    nt.links.new(row.outputs[0], fl.inputs[0])
    half = nt.nodes.new("ShaderNodeMath")
    half.operation = "MULTIPLY"
    half.location = (-420, -200)
    half.inputs[1].default_value = block[0] * 0.5
    nt.links.new(fl.outputs[0], half.inputs[0])
    shift = nt.nodes.new("ShaderNodeMath")
    shift.operation = "ADD"
    shift.location = (-420, -60)
    nt.links.new(sep.outputs["X"], shift.inputs[0])
    nt.links.new(half.outputs[0], shift.inputs[1])

    def gridline(src, period, loc):
        d = nt.nodes.new("ShaderNodeMath")
        d.operation = "DIVIDE"
        d.location = loc
        d.inputs[1].default_value = period
        nt.links.new(src, d.inputs[0])
        w = nt.nodes.new("ShaderNodeMath")
        w.operation = "WRAP"
        w.location = (loc[0] + 140, loc[1])
        w.inputs[1].default_value = 1.0
        w.inputs[2].default_value = 0.0
        nt.links.new(d.outputs[0], w.inputs[0])
        s = nt.nodes.new("ShaderNodeMath")
        s.operation = "SMOOTH_MIN"
        s.location = (loc[0] + 280, loc[1])
        s.inputs[2].default_value = 0.02
        nt.links.new(w.outputs[0], s.inputs[0])
        inv = nt.nodes.new("ShaderNodeMath")
        inv.operation = "SUBTRACT"
        inv.location = (loc[0] + 140, loc[1] - 120)
        inv.inputs[0].default_value = 1.0
        nt.links.new(w.outputs[0], inv.inputs[1])
        nt.links.new(inv.outputs[0], s.inputs[1])
        gt = nt.nodes.new("ShaderNodeMath")
        gt.operation = "GREATER_THAN"
        gt.location = (loc[0] + 420, loc[1])
        gt.inputs[1].default_value = mortar
        nt.links.new(s.outputs[0], gt.inputs[0])
        return gt

    gx = gridline(shift.outputs[0], block[0], (-260, 120))
    gz = gridline(sep.outputs["Z"], block[1], (-260, -420))
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.location = (200, -160)
    nt.links.new(gx.outputs[0], mul.inputs[0])
    nt.links.new(gz.outputs[0], mul.inputs[1])

    vec2 = _coord(nt, size, loc=(-1100, 420))
    n = _noise(nt, vec2.outputs["Vector"], detail=9.0, distort=0.6, loc=(-700, 420))
    mix = _mix_rgb(nt, n.outputs["Fac"], c1, c2, loc=(-400, 420))
    dark = nt.nodes.new("ShaderNodeMixRGB")
    dark.location = (200, 260)
    dark.inputs[1].default_value = (c2[0] * 0.35, c2[1] * 0.35, c2[2] * 0.35, 1)
    nt.links.new(mul.outputs[0], dark.inputs["Fac"])
    nt.links.new(mix.outputs["Color"], dark.inputs[2])
    nt.links.new(dark.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough

    hmix = nt.nodes.new("ShaderNodeMath")
    hmix.operation = "MULTIPLY_ADD"
    hmix.location = (360, -520)
    hmix.inputs[1].default_value = 0.6
    hmix.inputs[2].default_value = 0.0
    nt.links.new(mul.outputs[0], hmix.inputs[0])
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "ADD"
    add.location = (440, -640)
    nt.links.new(hmix.outputs[0], add.inputs[0])
    nfine = _noise(nt, vec2.outputs["Vector"], detail=10.0, loc=(-700, 700), scale=6.0)
    nt.links.new(nfine.outputs["Fac"], add.inputs[1])
    _bump(nt, add.outputs[0], bump_str, b, loc=(520, -760))
    return m


def striped(name, c1, c2, period=0.35, rough=0.75, bump_str=0.5, axis="Z",
            metal=0.0, size=1.0, distort=1.5):
    """木紋 / 屋瓦 / 板材：以 Wave 材質做條紋。"""
    m, nt, b = _new(name)
    vec = _coord(nt, size)
    w = nt.nodes.new("ShaderNodeTexWave")
    w.location = (-700, 0)
    w.wave_type = "BANDS"
    w.bands_direction = axis
    w.wave_profile = "SAW"
    w.inputs["Scale"].default_value = 1.0 / max(period, 1e-4)
    w.inputs["Distortion"].default_value = distort
    w.inputs["Detail"].default_value = 3.0
    nt.links.new(vec.outputs["Vector"], w.inputs["Vector"])
    mix = _mix_rgb(nt, w.outputs["Fac"], c1, c2)
    nt.links.new(mix.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    _bump(nt, w.outputs["Fac"], bump_str, b)
    return m


def emissive(name, color, strength, rough=0.4, base=None, alpha=1.0):
    m, nt, b = _new(name)
    b.inputs["Base Color"].default_value = (*(base or color), 1.0)
    b.inputs["Emission Color"].default_value = (*color, 1.0)
    b.inputs["Emission Strength"].default_value = strength
    b.inputs["Roughness"].default_value = rough
    if alpha < 1.0:
        b.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND"
    return m


def flat(name, color, rough=0.6, metal=0.0, spec=0.5, transmission=0.0, ior=1.45,
         alpha=1.0):
    m, nt, b = _new(name)
    b.inputs["Base Color"].default_value = (*color, 1.0)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["IOR"].default_value = ior
    b.inputs["Specular IOR Level"].default_value = spec
    b.inputs["Transmission Weight"].default_value = transmission
    b.inputs["Alpha"].default_value = alpha
    if alpha < 1.0:
        m.blend_method = "BLEND"
    return m


def water(name):
    m, nt, b = _new(name)
    b.inputs["Base Color"].default_value = (0.022, 0.075, 0.085, 1.0)
    b.inputs["Roughness"].default_value = 0.045
    b.inputs["IOR"].default_value = 1.33
    b.inputs["Transmission Weight"].default_value = 0.22
    vec = _coord(nt, 6.0)
    n = _noise(nt, vec.outputs["Vector"], detail=7.0, distort=1.2)
    n2 = _noise(nt, vec.outputs["Vector"], detail=4.0, distort=0.4,
                loc=(-700, -400), scale=0.12)
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "ADD"
    add.location = (-380, -300)
    nt.links.new(n.outputs["Fac"], add.inputs[0])
    nt.links.new(n2.outputs["Fac"], add.inputs[1])
    _bump(nt, add.outputs[0], 0.22, b, dist=0.4)
    return m


def foliage(name, c1, c2):
    m, nt, b = _new(name)
    vec = _coord(nt, 2.2)
    n = _noise(nt, vec.outputs["Vector"], detail=8.0, distort=1.6)
    mix = _mix_rgb(nt, n.outputs["Fac"], c1, c2)
    nt.links.new(mix.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.75
    b.inputs["Subsurface Weight"].default_value = 0.18
    b.inputs["Subsurface Radius"].default_value = (0.4, 0.55, 0.2)
    _bump(nt, n.outputs["Fac"], 0.25, b)
    return m


def terrain_blend(name):
    """地表：草／土／岩隨高度與雜訊混合。"""
    m, nt, b = _new(name)
    vec = _coord(nt, 26.0)
    n1 = _noise(nt, vec.outputs["Vector"], detail=9.0, distort=1.0)
    r = _ramp(nt, n1.outputs["Fac"], [
        (0.28, (0.030, 0.070, 0.018, 1)),
        (0.46, (0.062, 0.125, 0.032, 1)),
        (0.62, (0.098, 0.155, 0.048, 1)),
        (0.78, (0.150, 0.135, 0.062, 1)),
        (0.92, (0.095, 0.082, 0.062, 1))])
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    geo.location = (-1100, -520)
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    sep.location = (-900, -520)
    nt.links.new(geo.outputs["Normal"], sep.inputs["Vector"])
    slope = _ramp(nt, sep.outputs["Z"], [
        (0.55, (1, 1, 1, 1)), (0.86, (0, 0, 0, 1))], loc=(-700, -520))
    rock = nt.nodes.new("ShaderNodeMixRGB")
    rock.location = (-160, -160)
    rock.inputs[2].default_value = (0.09, 0.085, 0.082, 1)
    nt.links.new(slope.outputs["Color"], rock.inputs["Fac"])
    nt.links.new(r.outputs["Color"], rock.inputs[1])
    nt.links.new(rock.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.92
    fine = _noise(nt, vec.outputs["Vector"], detail=10.0, loc=(-700, 300), scale=40.0)
    _bump(nt, fine.outputs["Fac"], 0.18, b)
    return m


def sky_ceiling(name):
    """浮游城內部的人造天空：發光的層板下緣。"""
    m, nt, b = _new(name)
    vec = _coord(nt, 900.0)
    n = _noise(nt, vec.outputs["Vector"], detail=6.0, distort=1.4)
    r = _ramp(nt, n.outputs["Fac"], [
        (0.30, (0.20, 0.36, 0.66, 1)),
        (0.58, (0.44, 0.60, 0.84, 1)),
        (0.86, (0.86, 0.88, 0.92, 1))])
    nt.links.new(r.outputs["Color"], b.inputs["Emission Color"])
    b.inputs["Emission Strength"].default_value = 0.85
    b.inputs["Base Color"].default_value = (0.05, 0.07, 0.11, 1)
    b.inputs["Roughness"].default_value = 1.0
    return m


# ------------------------------------------------------------------ 材質庫
class MatLib(dict):
    def __missing__(self, key):
        m = flat(key, (0.8, 0.1, 0.6))
        self[key] = m
        return m


def build_library():
    L = MatLib()
    A = L.__setitem__

    # 石材與建築
    A("stone_wall", block_stone("stone_wall", (0.30, 0.285, 0.255), (0.44, 0.42, 0.38),
                                block=(2.6, 1.25), size=4.0))
    A("stone_castle", block_stone("stone_castle", (0.235, 0.235, 0.225), (0.36, 0.355, 0.335),
                                  block=(3.4, 1.6), bump_str=0.9, size=5.0))
    A("stone_dark", block_stone("stone_dark", (0.075, 0.075, 0.082), (0.145, 0.14, 0.15),
                                block=(4.0, 1.8), bump_str=1.0, size=6.0))
    A("stone_hull", rough_surface("stone_hull", (0.105, 0.098, 0.090), (0.205, 0.190, 0.168),
                                  rough=0.86, size=26.0, bump_str=0.55, distort=0.8))
    A("stone_hull_dark", rough_surface("stone_hull_dark", (0.052, 0.050, 0.048),
                                       (0.105, 0.098, 0.090), rough=0.9, size=34.0,
                                       bump_str=0.5))
    A("stone_rib", rough_surface("stone_rib", (0.145, 0.135, 0.118), (0.245, 0.225, 0.195),
                                 rough=0.78, size=18.0, bump_str=0.6))
    A("marble", rough_surface("marble", (0.72, 0.70, 0.665), (0.88, 0.87, 0.84),
                              rough=0.22, rough2=0.35, size=6.0, bump_str=0.08,
                              distort=1.8))
    A("marble_dark", rough_surface("marble_dark", (0.055, 0.05, 0.065), (0.16, 0.145, 0.18),
                                   rough=0.2, size=5.0, bump_str=0.08, distort=2.2))
    A("sandstone", rough_surface("sandstone", (0.42, 0.355, 0.255), (0.55, 0.475, 0.35),
                                 rough=0.9, size=5.0, bump_str=0.5))
    A("plaster", rough_surface("plaster", (0.62, 0.585, 0.525), (0.76, 0.73, 0.665),
                               rough=0.88, size=3.0, bump_str=0.22))
    A("plaster_warm", rough_surface("plaster_warm", (0.60, 0.50, 0.385), (0.74, 0.65, 0.50),
                                    rough=0.88, size=3.0, bump_str=0.22))
    A("cobble", rough_surface("cobble", (0.185, 0.178, 0.168), (0.325, 0.310, 0.285),
                              rough=0.82, size=1.1, bump_str=1.0, distort=1.4))
    A("dirt_road", rough_surface("dirt_road", (0.155, 0.125, 0.088), (0.255, 0.21, 0.15),
                                 rough=0.95, size=2.6, bump_str=0.5))
    A("gravel", rough_surface("gravel", (0.13, 0.125, 0.115), (0.24, 0.23, 0.21),
                              rough=0.94, size=0.55, bump_str=0.9))
    A("ruin_stone", rough_surface("ruin_stone", (0.20, 0.205, 0.175), (0.34, 0.34, 0.29),
                                  rough=0.93, size=3.4, bump_str=0.8, distort=1.2))

    # 屋頂
    A("roof_tile", striped("roof_tile", (0.135, 0.045, 0.032), (0.245, 0.085, 0.055),
                           period=0.42, rough=0.72, bump_str=0.55, axis="Y"))
    A("roof_tile_blue", striped("roof_tile_blue", (0.035, 0.055, 0.085),
                                (0.075, 0.105, 0.155), period=0.42, rough=0.68,
                                bump_str=0.55, axis="Y"))
    A("roof_slate", striped("roof_slate", (0.035, 0.037, 0.042), (0.075, 0.078, 0.088),
                            period=0.5, rough=0.6, bump_str=0.5, axis="Y"))
    A("copper_roof", rough_surface("copper_roof", (0.055, 0.20, 0.155), (0.10, 0.30, 0.24),
                                   rough=0.55, metal=0.75, size=4.0, bump_str=0.3))
    A("thatch", striped("thatch", (0.135, 0.105, 0.055), (0.235, 0.19, 0.10),
                        period=0.12, rough=0.95, bump_str=1.0, axis="Y", distort=3.0))

    # 木材
    A("wood_plank", striped("wood_plank", (0.075, 0.045, 0.024), (0.155, 0.098, 0.052),
                            period=0.22, rough=0.68, bump_str=0.35, axis="Y"))
    A("wood_dark", striped("wood_dark", (0.030, 0.019, 0.012), (0.072, 0.045, 0.026),
                           period=0.18, rough=0.6, bump_str=0.3, axis="Y"))
    A("wood_beam", striped("wood_beam", (0.055, 0.033, 0.018), (0.115, 0.072, 0.038),
                           period=0.30, rough=0.75, bump_str=0.45, axis="X"))
    A("wood_furniture", striped("wood_furniture", (0.095, 0.052, 0.026),
                                (0.185, 0.115, 0.058), period=0.10, rough=0.42,
                                bump_str=0.18, axis="X"))
    A("wood_floor", striped("wood_floor", (0.068, 0.040, 0.021), (0.135, 0.088, 0.046),
                            period=0.42, rough=0.5, bump_str=0.28, axis="Y"))

    # 金屬
    A("iron", rough_surface("iron", (0.035, 0.035, 0.038), (0.075, 0.075, 0.080),
                            rough=0.48, rough2=0.72, metal=1.0, size=0.8, bump_str=0.25))
    A("steel", flat("steel", (0.55, 0.565, 0.585), rough=0.18, metal=1.0))
    A("bronze", rough_surface("bronze", (0.28, 0.185, 0.075), (0.42, 0.30, 0.13),
                              rough=0.35, rough2=0.55, metal=1.0, size=1.4, bump_str=0.2))
    A("gold", flat("gold", (0.82, 0.62, 0.20), rough=0.15, metal=1.0))
    A("silver", flat("silver", (0.72, 0.73, 0.75), rough=0.12, metal=1.0))

    # 布料 / 雜項
    A("fabric_red", rough_surface("fabric_red", (0.185, 0.020, 0.022), (0.32, 0.045, 0.04),
                                  rough=0.9, size=0.6, bump_str=0.3, spec=0.25))
    A("fabric_blue", rough_surface("fabric_blue", (0.020, 0.035, 0.115),
                                   (0.045, 0.075, 0.21), rough=0.9, size=0.6,
                                   bump_str=0.3, spec=0.25))
    A("fabric_green", rough_surface("fabric_green", (0.022, 0.075, 0.045),
                                    (0.05, 0.14, 0.08), rough=0.9, size=0.6,
                                    bump_str=0.3, spec=0.25))
    A("canvas", rough_surface("canvas", (0.38, 0.335, 0.26), (0.52, 0.47, 0.375),
                              rough=0.94, size=0.5, bump_str=0.4, spec=0.2))
    A("leather", rough_surface("leather", (0.055, 0.032, 0.018), (0.105, 0.062, 0.032),
                               rough=0.62, size=0.25, bump_str=0.6))
    A("paper", flat("paper", (0.62, 0.575, 0.46), rough=0.85, spec=0.2))
    A("parchment", rough_surface("parchment", (0.50, 0.44, 0.32), (0.66, 0.60, 0.46),
                                 rough=0.88, size=0.4, bump_str=0.2))

    # 自然
    A("terrain", terrain_blend("terrain"))
    A("grass", foliage("grass", (0.055, 0.115, 0.030), (0.115, 0.20, 0.055)))
    A("foliage", foliage("foliage", (0.035, 0.085, 0.022), (0.105, 0.185, 0.048)))
    A("foliage_autumn", foliage("foliage_autumn", (0.19, 0.085, 0.018),
                                (0.30, 0.165, 0.035)))
    A("foliage_pine", foliage("foliage_pine", (0.018, 0.055, 0.030), (0.048, 0.098, 0.052)))
    A("bark", striped("bark", (0.038, 0.026, 0.016), (0.085, 0.062, 0.038),
                      period=0.06, rough=0.92, bump_str=0.9, axis="Z", distort=4.0))
    A("rock", rough_surface("rock", (0.075, 0.072, 0.068), (0.165, 0.16, 0.148),
                            rough=0.9, size=2.6, bump_str=0.9, distort=1.6))
    A("cliff", rough_surface("cliff", (0.10, 0.095, 0.085), (0.21, 0.20, 0.18),
                             rough=0.92, size=9.0, bump_str=1.0, distort=1.8))
    A("water", water("water"))
    A("snow", flat("snow", (0.86, 0.89, 0.95), rough=0.35))

    # 玻璃 / 發光
    A("glass", flat("glass", (0.86, 0.90, 0.92), rough=0.03, transmission=1.0, ior=1.46))
    A("glass_dirty", flat("glass_dirty", (0.62, 0.66, 0.60), rough=0.22,
                          transmission=0.9, ior=1.46))
    A("window_glow", emissive("window_glow", (1.0, 0.66, 0.32), 22.0,
                              base=(0.35, 0.22, 0.10)))
    A("window_glow_dim", emissive("window_glow_dim", (1.0, 0.72, 0.42), 6.0,
                                  base=(0.3, 0.2, 0.1)))
    A("flame", emissive("flame", (1.0, 0.52, 0.14), 260.0))
    A("flame_core", emissive("flame_core", (1.0, 0.86, 0.55), 900.0))
    A("lamp_glass", emissive("lamp_glass", (1.0, 0.78, 0.46), 40.0,
                             base=(0.5, 0.4, 0.25)))
    A("crystal_blue", emissive("crystal_blue", (0.25, 0.62, 1.0), 55.0,
                               base=(0.08, 0.2, 0.35), rough=0.1))
    A("rune_glow", emissive("rune_glow", (0.35, 0.85, 1.0), 30.0,
                            base=(0.05, 0.12, 0.18)))
    A("boss_glow", emissive("boss_glow", (1.0, 0.16, 0.08), 12.0,
                            base=(0.2, 0.03, 0.02)))
    A("potion_red", emissive("potion_red", (0.95, 0.10, 0.14), 3.0,
                             base=(0.4, 0.03, 0.05), rough=0.08))
    A("potion_blue", emissive("potion_blue", (0.12, 0.35, 0.95), 3.0,
                              base=(0.05, 0.12, 0.4), rough=0.08))
    A("potion_green", emissive("potion_green", (0.20, 0.90, 0.35), 3.0,
                               base=(0.05, 0.3, 0.1), rough=0.08))
    A("sky_ceiling", sky_ceiling("sky_ceiling"))
    A("sky_sun", emissive("sky_sun", (1.0, 0.95, 0.88), 900.0))
    _extra_materials(L)
    return L


def _extra_materials(L):
    """雲層等補充材質。"""
    m, nt, b = _new("cloud")
    b.inputs["Base Color"].default_value = (0.92, 0.94, 0.98, 1.0)
    b.inputs["Roughness"].default_value = 1.0
    b.inputs["Subsurface Weight"].default_value = 0.6
    b.inputs["Subsurface Radius"].default_value = (60.0, 60.0, 60.0)
    L["cloud"] = m
    return L
