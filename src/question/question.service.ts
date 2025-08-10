import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { User } from '../auth/entities/user.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionResponseDto } from './dto/question-response.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto, userId: number): Promise<QuestionResponseDto> {
    const user = await this.userRepository.findOne({ where: { mbrId: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const question = this.questionRepository.create({
      ...createQuestionDto,
      userId: userId,
    });

    const savedQuestion = await this.questionRepository.save(question);
    const questionWithUser = await this.questionRepository.findOne({
      where: { id: savedQuestion.id },
      relations: ['user'],
    });

    return plainToClass(QuestionResponseDto, questionWithUser, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<QuestionResponseDto[]> {
    const questions = await this.questionRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return questions.map(question =>
      plainToClass(QuestionResponseDto, question, {
        excludeExtraneousValues: true,
      })
    );
  }

  async findOne(id: number): Promise<any> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['user', 'answersRelation', 'answersRelation.user'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    await this.questionRepository.increment({ id }, 'views', 1);

    const questionDto = plainToClass(QuestionResponseDto, question, {
      excludeExtraneousValues: true,
    });

    const answersData = question.answersRelation?.map(answer => ({
      id: answer.id,
      content: answer.content,
      votes: answer.votes,
      accepted: answer.accepted,
      postedAt: answer.createdAt,
      user: {
        name: answer.user?.name || 'Anonymous',
        image: answer.user?.image || '/placeholder-user.jpg',
        reputation: answer.user?.reputation || 0,
      }
    })) || [];

    return {
      ...questionDto,
      answersCount: questionDto.answers,
      answers: answersData
    };
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto, userId: number): Promise<QuestionResponseDto> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.userId !== userId) {
      throw new ForbiddenException('You can only update your own questions');
    }

    Object.assign(question, updateQuestionDto);
    const updatedQuestion = await this.questionRepository.save(question);

    return plainToClass(QuestionResponseDto, updatedQuestion, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    const question = await this.questionRepository.findOne({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.userId !== userId) {
      throw new ForbiddenException('You can only delete your own questions');
    }

    await this.questionRepository.remove(question);
  }

  async vote(id: number, direction: 'up' | 'down'): Promise<QuestionResponseDto> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (direction === 'up') {
      question.votes += 1;
    } else {
      question.votes -= 1;
    }

    const updatedQuestion = await this.questionRepository.save(question);

    return plainToClass(QuestionResponseDto, updatedQuestion, {
      excludeExtraneousValues: true,
    });
  }
}