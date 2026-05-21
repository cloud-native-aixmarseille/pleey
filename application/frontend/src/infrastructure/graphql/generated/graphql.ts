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
  DateTime: { input: string; output: string; }
};

export type ActionPermissionType = {
  __typename?: 'ActionPermissionType';
  allowed: Scalars['Boolean']['output'];
  reason?: Maybe<CreatePartyDisabledReason>;
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

export type CreateOrganizationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export enum CreatePartyDisabledReason {
  ActivePartyExists = 'ACTIVE_PARTY_EXISTS',
  HostHasActiveParty = 'HOST_HAS_ACTIVE_PARTY',
  NoStagesAvailable = 'NO_STAGES_AVAILABLE'
}

export type CreatePartyInput = {
  gameId: Scalars['Int']['input'];
};

export type CreatePredictionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['Int']['input'];
  title: Scalars['String']['input'];
};

export type CreatePredictionPromptInput = {
  options: Array<SelectableOptionInput>;
  points: Scalars['Int']['input'];
  position?: InputMaybe<Scalars['Int']['input']>;
  predictionId: Scalars['Int']['input'];
  promptText: Scalars['String']['input'];
  timeLimit: Scalars['Int']['input'];
};

export type CreateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateQuizInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['Int']['input'];
  title: Scalars['String']['input'];
};

export type CreateQuizQuestionInput = {
  answers: Array<SelectableOptionInput>;
  points: Scalars['Int']['input'];
  position?: InputMaybe<Scalars['Int']['input']>;
  questionText: Scalars['String']['input'];
  quizId: Scalars['Int']['input'];
  timeLimit: Scalars['Int']['input'];
  type: QuizQuestionType;
};

export type GamePermissionsType = {
  __typename?: 'GamePermissionsType';
  createParty: ActionPermissionType;
  launchReadiness: LaunchReadinessPermissionType;
};

export type HealthStatus = {
  __typename?: 'HealthStatus';
  status: Scalars['String']['output'];
};

export enum LaunchReadinessDisabledReason {
  NoStagesAvailable = 'NO_STAGES_AVAILABLE'
}

export type LaunchReadinessPermissionType = {
  __typename?: 'LaunchReadinessPermissionType';
  allowed: Scalars['Boolean']['output'];
  reason?: Maybe<LaunchReadinessDisabledReason>;
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addOrganizationMember: OrganizationMemberType;
  createOrganization: OrganizationType;
  createParty: PartyType;
  createPrediction: PredictionType;
  createPredictionPrompt: PredictionPromptType;
  createProject: ProjectType;
  createQuiz: QuizType;
  createQuizQuestion: QuizQuestionTypeObject;
  deletePrediction: Scalars['Boolean']['output'];
  deletePredictionPrompt: Scalars['Boolean']['output'];
  deleteProject: Scalars['Boolean']['output'];
  deleteQuiz: Scalars['Boolean']['output'];
  deleteQuizQuestion: Scalars['Boolean']['output'];
  login: AuthResponseType;
  logout: Scalars['Boolean']['output'];
  refresh: AuthResponseType;
  regenerateAvatar: AuthUserProfileType;
  register: AuthUserProfileType;
  removeOrganizationMember: Scalars['Boolean']['output'];
  updatePrediction: PredictionType;
  updatePredictionPrompt: PredictionPromptType;
  updateProfile: AuthUserProfileType;
  updateProject: ProjectType;
  updateQuiz: QuizType;
  updateQuizQuestion: QuizQuestionTypeObject;
};


export type MutationAddOrganizationMemberArgs = {
  input: AddOrganizationMemberInput;
  organizationId: Scalars['Int']['input'];
};


export type MutationCreateOrganizationArgs = {
  input: CreateOrganizationInput;
};


export type MutationCreatePartyArgs = {
  input: CreatePartyInput;
};


export type MutationCreatePredictionArgs = {
  input: CreatePredictionInput;
};


export type MutationCreatePredictionPromptArgs = {
  input: CreatePredictionPromptInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
  organizationId: Scalars['Int']['input'];
};


export type MutationCreateQuizArgs = {
  input: CreateQuizInput;
};


export type MutationCreateQuizQuestionArgs = {
  input: CreateQuizQuestionInput;
};


export type MutationDeletePredictionArgs = {
  predictionId: Scalars['Int']['input'];
};


export type MutationDeletePredictionPromptArgs = {
  promptId: Scalars['Int']['input'];
};


export type MutationDeleteProjectArgs = {
  migrationProjectId?: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
};


export type MutationDeleteQuizArgs = {
  quizId: Scalars['Int']['input'];
};


export type MutationDeleteQuizQuestionArgs = {
  questionId: Scalars['Int']['input'];
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


export type MutationUpdatePredictionArgs = {
  input: UpdatePredictionInput;
  predictionId: Scalars['Int']['input'];
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


export type MutationUpdateQuizArgs = {
  input: UpdateQuizInput;
  quizId: Scalars['Int']['input'];
};


export type MutationUpdateQuizQuestionArgs = {
  input: UpdateQuizQuestionInput;
  questionId: Scalars['Int']['input'];
};

export type OrganizationDashboardEntityType = {
  __typename?: 'OrganizationDashboardEntityType';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type OrganizationDashboardStatsType = {
  __typename?: 'OrganizationDashboardStatsType';
  activeParties: Scalars['Int']['output'];
  totalGames: Scalars['Int']['output'];
  totalMembers: Scalars['Int']['output'];
  totalParties: Scalars['Int']['output'];
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

export enum PartyRole {
  Host = 'HOST',
  Player = 'PLAYER'
}

export enum PartyStatus {
  Active = 'ACTIVE',
  Ended = 'ENDED',
  Paused = 'PAUSED',
  Waiting = 'WAITING'
}

export type PartyType = {
  __typename?: 'PartyType';
  createdAt: Scalars['DateTime']['output'];
  gameId: Scalars['Int']['output'];
  partyId: Scalars['Int']['output'];
  pin: Scalars['String']['output'];
  role: PartyRole;
  status: PartyStatus;
};

export type PredictionPromptType = {
  __typename?: 'PredictionPromptType';
  id: Scalars['Int']['output'];
  options: Array<SelectableOptionType>;
  points: Scalars['Int']['output'];
  position: Scalars['Int']['output'];
  predictionId: Scalars['Int']['output'];
  promptText: Scalars['String']['output'];
  timeLimit: Scalars['Int']['output'];
};

export type PredictionType = {
  __typename?: 'PredictionType';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  gameId: Scalars['Int']['output'];
  predictionId: Scalars['Int']['output'];
  promptCount: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type ProjectGameListItemType = {
  __typename?: 'ProjectGameListItemType';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  gameId: Scalars['Int']['output'];
  gameTypeId?: Maybe<Scalars['Int']['output']>;
  permissions: GamePermissionsType;
  stageCount: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type ProjectGamesInput = {
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  projectId: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: Scalars['String']['input'];
  sortField?: Scalars['String']['input'];
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ProjectGamesType = {
  __typename?: 'ProjectGamesType';
  items: Array<ProjectGameListItemType>;
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
  health: HealthStatus;
  listParties: Array<PartyType>;
  live: HealthStatus;
  me: AuthUserProfileType;
  myOrganizations: OrganizationListType;
  organizationDashboard: OrganizationDashboardType;
  organizationProjects: ProjectListType;
  prediction: PredictionType;
  predictionPrompts: Array<PredictionPromptType>;
  projectGames: ProjectGamesType;
  quiz: QuizType;
  quizQuestions: Array<QuizQuestionTypeObject>;
  ready: HealthStatus;
};


export type QueryOrganizationDashboardArgs = {
  organizationId: Scalars['Int']['input'];
};


export type QueryOrganizationProjectsArgs = {
  organizationId: Scalars['Int']['input'];
};


export type QueryPredictionArgs = {
  predictionId: Scalars['Int']['input'];
};


export type QueryPredictionPromptsArgs = {
  predictionId: Scalars['Int']['input'];
};


export type QueryProjectGamesArgs = {
  input: ProjectGamesInput;
};


export type QueryQuizArgs = {
  quizId: Scalars['Int']['input'];
};


export type QueryQuizQuestionsArgs = {
  quizId: Scalars['Int']['input'];
};

export enum QuizQuestionType {
  Multiple = 'Multiple',
  TrueFalse = 'TrueFalse'
}

export type QuizQuestionTypeObject = {
  __typename?: 'QuizQuestionTypeObject';
  answers: Array<SelectableOptionType>;
  id: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  position: Scalars['Int']['output'];
  questionText: Scalars['String']['output'];
  quizId: Scalars['Int']['output'];
  timeLimit: Scalars['Int']['output'];
  type: QuizQuestionType;
};

export type QuizType = {
  __typename?: 'QuizType';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  gameId: Scalars['Int']['output'];
  questionCount: Scalars['Int']['output'];
  quizId: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type RefreshTokenInput = {
  refreshToken: Scalars['String']['input'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type SelectableOptionInput = {
  id?: InputMaybe<Scalars['Int']['input']>;
  isCorrect?: InputMaybe<Scalars['Boolean']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type SelectableOptionType = {
  __typename?: 'SelectableOptionType';
  id?: Maybe<Scalars['Int']['output']>;
  isCorrect: Scalars['Boolean']['output'];
  position: Scalars['Int']['output'];
  text?: Maybe<Scalars['String']['output']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  healthTick: HealthStatus;
};

export type UpdatePredictionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type UpdatePredictionPromptInput = {
  options: Array<SelectableOptionInput>;
  points: Scalars['Int']['input'];
  position?: InputMaybe<Scalars['Int']['input']>;
  promptText: Scalars['String']['input'];
  timeLimit: Scalars['Int']['input'];
};

export type UpdateProfileInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type UpdateQuizInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type UpdateQuizQuestionInput = {
  answers: Array<SelectableOptionInput>;
  points: Scalars['Int']['input'];
  position?: InputMaybe<Scalars['Int']['input']>;
  questionText: Scalars['String']['input'];
  timeLimit: Scalars['Int']['input'];
  type: QuizQuestionType;
};

export type ProjectGamesQueryVariables = Exact<{
  input: ProjectGamesInput;
}>;


export type ProjectGamesQuery = { __typename?: 'Query', projectGames: { __typename?: 'ProjectGamesType', totalCount: number, overallCount: number, page: number, pageSize: number, totalPages: number, items: Array<{ __typename?: 'ProjectGameListItemType', gameId: number, type: string, title: string, description?: string | null, createdAt: string, gameTypeId?: number | null, stageCount: number, permissions: { __typename?: 'GamePermissionsType', createParty: { __typename?: 'ActionPermissionType', allowed: boolean, reason?: CreatePartyDisabledReason | null }, launchReadiness: { __typename?: 'LaunchReadinessPermissionType', allowed: boolean, reason?: LaunchReadinessDisabledReason | null } } }> } };

export type CreatePartyMutationVariables = Exact<{
  input: CreatePartyInput;
}>;


export type CreatePartyMutation = { __typename?: 'Mutation', createParty: { __typename?: 'PartyType', partyId: number, gameId: number, pin: string, status: PartyStatus, role: PartyRole, createdAt: string } };

export type ListPartiesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListPartiesQuery = { __typename?: 'Query', listParties: Array<{ __typename?: 'PartyType', partyId: number, gameId: number, pin: string, status: PartyStatus, role: PartyRole, createdAt: string }> };

export type PredictionManagementQueryVariables = Exact<{
  predictionId: Scalars['Int']['input'];
}>;


export type PredictionManagementQuery = { __typename?: 'Query', prediction: { __typename?: 'PredictionType', predictionId: number, gameId: number, title: string, description?: string | null, createdAt: string, promptCount: number }, predictionPrompts: Array<{ __typename?: 'PredictionPromptType', id: number, predictionId: number, position: number, promptText: string, timeLimit: number, points: number, options: Array<{ __typename?: 'SelectableOptionType', id?: number | null, text?: string | null, position: number, isCorrect: boolean }> }> };

export type UpdatePredictionManagementMutationVariables = Exact<{
  predictionId: Scalars['Int']['input'];
  input: UpdatePredictionInput;
}>;


export type UpdatePredictionManagementMutation = { __typename?: 'Mutation', updatePrediction: { __typename?: 'PredictionType', predictionId: number } };

export type CreatePredictionManagementMutationVariables = Exact<{
  input: CreatePredictionInput;
}>;


export type CreatePredictionManagementMutation = { __typename?: 'Mutation', createPrediction: { __typename?: 'PredictionType', predictionId: number } };

export type DeletePredictionManagementMutationVariables = Exact<{
  predictionId: Scalars['Int']['input'];
}>;


export type DeletePredictionManagementMutation = { __typename?: 'Mutation', deletePrediction: boolean };

export type CreatePredictionPromptManagementMutationVariables = Exact<{
  input: CreatePredictionPromptInput;
}>;


export type CreatePredictionPromptManagementMutation = { __typename?: 'Mutation', createPredictionPrompt: { __typename?: 'PredictionPromptType', id: number, predictionId: number, position: number, promptText: string, timeLimit: number, points: number, options: Array<{ __typename?: 'SelectableOptionType', id?: number | null, text?: string | null, position: number, isCorrect: boolean }> } };

export type UpdatePredictionPromptManagementMutationVariables = Exact<{
  promptId: Scalars['Int']['input'];
  input: UpdatePredictionPromptInput;
}>;


export type UpdatePredictionPromptManagementMutation = { __typename?: 'Mutation', updatePredictionPrompt: { __typename?: 'PredictionPromptType', id: number, predictionId: number, position: number, promptText: string, timeLimit: number, points: number, options: Array<{ __typename?: 'SelectableOptionType', id?: number | null, text?: string | null, position: number, isCorrect: boolean }> } };

export type DeletePredictionPromptManagementMutationVariables = Exact<{
  promptId: Scalars['Int']['input'];
}>;


export type DeletePredictionPromptManagementMutation = { __typename?: 'Mutation', deletePredictionPrompt: boolean };

export type QuizManagementQueryVariables = Exact<{
  quizId: Scalars['Int']['input'];
}>;


export type QuizManagementQuery = { __typename?: 'Query', quiz: { __typename?: 'QuizType', quizId: number, gameId: number, title: string, description?: string | null, createdAt: string, questionCount: number }, quizQuestions: Array<{ __typename?: 'QuizQuestionTypeObject', id: number, quizId: number, position: number, questionText: string, type: QuizQuestionType, timeLimit: number, points: number, answers: Array<{ __typename?: 'SelectableOptionType', id?: number | null, text?: string | null, position: number, isCorrect: boolean }> }> };

export type UpdateQuizManagementMutationVariables = Exact<{
  quizId: Scalars['Int']['input'];
  input: UpdateQuizInput;
}>;


export type UpdateQuizManagementMutation = { __typename?: 'Mutation', updateQuiz: { __typename?: 'QuizType', quizId: number } };

export type CreateQuizManagementMutationVariables = Exact<{
  input: CreateQuizInput;
}>;


export type CreateQuizManagementMutation = { __typename?: 'Mutation', createQuiz: { __typename?: 'QuizType', quizId: number } };

export type DeleteQuizManagementMutationVariables = Exact<{
  quizId: Scalars['Int']['input'];
}>;


export type DeleteQuizManagementMutation = { __typename?: 'Mutation', deleteQuiz: boolean };

export type CreateQuizQuestionManagementMutationVariables = Exact<{
  input: CreateQuizQuestionInput;
}>;


export type CreateQuizQuestionManagementMutation = { __typename?: 'Mutation', createQuizQuestion: { __typename?: 'QuizQuestionTypeObject', id: number, quizId: number, position: number, questionText: string, type: QuizQuestionType, timeLimit: number, points: number, answers: Array<{ __typename?: 'SelectableOptionType', id?: number | null, text?: string | null, position: number, isCorrect: boolean }> } };

export type UpdateQuizQuestionManagementMutationVariables = Exact<{
  questionId: Scalars['Int']['input'];
  input: UpdateQuizQuestionInput;
}>;


export type UpdateQuizQuestionManagementMutation = { __typename?: 'Mutation', updateQuizQuestion: { __typename?: 'QuizQuestionTypeObject', id: number, quizId: number, position: number, questionText: string, type: QuizQuestionType, timeLimit: number, points: number, answers: Array<{ __typename?: 'SelectableOptionType', id?: number | null, text?: string | null, position: number, isCorrect: boolean }> } };

export type DeleteQuizQuestionManagementMutationVariables = Exact<{
  questionId: Scalars['Int']['input'];
}>;


export type DeleteQuizQuestionManagementMutation = { __typename?: 'Mutation', deleteQuizQuestion: boolean };

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

export type CreateOrganizationMutationVariables = Exact<{
  input: CreateOrganizationInput;
}>;


export type CreateOrganizationMutation = { __typename?: 'Mutation', createOrganization: { __typename?: 'OrganizationType', id: number, name: string, description?: string | null, createdAt: string, updatedAt: string, role?: OrganizationRole | null } };

export type WorkspaceOrganizationDashboardQueryVariables = Exact<{
  organizationId: Scalars['Int']['input'];
}>;


export type WorkspaceOrganizationDashboardQuery = { __typename?: 'Query', organizationDashboard: { __typename?: 'OrganizationDashboardType', organization: { __typename?: 'OrganizationDashboardEntityType', id: number, name: string, description?: string | null }, stats: { __typename?: 'OrganizationDashboardStatsType', totalGames: number, totalMembers: number, totalProjects: number } } };

export type WorkspaceOrganizationsQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkspaceOrganizationsQuery = { __typename?: 'Query', myOrganizations: { __typename?: 'OrganizationListType', organizations: Array<{ __typename?: 'OrganizationType', id: number, name: string, description?: string | null, createdAt: string, updatedAt: string, role?: OrganizationRole | null }> } };

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

export const AuthUserFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<AuthUserFieldsFragment, unknown>;
export const ProjectGamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectGames"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectGamesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectGames"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"gameTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"stageCount"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createParty"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allowed"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"launchReadiness"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allowed"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"overallCount"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]} as unknown as DocumentNode<ProjectGamesQuery, ProjectGamesQueryVariables>;
export const CreatePartyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateParty"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePartyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createParty"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"partyId"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"pin"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreatePartyMutation, CreatePartyMutationVariables>;
export const ListPartiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListParties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listParties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"partyId"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"pin"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ListPartiesQuery, ListPartiesQueryVariables>;
export const PredictionManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PredictionManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"predictionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prediction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"predictionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"predictionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"predictionId"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"promptCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"predictionPrompts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"predictionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"predictionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"predictionId"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"promptText"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimit"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}}]}}]}}]} as unknown as DocumentNode<PredictionManagementQuery, PredictionManagementQueryVariables>;
export const UpdatePredictionManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePredictionManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"predictionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePredictionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePrediction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"predictionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"predictionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"predictionId"}}]}}]}}]} as unknown as DocumentNode<UpdatePredictionManagementMutation, UpdatePredictionManagementMutationVariables>;
export const CreatePredictionManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePredictionManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePredictionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPrediction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"predictionId"}}]}}]}}]} as unknown as DocumentNode<CreatePredictionManagementMutation, CreatePredictionManagementMutationVariables>;
export const DeletePredictionManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeletePredictionManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"predictionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePrediction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"predictionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"predictionId"}}}]}]}}]} as unknown as DocumentNode<DeletePredictionManagementMutation, DeletePredictionManagementMutationVariables>;
export const CreatePredictionPromptManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePredictionPromptManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePredictionPromptInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPredictionPrompt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"predictionId"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"promptText"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimit"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}}]}}]}}]} as unknown as DocumentNode<CreatePredictionPromptManagementMutation, CreatePredictionPromptManagementMutationVariables>;
export const UpdatePredictionPromptManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePredictionPromptManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"promptId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePredictionPromptInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePredictionPrompt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"promptId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"promptId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"predictionId"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"promptText"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimit"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePredictionPromptManagementMutation, UpdatePredictionPromptManagementMutationVariables>;
export const DeletePredictionPromptManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeletePredictionPromptManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"promptId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePredictionPrompt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"promptId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"promptId"}}}]}]}}]} as unknown as DocumentNode<DeletePredictionPromptManagementMutation, DeletePredictionPromptManagementMutationVariables>;
export const QuizManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"QuizManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quizId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quiz"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"quizId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quizId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizId"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"questionCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quizQuestions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"quizId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quizId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quizId"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"questionText"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimit"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}}]}}]}}]} as unknown as DocumentNode<QuizManagementQuery, QuizManagementQueryVariables>;
export const UpdateQuizManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateQuizManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quizId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateQuizInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateQuiz"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"quizId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quizId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizId"}}]}}]}}]} as unknown as DocumentNode<UpdateQuizManagementMutation, UpdateQuizManagementMutationVariables>;
export const CreateQuizManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateQuizManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateQuizInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createQuiz"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizId"}}]}}]}}]} as unknown as DocumentNode<CreateQuizManagementMutation, CreateQuizManagementMutationVariables>;
export const DeleteQuizManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteQuizManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quizId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteQuiz"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"quizId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quizId"}}}]}]}}]} as unknown as DocumentNode<DeleteQuizManagementMutation, DeleteQuizManagementMutationVariables>;
export const CreateQuizQuestionManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateQuizQuestionManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateQuizQuestionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createQuizQuestion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quizId"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"questionText"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimit"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}}]}}]}}]} as unknown as DocumentNode<CreateQuizQuestionManagementMutation, CreateQuizQuestionManagementMutationVariables>;
export const UpdateQuizQuestionManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateQuizQuestionManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"questionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateQuizQuestionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateQuizQuestion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"questionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"questionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quizId"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"questionText"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimit"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateQuizQuestionManagementMutation, UpdateQuizQuestionManagementMutationVariables>;
export const DeleteQuizQuestionManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteQuizQuestionManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"questionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteQuizQuestion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"questionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"questionId"}}}]}]}}]} as unknown as DocumentNode<DeleteQuizQuestionManagementMutation, DeleteQuizQuestionManagementMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthUserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const RegenerateAvatarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegenerateAvatar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regenerateAvatar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RegenerateAvatarMutation, RegenerateAvatarMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const RefreshDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Refresh"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefreshTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refresh"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthUserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthUserProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUri"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RefreshMutation, RefreshMutationVariables>;
export const CreateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<CreateOrganizationMutation, CreateOrganizationMutationVariables>;
export const WorkspaceOrganizationDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceOrganizationDashboard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationDashboard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalGames"}},{"kind":"Field","name":{"kind":"Name","value":"totalMembers"}},{"kind":"Field","name":{"kind":"Name","value":"totalProjects"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceOrganizationDashboardQuery, WorkspaceOrganizationDashboardQueryVariables>;
export const WorkspaceOrganizationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceOrganizationsQuery, WorkspaceOrganizationsQueryVariables>;
export const WorkspaceProjectsByOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceProjectsByOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationProjects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceProjectsByOrganizationQuery, WorkspaceProjectsByOrganizationQueryVariables>;
export const CreateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateProjectMutation, CreateProjectMutationVariables>;
export const UpdateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const DeleteProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"migrationProjectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"migrationProjectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"migrationProjectId"}}}]}]}}]} as unknown as DocumentNode<DeleteProjectMutation, DeleteProjectMutationVariables>;