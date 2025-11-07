import { describe, it, expect, vi, beforeEach } from 'vitest';
import { quizService } from '../quiz.service';

const fetchMock = vi.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

describe('QuizService', () => {
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  describe('getQuizzes', () => {
    it('should fetch all quizzes', async () => {
      const mockQuizzes = [
        { id: 1, title: 'Quiz 1', description: 'Test quiz 1', created_by: 1, created_at: '2024-01-01' },
        { id: 2, title: 'Quiz 2', description: 'Test quiz 2', created_by: 1, created_at: '2024-01-02' }
      ];

      fetchMock.mockResolvedValueOnce({
        json: async () => mockQuizzes
      });

      const result = await quizService.getQuizzes(mockToken);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/quizzes'),
        expect.objectContaining({
          headers: { 'Authorization': `Bearer ${mockToken}` }
        })
      );
      expect(result).toEqual(mockQuizzes);
      expect(result).toHaveLength(2);
    });
  });

  describe('createQuiz', () => {
    it('should create a new quiz', async () => {
      const newQuiz = {
        id: 3,
        title: 'New Quiz',
        description: 'New description',
        created_by: 1,
        created_at: '2024-01-03'
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => newQuiz
      });

      const result = await quizService.createQuiz(mockToken, 'New Quiz', 'New description', 42);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/quizzes'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify({ title: 'New Quiz', description: 'New description', organizationId: 42 })
        })
      );
      expect(result).toEqual(newQuiz);
    });
  });

  describe('getQuestions', () => {
    it('should fetch questions for a quiz', async () => {
      const mockQuestions = [
        {
          id: 1,
          quiz_id: 1,
          question_text: 'What is 2+2?',
          type: 'multiple',
          correct_answer: 'A',
          option_a: '4',
          option_b: '3',
          option_c: '5',
          option_d: '6',
          time_limit: 20,
          points: 1000
        }
      ];

      fetchMock.mockResolvedValueOnce({
        json: async () => mockQuestions
      });

      const result = await quizService.getQuestions(mockToken, 1);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/quizzes/1/questions'),
        expect.objectContaining({
          headers: { 'Authorization': `Bearer ${mockToken}` }
        })
      );
      expect(result).toEqual(mockQuestions);
    });
  });

  describe('addQuestion', () => {
    it('should add a question to a quiz', async () => {
      const questionData = {
        quiz_id: 1,
        question_text: 'New question?',
        type: 'multiple',
        correct_answer: 'A',
        option_a: 'Answer A',
        option_b: 'Answer B',
        option_c: 'Answer C',
        option_d: 'Answer D',
        time_limit: 20,
        points: 1000
      };

      fetchMock.mockResolvedValueOnce({ ok: true });

      await quizService.addQuestion(mockToken, questionData);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/questions'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify(questionData)
        })
      );
    });
  });

  describe('deleteQuiz', () => {
    it('should delete a quiz', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true });

      await quizService.deleteQuiz(mockToken, 1);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/quizzes/1'),
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${mockToken}` }
        })
      );
    });
  });

  describe('deleteQuestion', () => {
    it('should delete a question', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true });

      await quizService.deleteQuestion(mockToken, 1);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/questions/1'),
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${mockToken}` }
        })
      );
    });
  });
});
