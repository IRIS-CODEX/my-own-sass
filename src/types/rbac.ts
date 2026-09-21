export type PagePermissionId =
  // Application Core Pages
  | 'proxy_gateway'
  | 'prompt_firewall'
  | 'pii_vault'
  | 'virtual_keys'
  | 'agent_fleet'
  | 'merkle_audit'
  | 'analytics_cost'
  | 'billing_portal'
  | 'team_workspace'
  // SaaS Central Root Admin Pages
  | 'admin_dashboard'
  | 'admin_tenants'
  | 'admin_roles'
  | 'admin_unpaid'
  | 'admin_pricing'
  | 'admin_security'
  | 'admin_gateway'
  | 'admin_settings';

export type ClearanceLevel =
  | 'LEVEL_1_GUEST'
  | 'LEVEL_2_OPERATOR'
  | 'LEVEL_3_ENGINEER'
  | 'LEVEL_4_EXECUTIVE'
  | 'LEVEL_5_ROOT';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INVITED' | 'MFA_REQUIRED';

export interface ActionPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canAdminOverride: boolean;
}

export interface GranularFeature {
  key: string;
  name: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface PageDefinition {
  id: PagePermissionId;
  name: string;
  category: 'Application Core' | 'Security & Privacy' | 'Compliance & Billing' | 'SaaS Central Main-Admin';
  description: string;
  route: string;
  features: GranularFeature[];
}

export interface PagePermissionConfig {
  enabled: boolean;
  actions: ActionPermissions;
  granularFeatures: Record<string, boolean>;
}

export interface RoleDefinition {
  id: string;
  name: string;
  badge: string;
  description: string;
  isSystem: boolean;
  color: string;
  clearanceLevel: ClearanceLevel;
  pagePermissions: Record<PagePermissionId, PagePermissionConfig>;
  assignedUsersCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  department: string;
  clearance: ClearanceLevel;
  status: UserStatus;
  mfaEnabled: boolean;
  lastLoginAt: string;
  lastLoginIp: string;
  createdAt: string;
  phone?: string;
  avatarUrl?: string;
  notes?: string;
}

// Master Registry of Every Application and Admin Page with all fine-grained features
export const MASTER_PAGES_REGISTRY: PageDefinition[] = [
  {
    id: 'proxy_gateway',
    name: 'Live Proxy Gateway',
    category: 'Application Core',
    description: 'Real-time AI agent traffic monitoring, latency telemetry, and payload interception.',
    route: '/proxy',
    features: [
      { key: 'view_traffic', name: 'Real-time Traffic Stream', description: 'View real-time token rate and request streams', riskLevel: 'LOW' },
      { key: 'intercept_requests', name: 'Payload Interception', description: 'Pause and inspect requests before sending upstream', riskLevel: 'MEDIUM' },
      { key: 'modify_routing', name: 'Dynamic Model Routing', description: 'Re-route requests between OpenAI, Anthropic, and Gemini', riskLevel: 'HIGH' },
      { key: 'token_rate_limiting', name: 'Rate Limiting Rules', description: 'Configure token budgets and concurrent stream limits', riskLevel: 'MEDIUM' },
      { key: 'raw_payload_inspect', name: 'Raw Payload Decryption', description: 'View decrypted prompt texts and completions', riskLevel: 'HIGH' },
    ],
  },
  {
    id: 'prompt_firewall',
    name: 'Prompt Firewall & AST Defense',
    category: 'Security & Privacy',
    description: 'Abstract Syntax Tree analysis, heuristic filters, and prompt injection mitigation.',
    route: '/firewall',
    features: [
      { key: 'view_rules', name: 'Inspect Firewall Rules', description: 'View active semantic and AST detection rules', riskLevel: 'LOW' },
      { key: 'edit_sensitivity', name: 'Firewall Sensitivity Calibration', description: 'Adjust attack detection thresholds and vector sensitivity', riskLevel: 'HIGH' },
      { key: 'manage_banned_patterns', name: 'Jailbreak Pattern Management', description: 'Add, update, or remove forbidden regex and DAN attack signatures', riskLevel: 'HIGH' },
      { key: 'override_blocked_prompts', name: 'Security Override Privilege', description: 'Bypass blocked prompts on false positives in real time', riskLevel: 'CRITICAL' },
      { key: 'test_firewall_sandbox', name: 'Attack Simulation Sandbox', description: 'Run test prompt injection payloads through the evaluator', riskLevel: 'LOW' },
    ],
  },
  {
    id: 'pii_vault',
    name: 'PII Masking & Vault',
    category: 'Security & Privacy',
    description: 'Sensitive data redaction, reversible tokenization, and cryptographic key vault.',
    route: '/vault',
    features: [
      { key: 'view_pii_detectors', name: 'View PII Detectors', description: 'Review active regex and NER entity redaction policies', riskLevel: 'LOW' },
      { key: 'toggle_entity_types', name: 'Configure Entity Rules', description: 'Toggle detectors for SSN, credit cards, emails, and API keys', riskLevel: 'MEDIUM' },
      { key: 'view_unmasked_payloads', name: 'Vault Unmasking Clearance', description: 'View de-tokenized original PII strings inside secure audits', riskLevel: 'CRITICAL' },
      { key: 'manage_vault_encryption', name: 'Vault Key Rotation', description: 'Rotate AES-256 vault master keys and encryption salts', riskLevel: 'CRITICAL' },
      { key: 'export_redaction_logs', name: 'Export Redaction Audits', description: 'Export scrubbing logs for compliance certifications', riskLevel: 'MEDIUM' },
    ],
  },
  {
    id: 'virtual_keys',
    name: 'Scoped Virtual Keys & Budgets',
    category: 'Application Core',
    description: 'Zero-trust virtual API keys, per-agent budget limits, and upstream provider masks.',
    route: '/keys',
    features: [
      { key: 'view_keys', name: 'Key Roster Access', description: 'View active virtual keys and token usage tallies', riskLevel: 'LOW' },
      { key: 'create_keys', name: 'Provision New Keys', description: 'Issue scoped virtual gateway keys for autonomous agents', riskLevel: 'MEDIUM' },
      { key: 'revoke_rotate_keys', name: 'Instant Revocation & Rotation', description: 'Immediately terminate compromised keys', riskLevel: 'HIGH' },
      { key: 'set_budgets', name: 'Spending Quotas & Hard Caps', description: 'Set hard daily and monthly USD caps per key', riskLevel: 'HIGH' },
      { key: 'model_whitelisting', name: 'Provider & Model Restrictions', description: 'Restrict keys to specific AI models (e.g. GPT-4o only)', riskLevel: 'MEDIUM' },
    ],
  },
  {
    id: 'agent_fleet',
    name: 'Autonomous Agent Fleet',
    category: 'Application Core',
    description: 'Autonomous AI agent execution tracking, tool-call controls, and runaway circuit breakers.',
    route: '/agents',
    features: [
      { key: 'view_fleet', name: 'Fleet Telemetry & Status', description: 'Monitor live agents across autonomous and semi-autonomous modes', riskLevel: 'LOW' },
      { key: 'register_agents', name: 'Agent Provisioning', description: 'Register new agents and configure system prompts', riskLevel: 'MEDIUM' },
      { key: 'pause_resume_agents', name: 'Autonomy Mode Control', description: 'Toggle between Full Auto, Semi Auto, and Paused states', riskLevel: 'HIGH' },
      { key: 'configure_tool_depth', name: 'Max Recursive Depth Bounds', description: 'Set recursive depth ceilings to stop infinite tool-calling loops', riskLevel: 'HIGH' },
      { key: 'emergency_terminate', name: 'Circuit Breaker Force Kill', description: 'Kill runaway autonomous agents executing unauthorized steps', riskLevel: 'CRITICAL' },
    ],
  },
  {
    id: 'merkle_audit',
    name: 'Cryptographic Merkle Audit Trail',
    category: 'Compliance & Billing',
    description: 'Tamper-evident audit ledger with SHA-256 chained hashing and compliance exports.',
    route: '/audit',
    features: [
      { key: 'view_audit_ledger', name: 'Immutable Ledger Access', description: 'Browse sequential blockchain-style state verification records', riskLevel: 'LOW' },
      { key: 'verify_merkle_proofs', name: 'Cryptographic Proof Validator', description: 'Recalculate Merkle trees to detect database tampering', riskLevel: 'LOW' },
      { key: 'export_compliance', name: 'Compliance Package Bundling', description: 'Generate certified SOC2, HIPAA, and ISO27001 proof packages', riskLevel: 'MEDIUM' },
      { key: 'manual_compliance_override', name: 'Audit Verdict Override', description: 'Manually override security and compliance verdicts', riskLevel: 'CRITICAL' },
    ],
  },
  {
    id: 'analytics_cost',
    name: 'Cloud Analytics & Cost Optimization',
    category: 'Compliance & Billing',
    description: 'Token efficiency breakdown, multi-model cost benchmarks, and budget forecasts.',
    route: '/analytics',
    features: [
      { key: 'view_spend_metrics', name: 'Financial Telemetry Access', description: 'View detailed cost metrics and token rate charts', riskLevel: 'LOW' },
      { key: 'export_reports', name: 'CSV & Ledger Data Export', description: 'Download complete usage breakdown sheets', riskLevel: 'LOW' },
      { key: 'forecast_simulator', name: 'Budget Forecasting Engine', description: 'Simulate scaling costs and predictive token usage', riskLevel: 'LOW' },
    ],
  },
  {
    id: 'billing_portal',
    name: 'Billing & Subscription Portal',
    category: 'Compliance & Billing',
    description: 'Tenant subscription tiers, payment methods, and invoice downloads.',
    route: '/billing',
    features: [
      { key: 'view_billing_info', name: 'Plan & Payment Status', description: 'View current active plan and payment methods', riskLevel: 'LOW' },
      { key: 'upgrade_downgrade', name: 'Plan Modification', description: 'Upgrade or downgrade organization subscription tier', riskLevel: 'HIGH' },
      { key: 'manage_payment_methods', name: 'Payment Method Updates', description: 'Add or update credit card and billing details', riskLevel: 'HIGH' },
      { key: 'download_invoices', name: 'Invoice Receipt Access', description: 'Download official billing receipts and tax documentation', riskLevel: 'LOW' },
    ],
  },
  {
    id: 'team_workspace',
    name: 'Team Workspace & Developer Settings',
    category: 'Application Core',
    description: 'Workspace configuration, webhook integrations, and developer preferences.',
    route: '/settings',
    features: [
      { key: 'edit_workspace_profile', name: 'Workspace Branding & Info', description: 'Update organization name, domain, and branding assets', riskLevel: 'MEDIUM' },
      { key: 'manage_webhooks', name: 'Outbound Webhook Endpoints', description: 'Configure event dispatch webhooks and signing keys', riskLevel: 'HIGH' },
      { key: 'manage_team_invites', name: 'Member Invitations', description: 'Send invitations to workspace team members', riskLevel: 'MEDIUM' },
      { key: 'api_cors_config', name: 'CORS & Origin Whitelist', description: 'Configure allowed origins for gateway client calls', riskLevel: 'HIGH' },
    ],
  },

  // --------------------------------------------------------------------------
  // SaaS Central Main-Admin Pages
  // --------------------------------------------------------------------------
  {
    id: 'admin_dashboard',
    name: 'Executive Dashboard & MRR',
    category: 'SaaS Central Main-Admin',
    description: 'SaaS Central executive analytics, global revenue run-rate, and multi-tenant KPIs.',
    route: '/admin/dashboard',
    features: [
      { key: 'view_financial_mrr', name: 'MRR & ARR Financials', description: 'Access global subscription revenue and growth KPIs', riskLevel: 'HIGH' },
      { key: 'view_growth_telemetry', name: 'Subscriber Telemetry', description: 'Review active subscriber churn and acquisition velocity', riskLevel: 'LOW' },
      { key: 'access_cloudsql_diag', name: 'Cloud SQL Schema Diagnostics', description: 'Inspect Cloud SQL connection health, tables, and migrations', riskLevel: 'MEDIUM' },
    ],
  },
  {
    id: 'admin_tenants',
    name: 'Users & Tenant Roster',
    category: 'SaaS Central Main-Admin',
    description: 'Global tenant directory, user accounts, and subscription quota modifications.',
    route: '/admin/tenants',
    features: [
      { key: 'view_all_tenants', name: 'Global Tenant Directory Access', description: 'View all tenant organizations and customer profiles', riskLevel: 'MEDIUM' },
      { key: 'create_tenant_user', name: 'Direct Firebase Account Creation', description: 'Create and provision new accounts directly in Firebase Auth', riskLevel: 'HIGH' },
      { key: 'modify_tenant_quota', name: 'Quota Adjustment Controls', description: 'Increase or decrease request and token limits for accounts', riskLevel: 'HIGH' },
      { key: 'change_subscription_plan', name: 'Subscription Plan Reassignment', description: 'Upgrade or downgrade tenant packages from admin portal', riskLevel: 'HIGH' },
      { key: 'suspend_reactivate_tenant', name: 'Tenant Suspension Controls', description: 'Instantly lock or restore tenant access and proxy keys', riskLevel: 'CRITICAL' },
      { key: 'delete_tenant_account', name: 'Permanent Account Purge', description: 'Delete organization accounts and stored data permanently', riskLevel: 'CRITICAL' },
    ],
  },
  {
    id: 'admin_roles',
    name: 'User & Role Management (RBAC)',
    category: 'SaaS Central Main-Admin',
    description: 'Granular Role-Based Access Control, permission matrix, and portal administrator management.',
    route: '/admin/roles',
    features: [
      { key: 'view_roles', name: 'View Role Definitions', description: 'View role hierarchy, clearance levels, and permission schemes', riskLevel: 'LOW' },
      { key: 'create_edit_roles', name: 'Role Builder & Policy Editor', description: 'Create and modify custom roles with page-by-page permission toggles', riskLevel: 'CRITICAL' },
      { key: 'delete_roles', name: 'Delete Custom Roles', description: 'Delete non-system custom roles', riskLevel: 'HIGH' },
      { key: 'manage_portal_users', name: 'Portal Admin User Directory', description: 'Create, edit, suspend, or invite SaaS Central operators', riskLevel: 'CRITICAL' },
      { key: 'assign_user_roles', name: 'Role Assignment Authority', description: 'Assign, elevate, or revoke user clearance and roles', riskLevel: 'CRITICAL' },
    ],
  },
  {
    id: 'admin_unpaid',
    name: 'Unpaid & Dunning Radar',
    category: 'SaaS Central Main-Admin',
    description: 'Delinquent account tracking, automated payment retry engine, and dunning workflows.',
    route: '/admin/unpaid',
    features: [
      { key: 'view_overdue_accounts', name: 'Delinquency Roster Access', description: 'Inspect overdue balances and past-due timelines', riskLevel: 'MEDIUM' },
      { key: 'trigger_dunning_emails', name: 'Dunning Notice Dispatch', description: 'Trigger collection emails and warning notices', riskLevel: 'MEDIUM' },
      { key: 'retry_payment_charge', name: 'Gateway Payment Re-attempt', description: 'Force card charge retry on connected payment gateways', riskLevel: 'HIGH' },
      { key: 'auto_freeze_delinquents', name: 'Bulk Delinquency Freeze', description: 'Auto-freeze all accounts past grace period threshold', riskLevel: 'CRITICAL' },
      { key: 'grant_grace_extension', name: 'Grace Period Extension', description: 'Grant custom grace period extensions to customers', riskLevel: 'MEDIUM' },
    ],
  },
  {
    id: 'admin_pricing',
    name: 'Package & Price Studio',
    category: 'SaaS Central Main-Admin',
    description: 'Live pricing package creation, monthly/annual fee adjustments, and feature tiering.',
    route: '/admin/pricing',
    features: [
      { key: 'view_packages', name: 'Browse Pricing Catalog', description: 'Inspect all live and drafted subscription packages', riskLevel: 'LOW' },
      { key: 'edit_package_prices', name: 'Price Calibration', description: 'Update monthly and yearly subscription fees across packages', riskLevel: 'HIGH' },
      { key: 'edit_tier_features', name: 'Package Feature Bundling', description: 'Add, edit, or remove feature bullets and quotas', riskLevel: 'HIGH' },
      { key: 'publish_package_changes', name: 'Deploy Pricing to Production', description: 'Publish pricing changes live to all checkout flows', riskLevel: 'CRITICAL' },
    ],
  },
  {
    id: 'admin_security',
    name: 'Security & Threat Audit',
    category: 'SaaS Central Main-Admin',
    description: 'System-wide prompt injection threats, SSRF attacks, and emergency kill-switch.',
    route: '/admin/security',
    features: [
      { key: 'view_threat_stream', name: 'Global Threat Telemetry', description: 'View live feed of intercepted prompt injection and PII breaches', riskLevel: 'LOW' },
      { key: 'trigger_global_killswitch', name: 'Root Global Kill-Switch', description: 'Instantly shut down all proxy traffic globally in an emergency', riskLevel: 'CRITICAL' },
      { key: 'ban_ip_or_tenant', name: 'Attacker Blacklisting', description: 'Permanently block malicious IP addresses or bad actor organizations', riskLevel: 'CRITICAL' },
      { key: 'clear_violation_alerts', name: 'Acknowledge Incidents', description: 'Clear or archive resolved security incidents', riskLevel: 'MEDIUM' },
    ],
  },
  {
    id: 'admin_gateway',
    name: 'Gateway Fleet & Cluster',
    category: 'SaaS Central Main-Admin',
    description: 'Proxy container node status, real-time WebSocket sessions, and cluster diagnostics.',
    route: '/admin/gateway',
    features: [
      { key: 'view_cluster_nodes', name: 'Cluster Node Health', description: 'Monitor CPU, memory, and throughput of proxy worker nodes', riskLevel: 'LOW' },
      { key: 'drain_restart_node', name: 'Node Drain & Restart', description: 'Safely drain and reboot cluster container instances', riskLevel: 'HIGH' },
      { key: 'inspect_active_websockets', name: 'Active Agent Streams', description: 'Inspect real-time open WebSocket streams and proxy sessions', riskLevel: 'MEDIUM' },
    ],
  },
  {
    id: 'admin_settings',
    name: 'SaaS Platform Config',
    category: 'SaaS Central Main-Admin',
    description: 'System-wide maintenance mode, global announcement broadcasts, and zero-trust policies.',
    route: '/admin/settings',
    features: [
      { key: 'toggle_maintenance_mode', name: 'Maintenance Mode Toggle', description: 'Put entire platform into maintenance mode with custom banner', riskLevel: 'CRITICAL' },
      { key: 'broadcast_announcement', name: 'Global Announcement Broadcast', description: 'Send top-bar announcement to all logged-in portal users', riskLevel: 'HIGH' },
      { key: 'configure_saas_policies', name: 'Global Security Policies', description: 'Configure public signups, card verification, and strict firewall', riskLevel: 'HIGH' },
    ],
  },
];

// Helper to create all permissions enabled
export function createFullPagePermissions(enableAll = true): Record<PagePermissionId, PagePermissionConfig> {
  const result: Partial<Record<PagePermissionId, PagePermissionConfig>> = {};
  for (const page of MASTER_PAGES_REGISTRY) {
    const granularFeatures: Record<string, boolean> = {};
    for (const feat of page.features) {
      granularFeatures[feat.key] = enableAll;
    }
    result[page.id] = {
      enabled: enableAll,
      actions: {
        canView: enableAll,
        canCreate: enableAll,
        canEdit: enableAll,
        canDelete: enableAll,
        canExport: enableAll,
        canAdminOverride: enableAll,
      },
      granularFeatures,
    };
  }
  return result as Record<PagePermissionId, PagePermissionConfig>;
}

// Preset Default Roles
export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'role_super_admin',
    name: 'Super Admin & Root Operator',
    badge: 'Root Access',
    description: 'Unrestricted zero-trust root clearance across all application pages, tenant directories, and SaaS Central administrative consoles.',
    isSystem: true,
    color: '#d97706',
    clearanceLevel: 'LEVEL_5_ROOT',
    pagePermissions: createFullPagePermissions(true),
    assignedUsersCount: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z',
  },
  {
    id: 'role_security_officer',
    name: 'Chief Information Security Officer (CISO)',
    badge: 'Security Root',
    description: 'Full administrative authority over prompt firewalls, PII masking vaults, threat detection streams, and emergency kill-switches.',
    isSystem: true,
    color: '#ef4444',
    clearanceLevel: 'LEVEL_4_EXECUTIVE',
    pagePermissions: (() => {
      const perms = createFullPagePermissions(false);
      // Enable Security & Privacy, Merkle Audit, and Threat stream
      const activePages: PagePermissionId[] = [
        'prompt_firewall',
        'pii_vault',
        'merkle_audit',
        'admin_security',
        'proxy_gateway',
        'admin_gateway',
        'admin_roles',
      ];
      for (const pageId of activePages) {
        perms[pageId].enabled = true;
        perms[pageId].actions = {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
          canAdminOverride: true,
        };
        for (const featKey in perms[pageId].granularFeatures) {
          perms[pageId].granularFeatures[featKey] = true;
        }
      }
      return perms;
    })(),
    assignedUsersCount: 1,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-09-20T00:00:00Z',
  },
  {
    id: 'role_aiops_engineer',
    name: 'AI Operations & Platform Engineer',
    badge: 'Platform Ops',
    description: 'Complete management of live proxy traffic, autonomous agent loops, scoped virtual keys, and gateway container fleet clusters.',
    isSystem: true,
    color: '#3b82f6',
    clearanceLevel: 'LEVEL_3_ENGINEER',
    pagePermissions: (() => {
      const perms = createFullPagePermissions(false);
      const activePages: PagePermissionId[] = [
        'proxy_gateway',
        'virtual_keys',
        'agent_fleet',
        'admin_gateway',
        'analytics_cost',
        'team_workspace',
      ];
      for (const pageId of activePages) {
        perms[pageId].enabled = true;
        perms[pageId].actions = {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: pageId !== 'team_workspace',
          canExport: true,
          canAdminOverride: false,
        };
        for (const featKey in perms[pageId].granularFeatures) {
          perms[pageId].granularFeatures[featKey] = true;
        }
      }
      return perms;
    })(),
    assignedUsersCount: 2,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
  },
  {
    id: 'role_billing_director',
    name: 'Finance & Billing Director',
    badge: 'Financial Control',
    description: 'Full access to subscription revenue, dunning radar, automated credit card retries, pricing studio, and invoice records.',
    isSystem: true,
    color: '#10b981',
    clearanceLevel: 'LEVEL_3_ENGINEER',
    pagePermissions: (() => {
      const perms = createFullPagePermissions(false);
      const activePages: PagePermissionId[] = [
        'admin_dashboard',
        'admin_tenants',
        'admin_unpaid',
        'admin_pricing',
        'billing_portal',
        'analytics_cost',
      ];
      for (const pageId of activePages) {
        perms[pageId].enabled = true;
        perms[pageId].actions = {
          canView: true,
          canCreate: pageId === 'admin_pricing',
          canEdit: true,
          canDelete: false,
          canExport: true,
          canAdminOverride: false,
        };
        for (const featKey in perms[pageId].granularFeatures) {
          perms[pageId].granularFeatures[featKey] = true;
        }
      }
      return perms;
    })(),
    assignedUsersCount: 1,
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-09-15T00:00:00Z',
  },
  {
    id: 'role_compliance_auditor',
    name: 'Zero-Trust Compliance Auditor',
    badge: 'Read-Only Audit',
    description: 'Audit-only access to cryptographic Merkle proof ledgers, PII redaction logs, threat history, and certified compliance exports.',
    isSystem: true,
    color: '#8b5cf6',
    clearanceLevel: 'LEVEL_2_OPERATOR',
    pagePermissions: (() => {
      const perms = createFullPagePermissions(false);
      const auditPages: PagePermissionId[] = [
        'merkle_audit',
        'pii_vault',
        'prompt_firewall',
        'admin_security',
        'analytics_cost',
      ];
      for (const pageId of auditPages) {
        perms[pageId].enabled = true;
        perms[pageId].actions = {
          canView: true,
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canExport: true,
          canAdminOverride: false,
        };
        for (const featKey in perms[pageId].granularFeatures) {
          perms[pageId].granularFeatures[featKey] = featKey.startsWith('view_') || featKey.startsWith('export_') || featKey.startsWith('verify_');
        }
      }
      return perms;
    })(),
    assignedUsersCount: 1,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z',
  },
  {
    id: 'role_developer',
    name: 'Autonomous Agent Developer',
    badge: 'Developer',
    description: 'Standard developer rights to create agents, provision virtual keys, inspect personal traffic, and test firewall sandboxes.',
    isSystem: true,
    color: '#06b6d4',
    clearanceLevel: 'LEVEL_2_OPERATOR',
    pagePermissions: (() => {
      const perms = createFullPagePermissions(false);
      const devPages: PagePermissionId[] = [
        'proxy_gateway',
        'virtual_keys',
        'agent_fleet',
        'prompt_firewall',
        'analytics_cost',
      ];
      for (const pageId of devPages) {
        perms[pageId].enabled = true;
        perms[pageId].actions = {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: false,
          canExport: true,
          canAdminOverride: false,
        };
        for (const featKey in perms[pageId].granularFeatures) {
          // Disable dangerous override or sensitivity calibration
          perms[pageId].granularFeatures[featKey] = !featKey.includes('override') && !featKey.includes('kill');
        }
      }
      return perms;
    })(),
    assignedUsersCount: 3,
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'role_guest_observer',
    name: 'Read-Only Executive Observer',
    badge: 'Observer',
    description: 'Passive observer clearance for viewing dashboards and summaries without ability to modify configurations or execute tools.',
    isSystem: true,
    color: '#64748b',
    clearanceLevel: 'LEVEL_1_GUEST',
    pagePermissions: (() => {
      const perms = createFullPagePermissions(false);
      for (const page of MASTER_PAGES_REGISTRY) {
        perms[page.id].enabled = true;
        perms[page.id].actions = {
          canView: true,
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canExport: false,
          canAdminOverride: false,
        };
        for (const featKey in perms[page.id].granularFeatures) {
          perms[page.id].granularFeatures[featKey] = featKey.startsWith('view_');
        }
      }
      return perms;
    })(),
    assignedUsersCount: 1,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z',
  },
];

// Initial Portal Users / Operators
export const DEFAULT_PORTAL_USERS: PortalUser[] = [
  {
    id: 'usr_root_001',
    name: 'Hamudi (Primary Administrator)',
    email: 'hamudijems4@gmail.com',
    roleId: 'role_super_admin',
    department: 'Platform Architecture & Root Authority',
    clearance: 'LEVEL_5_ROOT',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLoginAt: 'Just now',
    lastLoginIp: '192.168.1.100 (Zero-Trust Verified)',
    createdAt: '2026-01-01T00:00:00Z',
    phone: '+1 (555) 019-2834',
    notes: 'Root SaaS central owner with full biometric MFA clearance and global kill-switch capability.',
  },
  {
    id: 'usr_sec_002',
    name: 'Sarah Chen, CISO',
    email: 'sarah.chen@agentlens.security',
    roleId: 'role_security_officer',
    department: 'Cybersecurity & Threat Defense',
    clearance: 'LEVEL_4_EXECUTIVE',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLoginAt: '18 mins ago',
    lastLoginIp: '10.0.4.12',
    createdAt: '2026-01-15T09:30:00Z',
    phone: '+1 (555) 839-4412',
    notes: 'Lead security operator for Prompt Firewall AST rules and incident triage.',
  },
  {
    id: 'usr_ops_003',
    name: 'Darius Vance',
    email: 'darius.vance@agentlens.infra',
    roleId: 'role_aiops_engineer',
    department: 'Cloud Infrastructure & Gateway Fleet',
    clearance: 'LEVEL_3_ENGINEER',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLoginAt: '2 hours ago',
    lastLoginIp: '10.0.12.89',
    createdAt: '2026-02-10T14:15:00Z',
    phone: '+1 (555) 923-1104',
    notes: 'Manages container proxy nodes and WebSocket session scalability.',
  },
  {
    id: 'usr_fin_004',
    name: 'Elena Rostova',
    email: 'elena.rostova@agentlens.finance',
    roleId: 'role_billing_director',
    department: 'Revenue & Financial Operations',
    clearance: 'LEVEL_3_ENGINEER',
    status: 'ACTIVE',
    mfaEnabled: false,
    lastLoginAt: 'Yesterday, 16:40',
    lastLoginIp: '172.16.8.44',
    createdAt: '2026-03-01T11:00:00Z',
    phone: '+1 (555) 441-9923',
    notes: 'Controls dunning email radar, invoice settlement, and package pricing updates.',
  },
  {
    id: 'usr_audit_005',
    name: 'Arthur Sterling',
    email: 'arthur.sterling@compliance-guard.org',
    roleId: 'role_compliance_auditor',
    department: 'External Governance & SOC2 Compliance',
    clearance: 'LEVEL_2_OPERATOR',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLoginAt: '3 days ago',
    lastLoginIp: '198.51.100.24',
    createdAt: '2026-04-12T08:00:00Z',
    notes: 'External auditor inspecting Merkle trees and cryptographic proof verification.',
  },
];
