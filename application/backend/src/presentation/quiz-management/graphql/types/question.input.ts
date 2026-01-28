import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '../../../../domain/quiz/entities/question';

@InputType()
export class QuestionAnswerInput {
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  id?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  text?: string | null;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  position?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}

@InputType()
export class CreateQuestionInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  quizId!: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  position?: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @Field(() => QuestionType)
  @IsString()
  @IsIn(Object.values(QuestionType))
  type!: QuestionType;

  @Field(() => [QuestionAnswerInput])
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerInput)
  answers!: QuestionAnswerInput[];

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @Min(1)
  @IsOptional()
  timeLimit?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @Min(1)
  @IsOptional()
  points?: number;
}

@InputType()
export class UpdateQuestionInput {
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  quizId?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  position?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  questionText?: string;

  @Field(() => QuestionType, { nullable: true })
  @IsString()
  @IsIn(Object.values(QuestionType))
  @IsOptional()
  type?: QuestionType;

  @Field(() => [QuestionAnswerInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerInput)
  @IsOptional()
  answers?: QuestionAnswerInput[];

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @Min(1)
  @IsOptional()
  timeLimit?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @Min(1)
  @IsOptional()
  points?: number;
}
