import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

  async create(
    createQuestionDto: CreateQuestionDto,
  ): Promise<QuestionResponseDto> {
    // 로그인된 사용자만 질문 작성 허용
    const user = await this.userRepository.findOne({
      where: { mbrId: createQuestionDto.mbrId },
    });
    if (!user) {
      throw new NotFoundException(
        'User not found. Please login to create a question.',
      );
    }

    const question = this.questionRepository.create({
      title: createQuestionDto.title,
      description: createQuestionDto.description,
      tags: createQuestionDto.tags,
      mbrId: createQuestionDto.mbrId,
    });

    const savedQuestion = await this.questionRepository.save(question);
    
    // 게시물 작성 시 10포인트 지급
    await this.userRepository.increment({ mbrId: createQuestionDto.mbrId }, 'point', 10);
    
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
    const questionWithUser = await this.questionRepository.findOne({
      where: { id },
      relations: ['user', 'answersRelation', 'answersRelation.user'],
    });

    if (!questionWithUser) {
      throw new NotFoundException('Question not found');
    }

    await this.questionRepository.increment({ id }, 'views', 1);

    const questionDto = plainToClass(QuestionResponseDto, questionWithUser, {
      excludeExtraneousValues: true,
    });

    const answersData =
      questionWithUser.answersRelation?.map((answer) => ({
        id: answer.id,
        content: answer.content,
        votes: answer.votes,
        accepted: answer.accepted,
        postedAt: answer.createdAt,
        user: {
          name: answer.user?.name || 'Unknown',
          image: answer.user?.image || '/placeholder-user.jpg',
          reputation: answer.user?.reputation || 0,
        },
      })) || [];

    return {
      ...questionDto,
      answersCount: questionDto.answers,
      answers: answersData,
    };
  }

  async update(
    id: number,
    updateQuestionDto: UpdateQuestionDto,
    mbrId: number,
  ): Promise<QuestionResponseDto> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // 취약점 진단을 위해 권한 검증 제거
    // if (mbrId > 0 && question.mbrId !== mbrId) {
    //   throw new ForbiddenException('You can only update your own questions');
    // }

    Object.assign(question, updateQuestionDto);
    const updatedQuestion = await this.questionRepository.save(question);

    return plainToClass(QuestionResponseDto, updatedQuestion, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: number, mbrId: number): Promise<void> {
    const question = await this.questionRepository.findOne({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // 취약점 진단을 위해 권한 검증 제거
    // if (mbrId > 0 && question.mbrId !== mbrId) {
    //   throw new ForbiddenException('You can only delete your own questions');
    // }

    await this.questionRepository.remove(question);
  }

  async vote(
    id: number,
    direction: 'up' | 'down',
  ): Promise<QuestionResponseDto> {
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
