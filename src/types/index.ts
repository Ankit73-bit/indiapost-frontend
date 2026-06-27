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
  user: AuthUser;
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

export interface ClientSummaryStats {
  total: number;
  active: number;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export type NoticeType = string;
export type ListStatus =
  | 'DRAFT'
  | 'IMPORTING'
  | 'ACTIVE'
  | 'SYNCING'
  | 'COMPLETED';

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

export interface PdfArticleItem {
  articleNumber: string;
  isTerminal: boolean;
  normalizedStatus?: string;
}

/** @deprecated Legacy — PDFs are no longer pre-stored in S3 */
export interface GeneratedPdf {
  articleNumber: string;
  s3Key?: string;
  sizeBytes?: number;
  generatedAt?: string;
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
  articles: PdfArticleItem[];
  /** @deprecated Use articles — kept for older API responses */
  generatedPdfs?: GeneratedPdf[];
}

export type ListStats = Partial<Record<NormalizedStatus, number>>;

export interface UploadedFile {
  originalName: string;
  contentType?: string;
  sizeBytes: number;
  uploadedAt: string;
  /** Present only on lists imported before DB-backed file storage */
  s3Key?: string;
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
  /** Dispatch date order — default newest dispatch first */
  sortOrder?: 'asc' | 'desc';
}

export interface ListSummaryStats {
  total: number;
  importing: number;
  syncing: number;
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
  /** Admin API only — India Post no longer returns tracking for this article */
  indiaPostTrackingExpired?: boolean;
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
  nonTerminal?: boolean;
  /** Admin only */
  trackingExpired?: boolean;
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

export interface SyncableArticleFilters {
  status?: NormalizedStatus;
  search?: string;
  syncFailed?: boolean;
  nonTerminal?: boolean;
}

export interface TriggerArticlesBody {
  clientId: string;
  listId: string;
  articleIds?: string[];
  syncFilters?: SyncableArticleFilters;
}

export interface TriggerArticlesResponse {
  syncJobId: string;
  enqueued: number;
}

export interface BulkRetryResponse {
  enqueued: number;
  syncJobIds: string[];
}

export interface FailedArticleRetryFilters {
  clientId?: string;
  listId?: string;
  search?: string;
}

export type BulkRetryBody =
  | { articleIds: string[]; retryFilters?: never }
  | { retryFilters: FailedArticleRetryFilters; articleIds?: never };

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

export interface TrackingExpiredArticle {
  _id: string;
  articleId: string;
  articleNumber: string;
  clientId: string;
  listId: string;
  listName?: string;
  dispatchDate?: string;
  bookedOn?: string;
  normalizedStatus: NormalizedStatus;
  lastSyncedAt?: string;
  updatedAt: string;
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

// ─── Notice Generator ─────────────────────────────────────────────────────────

export type NoticeVersionStatus = 'draft' | 'active' | 'inactive';

export interface NoticeTableColumnConfig {
  name: string;
  format: 'str' | 'int' | 'float' | 'date' | 'time';
}

export interface NoticeTableConfig {
  id: string;
  placeholder_pattern: string;
  id_column: string;
  row_count_field?: string;
  columns: NoticeTableColumnConfig[];
}

export interface NoticeListFieldConfig {
  field_name: string;
  placeholder: string;
}

export type DateOutputStyle = 'dd-mm-yyyy' | 'dd-mmm-yyyy';

export interface VariableValidationResult {
  detected: string[];
  configured: string[];
  matched: string[];
  missingInConfig: string[];
  unusedInConfig: string[];
  isValid: boolean;
}

export interface NoticeConfig {
  notice_id: string;
  notice_name: string;
  with_header: boolean;
  id_field: string;
  sort_field?: string;
  description?: string;
  rotation?: boolean;
  max_rows: number;
  file_name?: string[];
  date_input_format?: string;
  date_output_style?: DateOutputStyle;
  variable_fields?: string[];
  date_fields?: string[];
  decimal_fields?: string[];
  list_fields?: NoticeListFieldConfig[];
  tables?: NoticeTableConfig[];
  default_password?: string;
  password_field?: string;
}

export interface NoticeVersionMetadata {
  variables: string[];
  images: string[];
  variableValidation?: VariableValidationResult;
  description?: string;
  createdBy?: string;
  configFileName?: string;
}

export interface NoticeTemplateVersion {
  version: string;
  status: NoticeVersionStatus;
  noticeConfig: NoticeConfig;
  templateMap: Record<string, string>;
  storagePrefix: string;
  fileNames: string[];
  metadata: NoticeVersionMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeTemplate {
  _id: string;
  clientId: string;
  noticeId: string;
  noticeName: string;
  activeVersion?: string;
  linkedConfigId?: string;
  versions: NoticeTemplateVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface SampleExcelPreviewData {
  columns: string[];
  rows: string[][];
  totalRowCount: number;
}

export interface SampleExcelValidationResult {
  isValid: boolean;
  requiredColumns: string[];
  indexedColumns: string[];
  foundColumns: string[];
  missingColumns: string[];
  incorrectNaming: Array<{ expected: string; found: string }>;
  rowCount: number;
  maxRows: number;
  tooManyRows: boolean;
  noDataRows: boolean;
  preview?: SampleExcelPreviewData;
}

export interface NoticeConfigRecord {
  _id: string;
  clientId: string;
  name: string;
  noticeId: string;
  config: NoticeConfig;
  configFileName: string;
  linkedTemplateId?: string;
  sampleExcelFileName?: string;
  sampleExcelValidated?: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListNoticeConfigsQuery {
  clientId: string;
  page?: number;
  limit?: number;
}

export interface CreateNoticeConfigBody {
  clientId: string;
  config: NoticeConfig;
  configFileName?: string;
  description?: string;
  linkedTemplateId?: string;
}

export interface ListNoticeTemplatesQuery {
  clientId: string;
  page?: number;
  limit?: number;
}

export interface CreateNoticeTemplateBody {
  clientId: string;
  noticeConfig?: NoticeConfig;
  configId?: string;
  noticeName?: string;
  noticeId?: string;
  description?: string;
}

export type NoticeExcelStatus = 'VALIDATED' | 'VALIDATION_FAILED' | 'PROCESSING';

export interface NoticeExcelRecord {
  _id: string;
  clientId: string;
  name: string;
  slug: string;
  noticeName?: string;
  noticeType?: string;
  noticeDate: string;
  dispatchDate?: string;
  description?: string;
  templateId?: string;
  templateVersion?: string;
  configId?: string;
  templateName?: string;
  configName?: string;
  excelFileName?: string;
  rowCount: number;
  status: NoticeExcelStatus;
  validationResult?: SampleExcelValidationResult;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeExcelDetail extends NoticeExcelRecord {
  templateName?: string;
  configName?: string;
  uploadedByName?: string;
}

export interface MatchingTemplate {
  templateId: string;
  templateName: string;
  noticeId: string;
  configId: string;
  configName: string;
  activeVersion: string;
  validation: SampleExcelValidationResult;
}

export interface ValidateProductionExcelResult {
  isValid: boolean;
  validation: SampleExcelValidationResult;
  matchingTemplates: MatchingTemplate[];
  error?: string;
}

export interface ListNoticeExcelsQuery {
  clientId: string;
  search?: string;
  status?: NoticeExcelStatus;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateNoticeExcelBody {
  clientId: string;
  name: string;
  slug: string;
  noticeName: string;
  noticeType: string;
  noticeDate: string;
  dispatchDate?: string;
  description?: string;
  templateId: string;
}
