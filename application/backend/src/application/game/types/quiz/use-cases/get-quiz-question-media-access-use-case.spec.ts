import { describe, expect, it } from 'vitest';
import { QuizErrorCode } from '../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import { MediaErrorCode } from '../../../../../domain/media/enums/media-error-code.enum';
import { OrganizationErrorCode } from '../../../../../domain/organization/enums/organization-error-code.enum';
import { ProjectErrorCode } from '../../../../../domain/project/enums/project-error-code.enum';
import { QuizMediaAccessFixture } from '../../../../../test-utils/fixtures/unit/quiz-media-access.fixture';

describe('GetQuizQuestionMediaAccessUseCase', () => {
  it('issues a grant after checking the editor still belongs to the asset project organization', async () => {
    // Arrange
    const fixture = new QuizMediaAccessFixture();

    // Act
    const grant = await fixture.useCase.execute(fixture.assetId, fixture.userId);

    // Assert
    expect(grant).toEqual(fixture.grant);
    expect(fixture.findQuestion).toHaveBeenCalledExactlyOnceWith(fixture.assetId);
    expect(fixture.findQuiz).toHaveBeenCalledExactlyOnceWith(fixture.quizId);
    expect(fixture.findProject).toHaveBeenCalledExactlyOnceWith(fixture.project.id);
    expect(fixture.findMember).toHaveBeenCalledExactlyOnceWith(fixture.project.organizationId, fixture.userId);
    expect(fixture.issuer.issue).toHaveBeenCalledExactlyOnceWith(fixture.assetId);
    expect(fixture.findMember.mock.invocationCallOrder[0]).toBeLessThan(
      fixture.issuer.issue.mock.invocationCallOrder[0],
    );
  });

  it('denies a known asset when current organization membership has been revoked', async () => {
    // Arrange
    const fixture = new QuizMediaAccessFixture();
    fixture.findMember.mockResolvedValue(null);

    // Act
    const result = fixture.useCase.execute(fixture.assetId, fixture.userId);

    // Assert
    await expect(result).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
    expect(fixture.issuer.issue).not.toHaveBeenCalled();
  });

  it('denies an asset whose project is no longer available', async () => {
    // Arrange
    const fixture = new QuizMediaAccessFixture();
    fixture.findProject.mockResolvedValue(null);

    // Act
    const result = fixture.useCase.execute(fixture.assetId, fixture.userId);

    // Assert
    await expect(result).rejects.toThrow(ProjectErrorCode.PROJECT_NOT_FOUND);
    expect(fixture.findMember).not.toHaveBeenCalled();
    expect(fixture.issuer.issue).not.toHaveBeenCalled();
  });

  it('does not issue for a deleted or detached media asset', async () => {
    // Arrange
    const fixture = new QuizMediaAccessFixture();
    fixture.findQuestion.mockResolvedValue(null);

    // Act
    const result = fixture.useCase.execute(fixture.assetId, fixture.userId);

    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.MEDIA_UNAVAILABLE);
    expect(fixture.findQuiz).not.toHaveBeenCalled();
    expect(fixture.issuer.issue).not.toHaveBeenCalled();
  });

  it('does not issue when the owning quiz has been deleted', async () => {
    // Arrange
    const fixture = new QuizMediaAccessFixture();
    fixture.findQuiz.mockResolvedValue(null);

    // Act
    const result = fixture.useCase.execute(fixture.assetId, fixture.userId);

    // Assert
    await expect(result).rejects.toThrow(QuizErrorCode.QUIZ_NOT_FOUND);
    expect(fixture.findProject).not.toHaveBeenCalled();
    expect(fixture.issuer.issue).not.toHaveBeenCalled();
  });
});
