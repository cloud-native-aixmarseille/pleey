import { Quiz } from '../../../shared/types';
import { Button, Card, Container } from '../../../shared/components';
import { OrganizationSelector } from '../../../shared/components/organization/OrganizationSelector';
import { useOrganization } from '../../../shared/context/OrganizationContext';
import { useTranslation } from 'react-i18next';

interface AdminDashboardProps {
  quizzes: Quiz[];
  onCreateQuiz: (title: string, description: string, organizationId: number) => Promise<void>;
  onManageQuiz: (quiz: Quiz) => void;
  onLaunchQuiz: (quizId: number) => Promise<void>;
}

export default function AdminDashboard({
  quizzes,
  onCreateQuiz,
  onManageQuiz,
  onLaunchQuiz
}: AdminDashboardProps) {
  const { t } = useTranslation();
  const { currentOrganization } = useOrganization();
  
  const handleCreateQuiz = () => {
    if (!currentOrganization) {
      alert(t('admin.selectOrganizationFirst'));
      return;
    }
    
    const title = prompt(t('admin.promptQuizTitle'));
    const description = prompt(t('admin.promptQuizDescription'));
    if (title) onCreateQuiz(title, description || '', currentOrganization.id);
  };

  return (
    <div className="min-h-screen bg-game-gradient p-4 sm:p-6 lg:p-8">
      <Container size="xl">
        {/* Header Section */}
        <Card className="p-6 sm:p-8 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl animate-bounce-slow">👑</span>
                <h2 className="text-3xl sm:text-4xl font-black text-gradient-neon">
                  {t('admin.dashboard')}
                </h2>
              </div>
              <p className="text-light-700">
                {t('admin.manageQuizzesSubtitle')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <OrganizationSelector />
              <Button
                variant="accent"
                size="lg"
                onClick={handleCreateQuiz}
                disabled={!currentOrganization}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                {t('admin.createQuiz')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
          <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-600 font-semibold text-sm mb-1">{t('admin.totalQuizzes')}</p>
                <p className="text-4xl font-black text-primary-700">{quizzes.length}</p>
              </div>
              <div className="text-5xl opacity-20">📚</div>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 border-2 border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 font-semibold text-sm mb-1">{t('admin.activeQuizzes')}</p>
                <p className="text-4xl font-black text-secondary-700">
                  {quizzes.filter(q => q.is_active).length}
                </p>
              </div>
              <div className="text-5xl opacity-20">🎯</div>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-accent-50 to-accent-100 border-2 border-accent-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent-700 font-semibold text-sm mb-1">{t('admin.questions')}</p>
                <p className="text-4xl font-black text-accent-800">
                  {quizzes.reduce((sum, quiz) => sum + (quiz.question_count || 0), 0)}
                </p>
              </div>
              <div className="text-5xl opacity-20">❓</div>
            </div>
          </Card>
        </div>

        {/* Quiz Grid */}
        {quizzes.length === 0 ? (
          <Card className="p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-dark-800 mb-2">
              {t('admin.noQuizzesTitle')}
            </h3>
            <p className="text-light-700 mb-6">
              {t('admin.noQuizzesDescription')}
            </p>
            <Button variant="primary" size="lg" onClick={handleCreateQuiz}>
              {t('admin.createFirstQuiz')}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <Card 
                key={quiz.id} 
                hover 
                className={`p-6 animate-scale-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-dark-800 flex-1 pr-2">
                      {quiz.title}
                    </h3>
                    {quiz.is_active && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-100 text-success-700 rounded-lg text-xs font-bold">
                        <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
                        {t('admin.active')}
                      </span>
                    )}
                  </div>
                  <p className="text-light-700 text-sm line-clamp-2 mb-3">
                    {quiz.description || t('admin.noDescription')}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-light-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {quiz.question_count || 0} {quiz.question_count === 1 ? t('quiz.question') : t('quiz.questionsPlural')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => onManageQuiz(quiz)}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {t('admin.manage')}
                    </span>
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    fullWidth
                    onClick={() => onLaunchQuiz(quiz.id)}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('admin.launch')}
                    </span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
