// EVENTFLOW Domain Types and Interfaces

export type EventStatus = 'Draft' | 'Published' | 'Completed' | 'Cancelled';
export type EventType = 'Conference' | 'Webinar' | 'Workshop' | 'Networking' | 'Summit' | 'Hybrid';

export type RegistrationStatus = 'Registered' | 'Confirmed' | 'Attended' | 'No-show' | 'Cancelled';
export type TicketType = 'General' | 'VIP' | 'Speaker' | 'Sponsor' | 'Press';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Nurturing' | 'Customer' | 'Inactive';
export type CompanyTier = 'Enterprise' | 'Mid-Market' | 'SMB' | 'Startup';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'In_Progress' | 'Completed' | 'Cancelled';

export type OpportunityStage = 'Discovery' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export type ActivityType = 
  | 'REGISTRATION_CREATED'
  | 'STATUS_CHANGED'
  | 'CHECK_IN'
  | 'NOTE_ADDED'
  | 'TASK_COMPLETED'
  | 'OPPORTUNITY_STAGE_CHANGED'
  | 'EMAIL_SENT'
  | 'MEETING_LOGGED'
  | 'AI_INSIGHT_GENERATED';

export type AITaskType = 
  | 'event_brief'
  | 'followup_draft'
  | 'meeting_notes'
  | 'lead_classification'
  | 'operational_query'
  | 'segment_suggestions';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZER' | 'STAFF' | 'VIEWER';
  avatarUrl?: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  eventType: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  timezone: string;
  location?: string | null;
  venueAddress?: string | null;
  virtualUrl?: string | null;
  capacity: number;
  registeredCount: number;
  attendedCount: number;
  bannerUrl?: string | null;
  tags: string[];
  targetAudience?: string | null;
  budget: number;
  expectedRevenue: number;
  workspaceId: string;
  createdById?: string | null;
  createdBy?: User | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  registrations?: Registration[];
  tasks?: Task[];
  opportunities?: Opportunity[];
  activities?: Activity[];
  stats?: EventStats;
}

export interface EventStats {
  capacityUtilization: number;
  attendanceRate: number;
  pipelineGenerated: number;
  revenueAttributed: number;
  leadsGenerated: number;
}

export interface Company {
  id: string;
  name: string;
  domain?: string | null;
  industry: string;
  size: string;
  tier: CompanyTier;
  logoUrl?: string | null;
  website?: string | null;
  headquarters?: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  contacts?: Contact[];
  opportunities?: Opportunity[];
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  title?: string | null;
  companyId?: string | null;
  company?: Company | null;
  leadScore: number;
  leadStatus: LeadStatus;
  tags: string[];
  city?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  registrations?: Registration[];
  opportunities?: Opportunity[];
  tasks?: Task[];
  activities?: Activity[];
}

export interface Registration {
  id: string;
  eventId: string;
  contactId: string;
  ticketType: TicketType;
  status: RegistrationStatus;
  utmSource: string; // 'LinkedIn' | 'Direct' | 'Email' | 'Partner' | etc.
  utmMedium?: string | null;
  utmCampaign?: string | null;
  checkInTime?: string | null;
  notes?: string | null;
  customAnswers?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  event?: Event;
  contact?: Contact;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  contactId?: string | null;
  eventId?: string | null;
  assignedToId?: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  contact?: Contact | null;
  event?: Event | null;
  assignedTo?: User | null;
}

export interface Opportunity {
  id: string;
  title: string;
  value: number;
  stage: OpportunityStage;
  probability: number;
  closeDate?: string | null;
  companyId?: string | null;
  contactId?: string | null;
  eventId?: string | null;
  notes?: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  company?: Company | null;
  contact?: Contact | null;
  event?: Event | null;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, any> | null;
  contactId?: string | null;
  eventId?: string | null;
  opportunityId?: string | null;
  userId?: string | null;
  workspaceId: string;
  createdAt: string;

  // Relations
  contact?: Contact | null;
  event?: Event | null;
  opportunity?: Opportunity | null;
  user?: User | null;
}

export interface AIInteraction {
  id: string;
  type: AITaskType;
  prompt: string;
  response: string;
  tokensUsed?: number | null;
  model: string;
  metadata?: Record<string, any> | null;
  eventId?: string | null;
  contactId?: string | null;
  createdAt: string;
}

// Analytics and Metrics
export interface KPIs {
  totalEvents: number;
  activeEvents: number;
  totalRegistrations: number;
  totalAttendees: number;
  overallAttendanceRate: number;
  totalPipelineValue: number;
  totalWonRevenue: number;
  totalLeads: number;
  qualifiedLeads: number;
  activeTasks: number;
}

export interface RegistrationTrendPoint {
  date: string;
  registrations: number;
  attendees: number;
}

export interface EventComparisonMetric {
  id: string;
  title: string;
  eventType: string;
  startDate: string;
  registered: number;
  attended: number;
  capacity: number;
  attendanceRate: number;
  pipeline: number;
  revenue: number;
}

export interface SourceBreakdown {
  source: string;
  count: number;
  percentage: number;
  conversionRate: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  dropoffRate?: number;
}

export interface LeadStatusMetric {
  status: LeadStatus;
  count: number;
  percentage: number;
}

export interface IndustryMetric {
  industry: string;
  companyCount: number;
  contactCount: number;
  pipelineValue: number;
}

export interface AnalyticsMetrics {
  kpis: KPIs;
  registrationTrends: RegistrationTrendPoint[];
  eventComparisons: EventComparisonMetric[];
  sourceBreakdown: SourceBreakdown[];
  funnel: FunnelStage[];
  leadStatusDistribution: LeadStatusMetric[];
  industryBreakdown: IndustryMetric[];
}

// API Payloads
export interface CreateRegistrationRequest {
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  companyName?: string;
  industry?: string;
  ticketType?: TicketType;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  notes?: string;
  customAnswers?: Record<string, any>;
}

export interface UpdateRegistrationRequest {
  status?: RegistrationStatus;
  ticketType?: TicketType;
  checkInTime?: string | null;
  notes?: string;
}

export interface CreateEventRequest {
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  eventType: EventType;
  status?: EventStatus;
  startDate: string;
  endDate: string;
  timezone?: string;
  location?: string;
  venueAddress?: string;
  virtualUrl?: string;
  capacity: number;
  bannerUrl?: string;
  tags?: string[];
  budget?: number;
  expectedRevenue?: number;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  companyId?: string;
  companyName?: string;
  leadScore?: number;
  leadStatus?: LeadStatus;
  tags?: string[];
  city?: string;
  country?: string;
  bio?: string;
  linkedinUrl?: string;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {}

export interface CreateOpportunityRequest {
  title: string;
  value: number;
  stage: OpportunityStage;
  probability?: number;
  closeDate?: string;
  companyId?: string;
  contactId?: string;
  eventId?: string;
  notes?: string;
}

export interface UpdateOpportunityRequest extends Partial<CreateOpportunityRequest> {}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  contactId?: string;
  eventId?: string;
  assignedToId?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {}

export interface AIRequest {
  type: AITaskType;
  eventId?: string;
  contactId?: string;
  prompt?: string;
  context?: Record<string, any>;
}

export interface AIResponse {
  type: AITaskType;
  result: string;
  structuredData?: any;
  model: string;
  isFallback: boolean;
  timestamp: string;
}
