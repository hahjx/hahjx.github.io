# GitHub Actions 部署安全与插件管理总结

## 一、第三方插件风险分析

### 1.1 风险插件识别

| 插件 | 类型 | 风险等级 |
|---|---|---|
| actions/checkout@v4 | GitHub 官方 | 安全 |
| pnpm/action-setup@v4 | pnpm 官方 | 安全 |
| actions/setup-node@v4 | GitHub 官方 | 安全 |
| actions/configure-pages@v4 | GitHub 官方 | 安全 |
| actions/upload-pages-artifact@v3 | GitHub 官方 | 安全 |
| actions/deploy-pages@v4 | GitHub 官方 | 安全 |
| hahjx/hub-mirror-action@v1.5 | 个人维护（已Fork） | 已缓解 |

### 1.2 原插件风险点

- Yikun/hub-mirror-action 是社区个人维护的同步工具
- 使用 @master 分支永远拉取最新代码，上游改动直接影响自己
- 涉及 GITEE_PRIVATE_KEY、GITEE_TOKEN 等密钥，存在凭据泄露风险

### 1.3 已采取的缓解措施

- 将 Yikun/hub-mirror-action Fork 到自有仓库 hahjx/hub-mirror-action
- 将 yml 配置中的引用从 Yikun/hub-mirror-action@master 改为 hahjx/hub-mirror-action@v1.5
- 锁定具体版本号，不再使用不稳定的 @master

## 二、Git Tag 与版本锁定

### 2.1 uses 引用的三种方式

| 写法 | 实际指向 | 稳定性 |
|---|---|---|
| @main / @master | 某个分支的最新提交 | 最不稳定 |
| @v1.5 | 某个 Tag | 比较稳定 |
| @完整commit SHA | 某次具体提交 | 最稳定 |

### 2.2 Tag 的稳定性说明

- Fork 时原仓库已有的 Tag 会被完整保留，指向同一个 commit
- 原仓库后续新增的 Tag 不会自动同步到 Fork
- 原仓库删除后，Fork 仓库中的 Tag 和代码依然完整保留
- 唯一风险：自己或他人误删 Tag

### 2.3 uses 语法格式

- 正确写法：uses: hahjx/hub-mirror-action@v1.5
- 错误写法：uses: https://github.com/hahjx/hub-mirror-action@v1.5（不能写完整 URL）
- 格式为 作者/仓库名@版本号，GitHub Actions 内部自动解析

### 2.4 Tag 不等于定版

Tag 仅表示"该版本指向某个固定提交"，不能保证：
- 代码一定没 Bug
- 作者以后不会删 Tag
- 作者不会把同一个 Tag 删掉重建
- 该版本一定适合生产环境

## 三、GitHub 宕机风险分析

### 3.1 风险概率评估

| 事件 | 概率 |
|---|---|
| GitHub 永久关闭 | 极低 |
| 微软倒闭 | 极低 |
| GitHub 短期宕机（几小时） | 较高，未来可能更频繁 |
| 博客部署失败 | 中等（推送时若 GitHub 正故障则可能失败） |

### 3.2 近期故障记录

- 2026 年 2 月单月记录 37 次故障
- 2026 年 8 月 17 日核心功能中断近 8 小时，Pages 下载错误率一度接近 50%
- 2026 年 4 月单月发生 10 次独立故障
- 第三方跟踪显示其 90 天可用性曾跌至 88% 左右

### 3.3 根因与应对

根因主要是 AI 流量暴增、系统紧耦合、扩容滞后。GitHub 正在加速迁移至 Azure、扩容、隔离核心服务。

### 3.4 兜底策略

- 本地永远保留完整源码（最重要）
- Gitee 保持同步，作为国内镜像和备用
- 推送后若 Pages 未更新，去 Actions 查看是否因故障失败，稍后重试
- 第三方 Action 尽量锁定版本或 Fork 到自己仓库
- 若非常在意稳定性，可额外部署到 Vercel / Cloudflare Pages 作为备用

## 四、插件更新与替换策略

### 4.1 Fork 后如何更新

**方式 A：网页同步（最简单）**

1. 打开 Fork 的仓库页面
2. 点击页面上方的 Sync fork / Update branch
3. 同步完成后，检查上游是否有新 Tag
4. 如有新 Tag，在 Fork 仓库中手动创建对应 Tag
5. 更新 yml 中的版本号

**方式 B：命令行同步**

```
cd hub-mirror-action
git remote add upstream https://github.com/Yikun/hub-mirror-action.git
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

然后打新 Tag：

```
git tag v1.6
git push origin v1.6
```

### 4.2 插件失效时的排查流程

1. 查看仓库 Actions 报错日志，确认是脚本问题还是 Token/密钥问题
2. 检查原仓库是否还在维护（看 Issues、PR、最近提交时间）
3. 在 GitHub Marketplace 搜索替代方案
4. 找到新方案后先 Fork 再锁定版本
5. 如果暂时找不到替代，可先停用同步步骤避免密钥反复触发失败

### 4.3 搜索替代插件的渠道

| 渠道 | 搜索关键词 |
|---|---|
| GitHub Marketplace | sync gitee、github to gitee、mirror action |
| GitHub 搜索 | hub-mirror-action、gitee sync action |
| Gitee 搜索 | github 同步、仓库镜像 |
| 官方文档 | "GitHub 仓库同步到 Gitee" |

### 4.4 选择插件的评估标准

- 最近 6 个月是否有更新
- 有没有明确版本 Tag
- Stars / Forks 数量
- Issues 是否有人反馈且作者有回应
- README 是否有完整配置示例
- 是否涉及 Token、SSH Key，权限是否最小化

### 4.5 备选方案

Gitee 本身提供仓库镜像功能，可配置 GitHub 到 Gitee 自动同步，无需依赖第三方 Action。

## 五、uses 语法与微软生态的关系

- uses: 只是 GitHub Actions 的插件引用语法，不绑定微软其他产品
- 运行在 GitHub Actions 的 Runner 上，支持 Linux、Windows、macOS
- 插件本身可以是任何人写的开源脚本
- 不把你锁死在微软产品生态里
- 真正依赖的是 GitHub Actions 平台本身，而非 Azure 或微软全家桶

## 六、操作记录

### 6.1 已完成的修改

```
# 修改前
uses: Yikun/hub-mirror-action@master

# 修改后
uses: hahjx/hub-mirror-action@v1.5
```

### 6.2 提交命令

```
git add .github/workflows/
git commit -m "fix: 切换为自建fork插件并锁定v1.5版本"
git push origin main
```

### 6.3 验证方式

推送后前往 GitHub Actions 页面查看 Sync 工作流是否正常运行。
