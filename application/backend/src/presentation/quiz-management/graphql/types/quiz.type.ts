import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { QuestionType } from '../../../../domain/quiz/entities/question';

registerEnumType(QuestionType, {
  name: 'QuestionType',
});

@ObjectType()
export class QuizType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  gameId!: number;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field()
  createdAt!: Date;

  @Field(() => Int)
  questionCount!: number;
}

@ObjectType()
class QuestionAnswerType {
  @Field(() => Int)
  id!: number;

  @Field(() => String, { nullable: true })
  text!: string | null;

  @Field(() => Int)
  position!: number;

  @Field()
  isCorrect!: boolean;
}

@ObjectType()
export class QuestionTypeGql {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  quizId!: number;

  @Field(() => Int)
  position!: number;

  @Field()
  questionText!: string;

  @Field(() => QuestionType)
  type!: QuestionType;

  @Field(() => [QuestionAnswerType])
  answers!: QuestionAnswerType[];

  @Field(() => Int)
  timeLimit!: number;

  @Field(() => Int)
  points!: number;
}
