import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourceDir = path.join(root, "logos");
const outDir = path.join(root, "public", "brand-logos");

const MAX_WIDTH = 900;
const MAX_HEIGHT = 360;
const PADDING = 36;

const logos = [
    ["BBC-Logo.wine.svg", "bbc.png"],
    ["Bloom.png", "bloom-nutrition.png"],
    ["Casetify-Logo.png", "casetify.png", { mode: "bright-mark" }],
    ["dossier.png", "dossier.png"],
    ["emi-4-logo-png-transparent.png", "emi.png"],
    ["Fashion-Nova-Logo.png", "fashion-nova.png"],
    ["Fortnite_F_lettermark_logo.png", "fortnite.png", { mode: "bright-mark" }],
    ["G-Fuel-Logo.png", "gfuel.png"],
    ["Halara-Logo.png", "halara.png"],
    ["hulu.png", "hulu.png", { mode: "remove-light-background" }],
    ["Insta360-Logo-500x281.png", "insta360.png"],
    ["Logitech_logo.png", "logitech.png"],
    ["Logo_Marvel_Rivals.svg", "marvel-rivals.png"],
    ["NordVPN_Logo_square.svg", "nordvpn.png"],
    ["OnceHuman.webp", "once-human.png"],
    ["Amazon_Prime_Video_logo.svg.png", "prime-video.png"],
    ["Romwe-Logo.png", "romwe.png"],
    ["shein-logo-0.png", "shein.png"],
    ["snapchat-logo-black-and-white.png", "snapchat.png", { mode: "remove-dark-background" }],
    ["Sony_Music_Entertainment_Logo_2023.svg", "sony-music.png"],
    ["Streamlabs-Logo.png", "streamlabs.png"],
    ["tiktok.svg", "tiktok.png"],
    ["universal.png", "universal-studios.png", { mode: "remove-light-background" }],
    ["Wander_Logo.jpg", "wander.png", { mode: "remove-light-background" }],
    ["wondershare.jpg", "wondershare.png", { mode: "remove-light-background" }],
];

function colorDistance(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function luminance(r, g, b) {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function estimateBackground(data, width, height, channels) {
    const samples = [];
    const sampleSize = Math.max(2, Math.floor(Math.min(width, height) * 0.055));
    const zones = [
        [0, 0, sampleSize, sampleSize],
        [width - sampleSize, 0, width, sampleSize],
        [0, height - sampleSize, sampleSize, height],
        [width - sampleSize, height - sampleSize, width, height],
    ];

    for (const [x0, y0, x1, y1] of zones) {
        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                const i = (y * width + x) * channels;
                if (data[i + 3] > 245) {
                    samples.push([data[i], data[i + 1], data[i + 2]]);
                }
            }
        }
    }

    if (!samples.length) return [255, 255, 255];

    samples.sort((a, b) => luminance(a[0], a[1], a[2]) - luminance(b[0], b[1], b[2]));
    const midpoint = samples[Math.floor(samples.length / 2)];
    return midpoint ?? [255, 255, 255];
}

function thresholdAlpha({ data, width, height, channels, mode, hasMeaningfulTransparency }) {
    const out = Buffer.alloc(width * height * 4);
    const background = estimateBackground(data, width, height, channels);
    const backgroundLum = luminance(background[0], background[1], background[2]);
    const removeLightBackground = mode === "remove-light-background";
    const removeDarkBackground = mode === "remove-dark-background";
    const brightMark = mode === "bright-mark";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sourceIndex = (y * width + x) * channels;
            const targetIndex = (y * width + x) * 4;
            const r = data[sourceIndex];
            const g = data[sourceIndex + 1];
            const b = data[sourceIndex + 2];
            const originalAlpha = data[sourceIndex + 3];
            const lum = luminance(r, g, b);
            const distanceFromBg = colorDistance([r, g, b], background);
            let alpha = originalAlpha;

            if (brightMark) {
                alpha = lum > 205 && Math.max(r, g, b) - Math.min(r, g, b) < 55 ? originalAlpha : 0;
            } else if (removeLightBackground) {
                const isBackground = lum > 218 && distanceFromBg < 78;
                alpha = isBackground ? 0 : originalAlpha;
            } else if (removeDarkBackground) {
                const isBackground = lum < 44 || (distanceFromBg < 54 && backgroundLum < 80);
                alpha = isBackground ? 0 : originalAlpha;
            } else if (hasMeaningfulTransparency) {
                alpha = originalAlpha;
            } else {
                const isBackground = distanceFromBg < 66;
                alpha = isBackground ? 0 : originalAlpha;
            }

            out[targetIndex] = 255;
            out[targetIndex + 1] = 255;
            out[targetIndex + 2] = 255;
            out[targetIndex + 3] = alpha;
        }
    }

    return out;
}

async function normalizeLogo(sourceFile, outFile, options = {}) {
    const input = path.join(sourceDir, sourceFile);
    const output = path.join(outDir, outFile);
    const image = sharp(input, { density: 300, animated: false }).rotate().ensureAlpha();
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    const pixelCount = info.width * info.height;
    let transparentPixels = 0;

    for (let i = 3; i < data.length; i += info.channels) {
        if (data[i] < 8) transparentPixels++;
    }

    const transparentRatio = transparentPixels / pixelCount;
    const hasMeaningfulTransparency = transparentRatio > 0.08 && options.mode !== "remove-light-background" && options.mode !== "remove-dark-background";
    const whiteMask = thresholdAlpha({
        data,
        width: info.width,
        height: info.height,
        channels: info.channels,
        mode: options.mode,
        hasMeaningfulTransparency,
    });

    const { data: finalData, info: finalInfo } = await sharp(whiteMask, {
        raw: {
            width: info.width,
            height: info.height,
            channels: 4,
        },
    })
        .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 })
        .resize({
            width: MAX_WIDTH - PADDING * 2,
            height: MAX_HEIGHT - PADDING * 2,
            fit: "inside",
            withoutEnlargement: true,
        })
        .extend({
            top: PADDING,
            bottom: PADDING,
            left: PADDING,
            right: PADDING,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .raw()
        .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < finalData.length; i += finalInfo.channels) {
        if (finalData[i + 3] > 0) {
            finalData[i] = 255;
            finalData[i + 1] = 255;
            finalData[i + 2] = 255;
        }
    }

    await sharp(finalData, {
        raw: {
            width: finalInfo.width,
            height: finalInfo.height,
            channels: finalInfo.channels,
        },
    })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(output);

    return output;
}

fs.mkdirSync(outDir, { recursive: true });

const written = [];
for (const [sourceFile, outFile, options] of logos) {
    const output = await normalizeLogo(sourceFile, outFile, options);
    written.push(path.relative(root, output));
}

console.log(`Generated ${written.length} white transparent logo PNGs:`);
for (const file of written) {
    console.log(`- ${file}`);
}
