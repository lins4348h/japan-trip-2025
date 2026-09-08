#!/usr/bin/env python3
"""建構艾恩葛朗特 3D 場景（Headless Blender / bpy 模組）。

用法：
    python3 build_aincrad.py --quality high --blend out/aincrad.blend
    python3 build_aincrad.py --quality high --render --shots 01,04,08 --samples 96
"""
import argparse
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402
from aincrad import scene, cameras, render as R, config as C  # noqa: E402
from aincrad.blutil import join_stats  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quality", default="high", choices=list(C.QUALITY))
    ap.add_argument("--blend", default="out/aincrad.blend")
    ap.add_argument("--render", action="store_true")
    ap.add_argument("--shots", default="all", help="逗號分隔的鏡頭前綴，或 all")
    ap.add_argument("--samples", type=int, default=96)
    ap.add_argument("--width", type=int, default=1600)
    ap.add_argument("--height", type=int, default=900)
    ap.add_argument("--outdir", default="renders")
    ap.add_argument("--no-clouds", action="store_true")
    ap.add_argument("--no-save", action="store_true")
    args = ap.parse_args()

    t0 = time.time()
    print(f"[1/4] 建構場景（quality={args.quality}）…", flush=True)
    ctx = scene.build(args.quality, clouds=not args.no_clouds)
    print(f"      幾何完成 {time.time() - t0:.1f}s  info={ctx['info']}", flush=True)

    print("[2/4] 建立攝影機…", flush=True)
    cams = cameras.build_cameras(ctx)
    v, f = join_stats(bpy.context.scene.collection)
    print(f"      場景統計：{len(bpy.data.objects)} 物件 / {v:,} 頂點 / {f:,} 面",
          flush=True)

    R.setup(samples=args.samples, res=(args.width, args.height))

    if not args.no_save:
        os.makedirs(os.path.dirname(args.blend) or ".", exist_ok=True)
        print(f"[3/4] 儲存 {args.blend} …", flush=True)
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.blend))
        print(f"      {os.path.getsize(args.blend) / 1e6:.1f} MB", flush=True)

    if args.render:
        os.makedirs(args.outdir, exist_ok=True)
        want = None if args.shots == "all" else set(args.shots.split(","))
        print("[4/4] 開始算圖…", flush=True)
        for s, ob in cams:
            key = s["name"].split("_")[0]
            if want is not None and key not in want and s["name"] not in want:
                continue
            path = os.path.join(args.outdir, s["name"] + ".png")
            dt = R.render_shot(ob, path, samples=s.get("samples") or args.samples)
            print(f"      {s['name']:<20} {dt / 60:6.2f} 分鐘  {s['note']}", flush=True)
    print(f"完成，總耗時 {(time.time() - t0) / 60:.1f} 分鐘")


if __name__ == "__main__":
    main()
