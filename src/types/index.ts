// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'customer';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  clientId: string | null; // null for admins
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

// ─── Status ───────────────────────────────────────────────────────────────────

export type NormalizedStatus =
  | 'BOOKED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'NOT_DELIVERED'
  | 'RETURNED'
  | 'DELIVERED_RTO'
  | 'UNKNOWN';

export const ALL_STATUSES: NormalizedStatus[] = [
  'BOOKED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'NOT_DELIVERED',
  'RETURNED',
  'DELIVERED_RTO',
  'UNKNOWN',
];

export const TERMINAL_STATUSES: NormalizedStatus[] = ['DELIVERED', 'DELIVERED_RTO'];

// ─── User (Public shape — no password) ───────────────────────────────────────

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  clientId: string | null;
  isActive: boolean;
}

export interface ListUsersQuery {
  role?: UserRole;
  clientId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UpdateMeBody {
  name: string;
}

export interface UpdatePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateEmailBody {
  newEmail: string;
  password: string;
}

export interface AdminUpdateUserBody {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface AssignClientBody {
  clientId: string | null;
}

// ─── Client ───────────────────────────────────────────────────────────────────

export interface ClientSettings {
  timezone: string;
  webhookUrl?: string;
  autoSyncEnabled: boolean;
  syncIntervalHours: number;
  maxRetries: number;
}

export interface Client {
  _id: string;
  name: string;
  slug: string;
  settings: ClientSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientBody {
  name: string;
  slug: string;
  settings?: Partial<ClientSettings>;
}

export interface UpdateClientBody {
  name?: string;
  settings?: Partial<ClientSettings>;
}

export interface ListClientsQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export type NoticeType = string;
export type ListStatus =
  | 'DRAFT'
  | 'IMPORTING'
  | 'ACTIVE'
  | 'SYNCING'
  | 'COMPLETED'
  | 'ARCHIVED';

export interface ImportProgress {
  totalRows: number;
  processedRows: number;
  failedRows?: number;
  startedAt: string;
  updatedAt?: string;
  fileName?: string;
}

export interface SyncProgress {
  syncJobId: string;
  totalArticles: number;
  processedCount: number;
  failedCount: number;
  startedAt: string;
}

export interface GeneratedPdf {
  articleNumber: string;
  s3Key: string;
  sizeBytes: number;
  generatedAt: string;
  isTerminal: boolean;
}

export interface PdfGenerationProgress {
  jobId: string;
  totalArticles: number;
  processedCount: number;
  skippedCount: number;
  failedCount: number;
  startedAt: string;
  updatedAt?: string;
}

export interface PdfGenerationResult {
  generated: number;
  skipped: number;
  failed: number;
  completedAt: string;
}

export interface ListPdfsSummary {
  totalArticles: number;
  pdfCount: number;
  generatedPdfs: GeneratedPdf[];
  pdfProgress?: PdfGenerationProgress;
  lastPdfGenerationResult?: PdfGenerationResult;
  pdfError?: string;
}

export type ListStats = Partial<Record<NormalizedStatus, number>>;

export interface UploadedFile {
  originalName: string;
  s3Key: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface ImportResult {
  totalRows: number;
  imported: number;
  skipped: number;
  errorRows: Array<{ row: number; reason: string }>;
  completedAt: string;
}

export interface List {
  _id: string;
  clientId: string;
  name: string;
  slug: string;
  noticeName?: string;
  noticeType?: NoticeType;
  noticeDate: string;
  dispatchDate: string;
  description?: string;
  uploadedFile?: UploadedFile;
  totalArticles: number;
  stats: ListStats;
  status: ListStatus;
  lastImportResult?: ImportResult;
  importProgress?: ImportProgress;
  importError?: string;
  syncProgress?: SyncProgress;
  pdfProgress?: PdfGenerationProgress;
  lastPdfGenerationResult?: PdfGenerationResult;
  generatedPdfs?: GeneratedPdf[];
  pdfError?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListBody {
  clientId: string;
  name: string;
  slug: string;
  noticeName: string;
  noticeType: string;
  noticeDate: string;
  dispatchDate: string;
  description?: string;
}

export interface UpdateListBody {
  name?: string;
  noticeName?: string;
  noticeType?: string;
  noticeDate?: string;
  dispatchDate?: string;
  description?: string;
}

export interface ListListsQuery {
  clientId?: string;
  status?: ListStatus;
  search?: string;
  year?: number;
  month?: number;
  noticeType?: string;
  page?: number;
  limit?: number;
}

// ─── Article ──────────────────────────────────────────────────────────────────

export interface Recipient {
  name: string;
  mobile?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface BookingDetails {
  bookedAt?: string;
  bookedOn?: string;
  originPincode?: string;
  destinationPincode?: string;
  tariff?: number;
  articleType?: string;
  deliveryLocation?: string;
  deliveryConfirmedOn?: string;
}

export interface LatestEvent {
  eventDate: string;
  office: string;
  officeId?: string;
  rawEvent: string;
  normalizedStatus: NormalizedStatus;
}

export interface Article {
  _id: string;
  clientId: string;
  listId: string;
  articleNumber: string;
  recipient: Recipient;
  attributes: Record<string, string>;
  normalizedStatus: NormalizedStatus;
  isTerminal: boolean;
  lastSyncedAt?: string;
  syncAttempts: number;
  syncError?: string;
  syncErrorAt?: string;
  deliveredAt?: string;
  bookingDetails?: BookingDetails;
  latestEvent?: LatestEvent;
  importRowNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleStats {
  totalArticles: number;
  terminalCount: number;
  deliveryRate: number;
  byStatus: Record<string, number>;
  lastSyncedAt?: string | null;
}

export interface TrackingEvent {
  _id: string;
  articleId: string;
  clientId: string;
  eventDate: string;
  office: string;
  officeId?: string;
  rawEvent: string;
  normalizedStatus: NormalizedStatus;
  createdAt: string;
}

export interface ListArticlesQuery {
  clientId: string;
  listId?: string;
  status?: NormalizedStatus;
  search?: string;
  syncFailed?: boolean;
  page?: number;
  limit?: number;
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

export type SyncJobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';

export interface SyncBatch {
  batchNumber: number;
  articleIds: string[];
  status: SyncJobStatus;
  processedCount: number;
  failedCount: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface SyncJob {
  _id: string;
  clientId: string;
  listId?: string;
  type: 'MANUAL' | 'SCHEDULED' | 'RETRY' | 'PARTIAL';
  triggeredBy: string;
  status: SyncJobStatus;
  totalArticles: number;
  totalBatches: number;
  processedCount: number;
  failedCount: number;
  skippedCount: number;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TriggerSyncBody {
  clientId: string;
  listId?: string;
}

export interface TriggerSyncResponse {
  syncJobId: string | null;
  message: string;
}

export interface FailedArticle {
  _id: string;
  articleId: string;
  clientId: string;
  listId: string;
  articleNumber: string;
  reason: string;
  retryCount: number;
  isResolved: boolean;
  updatedAt: string;
  createdAt: string;
}

export type SyncJobType = 'MANUAL' | 'SCHEDULED' | 'RETRY' | 'PARTIAL';

export interface ListSyncJobsQuery {
  clientId?: string;
  listId?: string;
  status?: SyncJobStatus;
  type?: SyncJobType;
  fromDate?: string;
  toDate?: string;
  listOnly?: boolean;
  page?: number;
  limit?: number;
}
