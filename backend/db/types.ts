export interface UserSubscriptionPayload {
  uid: string;
  email: string;
  displayName?: string;
  organizationName?: string;
  role?: string;
  phone?: string;
  jobTitle?: string;
  authProvider?: string;
  planTier?: string;
  monthlyPriceUsd?: number;
  billingInterval?: string;
  paymentMethod?: string;
  cardLast4?: string;
  status?: string;
  requestLimit?: number;
  requestsUsed?: number;
  activeAgentsCount?: number;
  virtualKeysCount?: number;
  signupDetails?: {
    phone?: string;
    jobTitle?: string;
    department?: string;
    teamSize?: string;
    useCase?: string;
    referralSource?: string;
    notes?: string;
    registeredAt?: string;
    ipAddress?: string;
  };
}

