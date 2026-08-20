/** 液态玻璃背景：缓慢流动的灰阶光斑，供玻璃面板衬托模糊 */
export function LiquidBackground() {
  return (
    <div className="liquid-bg" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  )
}
