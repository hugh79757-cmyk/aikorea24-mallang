#!/usr/bin/env python3
"""말랑 — OG 이미지(1200×630) + 파비콘(512) 생성."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math, os

W, H = 1200, 630
S = 2
FS = W * S  # 최종 해상도 기준
def s(v):  # 슈퍼샘플 스케일
    return int(v * S)

PAL = {
    "mint": (184,230,217), "peach": (255,216,194), "lav": (220,201,242),
    "butter": (255,242,184), "baby": (199,228,245), "rose": (251,208,220),
}

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))

img = Image.new("RGB", (FS, s(H)), "#FFFFFF")
# 파스텔 세로 그라데이션
stops = [(234,247,242), (245,240,251), (255,247,240)]
for y in range(s(H)):
    t = y / s(H) * (len(stops)-1)
    i = min(int(t), len(stops)-2)
    c = lerp(stops[i], stops[i+1], t-i)
    ImageDraw.Draw(img).line([(0, y), (FS, y)], fill=c)

# 은은한 광채
for (cxr, cyr, rr, col) in [
    (0.16, 0.10, 0.26, (198,238,226)),
    (0.88, 0.18, 0.22, (226,214,246)),
    (0.60, 0.96, 0.28, (255,228,208)),
    (0.42, 0.04, 0.18, (200,228,245)),
]:
    cx, cy, r = s(cxr*W), s(cyr*H), s(rr*W)
    ov = Image.new("RGBA", img.size, (0,0,0,0))
    ImageDraw.Draw(ov).ellipse([cx-r, cy-r, cx+r, cy+r], fill=col+(150,))
    ov = ov.filter(ImageFilter.GaussianBlur(s(0.055*W)))
    img = Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")


def blob(img, cx, cy, r, color, spikes=0, fin=True, antennae=0, eye=None):
    """파스텔 귀여운 블롭 (cx,cy,r 은 최종 해상도 기준). 합성된 img 를 반환."""
    CX, CY, R = s(cx), s(cy), s(r)
    E = s(eye if eye else r*0.16)

    def paste_sh(layer, cur):
        return Image.alpha_composite(cur.convert("RGBA"), layer).convert("RGB")

    # 그림자
    sh = Image.new("RGBA", img.size, (0,0,0,0))
    ImageDraw.Draw(sh).ellipse([CX-R*0.70, CY+R*0.82, CX+R*0.70, CY+R*1.00], fill=(90,105,120,46))
    sh = sh.filter(ImageFilter.GaussianBlur(s(r*0.09)))
    img = paste_sh(sh, img)
    d = ImageDraw.Draw(img)

    # 지느러미 (측면)
    if fin:
        for sgn in (-1, 1):
            x = CX + sgn*R*0.82
            d.polygon([(x, CY+R*0.46), (x+sgn*R*0.46, CY+R*0.82), (x+sgn*R*0.14, CY+R*0.62)],
                      fill=(170,217,240))
    # 아래 지느러미
    d.polygon([(CX-R*0.36, CY+R*0.86), (CX-R*0.54, CY+R*1.14), (CX-R*0.04, CY+R*1.10)],
              fill=(158,220,198))
    # 몸통
    d.ellipse([CX-R, CY-R*0.92, CX+R, CY+R*0.92], fill=color)
    # 하이라이트
    hl = Image.new("RGBA", img.size, (0,0,0,0))
    ImageDraw.Draw(hl).ellipse([CX-R*0.50, CY-R*0.72, CX+R*0.10, CY-R*0.08], fill=(255,255,255,125))
    hl = hl.filter(ImageFilter.GaussianBlur(s(r*0.13)))
    img = paste_sh(hl, img)
    d = ImageDraw.Draw(img)

    # 갑각 스파이크
    for i in range(spikes):
        t = (i+1)/(spikes+1)
        x = CX - R + t*R*2
        y = CY - R*0.90
        d.polygon([(x-R*0.15, y+R*0.05), (x, y-R*0.24), (x+R*0.15, y+R*0.05)], fill=(241,203,178))

    # 눈
    ey, ex = CY - R*0.13, R*0.34
    for sgn in (-1, 1):
        d.ellipse([CX+sgn*ex-E, ey-E*0.86, CX+sgn*ex+E, ey+E*0.86], fill=(43,58,74))
        d.ellipse([CX+sgn*ex-E*0.34, ey-E*0.62, CX+sgn*ex-E*0.34+E*0.36, ey-E*0.62+E*0.36], fill=(255,255,255))
    # 볼터치
    for sgn in (-1, 1):
        d.ellipse([CX+sgn*(ex+E*1.0)-E*0.72, ey+E*1.35-E*0.48,
                   CX+sgn*(ex+E*1.0)+E*0.72, ey+E*1.35+E*0.48], fill=(255,196,196))
    # 입
    d.arc([CX-E*1.05, ey+E*0.8, CX+E*1.05, ey+E*2.9], start=18, end=162,
          fill=(43,58,74), width=max(s(1.6), s(r*0.05)))
    # 촉수
    for i in range(antennae):
        a0, a1 = -74 - i*26, -84 - i*26
        x1, y1 = CX + math.cos(math.radians(a0))*R*0.92, CY + math.sin(math.radians(a0))*R*0.92
        x2, y2 = CX + math.cos(math.radians(a1))*(R*1.16), CY + math.sin(math.radians(a1))*(R*1.16)
        mx, my = (x1+x2)/2 + R*0.09, (y1+y2)/2 - R*0.13
        d.line([(x1,y1),(mx,my),(x2,y2)], fill=(186,168,222), width=max(s(2.2), s(r*0.065)), joint="curve")
        d.ellipse([x2-s(r*0.08), y2-s(r*0.08), x2+s(r*0.08), y2+s(r*0.08)], fill=PAL["lav"])
    return img


# ── 3종 배치 (상단 45%) ──
cy = 232
img = blob(img, 250, cy, 62, PAL["peach"], spikes=1, antennae=1, eye=11)
img = blob(img, 600, cy-14, 74, PAL["mint"], spikes=2, fin=True, antennae=2, eye=13)
img = blob(img, 950, cy, 62, PAL["baby"], spikes=3, antennae=3, eye=11)

img = img.resize((W, H), Image.LANCZOS)
d = ImageDraw.Draw(img)

FONT_CANDIDATES = [
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    "/System/Library/Fonts/Supplemental/AppleGothic.ttc",
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/Library/Fonts/Arial Unicode.ttf",
]
def pick_font(size):
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def ctext(text, y, font, fill):
    bb = d.textbbox((0,0), text, font=font)
    d.text(((W-(bb[2]-bb[0]))//2, y), text, font=font, fill=fill)

ctext("말랑", 352, pick_font(82), (43,58,74))
ctext("38억 년 진화 일지", 452, pick_font(32), (92,109,126))
ctext("멸종은 게임 오버가 아니라, 새로운 종으로의 분기입니다.", 508, pick_font(23), (146,160,174))

# 하단 스탯 칩
chips = [("강인", PAL["peach"]), ("민첩", PAL["baby"]), ("활력", PAL["mint"]), ("지혜", PAL["lav"])]
cw, gap = 112, 14
total = len(chips)*cw + (len(chips)-1)*gap
sx = (W-total)//2
fs24 = pick_font(23)
for i, (c, col) in enumerate(chips):
    x0 = sx + i*(cw+gap)
    d.rounded_rectangle([x0, 565, x0+cw, 604], radius=19, fill=col)
    bb = d.textbbox((0,0), c, font=fs24)
    d.text((x0+(cw-(bb[2]-bb[0]))//2, 573), c, font=fs24, fill=(70,85,100))

img.save("/Users/twinssn/Projects/aikorea24-mallang/public/og.png", "PNG", optimize=True)
print("og.png", img.size)

# ── 파비콘 512 ──
ico = Image.new("RGB", (512, 512), (255,253,249))
id_ = ImageDraw.Draw(ico)
c2 = 256
id_.ellipse([c2-168, c2-158, c2+168, c2+158], fill=PAL["mint"])
for sgn in (-1, 1):
    x = c2 + sgn*60
    id_.ellipse([x-40, c2-50-34, x+40, c2-50+34], fill=(43,58,74))
    id_.ellipse([x-12, c2-62, x+8, c2-38], fill=(255,255,255))
    id_.ellipse([c2+sgn*112-26, c2-2-14, c2+sgn*112+26, c2-2+14], fill=(255,196,196))
id_.arc([c2-58, c2-14, c2+58, c2+66], start=18, end=162, fill=(43,58,74), width=15)
ico.save("/Users/twinssn/Projects/aikorea24-mallang/public/favicon.png", "PNG", optimize=True)
print("favicon.png", ico.size)