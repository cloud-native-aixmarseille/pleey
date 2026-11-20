import { Injectable } from '@nestjs/common';
import { ChoiceSubmissionPartyActionPolicy } from '../../shared/services/choice-submission-party-action-policy';

@Injectable()
export class QuizPartyActionPolicy extends ChoiceSubmissionPartyActionPolicy {}
