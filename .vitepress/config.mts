import { defineConfig } from 'vitepress'
import { setSideBar } from './utils/genRoute.mts'

export default defineConfig({
  base: '/',
  srcExclude: ['**/SKILL.md'],
  title: '寒江雪的小站',
  description: '孤舟蓑立翁,独钓寒江雪',

  // 1. 在 VitePress 内部 Markdown 编译器阶段生效（第一步处理）
  markdown: {
    config: md => {
      // 拦截 html_inline 和 html_block 节点（即裸写的 <dependencyManagement>、<T> 等）
      const defaultHtmlInline =
        md.renderer.rules.html_inline ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options)
        }

      md.renderer.rules.html_inline = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const normalizedPath = (env.relativePath || '').replace(/\\/g, '/')
        const isDocFolder = /(doc-[^\/]+|docs)/i.test(normalizedPath)

        // 如果在 doc- 或 docs 目录下，且不是 HTML 注释，强制转义尖括号，使其不被 Vue 编译
        if (isDocFolder && token.content && !token.content.startsWith('<!--')) {
          return token.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        }
        return defaultHtmlInline(tokens, idx, options, env, self)
      }
    },
  },

  themeConfig: {
    nav: [{ text: '首页', link: '/' }],
    sidebar: setSideBar(),
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
    footer: {
      copyright: 'Copyright © 2026 寒江雪的小站',
    },
  },
})
