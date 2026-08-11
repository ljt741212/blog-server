# 博客后台 AI 全能助理 — 完整技术方案

> 版本: 2.0 | 日期: 2026-07-30 | 状态: ✅ 已实施

> **已实施**: 本方案已完整落地。核心代码位于 `packages/ai-agent/`（Agent 核心）和 `apps/server/src/modules/ai/`（NestJS 集成）。
> 实际实现细节与设计文档主要差异：
>
> - 会话持久化：消息从 LangGraph stream chunks 直接收集，而非依赖 Redis getState
> - Tool 数量：64 个（新增 memory 5 个 + note 4 个 + deep_task 1 个）
> - 记忆系统：三层架构（短期/中期/长期），含 MySQL `ai_memories` 表
> - 上下文管理：GSSC（Gather-Select-Structure-Compact）管道，自动 token 预算管理
> - 临时会话：Redis-only checkpoint，1h TTL，不持久化到 MySQL

---

## 目录

- [1. 概述](#1-概述)
- [2. 技术选型与依赖](#2-技术选型与依赖)
- [3. 项目结构](#3-项目结构)
- [4. 核心架构](#4-核心架构)
- [5. 数据流设计](#5-数据流设计)
- [6. LangGraph Agent 实现](#6-langgraph-agent-实现)
- [7. Tool 系统设计](#7-tool-系统设计)
- [8. 会话管理](#8-会话管理)
- [9. LLM 动态配置](#9-llm-动态配置)
- [10. 流式输出与 SSE](#10-流式输出与-sse)
- [11. 危险操作确认机制](#11-危险操作确认机制)
- [12. API 设计](#12-api-设计)
- [13. 错误处理](#13-错误处理)
- [14. 安全设计](#14-安全设计)
- [15. 实施计划](#15-实施计划)
- [16. 测试策略](#16-测试策略)
- [17. 附录](#17-附录)

---

## 1. 概述

### 1.1 目标

基于 LangChain + LangGraph 构建博客后台 AI 全能助理。管理员通过自然语言即可操控整个博客后台，涵盖文章、分类、标签、评论、友链、留言、公告、更新日志、站点配置、SEO、ICP、访问统计、数据导入导出、文件管理等全部模块。

**唯一不可操作的模块：用户信息管理（User CRUD、密码修改、角色变更）。**

### 1.2 核心设计原则

| 原则              | 说明                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| **Tool 即能力**   | 每个业务操作封装为独立 Tool，Agent 通过 Tool 调用操控系统                   |
| **LLM 可替换**    | 延续现有 `ai_configs` 表，支持 OpenAI / DeepSeek / Anthropic 动态切换       |
| **安全确认**      | 删除等危险操作通过 LangGraph `interrupt()` + `Command()` 暂停，等待用户确认 |
| **会话持久化**    | 会话历史存储到 MySQL，支持跨页面恢复                                        |
| **流式体验**      | 全链路 SSE 流式输出，含逐字输出、Tool 调用状态、确认请求                    |
| **Monorepo 隔离** | Agent 核心逻辑独立为 `packages/ai-agent`，与 NestJS 业务层解耦              |

---

## 2. 技术选型与依赖

### 2.1 技术栈

| 维度       | 选择                                         | 理由                                                           |
| ---------- | -------------------------------------------- | -------------------------------------------------------------- |
| Agent 框架 | LangChain + LangGraph                        | 成熟的 Tool Use + StateGraph 编排，支持 interrupt/checkpointer |
| 包管理     | pnpm workspace                               | 已有 `pnpm-workspace.yaml`，原生支持 monorepo                  |
| 后端框架   | NestJS 11                                    | 已有，保持不变                                                 |
| 数据库     | MySQL + TypeORM                              | 已有，保持不变                                                 |
| LLM SDK    | `@langchain/openai` + `@langchain/anthropic` | 各自的原生协议，不混用                                         |
| 流式输出   | SSE (Server-Sent Events)                     | 单向流，比 WebSocket 更轻量，NestJS 原生支持                   |

### 2.2 新增依赖

#### `packages/ai-agent/package.json`

```json
{
  "name": "@blog/ai-agent",
  "version": "0.0.1",
  "dependencies": {
    "@langchain/core": "^1.2.0",
    "@langchain/langgraph": "^1.4.0",
    "@langchain/langgraph-checkpoint": "^1.1.0",
    "@langchain/openai": "^1.5.0",
    "@langchain/anthropic": "^1.5.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
```

> **版本说明**：以上版本号为 2026-07-30 实际最新版本。`@langchain/langgraph-checkpoint` 是 `@langchain/langgraph` 的依赖，提供 `BaseCheckpointSaver` 基类。

#### `apps/server/package.json` 新增

```json
{
  "dependencies": {
    "@blog/ai-agent": "workspace:*"
  }
}
```

### 2.3 现有依赖中可移除的

| 包       | 原因                                                           |
| -------- | -------------------------------------------------------------- |
| `openai` | 被 `@langchain/openai` 替代（LangChain 内部封装了 OpenAI SDK） |

---

## 3. 项目结构

```
blog-server/
├── apps/
│   └── server/                              # NestJS 主项目
│       ├── src/
│       │   ├── modules/
│       │   │   ├── ai/                      # 精简后的 AI 模块
│       │   │   │   ├── ai.controller.ts     # chat(SSE), confirm, configs, usage, conversations
│       │   │   │   ├── ai.service.ts        # 组装 Agent，注入 Tool，处理 confirm
│       │   │   │   ├── ai.module.ts
│       │   │   │   ├── ai.dto.ts            # ChatDto, ConfirmDto, 等
│       │   │   │   ├── ai-config.entity.ts  # 已有，不变
│       │   │   │   ├── ai-usage.entity.ts   # 已有，扩展字段
│       │   │   │   └── conversation.entity.ts  # 新增
│       │   │   ├── post/                    # 业务模块（不变）
│       │   │   ├── category/
│       │   │   ├── tag/
│       │   │   ├── comment/
│       │   │   ├── friend-link/
│       │   │   ├── guest-message/
│       │   │   ├── announcement/
│       │   │   ├── changelog/
│       │   │   ├── seo-setting/
│       │   │   ├── site-config/
│       │   │   ├── icp-info/
│       │   │   ├── setting/
│       │   │   ├── visitor/
│       │   │   ├── oss/
│       │   │   ├── data-transfer/
│       │   │   └── user/
│       │   ├── common/
│       │   ├── config/
│       │   ├── global/
│       │   └── shared/
│       └── package.json
│
├── packages/
│   └── ai-agent/                            # LangChain + LangGraph Agent 核心
│       ├── src/
│       │   ├── agent/
│       │   │   ├── graph.ts                 # StateGraph 构建 + createAgent 入口
│       │   │   ├── nodes.ts                 # callAgent 节点、executeTool 节点
│       │   │   ├── state.ts                 # AgentState 类型定义
│       │   │   └── checkpointer.ts          # MySQL Checkpointer 实现
│       │   ├── tools/
│       │   │   ├── index.ts                 # Tool 注册表 + 危险操作标记 + createAllTools
│       │   │   ├── types.ts                 # ToolServices 接口、ToolFactory 类型
│       │   │   ├── post.tool.ts
│       │   │   ├── category.tool.ts
│       │   │   ├── tag.tool.ts
│       │   │   ├── comment.tool.ts
│       │   │   ├── friend-link.tool.ts
│       │   │   ├── guest-message.tool.ts
│       │   │   ├── announcement.tool.ts
│       │   │   ├── changelog.tool.ts
│       │   │   ├── site-config.tool.ts
│       │   │   ├── setting.tool.ts
│       │   │   ├── visitor.tool.ts
│       │   │   ├── data-transfer.tool.ts
│       │   │   ├── oss.tool.ts
│       │   │   └── writing.tool.ts
│       │   ├── prompts/
│       │   │   ├── system.ts                # System Prompt
│       │   │   └── writing.ts               # 写作场景 prompt 模板
│       │   └── index.ts                      # 对外暴露 createAgent() + 类型
│       ├── package.json
│       └── tsconfig.json
│
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

---

## 4. 核心架构

### 4.1 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                     apps/server (NestJS)                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    AiController                       │  │
│  │  POST /chat  →  SSE 流式响应                          │  │
│  │  POST /chat/:conversationId/confirm  →  确认/拒绝    │  │
│  │  GET  /conversations  →  会话列表                     │  │
│  │  GET  /conversations/:id  →  会话详情                 │  │
│  │  DELETE /conversations/:id  →  删除会话              │  │
│  │  (configs / usage 端点保持不变)                       │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────▼───────────────────────────────┐  │
│  │                    AiService                          │  │
│  │  - 读取 AiConfig 激活配置                             │  │
│  │  - 调用 createAgent() 构建 Agent                      │  │
│  │  - 注入所有业务 Service 到 Tool 工厂                   │  │
│  │  - 管理 SSE 连接与 Agent 生命周期的绑定                │  │
│  │  - 处理 confirm → Command({ resume }) 恢复 Agent       │  │
│  │  - 保存/加载会话消息到 MySQL                          │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────┼───────────────────────────────┐  │
│  │  业务 Services       │                                │  │
│  │  PostService         │   Tool 工厂函数注入             │  │
│  │  CategoryService     ◀───────────────────────────────│  │
│  │  TagService          │                                │  │
│  │  CommentService      │                                │  │
│  │  ...所有 Service     │                                │  │
│  └──────────────────────┼───────────────────────────────┘  │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  packages/ai-agent                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  createAgent(config)                  │  │
│  │                                                      │  │
│  │  输入:                                                │  │
│  │    - llmConfig: { provider, model, apiKey, baseUrl } │  │
│  │    - services: ToolServices                          │  │
│  │    - dangerousToolNames: string[]                    │  │
│  │    - checkpointer: Checkpointer                      │  │
│  │                                                      │  │
│  │  输出: CompiledStateGraph                            │  │
│  │    - stream(input, config) → stream                   │  │
│  │    - updateState(config, values)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  StateGraph  │  │  59 Tools    │  │  Prompt Templates│  │
│  │  + Nodes     │  │  (Structured │  │  (system.ts,     │  │
│  │  + Edges     │  │   Tool def)  │  │   writing.ts)    │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 关键接口

```typescript
// packages/ai-agent/src/tools/types.ts

import { StructuredTool } from '@langchain/core/tools';

/** Tool 工厂函数 — 接收 services 返回 StructuredTool 实例 */
export type ToolFactory = (services: ToolServices) => StructuredTool;

/** 所有业务 Service 的集合 — 由 AiService.buildToolServices() 构建 */
export interface ToolServices {
  postService: PostService;
  categoryService: CategoryService;
  tagService: TagService;
  commentService: CommentService;
  friendLinkService: FriendLinkService;
  guestMessageService: GuestMessageService;
  announcementService: AnnouncementService;
  changelogService: ChangelogService;
  siteConfigService: SiteConfigService;
  seoSettingService: SeoSettingService;
  icpInfoService: IcpInfoService;
  settingService: SettingService;
  visitorService: VisitorService;
  dataTransferService: DataTransferService;
  ossService: OssService;
}

// packages/ai-agent/src/index.ts

/** createAgent 配置 */
export interface AgentConfig {
  llmConfig: LlmConfig;
  services: ToolServices;
  dangerousToolNames: string[];
  checkpointer?: Checkpointer;
}

export interface LlmConfig {
  provider: 'openai' | 'deepseek' | 'anthropic';
  model: string;
  apiKey: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

// apps/server 端定义（不在 ai-agent 包内）

/** SSE 事件发射器 — 由 NestJS Controller 创建，注入到 callbacks 和 config */
export interface SseEmitter {
  emitToken(content: string): void;
  emitToolCall(toolName: string, args: Record<string, unknown>): void;
  emitToolResult(toolName: string, result: unknown): void;
  emitConfirm(
    toolName: string,
    args: Record<string, unknown>,
    message: string,
  ): void;
  emitDone(): void;
  emitError(message: string): void;
}
```

> **注意**：`SseEmitter` 定义在 `apps/server` 端（`ai.service.ts`），不在 `packages/ai-agent` 内。Agent 节点通过 `config.configurable.sseEmitter` 访问它，类型为 `unknown`，由节点内部做类型断言。

---

## 5. 数据流设计

### 5.1 普通对话流程

```
用户发送 "帮我查一下最近发布了哪些文章"
        │
        ▼
┌─────────────────┐
│  AiController   │  接收 POST /api/ai/chat
│  (SSE Response) │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│   AiService.handleChat()                         │
│                                                  │
│  1. 读取 AiConfig (isActive=true)                │
│  2. 创建/获取 Conversation                      │
│  3. 创建 SseEmitter (绑定 res)                   │
│  4. 创建 callbacks: { handleLLMNewToken }       │
│  5. agent.stream(input, { configurable, callbacks })│
│  6. for await (chunk of stream) { /* 保持连接 */ }│
│  7. 保存消息到 Conversation                      │
│  8. 新会话 → 异步生成标题                         │
│  9. sseEmitter.emitDone()                        │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│           LangGraph Agent                │
│                                          │
│  [agent node]                            │
│    │ LLM 决策: 需要调用 search_posts     │
│    │ (callback: handleLLMNewToken →     │
│    │  sseEmitter.emitToken)             │
│    ▼                                     │
│  [tool_executor node]                    │
│    │ → sseEmitter.emitToolCall(...)     │
│    │ → PostService.findPage(...)         │
│    │ → sseEmitter.emitToolResult(...)   │
│    ▼                                     │
│  [agent node]                            │
│    │ LLM 生成回复，逐 token 通过         │
│    │ handleLLMNewToken 流式输出          │
│    ▼                                     │
│  [END]                                   │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   前端 (SSE)    │  逐字渲染 + Tool 状态提示
└─────────────────┘
```

### 5.2 危险操作确认流程

```
用户发送 "删除那篇标题叫 test 的文章"
        │
        ▼
┌─────────────────────────────────────────┐
│           LangGraph Agent                │
│                                          │
│  [agent node]                            │
│    │ LLM 决策: 先 search_posts 找到文章  │
│    ▼                                     │
│  [tool_executor] → search_posts("test")  │
│    │ 返回 [{ id: 42, title: "test" }]    │
│    ▼                                     │
│  [agent node]                            │
│    │ LLM 决策: 调用 delete_post(42)      │
│    ▼                                     │
│  [tool_executor]                         │
│    │ 检查: delete_post 在 dangerousTools │
│    │ 中                                    │
│    │ → sseEmitter.emitConfirm(...)       │
│    │ → interrupt()            ⏸️ 暂停     │
│    │                                      │
│    │  Graph 暂停，控制权回到 handleChat   │
│    │  stream() 停止 yield                 │
│    │  SSE 连接保持（等待 confirm）         │
│    │                                      │
│    │  用户 POST /api/ai/chat/1/confirm    │
│    │  { confirm: true }                   │
│    │                                      │
│    │  AiService.handleConfirm():          │
│    │  1. 创建新的 SseEmitter (新 res)      │
│    │  2. agent.stream(                     │
│    │       Command({ resume: {confirm:true}}),│
│    │       { configurable: { sseEmitter } })│
│    │     )                                │
│    │                                      │
│    │  Graph 恢复 ▶️                        │
│    │  interrupt() 返回 { confirm: true }  │
│    │  → PostService.delete(42)            │
│    │  → sseEmitter.emitToolResult(...)    │
│    ▼                                     │
│  [agent node]                            │
│    │ LLM: "已删除文章《test》"            │
│    ▼                                     │
│  [END] → sseEmitter.emitDone()            │
└─────────────────────────────────────────┘
```

---

## 6. LangGraph Agent 实现

### 6.1 AgentState 定义

```typescript
// packages/ai-agent/src/agent/state.ts

import { BaseMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
});
```

> `AgentState` 只包含 `messages`。确认状态由 `interrupt()` 机制管理，不需要放入 State。

### 6.2 Graph 节点

```typescript
// packages/ai-agent/src/agent/nodes.ts

import { AIMessage, ToolMessage } from '@langchain/core/messages';
import { StructuredTool } from '@langchain/core/tools';
import { RunnableConfig } from '@langchain/core/runnables';
import { interrupt } from '@langchain/langgraph';

/**
 * 构建 callAgent 节点（闭包注入 modelWithTools）
 */
export function makeCallAgent(
  modelWithTools: ReturnType<BaseChatModel['bindTools']>,
) {
  return async (state: typeof AgentState.State, config: RunnableConfig) => {
    const response = await modelWithTools.invoke(state.messages, config);
    return { messages: [response] };
  };
}

/**
 * 构建 executeTool 节点（闭包注入 tools 和危险操作标记）
 */
export function makeExecuteTool(
  tools: StructuredTool[],
  dangerousToolNames: Set<string>,
) {
  const toolMap = new Map(tools.map((t) => [t.name, t]));

  return async (state: typeof AgentState.State, config: RunnableConfig) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const toolCalls = (lastMessage as AIMessage).tool_calls ?? [];
    const sseEmitter = config.configurable?.sseEmitter as
      SseEmitter | undefined;
    const results: ToolMessage[] = [];

    for (const tc of toolCalls) {
      const isDangerous = dangerousToolNames.has(tc.name);

      if (isDangerous) {
        // 通知前端弹出确认框
        const confirmMessage = generateConfirmMessage(tc.name, tc.args);
        sseEmitter?.emitConfirm(tc.name, tc.args, confirmMessage);

        // 暂停 Graph，等待用户确认
        // 恢复时 interrupt() 返回 Command({ resume }) 中的 resume 值
        const decision = (interrupt({
          type: 'confirm',
          toolName: tc.name,
          toolArgs: tc.args,
        }) ?? { confirm: false }) as { confirm: boolean };

        if (!decision.confirm) {
          results.push(
            new ToolMessage({
              tool_call_id: tc.id!,
              content: '用户取消了此操作',
            }),
          );
          continue;
        }
        // 用户确认 → 继续执行
      }

      // 执行 Tool
      const tool = toolMap.get(tc.name);
      if (!tool) {
        results.push(
          new ToolMessage({
            tool_call_id: tc.id!,
            content: `未知工具: ${tc.name}`,
          }),
        );
        continue;
      }

      sseEmitter?.emitToolCall(tc.name, tc.args);
      const result = await tool.invoke(tc.args);
      sseEmitter?.emitToolResult(tc.name, result);

      results.push(
        new ToolMessage({
          tool_call_id: tc.id!,
          content: typeof result === 'string' ? result : JSON.stringify(result),
        }),
      );
    }

    return { messages: results };
  };
}
```

### 6.3 Graph 构建

```typescript
// packages/ai-agent/src/agent/graph.ts

import { StateGraph, END, START } from '@langchain/langgraph';
import { StructuredTool } from '@langchain/core/tools';
import { BaseCheckpointSaver } from '@langchain/langgraph-checkpoint';

import { AgentState } from './state';
import { makeCallAgent, makeExecuteTool } from './nodes';
import { createChatModel } from './chat-model';

export interface BuildAgentOptions {
  llmConfig: LlmConfig;
  tools: StructuredTool[];
  dangerousToolNames: string[];
  checkpointer?: BaseCheckpointSaver;
}

export function buildAgent(options: BuildAgentOptions) {
  const { llmConfig, tools, dangerousToolNames, checkpointer } = options;

  const chatModel = createChatModel(llmConfig);
  const modelWithTools = chatModel.bindTools(tools);

  const callAgent = makeCallAgent(modelWithTools);
  const executeTool = makeExecuteTool(tools, new Set(dangerousToolNames));

  const graph = new StateGraph(AgentState)
    .addNode('agent', callAgent)
    .addNode('tools', executeTool)
    .addEdge(START, 'agent')
    .addConditionalEdges('agent', afterAgent, {
      tools: 'tools',
      end: END,
    })
    .addEdge('tools', 'agent');

  return graph.compile({ checkpointer });
}

function afterAgent(state: typeof AgentState.State): 'tools' | 'end' {
  const lastMessage = state.messages[state.messages.length - 1];
  const toolCalls = (lastMessage as AIMessage).tool_calls;
  if (toolCalls && toolCalls.length > 0) return 'tools';
  return 'end';
}
```

### 6.4 ChatModel 创建

```typescript
// packages/ai-agent/src/agent/chat-model.ts

import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

const PROVIDER_DEFAULTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1',
};

export function createChatModel(config: LlmConfig): BaseChatModel {
  const {
    provider,
    model,
    apiKey,
    baseUrl,
    maxTokens = 4096,
    temperature = 0.7,
  } = config;

  switch (provider) {
    case 'openai':
    case 'deepseek':
      return new ChatOpenAI({
        model,
        apiKey,
        configuration: {
          baseURL: baseUrl || PROVIDER_DEFAULTS[provider],
        },
        maxTokens,
        temperature,
        streaming: true,
      });

    case 'anthropic':
      // Anthropic 使用自己的协议，必须用 ChatAnthropic
      return new ChatAnthropic({
        model,
        apiKey,
        anthropicUrl: baseUrl || undefined,
        maxTokens,
        // temperature 在 Anthropic 中由 ChatAnthropic 内部处理
      });

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
```

### 6.5 MySQL Checkpointer

```typescript
// packages/ai-agent/src/agent/checkpointer.ts

import { BaseCheckpointSaver } from '@langchain/langgraph-checkpoint';
import { RunnableConfig } from '@langchain/core/runnables';

/**
 * MySQL Checkpointer
 *
 * 将 LangGraph checkpoint 序列化到 MySQL，支持跨请求恢复。
 * checkpoint 数据以 JSON 字符串存储在 ai_conversations 表的 checkpoint 字段。
 */
export class MySQLCheckpointer extends BaseCheckpointSaver {
  constructor(private readonly repo: ConversationRepository) {
    super();
  }

  async getTuple(config: RunnableConfig) {
    const threadId = config.configurable?.thread_id;
    if (!threadId) return undefined;

    const row = await this.repo.findCheckpoint(String(threadId));
    if (!row?.checkpoint) return undefined;

    return {
      config: row.config as RunnableConfig,
      checkpoint: JSON.parse(row.checkpoint),
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    };
  }

  async put(
    config: RunnableConfig,
    checkpoint: any,
    metadata: any,
    _newVersions: Record<string, string | number>,
  ): Promise<RunnableConfig> {
    const threadId = config.configurable?.thread_id;
    if (!threadId) return config;

    await this.repo.upsertCheckpoint({
      threadId: String(threadId),
      checkpoint: JSON.stringify(checkpoint),
      metadata: JSON.stringify(metadata),
      config: config as Record<string, unknown>,
    });

    return config;
  }
}
```

> `ConversationRepository` 是 `AiService` 传入的适配器，封装对 `conversation` 表的 checkpoint 读写操作。`config` 参数中的 `sseEmitter` 不会被序列化到 checkpoint（它不在 AgentState 中），仅在 `config.configurable` 中传递，每次请求重新注入。

### 6.6 createAgent 入口

```typescript
// packages/ai-agent/src/index.ts

export { buildAgent } from './agent/graph';
export { MySQLCheckpointer } from './agent/checkpointer';
export { createAllTools, dangerousToolNames } from './tools';
export type { ToolServices, ToolFactory } from './tools/types';
export type { AgentConfig, LlmConfig } from './agent/graph';

// 便捷入口
export function createAgent(config: AgentConfig) {
  const tools = createAllTools(config.services);
  return buildAgent({
    llmConfig: config.llmConfig,
    tools,
    dangerousToolNames: config.dangerousToolNames,
    checkpointer: config.checkpointer,
  });
}
```

---

## 7. Tool 系统设计

### 7.1 Tool 定义规范

```typescript
// packages/ai-agent/src/tools/types.ts

import { z } from 'zod';
import { StructuredTool } from '@langchain/core/tools';

export type ToolFactory = (services: ToolServices) => StructuredTool;

// ToolServices 接口见 4.2 节
```

每个 Tool 工厂函数：

1. 接收 `ToolServices` 参数
2. 返回一个继承 `StructuredTool` 的匿名类实例
3. 必须有 `name`（snake_case）、`description`（详细的功能描述）、`schema`（zod object）
4. `_call()` 方法中调用 `services.xxxService.xxx()` 执行业务逻辑
5. 返回值使用 `JSON.stringify()` 序列化为字符串

### 7.2 Tool 实现示例

```typescript
// packages/ai-agent/src/tools/post.tool.ts

import { z } from 'zod';
import { StructuredTool } from '@langchain/core/tools';
import { ToolServices } from './types';

// ========== search_posts ==========

export function createSearchPostsTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = 'search_posts';
    description =
      '搜索文章列表。支持按关键词、状态、分类ID、标签ID、时间范围筛选。返回分页结果，每篇文章包含 id、标题、状态、分类名、标签名、创建时间。';
    schema = z.object({
      keyword: z.string().optional().describe('搜索关键词，匹配标题和内容'),
      status: z.enum(['published', 'draft', 'all']).optional().default('all'),
      categoryId: z.number().optional().describe('分类ID'),
      tagId: z.number().optional().describe('标签ID'),
      startDate: z.string().optional().describe('开始日期，格式 YYYY-MM-DD'),
      endDate: z.string().optional().describe('结束日期，格式 YYYY-MM-DD'),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(10),
    });

    async _call(args: z.infer<typeof this.schema>) {
      const result = await services.postService.findPage({
        keyword: args.keyword,
        status: args.status,
        categoryId: args.categoryId,
        tagId: args.tagId,
        startDate: args.startDate,
        endDate: args.endDate,
        page: args.page,
        limit: args.limit,
      });
      return JSON.stringify({
        items: result.items.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          categoryName: p.category?.name,
          tags: p.tags?.map((t) => t.name),
          createdAt: p.createdAt,
        })),
        total: result.total,
        page: args.page,
        limit: args.limit,
      });
    }
  })();
}

// ========== get_post ==========

export function createGetPostTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = 'get_post';
    description =
      '获取单篇文章的完整内容，包括标题、正文、分类、标签、摘要、封面图等所有字段。';
    schema = z.object({
      id: z.number().describe('文章ID'),
    });

    async _call(args: z.infer<typeof this.schema>) {
      const post = await services.postService.findOne(args.id);
      if (!post) return JSON.stringify({ error: '文章不存在' });
      return JSON.stringify(post);
    }
  })();
}

// ========== delete_post ==========

export function createDeletePostTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = 'delete_post';
    description = '永久删除文章，不可恢复。删除前会请求用户确认。';
    schema = z.object({
      id: z.number().describe('要删除的文章ID'),
    });

    async _call(args: z.infer<typeof this.schema>) {
      const post = await services.postService.findOne(args.id);
      if (!post) return JSON.stringify({ error: '文章不存在' });
      await services.postService.delete(args.id);
      return JSON.stringify({
        success: true,
        message: `已删除文章《${post.title}》`,
      });
    }
  })();
}
```

### 7.3 Tool 注册表

```typescript
// packages/ai-agent/src/tools/index.ts

import { ToolFactory, ToolServices } from './types';
import { StructuredTool } from '@langchain/core/tools';

// 文章 9
import {
  createSearchPostsTool,
  createGetPostTool,
  createCreatePostTool,
  createUpdatePostTool,
  createDeletePostTool,
  createPublishPostTool,
  createUnpublishPostTool,
  createTopPostTool,
  createUntopPostTool,
} from './post.tool';
// 分类 4
import {
  createGetCategoriesTool,
  createCreateCategoryTool,
  createUpdateCategoryTool,
  createDeleteCategoryTool,
} from './category.tool';
// 标签 4
import {
  createGetTagsTool,
  createCreateTagTool,
  createUpdateTagTool,
  createDeleteTagTool,
} from './tag.tool';
// 评论 5
import {
  createGetCommentsTool,
  createApproveCommentTool,
  createRejectCommentTool,
  createReplyCommentTool,
  createDeleteCommentTool,
} from './comment.tool';
// 友链 4
import {
  createGetFriendLinksTool,
  createApproveFriendLinkTool,
  createRejectFriendLinkTool,
  createDeleteFriendLinkTool,
} from './friend-link.tool';
// 留言 3
import {
  createGetGuestMessagesTool,
  createReplyGuestMessageTool,
  createDeleteGuestMessageTool,
} from './guest-message.tool';
// 公告 3
import {
  createGetAnnouncementsTool,
  createCreateAnnouncementTool,
  createDeleteAnnouncementTool,
} from './announcement.tool';
// 更新日志 3
import {
  createGetChangelogsTool,
  createCreateChangelogTool,
  createDeleteChangelogTool,
} from './changelog.tool';
// 站点配置 8
import {
  createGetSiteConfigTool,
  createUpdateSiteConfigTool,
  createGetSeoSettingsTool,
  createUpdateSeoSettingsTool,
  createGetIcpInfoTool,
  createUpdateIcpInfoTool,
  createGetSettingTool,
  createUpdateSettingTool,
} from './site-config.tool';
// 访问统计 3
import {
  createGetVisitorDashboardTool,
  createGetVisitorLogsTool,
  createGetOnlineVisitorsTool,
} from './visitor.tool';
// 数据管理 2
import {
  createExportDataTool,
  createImportDataTool,
} from './data-transfer.tool';
// OSS 1
import { createGetOssSignUrlTool } from './oss.tool';
// 写作辅助 10
import {
  createContinueWriteTool,
  createPolishTextTool,
  createSummarizeTextTool,
  createGenerateTitleTool,
  createGenerateOutlineTool,
  createSuggestTagsTool,
  createGenerateSeoMetaTool,
  createReviewArticleTool,
  createTranslateTextTool,
  createImitateStyleTool,
} from './writing.tool';

/** 所有 Tool 工厂（59 个） */
export const allToolFactories: ToolFactory[] = [
  createSearchPostsTool,
  createGetPostTool,
  createCreatePostTool,
  createUpdatePostTool,
  createDeletePostTool,
  createPublishPostTool,
  createUnpublishPostTool,
  createTopPostTool,
  createUntopPostTool,
  createGetCategoriesTool,
  createCreateCategoryTool,
  createUpdateCategoryTool,
  createDeleteCategoryTool,
  createGetTagsTool,
  createCreateTagTool,
  createUpdateTagTool,
  createDeleteTagTool,
  createGetCommentsTool,
  createApproveCommentTool,
  createRejectCommentTool,
  createReplyCommentTool,
  createDeleteCommentTool,
  createGetFriendLinksTool,
  createApproveFriendLinkTool,
  createRejectFriendLinkTool,
  createDeleteFriendLinkTool,
  createGetGuestMessagesTool,
  createReplyGuestMessageTool,
  createDeleteGuestMessageTool,
  createGetAnnouncementsTool,
  createCreateAnnouncementTool,
  createDeleteAnnouncementTool,
  createGetChangelogsTool,
  createCreateChangelogTool,
  createDeleteChangelogTool,
  createGetSiteConfigTool,
  createUpdateSiteConfigTool,
  createGetSeoSettingsTool,
  createUpdateSeoSettingsTool,
  createGetIcpInfoTool,
  createUpdateIcpInfoTool,
  createGetSettingTool,
  createUpdateSettingTool,
  createGetVisitorDashboardTool,
  createGetVisitorLogsTool,
  createGetOnlineVisitorsTool,
  createExportDataTool,
  createImportDataTool,
  createGetOssSignUrlTool,
  createContinueWriteTool,
  createPolishTextTool,
  createSummarizeTextTool,
  createGenerateTitleTool,
  createGenerateOutlineTool,
  createSuggestTagsTool,
  createGenerateSeoMetaTool,
  createReviewArticleTool,
  createTranslateTextTool,
  createImitateStyleTool,
];

/** 危险操作 Tool 名称 */
export const dangerousToolNames = new Set([
  'delete_post',
  'delete_category',
  'delete_tag',
  'delete_comment',
  'delete_friend_link',
  'delete_guest_message',
  'delete_announcement',
  'delete_changelog',
  'import_data',
]);

/** 构建所有 Tool 实例 */
export function createAllTools(services: ToolServices): StructuredTool[] {
  return allToolFactories.map((factory) => factory(services));
}
```

### 7.4 写作辅助 Tool 的特殊处理

写作类 Tool 不调用业务 Service，而是直接调用 LLM：

```typescript
// packages/ai-agent/src/tools/writing.tool.ts

export function createPolishTextTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = 'polish_text';
    description = '润色文本，优化表达、修正语法、提升流畅度，保持原意不变。';
    schema = z.object({
      text: z.string().describe('需要润色的原始文本'),
      style: z
        .enum(['formal', 'casual', 'academic'])
        .optional()
        .describe('润色风格：formal=正式, casual=口语化, academic=学术'),
    });

    async _call(args: z.infer<typeof this.schema>) {
      // 写作类 Tool 内部调用 LLM，不通过业务 Service
      // 注意：此处的 model 是独立创建的，不带 Tool binding
      const model = createChatModel(getLlmConfig());
      const prompt = POLISH_PROMPTS[args.style ?? 'formal'];
      const response = await model.invoke([
        new SystemMessage(prompt),
        new HumanMessage(args.text),
      ]);
      return (response.content as string) ?? '';
    }
  })();
}
```

> **注意**：写作 Tool 内部调用的 LLM 需要与 Agent 主 LLM 共享配置。`getLlmConfig()` 从模块级变量读取，由 `createAgent()` 时设置。写作 Tool 的 LLM 调用不绑定 Tools（避免递归调用），且不走 streaming。

---

## 8. 会话管理

### 8.1 数据模型

```typescript
// apps/server/src/modules/ai/conversation.entity.ts

@Entity('ai_conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'AI 自动生成的标题',
  })
  title: string;

  @Column({ name: 'user_id', type: 'int', comment: '所属用户' })
  userId: number;

  @Column({ type: 'json', nullable: true, comment: '完整消息历史' })
  messages: ConversationMessage[];

  @Column({
    type: 'text',
    nullable: true,
    comment: 'LangGraph checkpoint 序列化数据',
  })
  checkpoint: string;

  @Column({ type: 'json', nullable: true, comment: 'Checkpoint metadata' })
  checkpointMetadata: string;

  @Column({ type: 'json', nullable: true, comment: 'Checkpoint config' })
  checkpointConfig: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: { name: string; args: Record<string, unknown>; id: string }[];
  toolResult?: { name: string; result: unknown };
  createdAt: string;
}
```

### 8.2 会话生命周期

```
新会话
  │  用户发第一条消息
  ▼
┌─────────────────┐
│ 创建 Conversation │  title = null, messages = []
│ thread_id = id   │
└────────┬────────┘
         │  AI 第一轮回复后
         ▼
┌─────────────────┐
│ 自动生成标题     │  setImmediate() 异步调用 LLM
│ (非阻塞)         │  根据首轮对话生成 title（≤20字）
└────────┬────────┘
         │  用户继续对话
         ▼
┌─────────────────┐
│ 追加消息 +       │  handleChat 结束后持久化 messages
│ 更新 checkpoint │  MySQLCheckpointer 自动更新 checkpoint
└────────┬────────┘
         │  用户关闭/切换
         ▼
┌─────────────────┐
│ 会话保留         │  数据持久化到 MySQL
│                 │  用户可随时从列表恢复
└────────┬────────┘
         │  用户删除
         ▼
┌─────────────────┐
│ 删除会话         │  DELETE /api/ai/conversations/:id
└─────────────────┘
```

### 8.3 恢复会话

```typescript
// AiService.resumeConversation()

async resumeConversation(conversationId: number, userId: number) {
  const conversation = await this.conversationRepo.findOne({
    where: { id: conversationId, userId },
  });
  if (!conversation) throw new NotFoundException("会话不存在");

  // LangGraph checkpointer 有 checkpoint 数据时会自动恢复
  // 无需手动加载 messages
  return conversation;
}
```

恢复会话时，只需传入 `thread_id`。Graph 的 checkpointer 自动从 MySQL 加载 checkpoint 并恢复状态。`messages` 字段是冗余存储，用于前端展示历史消息列表。

---

## 9. LLM 动态配置

### 9.1 AiService 配置加载

```typescript
// apps/server/src/modules/ai/ai.service.ts

@Injectable()
export class AiService {
  private agentCache: {
    configId: number;
    agent: ReturnType<typeof buildAgent>;
  } | null = null;

  constructor(
    @InjectRepository(AiConfig)
    private readonly configRepo: Repository<AiConfig>,
    @InjectRepository(AiUsage) private readonly usageRepo: Repository<AiUsage>,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    // 业务 Services
    private readonly postService: PostService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly commentService: CommentService,
    private readonly friendLinkService: FriendLinkService,
    private readonly guestMessageService: GuestMessageService,
    private readonly announcementService: AnnouncementService,
    private readonly changelogService: ChangelogService,
    private readonly siteConfigService: SiteConfigService,
    private readonly seoSettingService: SeoSettingService,
    private readonly icpInfoService: IcpInfoService,
    private readonly settingService: SettingService,
    private readonly visitorService: VisitorService,
    private readonly dataTransferService: DataTransferService,
    private readonly ossService: OssService,
  ) {}

  private async getOrCreateAgent(): Promise<ReturnType<typeof buildAgent>> {
    const activeConfig = await this.configRepo.findOne({
      where: { isActive: true },
    });

    if (!activeConfig) {
      throw new BadRequestException('没有启用的 AI 模型配置，请先在后台配置');
    }

    if (this.agentCache?.configId === activeConfig.id) {
      return this.agentCache.agent;
    }

    const agent = createAgent({
      llmConfig: {
        provider: activeConfig.provider,
        model: activeConfig.model,
        apiKey: decrypt(activeConfig.apiKey),
        baseUrl: activeConfig.baseUrl,
        maxTokens: activeConfig.maxTokens,
        temperature: activeConfig.temperature,
      },
      services: {
        postService: this.postService,
        categoryService: this.categoryService,
        tagService: this.tagService,
        commentService: this.commentService,
        friendLinkService: this.friendLinkService,
        guestMessageService: this.guestMessageService,
        announcementService: this.announcementService,
        changelogService: this.changelogService,
        siteConfigService: this.siteConfigService,
        seoSettingService: this.seoSettingService,
        icpInfoService: this.icpInfoService,
        settingService: this.settingService,
        visitorService: this.visitorService,
        dataTransferService: this.dataTransferService,
        ossService: this.ossService,
      },
      dangerousToolNames: [...dangerousToolNames],
      checkpointer: new MySQLCheckpointer({
        findCheckpoint: (threadId: string) =>
          this.conversationRepo.findOne({ where: { id: Number(threadId) } }),
        upsertCheckpoint: (data: {
          threadId: string;
          checkpoint: string;
          metadata: string;
          config: Record<string, unknown>;
        }) =>
          this.conversationRepo.update(
            { id: Number(data.threadId) },
            {
              checkpoint: data.checkpoint,
              checkpointMetadata: data.metadata,
              checkpointConfig: JSON.stringify(data.config),
            },
          ),
      }),
    });

    this.agentCache = { configId: activeConfig.id, agent };
    return agent;
  }

  // 配置变更时清除缓存
  async activateConfig(id: number) {
    // ... 原有切换逻辑
    this.agentCache = null;
  }
}
```

### 9.2 ChatModel 创建

见 6.4 节。支持三种 provider：

- `openai` / `deepseek`：使用 `ChatOpenAI`（OpenAI 兼容协议）
- `anthropic`：使用 `ChatAnthropic`（Anthropic 原生协议）

---

## 10. 流式输出与 SSE

### 10.1 SSE 事件类型

| 事件类型      | 前端表现               | 触发机制                                                          |
| ------------- | ---------------------- | ----------------------------------------------------------------- |
| `token`       | 逐字追加到聊天消息     | LangChain callback `handleLLMNewToken`                            |
| `tool_call`   | 显示 "正在执行 XXX..." | `executeTool` 节点调用 `sseEmitter.emitToolCall()`                |
| `tool_result` | 替换为执行结果摘要     | `executeTool` 节点调用 `sseEmitter.emitToolResult()`              |
| `confirm`     | 弹出确认对话框         | `executeTool` 节点检测到危险操作时调用 `sseEmitter.emitConfirm()` |
| `done`        | 消息结束，恢复输入框   | `handleChat` 的 `for await` 循环结束后                            |
| `error`       | 显示错误提示           | 任何异常 catch 块                                                 |

### 10.2 SSE 事件格式

```
event: token
data: {"type":"token","content":"帮"}

event: token
data: {"type":"token","content":"你"}

event: tool_call
data: {"type":"tool_call","tool":"search_posts","args":{"keyword":"Docker","status":"published"}}

event: tool_result
data: {"type":"tool_result","tool":"search_posts","result":{"items":[...],"total":3}}

event: token
data: {"type":"token","content":"找到"}

event: done
data: {"type":"done"}
```

### 10.3 NestJS Controller 实现

```typescript
// apps/server/src/modules/ai/ai.controller.ts

@Post('chat')
@UseGuards(JwtAuthGuard)
async chat(
  @Body() dto: ChatDto,
  @Res() res: Response,
  @Req() req: AuthenticatedRequest,
) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const sseEmitter: SseEmitter = {
    emitToken: (content) => {
      res.write(`event: token\ndata: ${JSON.stringify({ type: 'token', content })}\n\n`);
    },
    emitToolCall: (tool, args) => {
      res.write(`event: tool_call\ndata: ${JSON.stringify({ type: 'tool_call', tool, args })}\n\n`);
    },
    emitToolResult: (tool, result) => {
      res.write(`event: tool_result\ndata: ${JSON.stringify({ type: 'tool_result', tool, result })}\n\n`);
    },
    emitConfirm: (tool, args, message) => {
      res.write(`event: confirm\ndata: ${JSON.stringify({ type: 'confirm', tool, args, message })}\n\n`);
    },
    emitDone: () => {
      res.write(`event: done\ndata: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    },
    emitError: (message) => {
      res.write(`event: error\ndata: ${JSON.stringify({ type: 'error', message })}\n\n`);
      res.end();
    },
  };

  try {
    await this.aiService.handleChat(
      dto.message,
      dto.conversationId ?? null,
      req.user.id,
      sseEmitter,
    );
  } catch (error) {
    sseEmitter.emitError(error.message);
  }
}
```

### 10.4 AiService 核心聊天逻辑

```typescript
// apps/server/src/modules/ai/ai.service.ts

async handleChat(
  message: string,
  conversationId: number | null,
  userId: number,
  sseEmitter: SseEmitter,
) {
  // 1. 获取或创建会话
  let conversation: Conversation;
  if (conversationId) {
    conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, userId },
    });
    if (!conversation) throw new NotFoundException("会话不存在");
  } else {
    conversation = this.conversationRepo.create({ userId, messages: [] });
    await this.conversationRepo.save(conversation);
  }

  // 2. 构建 Agent
  const agent = await this.getOrCreateAgent();

  // 3. 创建 LangChain callbacks（token → SSE）
  const callbacks = [{
    handleLLMNewToken(token: string) {
      sseEmitter.emitToken(token);
    },
  }];

  // 4. 执行 Agent（streaming + callbacks）
  const stream = await agent.stream(
    { messages: [new HumanMessage(message)] },
    {
      configurable: {
        thread_id: String(conversation.id),
        sseEmitter, // 注入到节点中
      },
      callbacks,
    },
  );

  // 5. 消费 stream 保持连接
  for await (const _chunk of stream) {
    // 所有 SSE 事件由 callbacks 和节点内部 sseEmitter 发出
    // 此循环仅用于保持 HTTP 连接不关闭
  }

  // 6. 保存消息到会话
  await this.persistMessages(conversation, message, stream);

  // 7. 新会话 → 非阻塞生成标题
  if (!conversation.title) {
    setImmediate(() => this.generateTitle(conversation));
  }

  sseEmitter.emitDone();
}

private async persistMessages(
  conversation: Conversation,
  _userMessage: string,
  _stream: any,
) {
  // 从 checkpoint 中读取最终消息列表并保存到 messages 字段
  // 具体实现见实施阶段
  await this.conversationRepo.update(
    { id: conversation.id },
    { updatedAt: new Date() },
  );
}

private async generateTitle(conversation: Conversation) {
  try {
    const agent = await this.getOrCreateAgent();
    // 使用简单的 LLM 调用生成标题，不通过 Agent（避免 Tool 调用）
    const title = await this.generateTitleWithLLM(conversation);
    await this.conversationRepo.update(
      { id: conversation.id },
      { title: title.slice(0, 200) },
    );
  } catch (error) {
    this.logger.warn(`生成会话标题失败: ${error.message}`);
  }
}
```

### 10.5 handleConfirm 实现

```typescript
// apps/server/src/modules/ai/ai.service.ts

async handleConfirm(
  conversationId: number,
  confirm: boolean,
  sseEmitter: SseEmitter,
) {
  const agent = await this.getOrCreateAgent();

  const callbacks = [{
    handleLLMNewToken(token: string) {
      sseEmitter.emitToken(token);
    },
  }];

  // 使用 Command({ resume }) 恢复 Graph
  // interrupt() 会返回 { confirm: true/false }
  const stream = await agent.stream(
    new Command({ resume: { confirm } }),
    {
      configurable: {
        thread_id: String(conversationId),
        sseEmitter, // 新 HTTP 请求的新 emitter
      },
      callbacks,
    },
  );

  for await (const _chunk of stream) {
    // 保持连接
  }

  sseEmitter.emitDone();
}
```

> **关键点**：`handleConfirm` 是新的 HTTP 请求，创建新的 `sseEmitter`（绑定新的 `res`）。通过 `config.configurable.sseEmitter` 注入到 Graph 节点中。旧请求的 SSE 连接在 `emitConfirm` 后保持打开，前端收到 confirm 事件后关闭旧连接，建立新连接发送 confirm 请求。

---

## 11. 危险操作确认机制

### 11.1 确认流程

```
Agent 决策调用 delete_post(42)
        │
        ▼
┌───────────────────────────────┐
│ executeTool 节点              │
│                               │
│ 检查: delete_post ∈ dangerous │
│                               │
│ → sseEmitter.emitConfirm(     │
│     "delete_post",            │
│     { id: 42 },               │
│     "确认删除文章《XXXX》？"   │
│   )                           │
│                               │
│ → interrupt({ type: "confirm",│
│     toolName: "delete_post",  │
│     toolArgs: { id: 42 } })  │
│                               │
│ ⏸️ Graph 暂停                  │
│ ⏸️ handleChat 的 stream 停止   │
│ ⏸️ SSE 连接保持（旧连接）      │
└───────────────────────────────┘
        │
        │  前端收到 confirm 事件
        │  弹出确认框
        │  用户点击"确认"
        │  关闭旧 SSE 连接
        │
        ▼
┌───────────────────────────────────┐
│ POST /api/ai/chat/1/confirm      │
│ { confirm: true }                │
│                                  │
│ → AiService.handleConfirm()      │
│ → 创建新 SseEmitter (新 res)     │
│ → agent.stream(                  │
│     Command({ resume: { confirm: true }}),│
│     { configurable: { sseEmitter: new }} │
│   )                              │
│                                  │
│ Graph 恢复 ▶️                     │
│ → interrupt() 返回 { confirm: true }│
│ → 调用 PostService.delete(42)    │
│ → sseEmitter.emitToolResult(...) │
│ → 回到 agent 节点                │
│ → LLM 生成回复 (handleLLMNewToken)│
│ → sseEmitter.emitDone()          │
└───────────────────────────────────┘
```

### 11.2 Confirm API

```typescript
// apps/server/src/modules/ai/ai.controller.ts

@Post('chat/:conversationId/confirm')
@UseGuards(JwtAuthGuard)
async confirm(
  @Param('conversationId') conversationId: number,
  @Body() dto: ConfirmDto,
  @Res() res: Response,
) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const sseEmitter = this.createSseEmitter(res);

  try {
    await this.aiService.handleConfirm(
      conversationId,
      dto.confirm,
      sseEmitter,
    );
  } catch (error) {
    sseEmitter.emitError(error.message);
  }
}
```

```typescript
// ConfirmDto
export class ConfirmDto {
  @IsBoolean()
  confirm: boolean;
}
```

---

## 12. API 设计

### 12.1 完整端点列表

| 端点                                   | 方法   | 认证             | 说明                       |
| -------------------------------------- | ------ | ---------------- | -------------------------- |
| `/api/ai/chat`                         | POST   | JWT              | 发送消息，SSE 流式返回     |
| `/api/ai/chat/:conversationId/confirm` | POST   | JWT              | 确认/拒绝危险操作          |
| `/api/ai/conversations`                | GET    | JWT              | 获取当前用户会话列表       |
| `/api/ai/conversations/:id`            | GET    | JWT              | 获取会话详情（含消息历史） |
| `/api/ai/conversations/:id`            | DELETE | JWT              | 删除会话                   |
| `/api/ai/configs`                      | GET    | JWT              | 获取 AI 配置列表（已有）   |
| `/api/ai/configs/save`                 | POST   | JWT + SuperAdmin | 保存配置（已有）           |
| `/api/ai/configs/:id`                  | DELETE | JWT + SuperAdmin | 删除配置（已有）           |
| `/api/ai/configs/:id/activate`         | PATCH  | JWT + SuperAdmin | 激活配置（已有）           |
| `/api/ai/usage`                        | GET    | JWT              | 用量统计（已有）           |

### 12.2 请求/响应示例

#### POST /api/ai/chat

```json
// Request
{
  "message": "帮我查一下最近发布的文章",
  "conversationId": null
}
```

#### GET /api/ai/conversations

```json
// Response
{
  "items": [
    {
      "id": 1,
      "title": "关于 Docker 部署的讨论",
      "lastMessagePreview": "已删除文章《test》",
      "createdAt": "2026-07-30T09:00:00.000Z",
      "updatedAt": "2026-07-30T09:15:00.000Z"
    }
  ],
  "total": 1
}
```

> `lastMessagePreview` 是计算字段，取 `messages` 数组最后一条非 system 消息的 content 前 50 字。

#### POST /api/ai/chat/:conversationId/confirm

```json
// Request
{ "confirm": true }
```

---

## 13. 错误处理

### 13.1 错误分类

| 类别              | 示例                                  | 处理方式                                         |
| ----------------- | ------------------------------------- | ------------------------------------------------ |
| **LLM 调用错误**  | API Key 无效、余额不足、超时          | `emitError()` → 前端显示错误提示                 |
| **Tool 执行错误** | 文章不存在、分类下有文章无法删除      | 返回 JSON 错误信息给 LLM，Agent 自行调整         |
| **配置错误**      | 没有激活的 AI 配置                    | 立即返回错误，提示去配置                         |
| **会话错误**      | conversationId 不存在或不属于当前用户 | 返回 404                                         |
| **确认超时**      | 用户长时间不确认                      | 5 分钟后 SSE 连接超时关闭，checkpoint 保留可恢复 |

### 13.2 Tool 错误处理

Tool 执行失败时**不抛异常**，而是返回错误信息给 LLM 让它自行决策：

```typescript
async _call(args) {
  try {
    const result = await services.postService.delete(args.id);
    return JSON.stringify({ success: true });
  } catch (error) {
    return JSON.stringify({
      error: true,
      message: error.message,
      suggestion: "该文章可能已被删除，请检查文章列表",
    });
  }
}
```

### 13.3 SSE 连接中断处理

```typescript
req.on('close', () => {
  this.logger.warn(`SSE connection closed for conversation ${conversationId}`);
  // Graph 的 interrupt 状态已保存在 checkpointer，可恢复
});
```

---

## 14. 安全设计

### 14.1 认证

- 所有 AI 端点使用 `@UseGuards(JwtAuthGuard)` 保护
- 配置管理额外使用 `@UseGuards(SuperAdminGuard)`

### 14.2 速率限制

在 Controller 方法上使用 `@Throttle()` 装饰器：

```typescript
import { Throttle } from '@nestjs/throttler';

@Post('chat')
@UseGuards(JwtAuthGuard)
@Throttle({ default: { ttl: 60000, limit: 20 } }) // 每分钟 20 次
async chat(@Body() dto: ChatDto, @Res() res: Response, @Req() req: AuthenticatedRequest) {
  // ...
}
```

### 14.3 用户隔离

- 会话按 `userId` 隔离，所有查询都带 `userId` 条件
- Tool 操作记录到 `ai_usage_logs` 时关联 `conversation_id` 和 `user_id`

### 14.4 API Key 安全

- 已有 AES-256-GCM 加密存储，不变
- 返回给前端的 API Key 始终脱敏（maskKey）

### 14.5 审计日志

扩展 `ai_usage_logs` 表：

| 新增字段          | 类型        | 说明             |
| ----------------- | ----------- | ---------------- |
| `conversation_id` | INT         | 关联会话         |
| `user_id`         | INT         | 操作用户         |
| `tool_name`       | VARCHAR(50) | 调用的 Tool 名称 |
| `tool_args`       | JSON        | Tool 调用参数    |

---

## 15. 实施计划

### Phase 1：基础设施（1-2 天）

| 任务                         | 说明                                                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 创建 `packages/ai-agent` | 初始化 package.json、tsconfig.json                                                                                               |
| 1.2 安装依赖                 | `@langchain/core`, `@langchain/langgraph`, `@langchain/langgraph-checkpoint`, `@langchain/openai`, `@langchain/anthropic`, `zod` |
| 1.3 定义核心类型             | `AgentState`, `ToolFactory`, `ToolServices`, `LlmConfig`, `SseEmitter`                                                           |
| 1.4 实现 `createChatModel()` | 三种 provider 的 ChatModel 创建                                                                                                  |
| 1.5 实现 Graph               | `buildAgent()`, `makeCallAgent()`, `makeExecuteTool()`                                                                           |
| 1.6 实现 System Prompt       | 定义 Agent 角色、能力边界、行为规范                                                                                              |

### Phase 2：核心 Tool 实现（2-3 天）

| 任务                 | Tool 数量 |
| -------------------- | --------- |
| 2.1 文章管理 Tool    | 9         |
| 2.2 分类 & 标签 Tool | 8         |
| 2.3 写作辅助 Tool    | 10        |
| 2.4 站点配置 Tool    | 8         |

### Phase 3：扩展 Tool 实现（1-2 天）

| 任务                       | Tool 数量 |
| -------------------------- | --------- |
| 3.1 评论管理 Tool          | 5         |
| 3.2 友链管理 Tool          | 4         |
| 3.3 留言管理 Tool          | 3         |
| 3.4 公告 & 更新日志 Tool   | 6         |
| 3.5 统计 & 数据 & OSS Tool | 6         |

### Phase 4：NestJS 集成（1-2 天）

| 任务                       | 说明                                                    |
| -------------------------- | ------------------------------------------------------- |
| 4.1 重构 AiModule          | 精简 controller/service，移除旧的直接 API 调用逻辑      |
| 4.2 实现 AiService         | `handleChat()`, `handleConfirm()`, `getOrCreateAgent()` |
| 4.3 实现 SSE endpoint      | `/api/ai/chat` 流式响应                                 |
| 4.4 实现 Confirm endpoint  | `/api/ai/chat/:id/confirm`                              |
| 4.5 实现 Conversation CRUD | `conversation.entity` + 列表/详情/删除 API              |
| 4.6 实现 MySQLCheckpointer | 适配器传入 AiService                                    |

### Phase 5：会话与记忆（1 天）

| 任务             | 说明                                             |
| ---------------- | ------------------------------------------------ |
| 5.1 消息持久化   | `persistMessages()` 从 checkpoint 提取消息并保存 |
| 5.2 自动标题生成 | `setImmediate()` 异步生成标题                    |
| 5.3 会话恢复     | 通过 checkpointer 自动恢复，无需额外代码         |

### Phase 6：测试与优化（1-2 天）

| 任务         | 说明                              |
| ------------ | --------------------------------- |
| 6.1 单元测试 | Tool 函数测试、Graph 节点测试     |
| 6.2 集成测试 | Agent 完整流程 + confirm 流程测试 |
| 6.3 人工测试 | 实际对话验证各种场景              |
| 6.4 性能优化 | Tool 调用并发、Token 消耗优化     |

**总工期预估：7-12 天**

---

## 16. 测试策略

### 16.1 单元测试

```typescript
// packages/ai-agent/src/tools/__tests__/post.tool.spec.ts

describe('createSearchPostsTool', () => {
  it('should call postService.findPage with correct args', async () => {
    const mockPostService = {
      findPage: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    };
    const tool = createSearchPostsTool({ postService: mockPostService } as any);
    await tool._call({ keyword: 'Docker', status: 'published' });
    expect(mockPostService.findPage).toHaveBeenCalledWith({
      keyword: 'Docker',
      status: 'published',
      page: 1,
      limit: 10,
    });
  });
});
```

### 16.2 Graph 路由测试

```typescript
// packages/ai-agent/src/agent/__tests__/graph.spec.ts

describe('afterAgent', () => {
  it('should route to tools when LLM returns tool_calls', () => {
    const state = {
      messages: [
        new AIMessage({
          tool_calls: [{ name: 'search_posts', args: {}, id: '1' }],
        }),
      ],
    };
    expect(afterAgent(state)).toBe('tools');
  });

  it('should route to end when LLM returns plain text', () => {
    const state = { messages: [new AIMessage('Hello!')] };
    expect(afterAgent(state)).toBe('end');
  });
});
```

### 16.3 集成测试

```typescript
// apps/server/src/modules/ai/ai.service.spec.ts

describe('AiService', () => {
  it('handleChat → handleConfirm → resume flow', async () => {
    // 1. 发送消息触发危险操作
    // 2. 验证 SSE 收到 confirm 事件
    // 3. 调用 handleConfirm({ confirm: true })
    // 4. 验证 Tool 被执行
    // 5. 验证 SSE 收到 done 事件
  });
});
```

---

## 17. 附录

### 17.1 Tool 完整清单

| 模块     | 数量   | Tool 列表                                                                                                                                                                         |
| -------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文章     | 9      | `search_posts`, `get_post`, `create_post`, `update_post`, `delete_post` 🔴, `publish_post`, `unpublish_post`, `top_post`, `untop_post`                                            |
| 分类     | 4      | `get_categories`, `create_category`, `update_category`, `delete_category` 🔴                                                                                                      |
| 标签     | 4      | `get_tags`, `create_tag`, `update_tag`, `delete_tag` 🔴                                                                                                                           |
| 评论     | 5      | `get_comments`, `approve_comment`, `reject_comment`, `reply_comment`, `delete_comment` 🔴                                                                                         |
| 友链     | 4      | `get_friend_links`, `approve_friend_link`, `reject_friend_link`, `delete_friend_link` 🔴                                                                                          |
| 留言     | 3      | `get_guest_messages`, `reply_guest_message`, `delete_guest_message` 🔴                                                                                                            |
| 公告     | 3      | `get_announcements`, `create_announcement`, `delete_announcement` 🔴                                                                                                              |
| 更新日志 | 3      | `get_changelogs`, `create_changelog`, `delete_changelog` 🔴                                                                                                                       |
| 站点配置 | 2      | `get_site_config`, `update_site_config`                                                                                                                                           |
| SEO      | 2      | `get_seo_settings`, `update_seo_settings`                                                                                                                                         |
| ICP      | 2      | `get_icp_info`, `update_icp_info`                                                                                                                                                 |
| 全局设置 | 2      | `get_setting`, `update_setting`                                                                                                                                                   |
| 访问统计 | 3      | `get_visitor_dashboard`, `get_visitor_logs`, `get_online_visitors`                                                                                                                |
| 数据管理 | 2      | `export_data`, `import_data` 🔴                                                                                                                                                   |
| OSS      | 1      | `get_oss_sign_url`                                                                                                                                                                |
| 写作辅助 | 10     | `continue_write`, `polish_text`, `summarize_text`, `generate_title`, `generate_outline`, `suggest_tags`, `generate_seo_meta`, `review_article`, `translate_text`, `imitate_style` |
| **总计** | **59** | 🔴 = 危险操作 9 个                                                                                                                                                                |

### 17.2 System Prompt

```typescript
// packages/ai-agent/src/prompts/system.ts

export const SYSTEM_PROMPT = `你是博客后台的 AI 全能助理。你可以通过自然语言帮助管理员完成以下操作：

## 能力范围

### 文章管理
- 搜索、查看、创建、修改、删除文章
- 发布/下架文章，置顶/取消置顶

### 内容管理
- 管理分类和标签
- 审核评论（通过/拒绝/回复/删除）
- 审核友链申请
- 回复/删除留言
- 管理公告和更新日志

### 站点配置
- 查看/修改站点名称、描述、Logo
- 管理 SEO 元数据
- 管理 ICP 备案信息
- 修改全局设置

### 数据统计
- 查看访问仪表盘（PV/UV/趋势）
- 查看访问记录
- 查看当前在线人数

### 数据管理
- 导出/导入博客数据

### 写作辅助
- 续写、润色、摘要、标题生成
- 大纲生成、标签推荐、SEO 元数据生成
- 全文审阅、翻译、风格模仿

### 文件管理
- 获取 OSS 文件签名 URL

## 行为规范

1. **危险操作需确认**：删除文章、分类、标签、评论、友链、留言、公告、更新日志、导入数据等操作在执行前会自动请求你确认，请等待确认后执行。
2. **先查后改**：修改或删除前，先查询确认目标对象存在。
3. **批量操作**：支持批量处理，如"审核所有待处理的评论"。
4. **回复简洁**：执行完操作后，用简洁的语言告知结果。
5. **错误处理**：遇到错误时如实告知，并给出建议。

## 不可操作

- 不允许操作任何用户信息（创建/修改/删除用户、修改密码、变更角色）
- 如果用户要求操作以上内容，礼貌拒绝并说明原因`;
```

### 17.3 危险操作确认消息模板

```typescript
// packages/ai-agent/src/agent/nodes.ts

function generateConfirmMessage(
  toolName: string,
  args: Record<string, unknown>,
): string {
  const templates: Record<string, (a: any) => string> = {
    delete_post: (a) => `确认删除文章 #${a.id}？此操作不可恢复。`,
    delete_category: (a) => `确认删除分类 #${a.id}？若分类下有文章将无法删除。`,
    delete_tag: (a) => `确认删除标签 #${a.id}？`,
    delete_comment: (a) => `确认删除评论 #${a.id}？`,
    delete_friend_link: (a) => `确认删除友链 #${a.id}？`,
    delete_guest_message: (a) => `确认删除留言 #${a.id}？`,
    delete_announcement: (a) => `确认删除公告 #${a.id}？`,
    delete_changelog: (a) => `确认删除更新日志 #${a.id}？`,
    import_data: () => `确认导入数据？这将覆盖现有数据，请确保已备份。`,
  };
  return templates[toolName]?.(args) ?? `确认执行 ${toolName}？`;
}
```

### 17.4 依赖包版本参考

| 包                                | 版本      | 说明                                       |
| --------------------------------- | --------- | ------------------------------------------ |
| `@langchain/core`                 | `^1.2.0`  | LangChain 核心类型和接口                   |
| `@langchain/langgraph`            | `^1.4.0`  | StateGraph、Annotation、interrupt、Command |
| `@langchain/langgraph-checkpoint` | `^1.1.0`  | BaseCheckpointSaver 基类                   |
| `@langchain/openai`               | `^1.5.0`  | ChatOpenAI，OpenAI 兼容协议                |
| `@langchain/anthropic`            | `^1.5.0`  | ChatAnthropic，Anthropic 原生协议          |
| `zod`                             | `^3.23.0` | Tool Schema 定义                           |

---

> **文档结束**
>
> 下一步：确认方案后，开始 Phase 1 基础设施搭建。
