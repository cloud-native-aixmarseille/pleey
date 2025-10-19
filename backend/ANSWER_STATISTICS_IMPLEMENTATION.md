# Backend Support for Answer Statistics

## Overview
This document describes how to implement answer statistics tracking in the backend to support the enhanced question result display feature.

## Current State
The frontend now displays:
- Answer distribution (% of players who chose each option)
- Visual charts showing answer patterns
- Total number of answers

The backend currently returns basic answer results:
```typescript
{
  isCorrect: boolean;
  points: number;
  correctAnswer: string;
}
```

## Required Implementation

### 1. Update Submit Answer Use Case

File: `backend/src/application/game/use-cases/submit-answer.use-case.ts`

Add statistics calculation after saving the score:

```typescript
async execute(dto: SubmitAnswerDto): Promise<{
  isCorrect: boolean;
  points: number;
  correctAnswer: string;
  statistics?: AnswerStatistics;
}> {
  // ... existing code for checking answer and saving score ...

  // Calculate statistics for this question
  const statistics = await this.calculateAnswerStatistics(
    session.id,
    currentQuestion.id
  );

  return {
    isCorrect,
    points: gameScore.getTotalPoints(),
    correctAnswer: currentQuestion.correctAnswer,
    statistics,
  };
}

private async calculateAnswerStatistics(
  sessionId: number,
  questionId: number
): Promise<AnswerStatistics> {
  // Get all scores for this question in this session
  const scores = await this.scoreRepository.findBySessionAndQuestion(
    sessionId,
    questionId
  );

  // Count answers
  const answerDistribution: Record<string, number> = {};
  scores.forEach(score => {
    const answer = score.answer; // Need to add 'answer' field to Score entity
    answerDistribution[answer] = (answerDistribution[answer] || 0) + 1;
  });

  return {
    totalAnswers: scores.length,
    answerDistribution,
  };
}
```

### 2. Update Score Entity

File: `backend/src/domain/game/entities/score.entity.ts`

Add the user's answer to track what they selected:

```typescript
export class Score {
  constructor(
    public readonly id: number,
    public readonly sessionId: number,
    public readonly userId: number,
    public readonly questionId: number,
    public readonly points: number,
    public readonly answerTime: number | null,
    public readonly isCorrect: boolean,
    public readonly answeredAt: Date,
    public readonly answer: string, // Add this field
  ) {}
}
```

### 3. Update Database Schema

File: `backend/prisma/schema.prisma`

Add answer field to Score model:

```prisma
model Score {
  id         Int      @id @default(autoincrement())
  sessionId  Int      @map("session_id")
  userId     Int      @map("user_id")
  questionId Int      @map("question_id")
  points     Int      @default(0)
  answerTime Int?     @map("answer_time")
  isCorrect  Boolean  @default(false) @map("is_correct")
  answer     String   // Add this field
  answeredAt DateTime @default(now()) @map("answered_at")

  session  GameSession @relation(fields: [sessionId], references: [id])
  user     User        @relation(fields: [userId], references: [id])
  question Question    @relation(fields: [questionId], references: [id])

  @@map("scores")
}
```

### 4. Update Score Repository Interface

File: `backend/src/domain/game/repositories/score.repository.interface.ts`

Add method to find scores by session and question:

```typescript
export interface ScoreRepository {
  create(data: CreateScoreData): Promise<Score>;
  findBySessionAndQuestion(sessionId: number, questionId: number): Promise<Score[]>;
  findBySession(sessionId: number): Promise<Score[]>;
  // ... other methods
}
```

### 5. Create DTO for Answer Statistics

File: `backend/src/application/game/dto/answer-statistics.dto.ts`

```typescript
export class AnswerStatisticsDto {
  totalAnswers: number;
  answerDistribution: Record<string, number>;
}
```

## Migration Steps

1. **Update Prisma Schema**
   ```bash
   cd backend
   # Edit prisma/schema.prisma to add 'answer' field
   npx prisma migrate dev --name add_answer_to_scores
   npx prisma generate
   ```

2. **Update Score Entity**
   - Add answer field to Score entity
   - Update factory methods to include answer

3. **Update Repository Implementation**
   - Implement `findBySessionAndQuestion` method
   - Update `create` method to store answer

4. **Update Submit Answer Use Case**
   - Add statistics calculation logic
   - Return statistics in response

5. **Test the Changes**
   ```bash
   npm run test
   npm run test:e2e
   ```

## WebSocket Event Update

When broadcasting answer results to all players, include statistics:

```typescript
// In the WebSocket gateway (when implemented)
socket.to(sessionPin).emit('answer-result', {
  isCorrect: result.isCorrect,
  points: result.points,
  correctAnswer: result.correctAnswer,
  statistics: result.statistics, // Include statistics
});
```

## Testing

### Unit Tests

Test the statistics calculation:

```typescript
describe('SubmitAnswerUseCase', () => {
  it('should include answer statistics in response', async () => {
    // Arrange
    const mockScores = [
      { answer: 'A', isCorrect: true },
      { answer: 'A', isCorrect: true },
      { answer: 'B', isCorrect: false },
      { answer: 'C', isCorrect: false },
    ];
    
    scoreRepository.findBySessionAndQuestion.mockResolvedValue(mockScores);

    // Act
    const result = await submitAnswerUseCase.execute(dto);

    // Assert
    expect(result.statistics).toEqual({
      totalAnswers: 4,
      answerDistribution: { A: 2, B: 1, C: 1 },
    });
  });
});
```

### Integration Tests

Test the full flow with real database:

```typescript
it('should track answer distribution across multiple players', async () => {
  // Create session and question
  // Submit answers from multiple players
  // Verify statistics are correctly calculated
});
```

## Performance Considerations

### Caching
For high-traffic games, consider caching statistics:

```typescript
// Use Redis or in-memory cache
const cacheKey = `stats:${sessionId}:${questionId}`;
const cachedStats = await cache.get(cacheKey);

if (cachedStats) {
  return cachedStats;
}

const stats = await this.calculateAnswerStatistics(sessionId, questionId);
await cache.set(cacheKey, stats, { ttl: 60 }); // Cache for 60 seconds

return stats;
```

### Database Optimization
Add indexes for better query performance:

```sql
CREATE INDEX idx_scores_session_question ON scores(session_id, question_id);
```

## Alternative: Real-time Updates

For real-time statistics updates, use WebSocket to broadcast updates:

```typescript
// When a player submits an answer
socket.to(sessionPin).emit('statistics-update', {
  questionId,
  statistics: await this.calculateAnswerStatistics(sessionId, questionId),
});
```

Frontend can subscribe to these updates:

```typescript
socket.on('statistics-update', (data) => {
  setStatistics(data.statistics);
});
```

## Rollout Strategy

1. **Phase 1**: Add database field and basic tracking (no statistics returned)
2. **Phase 2**: Add statistics calculation (returned but optional on frontend)
3. **Phase 3**: Enable statistics display on frontend
4. **Phase 4**: Add real-time updates if needed

This phased approach ensures backward compatibility and allows for gradual rollout.
