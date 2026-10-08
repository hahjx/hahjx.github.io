## vscode的配置

- vscode 的配置文件是 `settings.json`，在项目中的 `.vscode` 目录下
  - 层级如下:项目根目录=>.vscode=>settings.json
  - 注意：setting要加s
- 配置示例
  1. 配置侧边缩进
     ```js
       // --- 新增：增强侧边栏层级感 ---
         "workbench.tree.indent": 20, // 默认是 8，设置为 20 左右视觉上接近加倍
         "workbench.tree.renderIndentGuides": "always", // 始终显示层级划线
     ```

### markdown文件的图片vscode黏贴配置

1. 查找配置项 markdown.copyFiles.destination
2. 添加配置项设置

- key: \*_/_.md
- value: assets/${documentBaseName}/${fileName}
