"""Blender 端物件與實體化（instancing）輔助。"""
import math
import bpy

from .meshutil import MeshData


def new_collection(name, parent=None):
    c = bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(c)
    return c


def proto_mesh(md: MeshData, matlib, name=None):
    """把 MeshData 轉成未連結場景的 mesh datablock，供大量實體共用。"""
    me = bpy.data.meshes.new(name or md.name)
    V = md.vertices()
    me.from_pydata([tuple(v) for v in V], [], md._F)
    me.validate(verbose=False, clean_customdata=False)
    for nm in md.mat_names:
        me.materials.append(matlib[nm])
    if len(md.mat_names) > 1:
        me.polygons.foreach_set("material_index", md._M)
    me.update()
    return me


def instance(mesh, coll, loc=(0, 0, 0), rz=0.0, s=1.0, rx=0.0, ry=0.0, name=None):
    ob = bpy.data.objects.new(name or mesh.name, mesh)
    ob.location = loc
    ob.rotation_euler = (rx, ry, rz)
    if hasattr(s, "__len__"):
        ob.scale = s
    else:
        ob.scale = (s, s, s)
    coll.objects.link(ob)
    return ob


def join_stats(coll):
    v = f = 0
    for ob in coll.all_objects:
        if ob.type == 'MESH':
            v += len(ob.data.vertices)
            f += len(ob.data.polygons)
    return v, f
