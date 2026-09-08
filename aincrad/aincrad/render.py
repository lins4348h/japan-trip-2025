"""Cycles 算圖設定與批次出圖。"""
import os
import time
import bpy


def setup(samples=128, res=(1600, 900), denoise=True, threshold=0.015,
          exposure=-0.35, look="AgX - Medium High Contrast"):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    cy = sc.cycles
    cy.device = 'CPU'
    cy.samples = samples
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = threshold
    cy.adaptive_min_samples = max(16, samples // 8)
    cy.use_denoising = denoise
    try:
        cy.denoiser = 'OPENIMAGEDENOISE'
        cy.denoising_use_gpu = False
    except Exception:
        pass
    cy.max_bounces = 8
    cy.diffuse_bounces = 3
    cy.glossy_bounces = 3
    cy.transmission_bounces = 6
    cy.transparent_max_bounces = 8
    cy.volume_bounces = 0
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    cy.blur_glossy = 1.5
    cy.sample_clamp_indirect = 12.0
    cy.use_light_tree = True
    cy.min_light_bounces = 1
    cy.min_transparent_bounces = 1
    sc.render.use_persistent_data = True
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGB'
    sc.render.image_settings.compression = 20
    sc.view_settings.view_transform = 'AgX'
    try:
        sc.view_settings.look = look
    except Exception:
        pass
    sc.view_settings.exposure = exposure
    return sc


def render_shot(cam_ob, path, samples=None, res=None):
    sc = bpy.context.scene
    sc.camera = cam_ob
    if samples:
        sc.cycles.samples = samples
    if res:
        sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.filepath = path
    t = time.time()
    bpy.ops.render.render(write_still=True)
    return time.time() - t
