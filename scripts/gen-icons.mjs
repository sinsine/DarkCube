// 生成 PWA 图标：纯 Node 实现的最小 PNG 编码器（无第三方依赖）
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
const buildDir = join(__dirname, '..', 'build')
mkdirSync(outDir, { recursive: true })
mkdirSync(buildDir, { recursive: true })

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

// ---------- 绘制：近黑底 + 居中白色墨点 + 白圈内黑色钢笔 ----------
function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const qx = ax + t * dx
  const qy = ay + t * dy
  return Math.hypot(px - qx, py - qy)
}

function inTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by)
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy)
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay)
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0
  return !(hasNeg && hasPos)
}

/** 钢笔（✎）：斜笔杆 + 笔尖三角 + 顶部笔帽短线，全部相对圆内坐标 */
function penAt(x, y, cx, cy, r) {
  // 笔杆：P1（左下）→ P2（右上）
  const P1x = cx - 0.4 * r
  const P1y = cy + 0.4 * r
  const P2x = cx + 0.44 * r
  const P2y = cy - 0.44 * r
  const hw = 0.065 * r
  if (distToSeg(x, y, P1x, P1y, P2x, P2y) <= hw) return true
  // 笔尖三角：顶点在左下方，底边为笔杆左端 ± 垂直偏移
  const s = Math.SQRT1_2 // 笔杆方向 (1/√2, -1/√2)，垂直方向 (1/√2, 1/√2)
  const baseW = 0.15 * r
  const ax = cx - 0.68 * r
  const ay = cy + 0.68 * r
  const bx = P1x + s * baseW
  const by = P1y + s * baseW
  const cxx = P1x - s * baseW
  const cyy = P1y - s * baseW
  if (inTriangle(x, y, ax, ay, bx, by, cxx, cyy)) return true
  // 笔帽短线：笔杆上端垂直短线
  const capHalf = 0.22 * r
  if (distToSeg(x, y, P2x + s * capHalf, P2y + s * capHalf, P2x - s * capHalf, P2y - s * capHalf) <= 0.05 * r)
    return true
  return false
}

function drawIcon(size) {
  const buf = Buffer.alloc(size * size * 4)
  const bg = [10, 10, 10, 255]
  const fg = [245, 245, 245, 255]
  const pen = [10, 10, 10, 255]
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
        if (penAt(x + 0.5, y + 0.5, cx, cy, r)) {
          buf[i] = pen[0]; buf[i + 1] = pen[1]; buf[i + 2] = pen[2]; buf[i + 3] = 255
        } else {
          buf[i] = fg[0]; buf[i + 1] = fg[1]; buf[i + 2] = fg[2]; buf[i + 3] = 255
        }
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
// electron-builder 使用 build/icon.png（512）
writeFileSync(join(buildDir, 'icon.png'), encodePNG(512, 512, drawIcon(512)))
writeFileSync(
  join(outDir, 'icon.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
    '<rect width="512" height="512" fill="#0a0a0a"/>' +
    '<circle cx="256" cy="256" r="154" fill="#f5f5f5"/>' +
    '<g stroke="#0a0a0a" stroke-linecap="round" fill="none">' +
    '<line x1="194" y1="318" x2="324" y2="188" stroke-width="20"/>' +
    '<line x1="348" y1="212" x2="300" y2="164" stroke-width="15"/>' +
    '</g>' +
    '<path d="M151 361 L211 334 L178 301 Z" fill="#0a0a0a"/>' +
    '</svg>'
)
console.log('icons generated →', outDir)
