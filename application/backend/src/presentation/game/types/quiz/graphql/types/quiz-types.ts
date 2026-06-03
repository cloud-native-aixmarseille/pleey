import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { QuizQuestionType } from '../../../../../../domain/game/types/quiz/entities/quiz-question';
import { SelectableOptionType } from '../../../shared/graphql/selectable-option-types';

registerEnumType(QuizQuestionType, {
  name: 'QuizQuestionType',
});

@ObjectType()
export class QuizType {
  @Field(() => ID)
  quizId!: string;

  @Field(() => ID)
  gameId!: string;

  @Field()
  type!: string;

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
export class QuizQuestionTypeObject {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  quizId!: string;

  @Field(() => Int)
  position!: number;

  @Field()
  questionText!: string;

  @Field(() => QuizQuestionType)
  type!: QuizQuestionType;

  @Field(() => Int)
  timeLimit!: number;

  @Field(() => Int)
  points!: number;

  @Field(() => [SelectableOptionType])
  answers!: SelectableOptionType[];
}
