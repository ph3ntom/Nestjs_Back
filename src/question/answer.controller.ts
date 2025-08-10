import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AnswerService } from './answer.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { AnswerResponseDto } from './dto/answer-response.dto';

@Controller('questions/:questionId/answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  async create(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body(ValidationPipe) createAnswerDto: CreateAnswerDto,
    @Request() req,
  ): Promise<AnswerResponseDto> {
    return this.answerService.create(questionId, createAnswerDto, req.session?.user?.mbrId);
  }

  @Get()
  async findByQuestionId(@Param('questionId', ParseIntPipe) questionId: number): Promise<AnswerResponseDto[]> {
    return this.answerService.findByQuestionId(questionId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AnswerResponseDto> {
    return this.answerService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateAnswerDto: UpdateAnswerDto,
    @Request() req,
  ): Promise<AnswerResponseDto> {
    return this.answerService.update(id, updateAnswerDto, req.session?.user?.mbrId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    return this.answerService.remove(id, req.session?.user?.mbrId);
  }

  @Post(':id/vote')
  async vote(
    @Param('id', ParseIntPipe) id: number,
    @Body('direction') direction: 'up' | 'down',
  ): Promise<AnswerResponseDto> {
    return this.answerService.vote(id, direction);
  }

  @Post(':id/accept')
  async accept(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<AnswerResponseDto> {
    return this.answerService.markAsAccepted(id, req.session?.user?.mbrId);
  }
}