export interface UserSubscriptionPayload {
  uid: string;
  email: string;
  displayName?: string;
  organizationName?: string;
  role?: string;
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
}
