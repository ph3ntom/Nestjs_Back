import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionResponseDto } from './dto/question-response.dto';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  async create(
    @Body(ValidationPipe) createQuestionDto: CreateQuestionDto,
    @Request() req,
  ): Promise<QuestionResponseDto> {
    return this.questionService.create(createQuestionDto, req.session?.user?.mbrId);
  }

  @Get()
  async findAll(): Promise<QuestionResponseDto[]> {
    return this.questionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.questionService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateQuestionDto: UpdateQuestionDto,
    @Request() req,
  ): Promise<QuestionResponseDto> {
    return this.questionService.update(id, updateQuestionDto, req.session?.user?.mbrId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    return this.questionService.remove(id, req.session?.user?.mbrId);
  }

  @Post(':id/vote')
  async vote(
    @Param('id', ParseIntPipe) id: number,
    @Body('direction') direction: 'up' | 'down',
  ): Promise<QuestionResponseDto> {
    return this.questionService.vote(id, direction);
  }
}