# AlterU U Agent 前端动效交付

> 交付版本：1.0.1  
> 定版日期：2026-08-10  
> 选定方向：方案二 · U-born Agent  
> 适用端：MiniAPP、iOS、Android

## 1. 本次只支持两个沟通状态

| 状态 | 触发条件 | 展示文案 | 点击结果 | 动画结束状态 |
|---|---|---|---|---|
| `idle_invitation` | 当前没有待回复消息 | `Create a game?` | 打开创建游戏 Agent | 收回气泡、脸和双手，恢复纯 U |
| `awaiting_user` | 存在一条需要当前用户回复的消息 | `Your turn — I’m waiting` | 打开该通知对应的会话 | 保留 U、脸和气泡；双手收回 |

本版不支持多待办队列、数量徽标或多个会话入口。前端不要根据待回复数量拼接第三种视觉状态。

## 2. 文件清单

### MiniAPP / WebView

- `miniapp/alteru-u-agent-create-game.svg`
- `miniapp/alteru-u-agent-your-turn.svg`

两份 SVG 都是 `220 × 48`、无外链、无脚本的自包含文件。CSS 动画、正式 U 路径、角色、气泡和文案都在文件内部，可直接作为 `<img>` 使用。

### 原生 APP

- `native/alteru-u-agent-create-game.lottie.json`
- `native/alteru-u-agent-your-turn.lottie.json`

两份 Lottie 都是 `220 × 48`、60fps、单次播放。正式 U 的两条路径是纯矢量 Shape Layer，不依赖位图锚点；文案图片通过 data URI 内嵌，交付时不需要额外的 images 目录。

`v1.0.1` 修复了部分原生 Lottie 渲染器中 U 主体缺失、只剩脸和双手的问题。前端应替换旧 JSON 文件本身，不要继续使用已缓存的 `v1.0.0` 内容。

## 3. 动画时间线

### 空闲邀请 / 6000ms

`纯 U → U 轻弹 → 长出脸 → 36px 三点思考圆 → 气泡展开 + 双手出现 → Create a game? → 气泡收回 → 脸和双手收回 → 纯 U`

这是一次完整闭环。播放结束后不要停在最后一帧的气泡状态；入口应恢复为纯 U。

### 待回复 / 4000ms

`纯 U → U 轻弹 → 长出脸 → 36px 三点思考圆 → 粉色气泡展开 + 双手提醒 → Your turn — I’m waiting → 双手收回 → 保持提示`

提示必须持续到消息已回复、任务取消或后端明确清除该状态。不要自动切回空闲邀请。

## 4. 状态机与优先级

```text
awaiting_user > idle_invitation > pure_u
```

- `awaiting_user` 到达时，立即中断正在播放的空闲邀请并替换为待回复动画。
- 收到新的 `awaiting_user`，且 `conversation_id` 改变时，替换点击目标并从头播放一次。
- 用户进入对应会话后，可以保留提醒，直到业务状态确认该消息不再待回复。
- `awaiting_user` 清除后，先回到纯 U；60 秒内不再主动邀请创建游戏。
- 空闲邀请不是固定轮播：首次从页面稳定后的 `20–40s` 中随机取一个时间；后续每次重新从 `180–360s` 中随机取间隔，每个页面会话最多播放 2 次。
- 用户最近 8 秒内有点击、触摸、键盘或滚动操作时，把本次邀请继续向后顺延；不要在用户正专注操作时展开气泡。
- 页面不可见时停止计时；恢复可见后重新计算剩余冷却时间，不补播错过的动画。

建议业务输入：

```ts
type UAgentEntryState =
  | { kind: 'idle_invitation' }
  | { kind: 'awaiting_user'; conversationId: string }
  | { kind: 'pure_u' };
```

参考调度逻辑：

```ts
const randomSeconds = (min: number, max: number) =>
  min + Math.random() * (max - min);

const firstDelay = randomSeconds(20, 40);
const repeatDelay = () => randomSeconds(180, 360);
```

随机值应在每次成功播放后重新抽取，不要用用户 ID 生成一个永久固定间隔。上述数值是首版产品默认值，后续可依据曝光率、点击率和打扰反馈调整。

## 5. MiniAPP 接入

```html
<button class="u-agent-entry" aria-label="Create a game with AlterU Agent">
  <img
    src="./alteru-u-agent-create-game.svg"
    width="220"
    height="48"
    alt=""
    draggable="false"
  />
</button>
```

SVG 是一次性 CSS 动画。需要重播时请重新挂载 `<img>`，或先移除 `src` 再在下一帧恢复；不要同时叠放两个状态文件。切换到 `awaiting_user` 时直接替换文件并更新按钮点击目标。

```ts
function replayImage(image: HTMLImageElement, src: string) {
  image.removeAttribute('src');
  requestAnimationFrame(() => image.setAttribute('src', src));
}
```

## 6. 原生 APP 接入

通用播放参数：

- content mode：`fitCenter` / `scaleAspectFit`
- loop：`false`
- speed：`1`
- background：transparent
- interaction：由外层原生按钮承接
- 点击热区：至少 `220 × 48pt/dp`；空间受限时视觉可以等比缩放，但触控高度不得小于 `44pt/dp`

原生容器请使用完整 `220:48` 比例的 `fitCenter / scaleAspectFit`，不要使用 `aspectFill` 或按气泡宽度裁剪画布。两个状态共用同一容器尺寸，只有 JSON 内容发生替换。

空闲邀请播放完毕后，容器会停在纯 U 的末帧。待回复播放完毕后，容器会停在可读提示末帧。业务状态发生变化时使用新 JSON 重新播放，不要在两份动画之间做帧号跳转。

iOS 与 Android 都应为整个动画容器设置可访问名称，并根据当前状态更新：

- 空闲：`Create a game with AlterU Agent`
- 待回复：`Your turn. Open the conversation waiting for your reply`

## 7. 视觉与行为不可变项

- 正式 U 水印始终存在，不使用完整 AlterU 字标。
- 手臂数量只能是 0 或 2，不能只显示单手。
- 思考阶段必须有 3 个点，且气泡是 `36 × 36px` 正圆。
- 展开气泡高 `36px`、圆角 `18px`、左右内边距 `14px`。
- 普通邀请使用白色气泡，待回复使用品牌粉；含义同时由文案表达，不能只靠颜色。
- 角色只在伸出与收回瞬间带动 U 弹一下，停留期间 U 不持续晃动。
- 控件固定在平台左上角；不要迁到右上角。

## 8. 减少动态与本地化

MiniAPP SVG 已包含 `prefers-reduced-motion` 静态呈现。原生端应读取系统“减少动态效果”设置：开启时不播放时间线，直接显示该业务状态的可读静态末帧。

当前交付文案为英文。Lottie 的文案以透明 PNG 内嵌，不能在运行时直接改字；增加其他语言时应使用 `handoff/source/generate-assets.cjs` 生成对应文件，并保持同一气泡高度、内边距和角色时间线。

## 9. 验收清单

- MiniAPP 与原生都只有两个业务动画文件。
- 两端画布均为 `220 × 48`，状态切换不会造成布局跳动。
- 空闲动画末帧只有纯 U。
- 待回复动画末帧仍可读、仍可点击，双手已经收回。
- 待回复能打断空闲动画，并打开正确的 `conversationId`。
- 清除待回复后不会立刻播放空闲邀请。
- 两次空闲邀请之间的间隔不固定，且每个页面会话最多 2 次。
- 320px 宽手机上无裁切，触控高度不小于 44px。
- 系统减少动态效果开启时仍能理解入口用途。
