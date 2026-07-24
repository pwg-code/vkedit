"""Render the vkedit VK monogram into a multi-resolution .ico file."""
from PIL import Image, ImageDraw

TEAL = (13, 148, 136, 255)
WHITE = (255, 255, 255, 255)

SIZES = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128)]


def draw_vk(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    s = size / 64.0
    radius = max(1, round(14 * s))

    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=TEAL)

    def P(x, y):
        return (round(x * s), round(y * s))

    v_poly = [
        P(8, 14), P(20, 14), P(32, 40), P(44, 14), P(56, 14),
        P(36, 52), P(28, 52),
    ]
    draw.polygon(v_poly, fill=WHITE)

    k_poly = [
        P(30, 14), P(36, 14), P(36, 28), P(50, 14), P(56, 14),
        P(40, 32), P(56, 50), P(50, 50), P(36, 36), P(36, 50),
        P(30, 50),
    ]
    draw.polygon(k_poly, fill=WHITE)

    return img


def main() -> None:
    # Render the icon at the largest size, then let Pillow resample for each
    # ICO entry. Geometric shapes downscale cleanly.
    master = draw_vk(max(w for w, _ in SIZES))
    master.save(
        "public/favicon.ico",
        format="ICO",
        sizes=SIZES,
    )
    print("Wrote public/favicon.ico with sizes", SIZES)


if __name__ == "__main__":
    main()