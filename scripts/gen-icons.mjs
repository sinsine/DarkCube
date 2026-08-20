// 生成 PWA 图标：纯 Node 实现的最小 PNG 编码器（无第三方依赖）
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

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
    raw[y * (stride + 1)] = 0 // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// ---------- 绘制：近黑底 + 居中白色墨点 ----------
function drawIcon(size) {
  const buf = Buffer.alloc(size * size * 4)
  const bg = [10, 10, 10, 255]
  const fg = [245, 245, 245, 255]
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.3
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - cx
      const dy = y + 0.5 - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const i = (y * size + x) * 4
      if (dist <= r - 1) {
        buf[i] = fg[0]; buf[i + 1] = fg[1]; buf[i + 2] = fg[2]; buf[i + 3] = 255
      } else if (dist <= r + 1) {
        const a = Math.max(0, Math.min(1, r + 1 - dist))
        buf[i] = Math.round(bg[0] + (fg[0] - bg[0]) * a)
        buf[i + 1] = Math.round(bg[1] + (fg[1] - bg[1]) * a)
        buf[i + 2] = Math.round(bg[2] + (fg[2] - bg[2]) * a)
        buf[i + 3] = 255
      } else {
        buf[i] = bg[0]; buf[i + 1] = bg[1]; buf[i + 2] = bg[2]; buf[i + 3] = bg[3]
      }
    }
  }
  return buf
}

for (const size of [192, 512]) {
  writeFileSync(join(outDir, `icon-${size}.png`), encodePNG(size, size, drawIcon(size)))
}
writeFileSync(join(outDir, 'apple-touch-icon.png'), encodePNG(180, 180, drawIcon(180)))
writeFileSync(
  join(outDir, 'icon.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#0a0a0a"/><circle cx="256" cy="256" r="154" fill="#f5f5f5"/></svg>'
)
console.log('icons generated →', outDir)
