# 📚 JLPT N2 一本通

> 6 週間 一発合格 完全攻略 · 在线学习站

一站式 JLPT N2 复习网站，包含 150 条语法、1000+ 高频词汇、读解/听解攻略、真题模考、学习打卡系统。所有数据本地保存。

🌐 **在线访问**：部署到 GitHub Pages 后访问 `https://<你的用户名>.github.io/<仓库名>/`

## ✨ 功能特色

- ✅ **150 条 N2 语法**：6 大主题分类，例句双语，可搜索可筛选，已学打勾
- ✅ **1000+ 高频词汇**：12 个主题，可隐藏假名/中文进行自测
- ✅ **读解 5 套路 + 真题精讲**：答案点击展开，详细解析
- ✅ **听解攻略 + 脚本**：5 大题型套路，脚本可隐藏/展开
- ✅ **真题模考**：自动判分，记录历史成绩
- ✅ **学习打卡系统**：日历视图、连续天数、任务清单
- ✅ **数据导出/导入**：本地 JSON 备份
- ✅ **纯静态站**：无后端、无追踪、无 cookie，全部 localStorage

## 🚀 部署到 GitHub Pages

### 方法 1：手动启用 Pages

```bash
git clone https://github.com/<你的用户名>/<仓库名>.git
cd <仓库名>
# 把本目录所有文件复制进去
git add .
git commit -m "Initial commit"
git push
```

然后在 GitHub 仓库设置中：
1. 进入 **Settings → Pages**
2. **Source** 选择 `Deploy from a branch`
3. **Branch** 选择 `main` / `/ (root)`
4. 保存，等几分钟即可访问

### 方法 2：使用 GitHub Actions（已内置 workflow）

推送代码到 `main` 分支后，`.github/workflows/deploy.yml` 会自动部署。

需要先在 Settings → Pages → Source 选 `GitHub Actions`。

## 📂 目录结构

```
.
├── index.html         # 首页
├── grammar.html       # 语法 150 条
├── vocab.html         # 词汇 1000
├── reading.html       # 读解攻略 + 真题
├── listening.html     # 听解攻略 + 练习
├── exam.html          # 真题模考
├── plan.html          # 打卡系统
├── data/
│   ├── grammar.json
│   ├── vocab.json
│   ├── reading.json
│   ├── listening.json
│   └── exam.json
└── assets/
    ├── style.css
    └── app.js
```

## 💡 自定义

- **修改语法/词汇**：编辑 `data/*.json` 即可，无需改代码
- **添加真题**：在 `data/reading.json` / `data/listening.json` 新增对象
- **修改颜色**：编辑 `assets/style.css` 顶部的 CSS 变量

## 📄 License

MIT · 内容来源整理自公开 JLPT 学习资料，仅供学习交流。

---

⭐ 觉得有用就给个 Star 支持一下！
