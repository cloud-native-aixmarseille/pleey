import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDashboard from '../AdminDashboard';

describe('AdminDashboard', () => {
  const mockQuizzes = [
    { id: 1, title: 'Quiz 1', description: 'Description 1', created_by: 1, created_at: '2024-01-01' },
    { id: 2, title: 'Quiz 2', description: 'Description 2', created_by: 1, created_at: '2024-01-02' }
  ];

  it('should render admin dashboard with title', () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn()
    };

    render(<AdminDashboard quizzes={[]} {...mockHandlers} />);

    expect(screen.getByText(/Panneau Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Créer un quiz/i)).toBeInTheDocument();
  });

  it('should display list of quizzes', () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn()
    };

    render(<AdminDashboard quizzes={mockQuizzes} {...mockHandlers} />);

    expect(screen.getByText('Quiz 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Quiz 2')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('should call onManageQuiz when manage button is clicked', () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn()
    };

    render(<AdminDashboard quizzes={mockQuizzes} {...mockHandlers} />);

    const manageButtons = screen.getAllByText('Gérer');
    fireEvent.click(manageButtons[0]);

    expect(mockHandlers.onManageQuiz).toHaveBeenCalledWith(mockQuizzes[0]);
  });

  it('should call onLaunchQuiz when launch button is clicked', () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn()
    };

    render(<AdminDashboard quizzes={mockQuizzes} {...mockHandlers} />);

    const launchButtons = screen.getAllByText('Lancer');
    fireEvent.click(launchButtons[0]);

    expect(mockHandlers.onLaunchQuiz).toHaveBeenCalledWith(mockQuizzes[0].id);
  });
});
