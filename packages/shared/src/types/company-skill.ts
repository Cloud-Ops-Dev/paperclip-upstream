export type CompanySkillSourceType = "local_path" | "github" | "url" | "catalog" | "skills_sh";

export type CompanySkillTrustLevel = "markdown_only" | "assets" | "scripts_executables";

export type CompanySkillCompatibility = "compatible" | "unknown" | "invalid";

export type CompanySkillSourceBadge = "paperclip" | "github" | "local" | "url" | "catalog" | "skills_sh";

export interface CompanySkillFileInventoryEntry {
  path: string;
  kind: "skill" | "markdown" | "reference" | "script" | "asset" | "other";
}

// ---------------------------------------------------------------------------
// Skills-loop V2 contract metadata (stored in CompanySkill.metadata)
// ---------------------------------------------------------------------------

/** Routing trigger conditions from skills-loop V2 contract. */
export interface SkillRoutingTrigger {
  keywords?: string[];
  patterns?: string[];
  task_types?: string[];
  tool_intensity?: string[];
  context_signals?: string[];
}

/** Routing exclusion rules from skills-loop V2 contract. */
export interface SkillRoutingExclusion {
  keywords?: string[];
  patterns?: string[];
  task_types?: string[];
  conflicts_with?: string[];
}

/** Full routing signal from skills-loop V2 contract. */
export interface SkillRoutingSignal {
  triggers?: SkillRoutingTrigger;
  exclusions?: SkillRoutingExclusion;
  priority?: number;
  confidence_threshold?: number;
}

/** Output field definition from skills-loop V2 contract. */
export interface SkillOutputField {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  constraints?: Record<string, unknown>;
}

/** Output contract from skills-loop V2 contract. */
export interface SkillOutputContract {
  schema_fields?: SkillOutputField[];
  guarantees?: string[];
  max_latency_ms?: number | null;
  idempotent?: boolean;
}

/** Provenance metadata from skills-loop V2 contract. */
export interface SkillProvenance {
  trust_level?: "trusted" | "reviewed" | "unreviewed";
  source_type?: string;
  source_uri?: string;
  reviewed_by?: string;
  reviewed_at?: string | null;
  safety_scan_passed?: boolean | null;
  safety_scan_at?: string | null;
}

/**
 * Skills-loop V2 contract fields stored in CompanySkill.metadata.
 * Extracted from SKILL.md YAML frontmatter during import.
 * Absent for V1 skills (no routing, no contracts).
 */
export interface SkillContractMetadata {
  skillsLoopVersion?: "2";
  routing?: SkillRoutingSignal;
  outputContract?: SkillOutputContract;
  provenance?: SkillProvenance;
  owner?: string;
  maturity?: "draft" | "active" | "deprecated";
}

export interface CompanySkill {
  id: string;
  companyId: string;
  key: string;
  slug: string;
  name: string;
  description: string | null;
  markdown: string;
  sourceType: CompanySkillSourceType;
  sourceLocator: string | null;
  sourceRef: string | null;
  trustLevel: CompanySkillTrustLevel;
  compatibility: CompanySkillCompatibility;
  fileInventory: CompanySkillFileInventoryEntry[];
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanySkillListItem {
  id: string;
  companyId: string;
  key: string;
  slug: string;
  name: string;
  description: string | null;
  sourceType: CompanySkillSourceType;
  sourceLocator: string | null;
  sourceRef: string | null;
  trustLevel: CompanySkillTrustLevel;
  compatibility: CompanySkillCompatibility;
  fileInventory: CompanySkillFileInventoryEntry[];
  createdAt: Date;
  updatedAt: Date;
  attachedAgentCount: number;
  editable: boolean;
  editableReason: string | null;
  sourceLabel: string | null;
  sourceBadge: CompanySkillSourceBadge;
  sourcePath: string | null;
  // Skills-loop V2 metadata (surfaced for UI badges)
  routingPriority: number | null;
  maturity: string | null;
  contractVersion: string | null;
}

export interface CompanySkillUsageAgent {
  id: string;
  name: string;
  urlKey: string;
  adapterType: string;
  desired: boolean;
  /**
   * Runtime adapter skill state when a caller explicitly fetched it.
   * Company skill detail reads intentionally return null here to avoid probing
   * agent runtimes while loading operator-facing skill metadata.
   */
  actualState: string | null;
}

export interface CompanySkillDetail extends CompanySkill {
  attachedAgentCount: number;
  usedByAgents: CompanySkillUsageAgent[];
  editable: boolean;
  editableReason: string | null;
  sourceLabel: string | null;
  sourceBadge: CompanySkillSourceBadge;
  sourcePath: string | null;
  // Skills-loop V2 metadata (surfaced for UI)
  routingPriority: number | null;
  maturity: string | null;
  contractVersion: string | null;
}

export interface CompanySkillUpdateStatus {
  supported: boolean;
  reason: string | null;
  trackingRef: string | null;
  currentRef: string | null;
  latestRef: string | null;
  hasUpdate: boolean;
}

export interface CompanySkillImportRequest {
  source: string;
}

export interface CompanySkillImportResult {
  imported: CompanySkill[];
  warnings: string[];
}

export interface CompanySkillProjectScanRequest {
  projectIds?: string[];
  workspaceIds?: string[];
}

export interface CompanySkillProjectScanSkipped {
  projectId: string;
  projectName: string;
  workspaceId: string | null;
  workspaceName: string | null;
  path: string | null;
  reason: string;
}

export interface CompanySkillProjectScanConflict {
  slug: string;
  key: string;
  projectId: string;
  projectName: string;
  workspaceId: string;
  workspaceName: string;
  path: string;
  existingSkillId: string;
  existingSkillKey: string;
  existingSourceLocator: string | null;
  reason: string;
}

export interface CompanySkillProjectScanResult {
  scannedProjects: number;
  scannedWorkspaces: number;
  discovered: number;
  imported: CompanySkill[];
  updated: CompanySkill[];
  skipped: CompanySkillProjectScanSkipped[];
  conflicts: CompanySkillProjectScanConflict[];
  warnings: string[];
}

export interface CompanySkillCreateRequest {
  name: string;
  slug?: string | null;
  description?: string | null;
  markdown?: string | null;
}

export interface CompanySkillFileDetail {
  skillId: string;
  path: string;
  kind: CompanySkillFileInventoryEntry["kind"];
  content: string;
  language: string | null;
  markdown: boolean;
  editable: boolean;
}

export interface CompanySkillFileUpdateRequest {
  path: string;
  content: string;
}
