export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type AppStackParamList = {
  HomeTabs: undefined;
  PersonDetail: { personId: string; personName: string };
  AddPerson: undefined;
  EditPerson: { personId: string };
  AddTransaction: { personId?: string; personName?: string };
  EditTransaction: { personId: string; txId: string };
  Settings: undefined;
};

