import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type AddOrganizationMemberInput = {
  role: OrganizationRole;
  userId: Scalars['Int']['input'];
};

export type AuthResponseType = {
  __typename?: 'AuthResponseType';
  accessToken: Scalars['String']['output'];
  expiresIn: Scalars['Int']['output'];
  refreshToken: Scalars['String']['output'];
  user: AuthUserProfileType;
};

export type AuthUserProfileType = {
  __typename?: 'AuthUserProfileType';
  avatarUri?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  username: Scalars['String']['output'];
};

export type CreateGameSessionInput = {
  gameId: Scalars['Int']['input'];
};

export type CreateOrganizationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreatePredictionGameInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['Int']['input'];
  title: Scalars['String']['input'];
};

export type CreatePredictionPromptInput = {
  options: Array<PredictionOptionInput>;
  points?: InputMaybe<Scalars['Int']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  predictionId: Scalars['Int']['input'];
  promptText: Scalars['String']['input'];
  timeLimit?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateQuestionInput = {
  answers: Array<QuestionAnswerInput>;
  points?: InputMaybe<Scalars['Int']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  questionText: Scalars['String']['input'];
  quizId: Scalars['Int']['input'];
  timeLimit?: InputMaybe<Scalars['Int']['input']>;
  type: QuestionType;
};

export type CreateQuizInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['Int']['input'];
  title: Scalars['String']['input'];
};

export type DashboardGameListItemType = {
  __typename?: 'DashboardGameListItemType';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  gameId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  relatedGameId?: Maybe<Scalars['Int']['output']>;
  stageCount: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type GameSessionListType = {
  __typename?: 'GameSessionListType';
  sessions: Array<GameSessionType>;
};

export enum GameSessionParticipantRole {
  Host = 'HOST',
  Player = 'PLAYER'
}

export enum GameSessionStatus {
  Active = 'ACTIVE',
  Ended = 'ENDED',
  Paused = 'PAUSED',
  Waiting = 'WAITING'
}

export type GameSessionType = {
  __typename?: 'GameSessionType';
  createdAt: Scalars['DateTime']['output'];
  currentStageId?: Maybe<Scalars['Int']['output']>;
  gameId: Scalars['Int']['output'];
  participantRole: GameSessionParticipantRole;
  pin: Scalars['String']['output'];
  sessionId: Scalars['Int']['output'];
  status: GameSessionStatus;
};

export enum GameType {
  Prediction = 'PREDICTION',
  Quiz = 'QUIZ'
}

export type HealthStatus = {
  __typename?: 'HealthStatus';
  status: Scalars['String']['output'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addOrganizationMember: OrganizationMemberType;
  createGameSession: GameSessionType;
  createOrganization: OrganizationType;
  createPredictionGame: PredictionGameType;
  createPredictionPrompt: PredictionPromptType;
  createProject: ProjectType;
  createQuestion: QuestionTypeGql;
  createQuiz: QuizType;
  deletePredictionPrompt: Scalars['Boolean']['output'];
  deleteProject: Scalars['Boolean']['output'];
  deleteQuestion: Scalars['Boolean']['output'];
  deleteQuiz: Scalars['Boolean']['output'];
  leaveCurrentPlayerSession: Scalars['Boolean']['output'];
  login: AuthResponseType;
  logout: Scalars['Boolean']['output'];
  refresh: AuthResponseType;
  regenerateAvatar: AuthUserProfileType;
  register: AuthUserProfileType;
  removeOrganizationMember: Scalars['Boolean']['output'];
  resumeGameSession: GameSessionType;
  stopGameSession: GameSessionType;
  updatePredictionPrompt: PredictionPromptType;
  updateProfile: AuthUserProfileType;
  updateProject: ProjectType;
  updateQuestion: QuestionTypeGql;
  updateQuiz: QuizType;
};


export type MutationAddOrganizationMemberArgs = {
  input: AddOrganizationMemberInput;
  organizationId: Scalars['Int']['input'];
};


export type MutationCreateGameSessionArgs = {
  input: CreateGameSessionInput;
};


export type MutationCreateOrganizationArgs = {
  input: CreateOrganizationInput;
};


export type MutationCreatePredictionGameArgs = {
  input: CreatePredictionGameInput;
};


export type MutationCreatePredictionPromptArgs = {
  input: CreatePredictionPromptInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
  organizationId: Scalars['Int']['input'];
};


export type MutationCreateQuestionArgs = {
  input: CreateQuestionInput;
};


export type MutationCreateQuizArgs = {
  input: CreateQuizInput;
};


export type MutationDeletePredictionPromptArgs = {
  promptId: Scalars['Int']['input'];
};


export type MutationDeleteProjectArgs = {
  migrationProjectId?: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
};


export type MutationDeleteQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type MutationDeleteQuizArgs = {
  quizId: Scalars['Int']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationRefreshArgs = {
  input: RefreshTokenInput;
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRemoveOrganizationMemberArgs = {
  memberId: Scalars['Int']['input'];
};


export type MutationResumeGameSessionArgs = {
  sessionId: Scalars['Int']['input'];
};


export type MutationStopGameSessionArgs = {
  sessionId: Scalars['Int']['input'];
};


export type MutationUpdatePredictionPromptArgs = {
  input: UpdatePredictionPromptInput;
  promptId: Scalars['Int']['input'];
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
  projectId: Scalars['Int']['input'];
};


export type MutationUpdateQuestionArgs = {
  input: UpdateQuestionInput;
  questionId: Scalars['Int']['input'];
};


export type MutationUpdateQuizArgs = {
  input: UpdateQuizInput;
  quizId: Scalars['Int']['input'];
};

export type OrganizationDashboardEntityType = {
  __typename?: 'OrganizationDashboardEntityType';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type OrganizationDashboardStatsType = {
  __typename?: 'OrganizationDashboardStatsType';
  activeGameSessions: Scalars['Int']['output'];
  totalGameSessions: Scalars['Int']['output'];
  totalGames: Scalars['Int']['output'];
  totalMembers: Scalars['Int']['output'];
  totalProjects: Scalars['Int']['output'];
};

export type OrganizationDashboardType = {
  __typename?: 'OrganizationDashboardType';
  organization: OrganizationDashboardEntityType;
  stats: OrganizationDashboardStatsType;
};

export type OrganizationListType = {
  __typename?: 'OrganizationListType';
  organizations: Array<OrganizationType>;
};

export type OrganizationMemberType = {
  __typename?: 'OrganizationMemberType';
  id: Scalars['Int']['output'];
  joinedAt: Scalars['DateTime']['output'];
  organizationId: Scalars['Int']['output'];
  role: OrganizationRole;
  userId: Scalars['Int']['output'];
};

export enum OrganizationRole {
  Manager = 'MANAGER',
  Member = 'MEMBER',
  Owner = 'OWNER'
}

export type OrganizationType = {
  __typename?: 'OrganizationType';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  role?: Maybe<OrganizationRole>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PredictionGameType = {
  __typename?: 'PredictionGameType';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  predictionId: Scalars['Int']['output'];
  projectId: Scalars['Int']['output'];
  promptCount: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  type: GameType;
};

export type PredictionOptionInput = {
  id?: InputMaybe<Scalars['Int']['input']>;
  isCorrect?: InputMaybe<Scalars['Boolean']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type PredictionOptionType = {
  __typename?: 'PredictionOptionType';
  id: Scalars['Int']['output'];
  isCorrect: Scalars['Boolean']['output'];
  position: Scalars['Int']['output'];
  text?: Maybe<Scalars['String']['output']>;
};

export type PredictionPromptType = {
  __typename?: 'PredictionPromptType';
  id: Scalars['Int']['output'];
  options: Array<PredictionOptionType>;
  points: Scalars['Int']['output'];
  position: Scalars['Int']['output'];
  predictionId: Scalars['Int']['output'];
  promptText: Scalars['String']['output'];
  timeLimit: Scalars['Int']['output'];
};

export type ProjectDashboardGamesInput = {
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  projectId: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: Scalars['String']['input'];
  sortField?: Scalars['String']['input'];
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ProjectDashboardGamesType = {
  __typename?: 'ProjectDashboardGamesType';
  items: Array<DashboardGameListItemType>;
  overallCount: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type ProjectListType = {
  __typename?: 'ProjectListType';
  projects: Array<ProjectType>;
};

export type ProjectType = {
  __typename?: 'ProjectType';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  organizationId: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  activeSessionByPin?: Maybe<GameSessionType>;
  activeSessions: GameSessionListType;
  currentPlayerSession?: Maybe<GameSessionType>;
  gameSessions: GameSessionListType;
  health: HealthStatus;
  live: HealthStatus;
  me: AuthUserProfileType;
  myOrganizations: OrganizationListType;
  organizationDashboard: OrganizationDashboardType;
  organizationProjects: ProjectListType;
  predictionGamesByProject: Array<PredictionGameType>;
  predictionPrompts: Array<PredictionPromptType>;
  projectDashboardGames: ProjectDashboardGamesType;
  quizQuestions: Array<QuestionTypeGql>;
  quizzes: Array<QuizType>;
  ready: HealthStatus;
};


export type QueryActiveSessionByPinArgs = {
  pin: Scalars['String']['input'];
};


export type QueryGameSessionsArgs = {
  gameId: Scalars['Int']['input'];
};


export type QueryOrganizationDashboardArgs = {
  organizationId: Scalars['Int']['input'];
};


export type QueryOrganizationProjectsArgs = {
  organizationId: Scalars['Int']['input'];
};


export type QueryPredictionGamesByProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryPredictionPromptsArgs = {
  predictionId: Scalars['Int']['input'];
};


export type QueryProjectDashboardGamesArgs = {
  input: ProjectDashboardGamesInput;
};


export type QueryQuizQuestionsArgs = {
  quizId: Scalars['Int']['input'];
};


export type QueryQuizzesArgs = {
  projectId?: InputMaybe<Scalars['Int']['input']>;
};

export type QuestionAnswerInput = {
  id?: InputMaybe<Scalars['Int']['input']>;
  isCorrect?: InputMaybe<Scalars['Boolean']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type QuestionAnswerType = {
  __typename?: 'QuestionAnswerType';
  id: Scalars['Int']['output'];
  isCorrect: Scalars['Boolean']['output'];
  position: Scalars['Int']['output'];
  text?: Maybe<Scalars['String']['output']>;
};

export enum QuestionType {
  Multiple = 'MULTIPLE',
  TrueFalse = 'TRUE_FALSE'
}

export type QuestionTypeGql = {
  __typename?: 'QuestionTypeGql';
  answers: Array<QuestionAnswerType>;
  id: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  position: Scalars['Int']['output'];
  questionText: Scalars['String']['output'];
  quizId: Scalars['Int']['output'];
  timeLimit: Scalars['Int']['output'];
  type: QuestionType;
};

export type QuizType = {
  __typename?: 'QuizType';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  gameId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  questionCount: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type RefreshTokenInput = {
  refreshToken: Scalars['String']['input'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  healthTick: HealthStatus;
};

export type UpdatePredictionPromptInput = {
  options?: InputMaybe<Array<PredictionOptionInput>>;
  points?: InputMaybe<Scalars['Int']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  predictionId?: InputMaybe<Scalars['Int']['input']>;
  promptText?: InputMaybe<Scalars['String']['input']>;
  timeLimit?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateProfileInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type UpdateQuestionInput = {
  answers?: InputMaybe<Array<QuestionAnswerInput>>;
  points?: InputMaybe<Scalars['Int']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  questionText?: InputMaybe<Scalars['String']['input']>;
  quizId?: InputMaybe<Scalars['Int']['input']>;
  timeLimit?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<QuestionType>;
};

export type UpdateQuizInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type AuthUserFieldsFragment = { __typename?: 'AuthUserProfileType', id: number, username: string, email: string, avatarUri?: string | null, createdAt?: string | null };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthResponseType', accessToken: string, refreshToken: string, expiresIn: number, user: { __typename?: 'AuthUserProfileType', id: number, username: string, email: string, avatarUri?: string | null, createdAt?: string | null } } };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthUserProfileType', id: number, username: string, email: string, avatarUri?: string | null, createdAt?: string | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'AuthUserProfileType', id: number, username: string, email: string, avatarUri?: string | null, createdAt?: string | null } };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'AuthUserProfileType', id: number, username: string, email: string, avatarUri?: string | null, createdAt?: string | null } };

export type RegenerateAvatarMutationVariables = Exact<{ [key: string]: never; }>;


export type RegenerateAvatarMutation = { __typename?: 'Mutation', regenerateAvatar: { __typename?: 'AuthUserProfileType', id: number, username: string, email: string, avatarUri?: string | null, createdAt?: string | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type RefreshMutationVariables = Exact<{
  input: RefreshTokenInput;
}>;


export type RefreshMutation = { __typename?: 'Mutation', refresh: { __typename?: 'AuthResponseType', accessToken: string, refreshToken: string, expiresIn: number, user: { __typename?: 'AuthUserProfileType', id: number, username: string, email: string, avatarUri?: string | null, createdAt?: string | null } } };

export type ProjectDashboardGamesQueryVariables = Exact<{
  input: ProjectDashboardGamesInput;
}>;


export type ProjectDashboardGamesQuery = { __typename?: 'Query', projectDashboardGames: { __typename?: 'ProjectDashboardGamesType', totalCount: number, overallCount: number, page: number, pageSize: number, totalPages: number, items: Array<{ __typename?: 'DashboardGameListItemType', id: number, gameId: number, type: string, title: string, description?: string | null, createdAt: string, relatedGameId?: number | null, stageCount: number }> } };

export type ActiveGameSessionByPinQueryVariables = Exact<{
  pin: Scalars['String']['input'];
}>;


export type ActiveGameSessionByPinQuery = { __typename?: 'Query', activeSessionByPin?: { __typename?: 'GameSessionType', sessionId: number, gameId: number, pin: string, status: GameSessionStatus, currentStageId?: number | null, participantRole: GameSessionParticipantRole, createdAt: string } | null };

export type ActiveGameSessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveGameSessionsQuery = { __typename?: 'Query', activeSessions: { __typename?: 'GameSessionListType', sessions: Array<{ __typename?: 'GameSessionType', sessionId: number, gameId: number, pin: string, status: GameSessionStatus, currentStageId?: number | null, participantRole: GameSessionParticipantRole, createdAt: string }> } };

export type CreateDashboardGameSessionMutationVariables = Exact<{
  input: CreateGameSessionInput;
}>;


export type CreateDashboardGameSessionMutation = { __typename?: 'Mutation', createGameSession: { __typename?: 'GameSessionType', sessionId: number, gameId: number, pin: string, status: GameSessionStatus, currentStageId?: number | null, participantRole: GameSessionParticipantRole, createdAt: string } };

export type CurrentPlayerGameSessionQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentPlayerGameSessionQuery = { __typename?: 'Query', currentPlayerSession?: { __typename?: 'GameSessionType', sessionId: number, gameId: number, pin: string, status: GameSessionStatus, currentStageId?: number | null, participantRole: GameSessionParticipantRole, createdAt: string } | null };

export type LeaveCurrentPlayerGameSessionMutationVariables = Exact<{ [key: string]: never; }>;


export type LeaveCurrentPlayerGameSessionMutation = { __typename?: 'Mutation', leaveCurrentPlayerSession: boolean };

export type ResumeDashboardGameSessionMutationVariables = Exact<{
  sessionId: Scalars['Int']['input'];
}>;


export type ResumeDashboardGameSessionMutation = { __typename?: 'Mutation', resumeGameSession: { __typename?: 'GameSessionType', sessionId: number, gameId: number, pin: string, status: GameSessionStatus, currentStageId?: number | null, participantRole: GameSessionParticipantRole, createdAt: string } };

export type StopDashboardGameSessionMutationVariables = Exact<{
  sessionId: Scalars['Int']['input'];
}>;


export type StopDashboardGameSessionMutation = { __typename?: 'Mutation', stopGameSession: { __typename?: 'GameSessionType', sessionId: number, gameId: number, pin: string, status: GameSessionStatus, currentStageId?: number | null, participantRole: GameSessionParticipantRole, createdAt: string } };

export type CreateOrganizationMutationVariables = Exact<{
  input: CreateOrganizationInput;
}>;


export type CreateOrganizationMutation = { __typename?: 'Mutation', createOrganization: { __typename?: 'OrganizationType', id: number, name: string, description?: string | null, createdAt: string, updatedAt: string, role?: OrganizationRole | null } };

export type WorkspaceOrganizationDashboardQueryVariables = Exact<{
  organizationId: Scalars['Int']['input'];
}>;


export type WorkspaceOrganizationDashboardQuery = { __typename?: 'Query', organizationDashboard: { __typename?: 'OrganizationDashboardType', organization: { __typename?: 'OrganizationDashboardEntityType', id: number, name: string, description?: string | null }, stats: { __typename?: 'OrganizationDashboardStatsType', totalGames: number, totalGameSessions: number, activeGameSessions: number, totalMembers: number, totalProjects: number } } };

export type WorkspaceOrganizationsQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkspaceOrganizationsQuery = { __typename?: 'Query', myOrganizations: { __typename?: 'OrganizationListType', organizations: Array<{ __typename?: 'OrganizationType', id: number, name: string, description?: string | null, createdAt: string, updatedAt: string, role?: OrganizationRole | null }> } };

export type DashboardPredictionGamesByProjectQueryVariables = Exact<{
  projectId: Scalars['Int']['input'];
}>;


export type DashboardPredictionGamesByProjectQuery = { __typename?: 'Query', predictionGamesByProject: Array<{ __typename?: 'PredictionGameType', id: number, predictionId: number, projectId: number, title: string, description?: string | null, promptCount: number, createdAt: string }> };

export type PredictionPromptsQueryVariables = Exact<{
  predictionId: Scalars['Int']['input'];
}>;


export type PredictionPromptsQuery = { __typename?: 'Query', predictionPrompts: Array<{ __typename?: 'PredictionPromptType', id: number, predictionId: number, position: number, promptText: string, timeLimit: number, points: number, options: Array<{ __typename?: 'PredictionOptionType', id: number, text?: string | null, position: number, isCorrect: boolean }> }> };

export type CreatePredictionPromptMutationVariables = Exact<{
  input: CreatePredictionPromptInput;
}>;


export type CreatePredictionPromptMutation = { __typename?: 'Mutation', createPredictionPrompt: { __typename?: 'PredictionPromptType', id: number, predictionId: number, position: number, promptText: string, timeLimit: number, points: number, options: Array<{ __typename?: 'PredictionOptionType', id: number, text?: string | null, position: number, isCorrect: boolean }> } };

export type UpdatePredictionPromptMutationVariables = Exact<{
  promptId: Scalars['Int']['input'];
  input: UpdatePredictionPromptInput;
}>;


export type UpdatePredictionPromptMutation = { __typename?: 'Mutation', updatePredictionPrompt: { __typename?: 'PredictionPromptType', id: number, predictionId: number, position: number, promptText: string, timeLimit: number, points: number, options: Array<{ __typename?: 'PredictionOptionType', id: number, text?: string | null, position: number, isCorrect: boolean }> } };

export type DeletePredictionPromptMutationVariables = Exact<{
  promptId: Scalars['Int']['input'];
}>;


export type DeletePredictionPromptMutation = { __typename?: 'Mutation', deletePredictionPrompt: boolean };

export type WorkspaceProjectsByOrganizationQueryVariables = Exact<{
  organizationId: Scalars['Int']['input'];
}>;


export type WorkspaceProjectsByOrganizationQuery = { __typename?: 'Query', organizationProjects: { __typename?: 'ProjectListType', projects: Array<{ __typename?: 'ProjectType', id: number, name: string, description?: string | null, organizationId: number, createdAt: string }> } };

export type CreateProjectMutationVariables = Exact<{
  organizationId: Scalars['Int']['input'];
  input: CreateProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'ProjectType', id: number, name: string, description?: string | null, organizationId: number, createdAt: string } };

export type UpdateProjectMutationVariables = Exact<{
  projectId: Scalars['Int']['input'];
  input: UpdateProjectInput;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject: { __typename?: 'ProjectType', id: number, name: string, description?: string | null, organizationId: number, createdAt: string } };

export type DeleteProjectMutationVariables = Exact<{
  projectId: Scalars['Int']['input'];
  migrationProjectId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DeleteProjectMutation = { __typename?: 'Mutation', deleteProject: boolean };

export type DashboardQuizzesByProjectQueryVariables = Exact<{
  projectId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DashboardQuizzesByProjectQuery = { __typename?: 'Query', quizzes: Array<{ __typename?: 'QuizType', id: number, gameId: number, title: string, description?: string | null, createdAt: string, questionCount: number }> };

export type QuizQuestionsQueryVariables = Exact<{
  quizId: Scalars['Int']['input'];
}>;


export type QuizQuestionsQuery = { __typename?: 'Query', quizQuestions: Array<{ __typename?: 'QuestionTypeGql', id: number, quizId: number, position: number, questionText: string, type: QuestionType, timeLimit: number, points: number, answers: Array<{ __typename?: 'QuestionAnswerType', id: number, text?: string | null, position: number, isCorrect: boolean }> }> };

export type UpdateQuizMutationVariables = Exact<{
  quizId: Scalars['Int']['input'];
  input: UpdateQuizInput;
}>;


export type UpdateQuizMutation = { __typename?: 'Mutation', updateQuiz: { __typename?: 'QuizType', id: number, gameId: number, title: string, description?: string | null, createdAt: string, questionCount: number } };

export type CreateQuestionMutationVariables = Exact<{
  input: CreateQuestionInput;
}>;


export type CreateQuestionMutation = { __typename?: 'Mutation', createQuestion: { __typename?: 'QuestionTypeGql', id: number, quizId: number, position: number, questionText: string, type: QuestionType, timeLimit: number, points: number, answers: Array<{ __typename?: 'QuestionAnswerType', id: number, text?: string | null, position: number, isCorrect: boolean }> } };

export type UpdateQuestionMutationVariables = Exact<{
  questionId: Scalars['Int']['input'];
  input: UpdateQuestionInput;
}>;


export type UpdateQuestionMutation = { __typename?: 'Mutation', updateQuestion: { __typename?: 'QuestionTypeGql', id: number, quizId: number, position: number, questionText: string, type: QuestionType, timeLimit: number, points: number, answers: Array<{ __typename?: 'QuestionAnswerType', id: number, text?: string | null, position: number, isCorrect: boolean }> } };

export type DeleteQuestionMutationVariables = Exact<{
  questionId: Scalars['Int']['input'];
}>;


export type DeleteQuestionMutation = { __typename?: 'Mutation', deleteQuestion: boolean };

export const AuthUserFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<AuthUserFieldsFragment, unknown>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthUserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const RegenerateAvatarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegenerateAvatar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regenerateAvatar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RegenerateAvatarMutation, RegenerateAvatarMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const RefreshDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Refresh"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefreshTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refresh"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthUserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RefreshMutation, RefreshMutationVariables>;
export const ProjectDashboardGamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectDashboardGames"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectDashboardGamesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectDashboardGames"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"relatedGameId"}},{"kind":"Field","name":{"kind":"Name","value":"stageCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"overallCount"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]} as unknown as DocumentNode<ProjectDashboardGamesQuery, ProjectDashboardGamesQueryVariables>;
export const ActiveGameSessionByPinDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActiveGameSessionByPin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pin"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeSessionByPin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pin"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pin"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"pin"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentStageId"}},{"kind":"Field","name":{"kind":"Name","value":"participantRole"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ActiveGameSessionByPinQuery, ActiveGameSessionByPinQueryVariables>;
export const ActiveGameSessionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActiveGameSessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeSessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"pin"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentStageId"}},{"kind":"Field","name":{"kind":"Name","value":"participantRole"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<ActiveGameSessionsQuery, ActiveGameSessionsQueryVariables>;
export const CreateDashboardGameSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDashboardGameSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGameSessionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGameSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"pin"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentStageId"}},{"kind":"Field","name":{"kind":"Name","value":"participantRole"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateDashboardGameSessionMutation, CreateDashboardGameSessionMutationVariables>;
export const CurrentPlayerGameSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentPlayerGameSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentPlayerSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"pin"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentStageId"}},{"kind":"Field","name":{"kind":"Name","value":"participantRole"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CurrentPlayerGameSessionQuery, CurrentPlayerGameSessionQueryVariables>;
export const LeaveCurrentPlayerGameSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LeaveCurrentPlayerGameSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveCurrentPlayerSession"}}]}}]} as unknown as DocumentNode<LeaveCurrentPlayerGameSessionMutation, LeaveCurrentPlayerGameSessionMutationVariables>;
export const ResumeDashboardGameSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResumeDashboardGameSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resumeGameSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"pin"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentStageId"}},{"kind":"Field","name":{"kind":"Name","value":"participantRole"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ResumeDashboardGameSessionMutation, ResumeDashboardGameSessionMutationVariables>;
export const StopDashboardGameSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StopDashboardGameSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopGameSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"pin"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentStageId"}},{"kind":"Field","name":{"kind":"Name","value":"participantRole"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<StopDashboardGameSessionMutation, StopDashboardGameSessionMutationVariables>;
export const CreateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<CreateOrganizationMutation, CreateOrganizationMutationVariables>;
export const WorkspaceOrganizationDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceOrganizationDashboard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationDashboard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalGames"}},{"kind":"Field","name":{"kind":"Name","value":"totalGameSessions"}},{"kind":"Field","name":{"kind":"Name","value":"activeGameSessions"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"totalProjects"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceOrganizationDashboardQuery, WorkspaceOrganizationDashboardQueryVariables>;
export const WorkspaceOrganizationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceOrganizationsQuery, WorkspaceOrganizationsQueryVariables>;
export const DashboardPredictionGamesByProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardPredictionGamesByProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"predictionGamesByProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"predictionId"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"promptCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<DashboardPredictionGamesByProjectQuery, DashboardPredictionGamesByProjectQueryVariables>;
export const PredictionPromptsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PredictionPrompts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"predictionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"predictionPrompts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"predictionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"predictionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"predictionId"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"promptText"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeLimit"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}}]} as unknown as DocumentNode<PredictionPromptsQuery, PredictionPromptsQueryVariables>;
export const CreatePredictionPromptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePredictionPrompt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePredictionPromptInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPredictionPrompt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"predictionId"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"promptText"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeLimit"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}}]} as unknown as DocumentNode<CreatePredictionPromptMutation, CreatePredictionPromptMutationVariables>;
export const UpdatePredictionPromptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePredictionPrompt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"promptId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePredictionPromptInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePredictionPrompt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"promptId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"promptId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"predictionId"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"promptText"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeLimit"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}}]} as unknown as DocumentNode<UpdatePredictionPromptMutation, UpdatePredictionPromptMutationVariables>;
export const DeletePredictionPromptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeletePredictionPrompt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"promptId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePredictionPrompt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"promptId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"promptId"}}}]}]}}]} as unknown as DocumentNode<DeletePredictionPromptMutation, DeletePredictionPromptMutationVariables>;
export const WorkspaceProjectsByOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceProjectsByOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationProjects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceProjectsByOrganizationQuery, WorkspaceProjectsByOrganizationQueryVariables>;
export const CreateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateProjectMutation, CreateProjectMutationVariables>;
export const UpdateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const DeleteProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"migrationProjectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"migrationProjectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"migrationProjectId"}}}]}]}}]} as unknown as DocumentNode<DeleteProjectMutation, DeleteProjectMutationVariables>;
export const DashboardQuizzesByProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardQuizzesByProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizzes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"questionCount"}}]}}]}}]} as unknown as DocumentNode<DashboardQuizzesByProjectQuery, DashboardQuizzesByProjectQueryVariables>;
export const QuizQuestionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"QuizQuestions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quizId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizQuestions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"quizId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quizId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quizId"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"questionText"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeLimit"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}}]} as unknown as DocumentNode<QuizQuestionsQuery, QuizQuestionsQueryVariables>;
export const UpdateQuizDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateQuiz"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quizId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateQuizInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateQuiz"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"quizId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quizId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"questionCount"}}]}}]}}]} as unknown as DocumentNode<UpdateQuizMutation, UpdateQuizMutationVariables>;
export const CreateQuestionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateQuestion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateQuestionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createQuestion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quizId"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"questionText"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeLimit"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}}]} as unknown as DocumentNode<CreateQuestionMutation, CreateQuestionMutationVariables>;
export const UpdateQuestionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateQuestion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"questionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateQuestionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateQuestion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"questionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"questionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quizId"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"questionText"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeLimit"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}}]} as unknown as DocumentNode<UpdateQuestionMutation, UpdateQuestionMutationVariables>;
export const DeleteQuestionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteQuestion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"questionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteQuestion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"questionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"questionId"}}}]}]}}]} as unknown as DocumentNode<DeleteQuestionMutation, DeleteQuestionMutationVariables>;