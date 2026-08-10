const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const handoffDir = path.resolve(__dirname, '..')
const miniappDir = path.join(handoffDir, 'miniapp')
const nativeDir = path.join(handoffDir, 'native')

const CANVAS = { width: 220, height: 48 }
const BUBBLE_X = 51
const COLORS = {
  white: '#FFFFFF',
  ink: '#171014',
  pink: '#F5B1C7',
  pinkHot: '#FF7EAA',
}

const U_PATH_MAIN = 'M170.98 80.6864C175.826 80.3379 179.093 82.8464 180.922 87.1309C184.554 95.5742 179.373 98.9845 175.515 105.325C163.859 124.48 165.503 149.557 163.744 170.582C161.932 192.259 154.492 222.584 132.269 231.923C124.974 234.989 114.517 234.372 107.397 231.013C70.2537 212.926 93.1286 160.103 105.525 133.265C109.335 126.098 112.98 118.784 117.907 112.277C121.491 107.547 127.748 104.724 132.998 108.827C135.386 110.694 136.494 114.684 135.563 117.517C133.513 123.752 129.105 129.175 126.136 135.017C117.204 151.711 107.57 173.577 108.149 192.736C108.648 197.729 110.443 203.949 114.709 207.163C121.717 212.44 129.246 209.446 133.613 202.772C139.289 194.091 141.378 184.867 142.431 174.855C143.583 164.684 143.524 154.864 144.04 144.611C144.994 125.736 146.094 103.972 158.412 88.4443C161.509 84.5388 165.905 81.2324 170.98 80.6864Z'
const U_PATH_STAR = 'M86.9111 55.8511C87.5972 55.021 88.2531 54.3294 88.9727 53.5417C91.25 52.4699 98.6717 56.4898 104.848 54.7181C114.926 51.8253 124.216 44.6228 133.929 32.5885C137.352 28.3472 139.875 23.9207 143.53 19.8896C144.863 19.2069 144.275 19.3179 145.281 19.7403C145.408 20.3861 145.647 21.0867 144.974 22.1183C129.708 45.5149 124.762 63.0491 135.86 73.3957C137.561 74.9843 140.36 76.5377 141.933 78.4606L140.234 80.9976C139.451 81.6669 139.143 82.0962 138.465 81.9081C133.792 80.6128 129.85 79.3599 124.485 79.4064C114.232 79.4902 104.957 91.2197 95.9169 103.826C93.848 106.711 90.2527 112.469 87.8923 114.692C86.2512 115.246 86.8375 115.356 85.9333 114.646C86.1422 111.648 90.6859 105.295 92.5935 101.966C103.729 82.5318 103.185 67.3286 93.9942 61.1122C92.4408 60.0674 87.4627 58.0224 86.9111 55.8511Z'

const STATES = {
  create: {
    id: 'create-game',
    title: 'Create a game',
    copy: 'Create a game?',
    accessible: 'Create a game with AlterU Agent',
    bubbleWidth: 126,
    bubbleFill: COLORS.white,
    durationMs: 6000,
    frames: 360,
    finalState: 'pure-u',
  },
  waiting: {
    id: 'your-turn',
    title: 'Your turn',
    copy: 'Your turn — I’m waiting',
    accessible: 'Your turn. Open the Agent conversation that needs your reply',
    bubbleWidth: 160,
    bubbleFill: COLORS.pink,
    durationMs: 4000,
    frames: 240,
    finalState: 'persistent-message',
  },
}

function ensureDirectories() {
  fs.mkdirSync(miniappDir, { recursive: true })
  fs.mkdirSync(nativeDir, { recursive: true })
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function sharedSvgMarkup(state) {
  const textX = state.bubbleWidth / 2
  return `
  <g id="u-agent">
    <g id="u-mark">
      <path transform="translate(1 3) scale(.1640625)" d="${U_PATH_MAIN}" fill="${COLORS.white}"/>
      <path transform="translate(1 3) scale(.1640625)" d="${U_PATH_STAR}" fill="${COLORS.white}"/>
    </g>
    <g id="u-face">
      <rect x="15" y="28" width="14" height="11" rx="5.5" fill="${COLORS.pink}" stroke="${COLORS.white}" stroke-width="2"/>
      <ellipse cx="19.75" cy="33.5" rx="1.25" ry="1.75" fill="${COLORS.ink}"/>
      <ellipse cx="24.25" cy="33.5" rx="1.25" ry="1.75" fill="${COLORS.ink}"/>
    </g>
    <g id="arm-left">
      <path d="M17 33L8 36" fill="none" stroke="${COLORS.pink}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="8" cy="36" r="2.5" fill="${COLORS.white}"/>
    </g>
    <g id="arm-right">
      <path d="M29 33L39 30" fill="none" stroke="${COLORS.pink}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="39" cy="30" r="2.5" fill="${COLORS.white}"/>
    </g>
  </g>
  <g id="speech" transform="translate(${BUBBLE_X} 6)">
    <g id="speech-motion">
      <path id="bubble-tail" d="M2 19L-11 23L2 27Z" fill="${state.bubbleFill}"/>
      <rect id="bubble-surface" width="36" height="36" rx="18" fill="${state.bubbleFill}" stroke="rgba(13,10,15,.08)"/>
      <clipPath id="bubble-clip"><rect id="bubble-clip-rect" width="36" height="36" rx="18"/></clipPath>
      <g clip-path="url(#bubble-clip)">
        <g id="thinking-dots" fill="${COLORS.ink}">
          <circle cx="12" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="24" cy="18" r="2"/>
        </g>
        <text id="message-copy" x="${textX}" y="22" fill="${COLORS.ink}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="650" letter-spacing="-.1" text-anchor="middle">${escapeXml(state.copy)}</text>
      </g>
    </g>
  </g>`
}

function createSvgCss(state) {
  return `
    #u-mark,#u-face,#arm-left,#arm-right,#speech-motion,#bubble-tail,#thinking-dots,#message-copy { transform-box: fill-box; }
    #u-mark { transform-origin: 50% 82%; animation: create-mark 6s cubic-bezier(.2,.8,.2,1) 1 both; }
    #u-face { transform-origin: center bottom; animation: create-face 6s cubic-bezier(.2,.8,.2,1) 1 both; }
    #arm-left { transform-origin: right center; animation: create-left-arm 6s ease-in-out 1 both; }
    #arm-right { transform-origin: left center; animation: create-right-arm 6s ease-in-out 1 both; }
    #speech-motion { transform-origin: 0 82%; animation: create-speech 6s cubic-bezier(.2,.8,.2,1) 1 both; }
    #bubble-surface,#bubble-clip-rect { animation: create-width 6s cubic-bezier(.2,.8,.2,1) 1 both; }
    #thinking-dots { animation: create-dots 6s ease 1 both; }
    #thinking-dots circle { transform-box: fill-box; transform-origin: center; animation: dot-pulse .66s ease-in-out infinite alternate; }
    #thinking-dots circle:nth-child(2) { animation-delay: .12s; }
    #thinking-dots circle:nth-child(3) { animation-delay: .24s; }
    #message-copy { animation: create-copy 6s ease 1 both; }
    @keyframes create-mark {
      0%,8%,18%,82%,94%,100% { transform: translateY(0) scale(1); }
      11% { transform: translateY(1px) scale(1.035,.965); }
      14% { transform: translateY(-1.5px) scale(.97,1.055); }
      17% { transform: translateY(.4px) scale(1.016,.987); }
      85% { transform: translateY(-.6px) scale(.985,1.025); }
      89% { transform: translateY(1px) scale(1.035,.965); }
      92% { transform: translateY(-.4px) scale(.99,1.018); }
    }
    @keyframes create-face {
      0%,8% { opacity:0; transform:translateY(6px) scale(.68); }
      15% { opacity:1; transform:translateY(-2px) scale(1.08); }
      19%,82% { opacity:1; transform:translateY(0) scale(1); }
      90%,100% { opacity:0; transform:translateY(6px) scale(.72); }
    }
    @keyframes create-speech {
      0%,19% { opacity:0; transform:translateX(-4px) scale(.74); }
      23%,78% { opacity:1; transform:translateX(0) scale(1); }
      84%,100% { opacity:0; transform:translateX(-4px) scale(.74); }
    }
    @keyframes create-width {
      0%,28% { width:36px; }
      36%,70% { width:${state.bubbleWidth}px; }
      79%,100% { width:36px; }
    }
    @keyframes create-dots { 0%,20% { opacity:0; } 23%,29% { opacity:1; } 35%,100% { opacity:0; } }
    @keyframes create-copy { 0%,32% { opacity:0; transform:translateX(4px); } 38%,70% { opacity:1; transform:translateX(0); } 76%,100% { opacity:0; transform:translateX(-2px); } }
    @keyframes create-left-arm { 0%,34% { opacity:0; transform:rotate(22deg) scaleX(.72); } 39%,61% { opacity:1; transform:rotate(8deg) scaleX(1); } 67%,100% { opacity:0; transform:rotate(22deg) scaleX(.72); } }
    @keyframes create-right-arm { 0%,34% { opacity:0; transform:rotate(18deg) scaleX(.72); } 39% { opacity:1; transform:rotate(-58deg) scaleX(1); } 45% { opacity:1; transform:rotate(16deg) scaleX(1); } 51% { opacity:1; transform:rotate(-50deg) scaleX(1); } 57%,61% { opacity:1; transform:rotate(-10deg) scaleX(1); } 67%,100% { opacity:0; transform:rotate(18deg) scaleX(.72); } }
    @keyframes dot-pulse { from { transform:translateY(1px) scale(.82); opacity:.5; } to { transform:translateY(-1px) scale(1); opacity:1; } }
    @media (prefers-reduced-motion: reduce) {
      #u-mark,#u-face,#arm-left,#arm-right,#speech-motion,#bubble-surface,#bubble-clip-rect,#thinking-dots,#message-copy,#thinking-dots circle { animation:none!important; }
      #u-face,#speech-motion,#message-copy { opacity:1; transform:none; }
      #arm-left,#arm-right,#thinking-dots { opacity:0; }
      #bubble-surface,#bubble-clip-rect { width:${state.bubbleWidth}px; }
    }`
}

function waitingSvgCss(state) {
  return `
    #u-mark,#u-face,#arm-left,#arm-right,#speech-motion,#bubble-tail,#thinking-dots,#message-copy,#attention-ring { transform-box: fill-box; }
    #u-mark { transform-origin: 50% 82%; animation: waiting-mark 4s cubic-bezier(.2,.8,.2,1) 1 both; }
    #u-face { transform-origin: center bottom; animation: waiting-face 4s cubic-bezier(.2,.8,.2,1) 1 both; }
    #arm-left { transform-origin: right center; animation: waiting-left-arm 4s cubic-bezier(.2,.8,.2,1) 1 both; }
    #arm-right { transform-origin: left center; animation: waiting-right-arm 4s cubic-bezier(.2,.8,.2,1) 1 both; }
    #speech-motion { transform-origin: 0 82%; animation: waiting-speech 4s cubic-bezier(.2,.8,.2,1) 1 both; }
    #bubble-surface,#bubble-clip-rect { animation: waiting-width 4s cubic-bezier(.2,.8,.2,1) 1 both; }
    #thinking-dots { animation: waiting-dots 4s ease 1 both; }
    #thinking-dots circle { transform-box: fill-box; transform-origin:center; animation: dot-pulse .66s ease-in-out infinite alternate; }
    #thinking-dots circle:nth-child(2) { animation-delay:.12s; }
    #thinking-dots circle:nth-child(3) { animation-delay:.24s; }
    #message-copy { animation: waiting-copy 4s ease 1 both; }
    #attention-ring { transform-origin:center; animation: waiting-ring 1.6s ease-out 2 both; }
    @keyframes waiting-mark { 0%,5%,22%,100% { transform:translateY(0) scale(1); } 9% { transform:translateY(1px) scale(1.035,.965); } 14% { transform:translateY(-1.5px) scale(.97,1.055); } 19% { transform:translateY(.4px) scale(1.016,.987); } }
    @keyframes waiting-face { 0%,5% { opacity:0; transform:translateY(6px) scale(.68); } 18% { opacity:1; transform:translateY(-2px) scale(1.08); } 23%,100% { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes waiting-speech { 0%,16% { opacity:0; transform:translateX(-8px) scale(.82); } 24%,100% { opacity:1; transform:translateX(0) scale(1); } }
    @keyframes waiting-width { 0%,31% { width:36px; } 44%,100% { width:${state.bubbleWidth}px; } }
    @keyframes waiting-dots { 0%,17% { opacity:0; } 23%,32% { opacity:1; } 41%,100% { opacity:0; } }
    @keyframes waiting-copy { 0%,38% { opacity:0; transform:translateX(4px); } 47%,100% { opacity:1; transform:translateX(0); } }
    @keyframes waiting-left-arm { 0%,20% { opacity:0; transform:rotate(22deg) scaleX(.72); } 30%,56% { opacity:1; transform:rotate(12deg) scaleX(1); } 70%,100% { opacity:0; transform:rotate(22deg) scaleX(.72); } }
    @keyframes waiting-right-arm { 0%,20% { opacity:0; transform:rotate(10deg) scaleX(.72); } 30%,56% { opacity:1; transform:rotate(-8deg) scaleX(1.16); } 70%,100% { opacity:0; transform:rotate(-4deg) scaleX(.76); } }
    @keyframes waiting-ring { 0% { opacity:0; transform:scale(.72); } 18% { opacity:.9; } 72%,100% { opacity:0; transform:scale(1.32); } }
    @keyframes dot-pulse { from { transform:translateY(1px) scale(.82); opacity:.5; } to { transform:translateY(-1px) scale(1); opacity:1; } }
    @media (prefers-reduced-motion: reduce) {
      #u-mark,#u-face,#arm-left,#arm-right,#speech-motion,#bubble-surface,#bubble-clip-rect,#thinking-dots,#message-copy,#attention-ring,#thinking-dots circle { animation:none!important; }
      #u-face,#speech-motion,#message-copy { opacity:1; transform:none; }
      #arm-left,#arm-right,#thinking-dots,#attention-ring { opacity:0; }
      #bubble-surface,#bubble-clip-rect { width:${state.bubbleWidth}px; }
    }`
}

function writeMiniappSvg(state, type) {
  const extra = type === 'waiting'
    ? `<ellipse id="attention-ring" cx="22" cy="25" rx="18" ry="18" fill="none" stroke="${COLORS.pinkHot}" stroke-width="1" opacity="0"/>`
    : ''
  const css = type === 'waiting' ? waitingSvgCss(state) : createSvgCss(state)
  const svg = `<svg width="${CANVAS.width}" height="${CANVAS.height}" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">AlterU U Agent — ${escapeXml(state.title)}</title>
  <desc id="desc">${escapeXml(state.accessible)}. The U watermark stays visible while the face, paired arms, thinking bubble, and message animate.</desc>
  <style>${css}
  </style>
  ${extra}
  ${sharedSvgMarkup(state)}
</svg>\n`
  const filePath = path.join(miniappDir, `alteru-u-agent-${state.id}.svg`)
  fs.writeFileSync(filePath, svg)
  return filePath
}

function lottieEase(dimensions = 1) {
  return {
    i: { x: Array(dimensions).fill(0.2), y: Array(dimensions).fill(1) },
    o: { x: Array(dimensions).fill(0.2), y: Array(dimensions).fill(0.8) },
  }
}

function animated(frames, dimensions = 1) {
  return {
    a: 1,
    k: frames.map((frame, index) => {
      const result = { t: frame.t, s: frame.v }
      if (frame.hold && index < frames.length - 1) {
        result.h = 1
        return result
      }
      if (index < frames.length - 1) {
        result.e = frames[index + 1].v
        Object.assign(result, lottieEase(dimensions))
      }
      return result
    }),
  }
}

function svgPathToLottie(pathData) {
  const tokens = pathData.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) || []
  const vertices = []
  const inTangents = []
  const outTangents = []
  let index = 0
  let command = ''
  let closed = false

  const readNumber = () => Number(tokens[index++])
  const isCommand = (token) => /^[A-Za-z]$/.test(token || '')

  while (index < tokens.length) {
    if (isCommand(tokens[index])) command = tokens[index++]
    if (command === 'M') {
      const point = [readNumber(), readNumber()]
      vertices.push(point)
      inTangents.push([0, 0])
      outTangents.push([0, 0])
      command = 'L'
      continue
    }
    if (command === 'C') {
      const control1 = [readNumber(), readNumber()]
      const control2 = [readNumber(), readNumber()]
      const endpoint = [readNumber(), readNumber()]
      const previous = vertices[vertices.length - 1]
      outTangents[outTangents.length - 1] = [control1[0] - previous[0], control1[1] - previous[1]]
      vertices.push(endpoint)
      inTangents.push([control2[0] - endpoint[0], control2[1] - endpoint[1]])
      outTangents.push([0, 0])
      continue
    }
    if (command === 'L') {
      vertices.push([readNumber(), readNumber()])
      inTangents.push([0, 0])
      outTangents.push([0, 0])
      continue
    }
    if (command === 'Z' || command === 'z') {
      closed = true
      break
    }
    throw new Error(`Unsupported SVG path command in official U watermark: ${command}; next tokens: ${tokens.slice(index, index + 8).join(' ')}`)
  }

  return { c: closed, i: inTangents, o: outTangents, v: vertices }
}

function staticProp(value) {
  return { a: 0, k: value }
}

function transform({ opacity = 100, position = [0, 0, 0], anchor = [0, 0, 0], scale = [100, 100, 100], rotation = 0 }) {
  return {
    o: typeof opacity === 'number' ? staticProp(opacity) : animated(opacity),
    r: typeof rotation === 'number' ? staticProp(rotation) : animated(rotation),
    p: Array.isArray(position) ? staticProp(position) : animated(position, 3),
    a: staticProp(anchor),
    s: Array.isArray(scale) ? staticProp(scale) : animated(scale, 3),
  }
}

function baseLayer(ind, name, type, op, ks) {
  return { ddd: 0, ind, ty: type, nm: name, sr: 1, ks, ao: 0, ip: 0, op, st: 0, bm: 0 }
}

function fill(color) {
  return { ty: 'fl', c: staticProp(color), o: staticProp(100), r: 1, nm: 'Fill' }
}

function stroke(color, width) {
  return { ty: 'st', c: staticProp(color), o: staticProp(100), w: staticProp(width), lc: 2, lj: 2, ml: 4, nm: 'Stroke' }
}

function group(name, items) {
  return {
    ty: 'gr', nm: name, it: [
      ...items,
      { ty: 'tr', p: staticProp([0, 0]), a: staticProp([0, 0]), s: staticProp([100, 100]), r: staticProp(0), o: staticProp(100), sk: staticProp(0), sa: staticProp(0), nm: 'Transform' },
    ],
  }
}

function ellipse(position, size, color) {
  return group('Ellipse', [
    { ty: 'el', p: staticProp(position), s: staticProp(size), d: 1, nm: 'Ellipse Path' },
    fill(color),
  ])
}

function shapeLayer(ind, name, op, ks, shapes) {
  return { ...baseLayer(ind, name, 4, op, ks), shapes }
}

function imageLayer(ind, name, op, refId, ks) {
  return { ...baseLayer(ind, name, 2, op, ks), refId }
}

function opacityFrames(kind, role) {
  if (kind === 'create') {
    const map = {
      face: [{ t: 0, v: [0] }, { t: 48, v: [0] }, { t: 90, v: [100] }, { t: 294, v: [100] }, { t: 330, v: [0] }, { t: 360, v: [0] }],
      arms: [{ t: 0, v: [0] }, { t: 122, v: [0] }, { t: 142, v: [100] }, { t: 220, v: [100] }, { t: 244, v: [0] }, { t: 360, v: [0] }],
      speech: [{ t: 0, v: [0] }, { t: 68, v: [0] }, { t: 84, v: [100] }, { t: 286, v: [100] }, { t: 312, v: [0] }, { t: 360, v: [0] }],
      dots: [{ t: 0, v: [0] }, { t: 72, v: [0] }, { t: 86, v: [100] }, { t: 108, v: [100] }, { t: 126, v: [0] }, { t: 360, v: [0] }],
      copy: [{ t: 0, v: [0] }, { t: 116, v: [0] }, { t: 140, v: [100] }, { t: 252, v: [100] }, { t: 276, v: [0] }, { t: 360, v: [0] }],
    }
    return map[role]
  }
  const map = {
    face: [{ t: 0, v: [0] }, { t: 18, v: [0] }, { t: 48, v: [100] }, { t: 240, v: [100] }],
    arms: [{ t: 0, v: [0] }, { t: 40, v: [0] }, { t: 68, v: [100] }, { t: 124, v: [100] }, { t: 158, v: [0] }, { t: 240, v: [0] }],
    speech: [{ t: 0, v: [0] }, { t: 28, v: [0] }, { t: 56, v: [100] }, { t: 240, v: [100] }],
    dots: [{ t: 0, v: [0] }, { t: 42, v: [0] }, { t: 58, v: [100] }, { t: 82, v: [100] }, { t: 104, v: [0] }, { t: 240, v: [0] }],
    copy: [{ t: 0, v: [0] }, { t: 88, v: [0] }, { t: 116, v: [100] }, { t: 240, v: [100] }],
  }
  return map[role]
}

function sizeFrames(kind, finalWidth) {
  if (kind === 'create') {
    return [
      { t: 0, v: [36, 36] }, { t: 100, v: [36, 36] }, { t: 132, v: [finalWidth, 36] },
      { t: 252, v: [finalWidth, 36] }, { t: 292, v: [36, 36] }, { t: 360, v: [36, 36] },
    ]
  }
  return [
    { t: 0, v: [36, 36] }, { t: 78, v: [36, 36] }, { t: 112, v: [finalWidth, 36] }, { t: 240, v: [finalWidth, 36] },
  ]
}

function rectPositionFrames(kind, finalWidth) {
  return sizeFrames(kind, finalWidth).map(frame => ({ t: frame.t, v: [frame.v[0] / 2, 0] }))
}

function markScaleFrames(kind) {
  if (kind === 'create') {
    return [
      { t: 0, v: [100, 100, 100] }, { t: 36, v: [100, 100, 100] }, { t: 46, v: [103.6, 96.4, 100] },
      { t: 58, v: [97, 105.4, 100] }, { t: 72, v: [100, 100, 100], hold: true }, { t: 300, v: [100, 100, 100] },
      { t: 314, v: [98.4, 102.8, 100] }, { t: 328, v: [103.2, 96.8, 100] }, { t: 342, v: [100, 100, 100], hold: true }, { t: 360, v: [100, 100, 100] },
    ]
  }
  return [
    { t: 0, v: [100, 100, 100] }, { t: 14, v: [100, 100, 100] }, { t: 26, v: [103.6, 96.4, 100] },
    { t: 38, v: [97, 105.4, 100] }, { t: 52, v: [100, 100, 100], hold: true }, { t: 240, v: [100, 100, 100] },
  ]
}

function faceScaleFrames(kind) {
  if (kind === 'create') {
    return [
      { t: 0, v: [68, 68, 100] }, { t: 48, v: [68, 68, 100] }, { t: 78, v: [108, 108, 100] },
      { t: 96, v: [100, 100, 100] }, { t: 294, v: [100, 100, 100] }, { t: 330, v: [72, 72, 100] }, { t: 360, v: [72, 72, 100] },
    ]
  }
  return [
    { t: 0, v: [68, 68, 100] }, { t: 18, v: [68, 68, 100] }, { t: 42, v: [108, 108, 100] },
    { t: 58, v: [100, 100, 100] }, { t: 240, v: [100, 100, 100] },
  ]
}

function armRotationFrames(kind, side) {
  if (kind === 'create') {
    if (side === 'left') return [{ t: 0, v: [22] }, { t: 122, v: [22] }, { t: 146, v: [8] }, { t: 220, v: [8] }, { t: 244, v: [22] }, { t: 360, v: [22] }]
    return [
      { t: 0, v: [18] }, { t: 122, v: [18] }, { t: 142, v: [-58] }, { t: 162, v: [16] },
      { t: 182, v: [-50] }, { t: 202, v: [-10] }, { t: 220, v: [-10] }, { t: 244, v: [18] }, { t: 360, v: [18] },
    ]
  }
  if (side === 'left') return [{ t: 0, v: [22] }, { t: 40, v: [22] }, { t: 72, v: [12] }, { t: 124, v: [12] }, { t: 158, v: [22] }, { t: 240, v: [22] }]
  return [{ t: 0, v: [10] }, { t: 40, v: [10] }, { t: 72, v: [-8] }, { t: 124, v: [-8] }, { t: 158, v: [-4] }, { t: 240, v: [-4] }]
}

function armScaleFrames(kind, side) {
  const base = side === 'right' && kind === 'waiting' ? 116 : 100
  if (kind === 'create') return [{ t: 0, v: [72, 100, 100] }, { t: 122, v: [72, 100, 100] }, { t: 146, v: [100, 100, 100] }, { t: 220, v: [100, 100, 100] }, { t: 244, v: [72, 100, 100] }, { t: 360, v: [72, 100, 100] }]
  return [{ t: 0, v: [72, 100, 100] }, { t: 40, v: [72, 100, 100] }, { t: 72, v: [base, 100, 100] }, { t: 124, v: [base, 100, 100] }, { t: 158, v: [76, 100, 100] }, { t: 240, v: [76, 100, 100] }]
}

function makeFaceLayer(op, kind) {
  const shapes = [
    group('Face', [
      { ty: 'rc', p: staticProp([0, 0]), s: staticProp([14, 11]), r: staticProp(5.5), d: 1, nm: 'Face Shape' },
      fill([0.960784, 0.694118, 0.780392, 1]),
      stroke([1, 1, 1, 1], 2.6),
    ]),
  ]
  return shapeLayer(30, 'U Agent Face', op, transform({
    opacity: opacityFrames(kind, 'face'), position: [22, 39, 0], anchor: [0, 5.5, 0], scale: [100, 100, 100],
  }), shapes)
}

function makeEyeLayer(op, kind, side, ind) {
  const eyeX = side === 'left' ? -2.25 : 2.25
  return shapeLayer(ind, `U Agent ${side} eye`, op, transform({
    opacity: opacityFrames(kind, 'face'),
    position: [22, 39, 0],
    anchor: [0, 5.5, 0],
    scale: [100, 100, 100],
  }), [ellipse([eyeX, 0], [2.5, 3.5], [0.090196, 0.062745, 0.078431, 1])])
}

function makeArmLayer(op, kind, side, ind) {
  const direction = side === 'left' ? -1 : 1
  const position = side === 'left' ? [17, 33, 0] : [29, 33, 0]
  const armPath = {
    ty: 'sh', nm: 'Arm Path', ks: staticProp({ c: false, i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]], v: [[0, 0], [10 * direction, 0]] }),
  }
  return shapeLayer(ind, `U Agent ${side} arm`, op, {
    o: animated(opacityFrames(kind, 'arms')),
    r: animated(armRotationFrames(kind, side)),
    p: staticProp(position),
    a: staticProp([0, 0, 0]),
    s: animated(armScaleFrames(kind, side), 3),
  }, [
    group('Arm', [armPath, stroke([0.960784, 0.694118, 0.780392, 1], 3)]),
    ellipse([10 * direction, 0], [5, 5], [1, 1, 1, 1]),
  ])
}

function makeBubbleLayer(op, kind, state) {
  const sizes = sizeFrames(kind, state.bubbleWidth)
  const positions = rectPositionFrames(kind, state.bubbleWidth)
  const fillColor = state.bubbleFill === COLORS.white
    ? [1, 1, 1, 1]
    : [0.960784, 0.694118, 0.780392, 1]
  return shapeLayer(20, 'Speech bubble surface', op, transform({ opacity: opacityFrames(kind, 'speech'), position: [BUBBLE_X, 24, 0] }), [
    group('Bubble', [
      { ty: 'sh', nm: 'Integrated tail path', ks: staticProp({ c: true, i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]], v: [[-11, 5], [2, 1], [2, 9]] }) },
      { ty: 'rc', p: animated(positions, 2), s: animated(sizes, 2), r: staticProp(18), d: 1, nm: 'Bubble Shape' },
      fill(fillColor),
    ]),
  ])
}

function makeDotsLayer(op, kind) {
  return shapeLayer(23, 'Three thinking dots', op, transform({ opacity: opacityFrames(kind, 'dots'), position: [BUBBLE_X + 18, 24, 0] }), [
    ellipse([-6, 0], [4, 4], [0.090196, 0.062745, 0.078431, 1]),
    ellipse([0, 0], [4, 4], [0.090196, 0.062745, 0.078431, 1]),
    ellipse([6, 0], [4, 4], [0.090196, 0.062745, 0.078431, 1]),
  ])
}

function makeRingLayer(op) {
  return shapeLayer(9, 'Waiting attention ring', op, transform({
    opacity: [{ t: 0, v: [0] }, { t: 12, v: [90] }, { t: 64, v: [0] }, { t: 76, v: [90] }, { t: 128, v: [0] }, { t: 240, v: [0] }],
    position: [22, 25, 0],
    scale: [100, 100, 100],
  }), [
    group('Ring', [
      { ty: 'el', p: staticProp([0, 0]), s: staticProp([36, 36]), d: 1, nm: 'Ring Path' },
      stroke([1, 0.494118, 0.666667, 1], 1),
    ]),
  ])
}

function patchAnimatedTransforms(layer, kind) {
  if (layer.nm === 'U Agent Face' || layer.nm.endsWith(' eye')) layer.ks.s = animated(faceScaleFrames(kind), 3)
  if (layer.nm === 'Waiting attention ring') {
    layer.ks.s = animated([
      { t: 0, v: [72, 72, 100] }, { t: 64, v: [132, 132, 100] },
      { t: 76, v: [72, 72, 100] }, { t: 128, v: [132, 132, 100] }, { t: 240, v: [132, 132, 100] },
    ], 3)
  }
  return layer
}

function makeOfficialUMarkLayer(op, kind) {
  const markGroup = group('Official U watermark paths', [
    { ty: 'sh', nm: 'U main path', ks: staticProp(svgPathToLottie(U_PATH_MAIN)) },
    { ty: 'sh', nm: 'U star path', ks: staticProp(svgPathToLottie(U_PATH_STAR)) },
    fill([1, 1, 1, 1]),
  ])
  const groupTransform = markGroup.it[markGroup.it.length - 1]
  groupTransform.p = staticProp([1, 3])
  groupTransform.s = staticProp([16.40625, 16.40625])

  return shapeLayer(10, 'Official U watermark — vector', op, {
    o: staticProp(100),
    r: staticProp(0),
    p: staticProp([22, 38, 0]),
    a: staticProp([22, 38, 0]),
    s: animated(markScaleFrames(kind), 3),
  }, [markGroup])
}

function makeNativeBackgroundLayer(op) {
  return shapeLayer(1, 'Native platform black background', op, transform({ position: [0, 0, 0] }), [
    group('Background', [
      { ty: 'rc', p: staticProp([110, 24]), s: staticProp([220, 48]), r: staticProp(0), d: 1, nm: 'Background rectangle' },
      fill([0.027451, 0.023529, 0.027451, 1]),
    ]),
  ])
}

async function pngData(svg) {
  return (await sharp(Buffer.from(svg)).png().toBuffer()).toString('base64')
}

async function writeNativeLottie(state, kind) {
  const textWidth = state.bubbleWidth * 4
  const textSvg = `<svg width="${textWidth}" height="144" viewBox="0 0 ${textWidth} 144" xmlns="http://www.w3.org/2000/svg"><text x="${textWidth / 2}" y="88" fill="${COLORS.ink}" font-family="-apple-system, BlinkMacSystemFont, SF Pro Text, PingFang SC, Helvetica Neue, Arial, sans-serif" font-size="44" font-weight="650" text-anchor="middle">${escapeXml(state.copy)}</text></svg>`
  const textData = await pngData(textSvg)
  const op = state.frames

  const markLayer = makeOfficialUMarkLayer(op, kind)
  const faceLayer = patchAnimatedTransforms(makeFaceLayer(op, kind), kind)
  const leftEye = patchAnimatedTransforms(makeEyeLayer(op, kind, 'left', 33), kind)
  const rightEye = patchAnimatedTransforms(makeEyeLayer(op, kind, 'right', 34), kind)
  const leftArm = makeArmLayer(op, kind, 'left', 31)
  const rightArm = makeArmLayer(op, kind, 'right', 32)
  const bubble = makeBubbleLayer(op, kind, state)
  const dots = makeDotsLayer(op, kind)
  const copyLayer = imageLayer(24, 'Message copy', op, 'message_copy', {
    o: animated(opacityFrames(kind, 'copy')),
    r: staticProp(0), p: staticProp([BUBBLE_X, 6, 0]), a: staticProp([0, 0, 0]), s: staticProp([25, 25, 100]),
  })
  const layers = [copyLayer, dots, bubble, rightArm, leftArm, leftEye, rightEye, faceLayer, markLayer]
  if (kind === 'waiting') layers.push(patchAnimatedTransforms(makeRingLayer(op), kind))
  layers.push(makeNativeBackgroundLayer(op))

  const markers = kind === 'create'
    ? [
        { tm: 72, cm: 'thinking', dr: 54 },
        { tm: 132, cm: 'message', dr: 144 },
        { tm: 342, cm: 'pure-u', dr: 18 },
      ]
    : [
        { tm: 42, cm: 'thinking', dr: 62 },
        { tm: 112, cm: 'message', dr: 46 },
        { tm: 158, cm: 'settled', dr: 82 },
      ]

  const lottie = {
    v: '5.12.2', fr: 60, ip: 0, op, w: CANVAS.width, h: CANVAS.height,
    nm: `AlterU U Agent — ${state.title}`,
    ddd: 0,
    assets: [
      { id: 'message_copy', w: textWidth, h: 144, u: '', p: `data:image/png;base64,${textData}`, e: 1 },
    ],
    layers,
    markers,
    meta: {
      generator: 'AlterU U Agent handoff generator',
      handoff_version: '1.0.3',
      state: state.id,
      duration_ms: state.durationMs,
      final_state: state.finalState,
      play_mode: 'once',
      canvas: `${CANVAS.width}x${CANVAS.height}`,
      hand_rule: '0-or-2',
    },
  }

  const filePath = path.join(nativeDir, `alteru-u-agent-${state.id}.lottie.json`)
  fs.writeFileSync(filePath, `${JSON.stringify(lottie, null, 2)}\n`)
  return filePath
}

function writeManifest() {
  const manifest = {
    name: 'AlterU U Agent frontend handoff',
    version: '1.0.3',
    updated_at: '2026-08-10',
    canvas: CANVAS,
    natural_character_size: { width: 42, height: 44 },
    idle_invitation_scheduler: {
      first_delay_seconds: { min: 20, max: 40 },
      repeat_delay_seconds: { min: 180, max: 360 },
      max_plays_per_page_session: 2,
      recent_interaction_guard_seconds: 8,
      after_waiting_cooldown_seconds: 60,
      pause_while_page_hidden: true,
      randomize_each_interval: true,
    },
    states: [
      {
        id: STATES.create.id,
        communication_category: 'idle_invitation',
        message: STATES.create.copy,
        duration_ms: STATES.create.durationMs,
        playback: 'once',
        final_state: STATES.create.finalState,
        miniapp: `miniapp/alteru-u-agent-${STATES.create.id}.svg`,
        native: `native/alteru-u-agent-${STATES.create.id}.lottie.json`,
      },
      {
        id: STATES.waiting.id,
        communication_category: 'awaiting_user',
        message: STATES.waiting.copy,
        duration_ms: STATES.waiting.durationMs,
        playback: 'once',
        final_state: STATES.waiting.finalState,
        miniapp: `miniapp/alteru-u-agent-${STATES.waiting.id}.svg`,
        native: `native/alteru-u-agent-${STATES.waiting.id}.lottie.json`,
      },
    ],
    invariants: {
      u_watermark_always_visible: true,
      arm_count: [0, 2],
      thinking_dot_count: 3,
      bubble_height: 36,
      bubble_radius: 18,
      bubble_horizontal_padding: 14,
      supports_reduced_motion: true,
      excluded_categories: ['queue', 'badge_count', 'multiple_actions'],
    },
    native_compatibility: {
      official_u_rendering: 'pure-vector-shape-layer',
      background_rendering: 'native-platform-black-shape-layer',
      eye_rendering: 'two-independent-shape-layers-above-face',
      bubble_tail_rendering: 'integrated-in-bubble-shape-layer-with-2px-overlap',
      bubble_tail_geometry: '8px-base-shifted-5px-toward-face-center',
      face_center_y: 33.5,
      face_stroke_width: 2.6,
      embedded_image_assets: ['message_copy'],
      external_image_assets: 0,
      rationale: 'Avoid native Lottie image-anchor and embedded-watermark compatibility differences.',
    },
  }
  fs.writeFileSync(path.join(handoffDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
}

async function main() {
  ensureDirectories()
  const files = [
    writeMiniappSvg(STATES.create, 'create'),
    writeMiniappSvg(STATES.waiting, 'waiting'),
    await writeNativeLottie(STATES.create, 'create'),
    await writeNativeLottie(STATES.waiting, 'waiting'),
  ]
  writeManifest()
  console.log(files.map(file => path.relative(handoffDir, file)).join('\n'))
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
