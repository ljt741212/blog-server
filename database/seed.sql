-- ============================================
-- 种子数据
-- ============================================

-- 文章分类
INSERT INTO categories (name, description, status) VALUES
('前端开发', '前端技术相关文章，包括 HTML、CSS、JavaScript、Vue、React 等', 1),
('后端开发', '后端技术相关文章，包括 Node.js、Java、Python、Go 等', 1),
('数据库', '数据库相关技术文章，包括 MySQL、PostgreSQL、Redis、MongoDB 等', 1),
('工具推荐', '开发工具、插件和效率工具推荐', 1),
('随想录', '个人想法、读后感、生活记录', 1);

-- 文章标签
INSERT INTO tags (name, description, status) VALUES
('JavaScript', 'JavaScript 语言相关', 1),
('TypeScript', 'TypeScript 语言相关', 1),
('Vue', 'Vue.js 框架相关', 1),
('React', 'React 框架相关', 1),
('Node.js', 'Node.js 运行时相关', 1),
('NestJS', 'NestJS 框架相关', 1),
('MySQL', 'MySQL 数据库相关', 1),
('Git', 'Git 版本控制相关', 1),
('Docker', 'Docker 容器化相关', 1),
('CSS', 'CSS 样式相关', 1);

-- 文章
INSERT INTO posts (title, content, summary, coverImage, isTop, isRecommended, slug, views, likes, status, publishTime, user_id, category_id) VALUES
(
  'NestJS 入门教程：从零搭建博客后端',
  '<h2>为什么选择 NestJS</h2><p>NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用程序的框架。它使用渐进式 JavaScript，内置并完全支持 TypeScript。</p><h3>核心概念</h3><p>NestJS 的核心概念包括：模块（Module）、控制器（Controller）、提供者（Provider）、依赖注入（DI）等。这些概念大多借鉴自 Angular，使得前端开发者能够快速上手。</p><h3>创建项目</h3><pre><code>pnpm create nest app blog-server</code></pre><p>选择 pnpm 作为包管理器，项目创建完成后，你会得到一个包含基本文件结构的项目目录。</p><h3>模块化设计</h3><p>NestJS 将应用拆分为多个模块，每个模块负责特定的业务领域。例如，用户模块负责用户注册登录，文章模块负责文章CRUD。</p><p>这种模块化的设计让代码更易于维护和扩展。</p>',
  '本文介绍如何使用 NestJS 从零开始搭建一个功能完整的博客后端服务，涵盖项目初始化、模块化设计、数据库连接等核心内容。',
  NULL, 1, 1, 'nestjs-getting-started', 1523, 89, 'published', '2026-05-10 10:00:00', 1, 2
),
(
  'TypeScript 高级类型技巧总结',
  '<h2>引言</h2><p>TypeScript 的类型系统非常强大，掌握高级类型技巧可以让你的代码更加健壮。本文总结了一些实用的 TypeScript 高级类型用法。</p><h3>条件类型</h3><p>条件类型允许你根据类型关系创建新类型：</p><pre><code>type IsString&lt;T&gt; = T extends string ? true : false;</code></pre><h3>映射类型</h3><p>映射类型允许你基于已有类型创建新类型：</p><pre><code>type Readonly&lt;T&gt; = { readonly [P in keyof T]: T[P] };</code></pre><h3>模板字面量类型</h3><p>TypeScript 4.1 引入的模板字面量类型大大增强了字符串类型的处理能力。</p>',
  '总结 TypeScript 中实用的高级类型技巧，包括条件类型、映射类型、模板字面量类型等。',
  NULL, 0, 1, 'typescript-advanced-types', 982, 56, 'published', '2026-05-12 14:30:00', 1, 1
),
(
  '使用 Docker 部署 Node.js 应用的最佳实践',
  '<h2>为什么使用 Docker</h2><p>Docker 提供了一致的运行环境，解决了"在我机器上能跑"的问题。对于 Node.js 应用来说，Docker 可以帮助我们实现快速部署和平滑扩缩容。</p><h3>多阶段构建</h3><p>多阶段构建可以显著减小镜像体积：</p><pre><code>FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCMD ["node", "dist/main"]</code></pre><h3>健康检查</h3><p>为容器配置健康检查：</p><pre><code>HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3004/api || exit 1</code></pre>',
  '分享使用 Docker 容器化部署 Node.js/NestJS 应用的实践经验，包括多阶段构建和健康检查配置。',
  NULL, 0, 1, 'docker-nodejs-deploy', 867, 42, 'published', '2026-05-15 09:20:00', 1, 2
),
(
  'CSS Grid 布局完全指南',
  '<h2>前言</h2><p>CSS Grid 是 CSS 中最强大的布局系统。它是一个二维系统，可以同时处理列和行。</p><h3>基本概念</h3><p>Grid 容器和 Grid 项目是 CSS Grid 的两个核心概念。通过设置 <code>display: grid</code>，一个元素就成为了 Grid 容器。</p><h3>常用属性</h3><ul><li><code>grid-template-columns</code> - 定义列轨道</li><li><code>grid-template-rows</code> - 定义行轨道</li><li><code>grid-gap</code> - 设置网格间距</li><li><code>grid-area</code> - 将项目放置到指定区域</li></ul><p>Grid 布局特别适合制作响应式页面布局和复杂的卡片排列。</p>',
  '全面介绍 CSS Grid 布局的核心概念和常用属性，帮助开发者从 Flexbox 过渡到 Grid 布局。',
  NULL, 0, 0, 'css-grid-guide', 2105, 134, 'published', '2026-05-08 16:45:00', 1, 1
),
(
  '2026 年值得关注的 10 个前端开发工具',
  '<h2>前言</h2><p>前端工具生态日新月异，这里整理了 2026 年值得关注的 10 个前端开发工具。</p><h3>1. Biome</h3><p>一个快速的格式化器和 linter，用 Rust 编写，比 Prettier + ESLint 快数倍。</p><h3>2. Vite 6</h3><p>下一代前端构建工具，速度超快，开箱即用支持 ES 模块。</p><h3>3. Rspack</h3><p>基于 Rust 的 Web 打包工具，与 Webpack 生态兼容，但速度更快。</p><h3>4. Oxc</h3><p>基于 Rust 的 JavaScript/TypeScript 工具链。</p><p>其余推荐包括：Bun、Deno 2、Nova CSS Engine、TabNine、Storybook 8、Playwright。</p>',
  '盘点 2026 年前端开发中最值得关注的工具，包括 Biome、Vite 6、Rspack 等。',
  NULL, 0, 0, 'frontend-tools-2026', 3210, 201, 'published', '2026-05-18 11:00:00', 1, 4
),
(
  'MySQL 索引优化实战',
  '<h2>为什么索引重要</h2><p>索引是数据库优化最常用的手段之一。合理使用索引可以大幅提升查询性能。</p><h3>B+树索引</h3><p>MySQL InnoDB 引擎默认使用 B+树索引。理解 B+树的结构有助于写出更高效的查询。</p><h3>最左前缀原则</h3><p>联合索引遵循最左前缀原则：</p><pre><code>CREATE INDEX idx_name_age ON users(name, age);\n-- 以下查询可以使用索引\nSELECT * FROM users WHERE name = '';\nSELECT * FROM users WHERE name = '' AND age > 18;\n-- 以下查询无法使用索引\nSELECT * FROM users WHERE age > 18;</code></pre><h3>EXPLAIN 分析</h3><p>使用 EXPLAIN 命令分析查询是否使用了索引。</p>',
  '深入讲解 MySQL 索引优化，包括 B+树原理、最左前缀原则和 EXPLAIN 分析工具。',
  NULL, 0, 1, 'mysql-index-optimization', 678, 37, 'published', '2026-05-14 08:15:00', 1, 3
);

-- 文章-标签关联
INSERT INTO posts_tags (postsId, tagsId) VALUES
(1, 5), (1, 6),  -- NestJS 文章 -> Node.js + NestJS
(2, 2),           -- TypeScript 文章 -> TypeScript
(3, 5), (3, 8), (3, 9),  -- Docker 文章 -> Node.js + Git + Docker
(4, 10),          -- CSS 文章 -> CSS
(5, 1), (5, 3), (5, 4),  -- 工具文章 -> JS + Vue + React
(6, 1), (6, 7);  -- MySQL 文章 -> JS + MySQL

-- 文章评论
INSERT INTO comments (content, status, likes, user_id, postId) VALUES
('很棒的 NestJS 入门教程，对新手非常友好！', 'approved', 5, 1, 1),
('TypeScript 的高级类型确实很强大，建议加上 infer 关键字的用法', 'approved', 3, 1, 2),
('Docker 多阶段构建真的很好用，镜像体积能减少 70%', 'approved', 2, 1, 3),
('CSS Grid 比 Flexbox 好理解多了，二维布局神器', 'approved', 4, 1, 4),
('Biome 确实快，已经从 Prettier + ESLint 全面切换过来了', 'approved', 1, 1, 5),
('最左前缀那个例子讲得很清楚，之前一直没搞懂', 'approved', 0, 1, 6);

-- SEO 设置
INSERT INTO seo_settings (title, description, keywords, sitemap_url, robots, canonical_url, og_title, og_description, og_image, schema_markup, meta_author, meta_viewport) VALUES
(
  'LJT Blog - 个人技术博客',
  '一个专注于前端、后端和数据库技术分享的个人博客，记录开发过程中的思考和总结。',
  '技术博客,前端开发,后端开发,NestJS,TypeScript,MySQL,Node.js,Vue,React',
  '/sitemap.xml',
  'User-agent: *\nAllow: /\nDisallow: /api/',
  'https://blog.ljt.com',
  'LJT Blog - 个人技术博客',
  '一个专注于前端、后端和数据库技术分享的个人博客',
  '/images/og-default.png',
  '{"@context":"https://schema.org","@type":"WebSite","name":"LJT Blog","url":"https://blog.ljt.com"}',
  'linzai',
  'width=device-width, initial-scale=1.0'
);

-- 更新日志
INSERT INTO changelogs (title, version, content, type, isPublished, releaseDate) VALUES
(
  '博客系统正式上线',
  '1.0.0',
  '## 新功能\n- 文章管理：支持文章的创建、编辑、发布和删除\n- 分类管理：支持文章分类的增删改查\n- 标签管理：支持标签的增删改查\n- 评论系统：支持文章评论和审核\n- 用户系统：支持用户注册、登录和权限管理\n- 访客统计：实时统计网站访问数据\n- SEO 设置：支持自定义 SEO 元数据\n- OSS 文件上传：支持阿里云 OSS 文件存储\n\n## 技术栈\n- NestJS 11 + TypeScript\n- MySQL + TypeORM\n- JWT 认证',
  'feature', 1, '2026-03-15'
),
(
  '新增数据导入导出功能',
  '1.1.0',
  '## 新功能\n- 数据导出：支持将全站数据导出为 ZIP 压缩包\n- 数据导入：支持从 ZIP 压缩包导入数据\n\n## 改进\n- 优化图片上传体验，支持拖拽上传\n- 文章编辑页面支持 Markdown 实时预览\n\n## 修复\n- 修复评论审核状态切换不生效的问题\n- 修复移动端访问统计不准确的问题',
  'feature', 1, '2026-04-20'
),
(
  '性能优化和安全增强',
  '1.2.0',
  '## 改进\n- 数据库查询性能优化，添加必要的索引\n- 接口响应速度提升 40%\n- 前端资源启用 Gzip 压缩\n\n## 安全\n- 修复 XSS 注入漏洞\n- 加强 JWT Token 过期策略\n- API 请求频率限制',
  'improvement', 1, '2026-05-10'
),
(
  '修复若干已知问题',
  '1.2.1',
  '## 修复\n- 修复文章置顶排序逻辑错误\n- 修复评论列表分页数据重复问题\n- 修复 SEO 设置页面部分字段保存后不生效\n- 修复文件上传大小限制配置不生效',
  'bugfix', 1, '2026-05-18'
);
