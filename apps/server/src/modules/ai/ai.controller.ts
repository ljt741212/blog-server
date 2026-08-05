import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { JwtAuthGuard, SuperAdminGuard } from '@/common';

import {
  ChatDto,
  ConfirmDto,
  EditorChatDto,
  SaveAiConfigDto,
  UsageQueryDto,
} from './ai.dto';
import { AiService, type SseEmitter } from './ai.service';

import type { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: { id: number; username: string; role?: number };
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ---- Chat (SSE) ----

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  async chat(
    @Body() dto: ChatDto,
    @Res() res: Response,
    @Req() req: AuthRequest,
  ) {
    this.setupSse(res);

    const emitter = this.createSseEmitter(res);
    const authHeader = req.headers.authorization ?? '';

    try {
      await this.aiService.handleChat(
        dto.message,
        dto.conversationId ?? null,
        req.user?.id ?? 0,
        authHeader,
        emitter,
        dto.temporary ?? false,
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      emitter.emitError(msg);
    }
  }

  // ---- Confirm ----

  @Post('chat/:conversationId/confirm')
  @UseGuards(JwtAuthGuard)
  async confirm(
    @Param('conversationId') conversationId: number,
    @Body() dto: ConfirmDto,
    @Res() res: Response,
  ) {
    this.setupSse(res);

    const emitter = this.createSseEmitter(res);

    try {
      await this.aiService.handleConfirm(conversationId, dto.confirm, emitter);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      emitter.emitError(msg);
    }
  }

  // ---- Conversations ----

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async getConversations(
    @Req() req: AuthRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.aiService.getConversations(
      req.user?.id ?? 0,
      page ?? 1,
      limit ?? 20,
    );
  }

  @Get('conversations/:id')
  @UseGuards(JwtAuthGuard)
  async getConversation(@Param('id') id: number, @Req() req: AuthRequest) {
    return this.aiService.getConversation(id, req.user?.id ?? 0);
  }

  @Delete('conversations/:id')
  @UseGuards(JwtAuthGuard)
  async deleteConversation(@Param('id') id: number, @Req() req: AuthRequest) {
    await this.aiService.deleteConversation(id, req.user?.id ?? 0);
    return { success: true };
  }

  // ---- Configs (保留) ----

  @Get('configs')
  @UseGuards(JwtAuthGuard)
  getConfigs() {
    return this.aiService.getConfigs();
  }

  @Post('configs/save')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  saveConfig(@Body() dto: SaveAiConfigDto) {
    return this.aiService.saveConfig(dto);
  }

  @Delete('configs/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  deleteConfig(@Param('id') id: number) {
    return this.aiService.deleteConfig(id);
  }

  @Patch('configs/:id/activate')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  activateConfig(@Param('id') id: number) {
    return this.aiService.activateConfig(id);
  }

  // ---- Usage (保留) ----

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  getUsage(@Query() query: UsageQueryDto) {
    return this.aiService.getUsage(query);
  }

  // ---- Article Editor ----

  @Post('article-editor/chat')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  async editorChat(
    @Body() dto: EditorChatDto,
    @Res() res: Response,
    @Req() req: AuthRequest,
  ) {
    this.setupSse(res);

    const emitter = this.createSseEmitter(res);

    try {
      await this.aiService.handleEditorChat(
        dto.message,
        dto.editorState,
        dto.conversationId ?? null,
        req.user?.id ?? 0,
        emitter,
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      emitter.emitError(msg);
    }
  }

  @Post('article-editor/chat/:conversationId/confirm')
  @UseGuards(JwtAuthGuard)
  async editorConfirm(
    @Param('conversationId') conversationId: number,
    @Body() dto: ConfirmDto,
    @Res() res: Response,
  ) {
    this.setupSse(res);

    const emitter = this.createSseEmitter(res);

    try {
      await this.aiService.handleEditorConfirm(
        conversationId,
        dto.confirm,
        emitter,
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      emitter.emitError(msg);
    }
  }

  @Get('article-editor/conversations')
  @UseGuards(JwtAuthGuard)
  async getEditorConversations(
    @Req() req: AuthRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.aiService.getConversations(
      req.user?.id ?? 0,
      page ?? 1,
      limit ?? 20,
    );
  }

  // ---- Helpers ----

  private setupSse(res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
  }

  private createSseEmitter(res: Response): SseEmitter {
    return {
      emitToken: (content) => {
        res.write(
          `event: token\ndata: ${JSON.stringify({ type: 'token', content })}\n\n`,
        );
      },
      emitToolCall: (tool, args) => {
        res.write(
          `event: tool_call\ndata: ${JSON.stringify({ type: 'tool_call', tool, args })}\n\n`,
        );
      },
      emitToolResult: (tool, result) => {
        res.write(
          `event: tool_result\ndata: ${JSON.stringify({ type: 'tool_result', tool, result })}\n\n`,
        );
      },
      emitConfirm: (tool, args, message) => {
        res.write(
          `event: confirm\ndata: ${JSON.stringify({ type: 'confirm', tool, args, message })}\n\n`,
        );
      },
      emitDone: (threadId) => {
        res.write(
          `event: done\ndata: ${JSON.stringify({ type: 'done', threadId: threadId ?? null })}\n\n`,
        );
        res.end();
      },
      emitError: (message) => {
        res.write(
          `event: error\ndata: ${JSON.stringify({ type: 'error', message })}\n\n`,
        );
        res.end();
      },
    };
  }
}
