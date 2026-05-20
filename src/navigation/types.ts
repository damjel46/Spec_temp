import { CommonSpec } from '../types/spec';

export type RootStackParamList = {
  Intro: undefined;
  CommonForm: undefined;
  JobForm: { commonSpec: CommonSpec };
  Loading: { commonSpec: CommonSpec };
  Result: { analysisResult: unknown };
};
