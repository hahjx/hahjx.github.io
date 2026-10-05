# JS 封装 Blob 文件流解析与下载方法

在前端开发中，解析下载 `Blob` 类型的数据（通常是后端返回的文件流）是一个非常高频的需求。在实际开发中，需要重点注意两个隐蔽坑点：

1. **响应头部大小写与文件名解析**：后端通常将文件名放在 `Content-Disposition` 响应头中，但可能是 `filename` 或 `filename*`（UTF-8 编码）。
2. **后端错误处理**：当接口报错（如权限不足或 Token 过期）时，后端可能仍然返回 `200` 或者 JSON 数据，但已被 HTTP 工具（如 Axios）强制包装成了 `Blob` 对象。如果不将 `Blob` 重新解析为 JSON，页面直接触发下载，会导致用户下载到一个存着错误信息的 `.json` / `.txt` 文件。

以下提供一个生产环境通用的 ES6 标准 JavaScript 封装函数：

```javascript
/**
 * 解析并下载 Blob 文件流
 * 
 * @param {Blob|Response} res - 接口返回的 Blob 对象或 Axios 响应对象/Fetch Response
 * @param {string} [customFileName] - 自定义文件名（传入则优先使用，不传则尝试从 Content-Disposition 解析）
 * @param {string} [fallbackFileName='download'] - 解析失败时的保底文件名
 * @returns {Promise<void>}
 */
async function downloadBlob(res, customFileName, fallbackFileName = 'download') {
  let blobData = res;
  let headers = {};

  // 1. 兼容 Axios 或 Fetch 的 Response 结构提取
  if (res && res.data instanceof Blob) {
    blobData = res.data;
    headers = res.headers || {};
  } else if (res instanceof Response) {
    headers = Object.fromEntries(res.headers.entries());
    blobData = await res.blob();
  }

  if (!(blobData instanceof Blob)) {
    throw new Error('传入的数据不是有效的 Blob 对象');
  }

  // 2. 拦截错误信息：如果 Blob 类型为 json，说明后端返回的是错误提示而非文件流
  if (blobData.type.includes('application/json')) {
    const text = await blobData.text();
    let errorData = {};
    try {
      errorData = JSON.parse(text);
    } catch {
      errorData = { message: text };
    }
    // 抛出后端返回的具体错误信息信息，供调用方做 toast 提示
    throw new Error(errorData.msg || errorData.message || '导出文件失败');
  }

  // 3. 确定文件名
  let fileName = customFileName;
  if (!fileName) {
    // 获取 Content-Disposition 头信息 (兼容 Axios 的小写 headers)
    const disposition = headers['content-disposition'] || headers['Content-Disposition'];
    if (disposition) {
      // 优先匹配 filename* (支持含有中文及特殊字符的编码格式)
      const filenameStarMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
      if (filenameStarMatch && filenameStarMatch[1]) {
        fileName = decodeURIComponent(filenameStarMatch[1]);
      } else {
        // 退而求其次匹配标准 filename
        const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          fileName = decodeURIComponent(filenameMatch[1]);
        }
      }
    }
  }

  // 若仍未能获取文件名，使用保底名称
  fileName = fileName || fallbackFileName;

  // 4. 创建 DOM 节点并触发下载
  const blobUrl = window.URL.createObjectURL(blobData);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // 5. 资源清理
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}
```

---

## 使用示例

### 示例 1：配合 Axios 使用（最常用）

在使用 Axios 请求二进制文件时，**必须设置 `responseType: 'blob'`**：

```javascript
import axios from 'axios';

async function exportExcel() {
  try {
    const response = await axios.get('/api/export/user-list', {
      responseType: 'blob' // 必须显式声明
    });

    // 调用封装的方法下载
    await downloadBlob(response);
    console.log('下载成功');
  } catch (error) {
    // 如果后端返回错误 JSON，会被 downloadBlob 拦截并抛出错误 message
    console.error('下载失败：', error.message);
  }
}
```

### 示例 2：手动指定下载文件名

```javascript
const response = await axios.get('/api/export/report', { responseType: 'blob' });

// 强制指定文件名，忽略后端 Header
await downloadBlob(response, '2026年度数据报表.xlsx');
```

### 示例 3：配合原生 Fetch API 使用

```javascript
async function fetchAndDownload() {
  try {
    const res = await fetch('/api/export/pdf');
    if (!res.ok) throw new Error('网络请求异常');
    
    await downloadBlob(res);
  } catch (err) {
    console.error(err.message);
  }
}
```