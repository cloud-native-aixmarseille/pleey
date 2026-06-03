import { type ArgumentMetadata, BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { CreatePredictionFromImportInput } from '../../prediction/graphql/types/prediction-inputs';
import { CreateQuizFromImportInput } from '../../quiz/graphql/types/quiz-inputs';

const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

const upload = Promise.resolve({
  createReadStream: () => {
    throw new Error('Not used in validation tests');
  },
  filename: 'quiz-import.json',
  mimetype: 'application/json',
});

const createMetadata = (
  metatype: typeof CreateQuizFromImportInput | typeof CreatePredictionFromImportInput,
): ArgumentMetadata => ({
  data: 'input',
  metatype,
  type: 'body',
});

describe('Import playable content GraphQL inputs validation', () => {
  it('accepts whitelisted upload properties for quiz import creation input', async () => {
    const result = await validationPipe.transform(
      {
        description: 'Imported quiz',
        file: upload,
        projectId: backendTestIdentifiers.project(3),
        title: 'Quiz from file',
      },
      createMetadata(CreateQuizFromImportInput),
    );

    expect(result).toBeInstanceOf(CreateQuizFromImportInput);
    expect(result).toMatchObject({
      description: 'Imported quiz',
      projectId: backendTestIdentifiers.project(3),
      title: 'Quiz from file',
    });
    await expect(result.file).resolves.toMatchObject({
      filename: 'quiz-import.json',
      mimetype: 'application/json',
    });
  });

  it('accepts whitelisted upload properties for prediction import creation input', async () => {
    const result = await validationPipe.transform(
      {
        description: 'Imported prediction',
        file: upload,
        projectId: backendTestIdentifiers.project(5),
        title: 'Prediction from file',
      },
      createMetadata(CreatePredictionFromImportInput),
    );

    expect(result).toBeInstanceOf(CreatePredictionFromImportInput);
    expect(result).toMatchObject({
      description: 'Imported prediction',
      projectId: backendTestIdentifiers.project(5),
      title: 'Prediction from file',
    });
    await expect(result.file).resolves.toMatchObject({
      filename: 'quiz-import.json',
      mimetype: 'application/json',
    });
  });

  it('rejects non-whitelisted properties for quiz import creation input', async () => {
    await expect(
      validationPipe.transform(
        {
          file: upload,
          projectId: backendTestIdentifiers.project(3),
          title: 'Quiz from file',
          unexpected: true,
        },
        createMetadata(CreateQuizFromImportInput),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
