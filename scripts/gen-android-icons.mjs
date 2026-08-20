// 生成 Android 应用图标：黑白墨点设计
// - mipmap-*/ic_launcher.png / ic_launcher_round.png：传统启动图标（暗底 + 白点）
// - mipmap-*/ic_launcher_foreground.png：自适应图标前景（透明底 + 白点，安全区内）
// - drawable*/splash.png：启动页（浅底 + 墨点，匹配默认日间主题）
import { deflateSync } from 'node:zlib'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const res = join(__dirname, '..', 'android', 'app', 'src', 'main', 'res')

// ---------- PNG 编码 ----------
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePNG(width, height, pixels) {
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

/** 绘制：中心圆点；transparentBg 时背景透明，否则实色背景 */
function drawIcon(size, { bg = [10, 10, 10, 255], fg = [245, 245, 245, 255], radiusFactor = 0.3, transparentBg = false } = {}) {
  const buf = Buffer.alloc(size * size * 4)
  const cx = size / 2
  const cy = size / 2
  const r = size * radiusFactor
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - cx
      const dy = y + 0.5 - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const i = (y * size + x) * 4
      if (dist <= r - 1) {
        buf[i] = fg[0]; buf[i + 1] = fg[1]; buf[i + 2] = fg[2]; buf[i + 3] = fg[3]
      } else if (dist <= r + 1) {
        const a = Math.max(0, Math.min(1, r + 1 - dist))
        buf[i] = Math.round(fg[0] * a + bg[0] * (1 - a))
        buf[i + 1] = Math.round(fg[1] * a + bg[1] * (1 - a))
        buf[i + 2] = Math.round(fg[2] * a + bg[2] * (1 - a))
        buf[i + 3] = transparentBg ? Math.round(fg[3] * a) : 255
      } else if (transparentBg) {
        buf[i + 3] = 0
      } else {
        buf[i] = bg[0]; buf[i + 1] = bg[1]; buf[i + 2] = bg[2]; buf[i + 3] = bg[3]
      }
    }
  }
  return buf
}

function readPngSize(file) {
  const b = readFileSync(file)
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }
}

const DARK = [10, 10, 10, 255]
const WHITE = [245, 245, 245, 255]
const LIGHT_BG = [244, 244, 244, 255]
const INK = [20, 20, 20, 255]

// 传统启动图标（legacy，全尺寸实底）
const LEGACY = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 }
for (const [dpi, size] of Object.entries(LEGACY)) {
  const png = encodePNG(size, size, drawIcon(size, { bg: DARK, fg: WHITE, radiusFactor: 0.3 }))
  writeFileSync(join(res, `mipmap-${dpi}`, 'ic_launcher.png'), png)
  writeFileSync(join(res, `mipmap-${dpi}`, 'ic_launcher_round.png'), png)
}

// 自适应图标前景（透明底，内容在安全区内）
const FOREGROUND = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 }
for (const [dpi, size] of Object.entries(FOREGROUND)) {
  const png = encodePNG(size, size, drawIcon(size, { transparentBg: true, radiusFactor: 0.28 }))
  writeFileSync(join(res, `mipmap-${dpi}`, 'ic_launcher_foreground.png'), png)
}

// 启动页：按现有尺寸重新生成（浅底 + 墨点）
const splashDirs = ['drawable', 'drawable-port-mdpi', 'drawable-port-hdpi', 'drawable-port-xhdpi', 'drawable-port-xxhdpi', 'drawable-port-xxxhdpi', 'drawable-land-mdpi', 'drawable-land-hdpi', 'drawable-land-xhdpi', 'drawable-land-xxhdpi', 'drawable-land-xxxhdpi']
for (const dir of splashDirs) {
  const file = join(res, dir, 'splash.png')
  const { width, height } = readPngSize(file)
  const min = Math.min(width, height)
  const buf = Buffer.alloc(width * height * 4)
  const cx = width / 2
  const cy = height / 2
  const r = min * 0.16
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x + 0.5 - cx
      const dy = y + 0.5 - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const i = (y * width + x) * 4
      if (dist <= r - 1) {
        buf[i] = INK[0]; buf[i + 1] = INK[1]; buf[i + 2] = INK[2]; buf[i + 3] = 255
      } else if (dist <= r + 1) {
        const a = Math.max(0, Math.min(1, r + 1 - dist))
        buf[i] = Math.round(INK[0] * a + LIGHT_BG[0] * (1 - a))
        buf[i + 1] = Math.round(INK[1] * a + LIGHT_BG[1] * (1 - a))
        buf[i + 2] = Math.round(INK[2] * a + LIGHT_BG[2] * (1 - a))
        buf[i + 3] = 255
      } else {
        buf[i] = LIGHT_BG[0]; buf[i + 1] = LIGHT_BG[1]; buf[i + 2] = LIGHT_BG[2]; buf[i + 3] = LIGHT_BG[3]
      }
    }
  }
  writeFileSync(file, encodePNG(width, height, buf))
}

console.log('Android 图标与启动页已生成 →', res)
