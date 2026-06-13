CREATE TABLE `agentic_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskType` enum('policy_draft','policy_update','gap_remediation','evidence_collection','report_generation','notification_send') NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`triggeredBy` enum('ai_recommendation','regulatory_update','manual','scheduled') NOT NULL,
	`sourceId` int,
	`sourceType` varchar(64),
	`assignedTo` int,
	`aiGeneratedContent` text,
	`status` enum('queued','in_progress','awaiting_approval','approved','rejected','completed','failed') NOT NULL DEFAULT 'queued',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`approvedBy` int,
	`approvedAt` timestamp,
	`completedAt` timestamp,
	`errorMessage` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agentic_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_explainability_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recommendationId` int,
	`policyId` int,
	`regulatoryUpdateId` int,
	`modelUsed` varchar(128),
	`inputContext` text,
	`regulatoryReferences` json,
	`policyClausesAnalyzed` json,
	`confidenceScore` int,
	`reasoning` text,
	`decisionFactors` json,
	`alternativesConsidered` json,
	`humanReviewRequired` boolean DEFAULT false,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_explainability_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`category` enum('risk_alert','compliance_suggestion','policy_update','efficiency_improvement','regulatory_change') NOT NULL,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`relatedPolicyId` int,
	`relatedDepartment` varchar(128),
	`status` enum('new','acknowledged','implemented','dismissed') NOT NULL DEFAULT 'new',
	`confidenceScore` int DEFAULT 0,
	`actionItems` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`keyHash` varchar(256) NOT NULL,
	`keyPrefix` varchar(16) NOT NULL,
	`permissions` json,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`requestType` enum('policy_approval','delegation_approval','expense_approval','contract_approval','compliance_exception') NOT NULL,
	`requesterId` int,
	`approverId` int,
	`relatedPolicyId` int,
	`relatedDelegationId` int,
	`amount` decimal(15,2),
	`currency` varchar(3) DEFAULT 'GBP',
	`status` enum('pending','approved','rejected','escalated') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`dueDate` timestamp,
	`approvedAt` timestamp,
	`rejectedAt` timestamp,
	`comments` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approval_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_trail` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` varchar(64) NOT NULL,
	`entityId` int NOT NULL,
	`action` enum('create','update','delete','approve','reject','view','export') NOT NULL,
	`userId` int,
	`userName` varchar(256),
	`previousValue` json,
	`newValue` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`hashValue` varchar(64),
	`previousHashValue` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_trail_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `benchmark_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int,
	`industry` varchar(128) NOT NULL,
	`orgSize` enum('1-10','11-50','51-200','201-500','500+') NOT NULL,
	`overallScore` int NOT NULL,
	`policyScore` int,
	`auditScore` int,
	`riskScore` int,
	`complianceScore` int,
	`anonymizedId` varchar(64) NOT NULL,
	`snapshotDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `benchmark_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_passports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int,
	`issuedTo` int,
	`passportHash` varchar(256) NOT NULL,
	`overallScore` int NOT NULL,
	`frameworks` json,
	`certifications` json,
	`validFrom` timestamp NOT NULL DEFAULT (now()),
	`validUntil` timestamp NOT NULL,
	`status` enum('active','expired','revoked') NOT NULL DEFAULT 'active',
	`accessLog` json,
	`sharedWith` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_passports_id` PRIMARY KEY(`id`),
	CONSTRAINT `compliance_passports_passportHash_unique` UNIQUE(`passportHash`)
);
--> statement-breakpoint
CREATE TABLE `compliance_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`policyId` int,
	`department` varchar(128) NOT NULL,
	`complianceStatus` enum('compliant','partial','non_compliant','pending_review') NOT NULL DEFAULT 'pending_review',
	`score` int DEFAULT 0,
	`lastAssessmentDate` timestamp,
	`nextAssessmentDate` timestamp,
	`findings` text,
	`remediation` text,
	`assessorId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(256),
	`phone` varchar(32),
	`inquiryType` enum('demo','pricing','partnership','support','general','media') NOT NULL,
	`subject` varchar(512) NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','read','replied','resolved','archived') NOT NULL DEFAULT 'new',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`assignedTo` int,
	`notes` text,
	`repliedAt` timestamp,
	`resolvedAt` timestamp,
	`source` varchar(64) DEFAULT 'contact_page',
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contact_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delegation_authority` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`authorityType` enum('financial','operational','contractual','hr','procurement','compliance') NOT NULL,
	`delegatorId` int,
	`delegateeId` int,
	`thresholdAmount` decimal(15,2),
	`thresholdCurrency` varchar(3) DEFAULT 'GBP',
	`conditions` text,
	`status` enum('active','pending','expired','revoked') NOT NULL DEFAULT 'pending',
	`effectiveFrom` timestamp,
	`effectiveTo` timestamp,
	`approvalChain` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `delegation_authority_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `demo_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(256) NOT NULL,
	`phone` varchar(32),
	`message` text,
	`status` enum('new','contacted','qualified','converted','closed') NOT NULL DEFAULT 'new',
	`source` varchar(64) DEFAULT 'website',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demo_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`code` varchar(32) NOT NULL,
	`description` text,
	`headId` int,
	`parentId` int,
	`complianceScore` int DEFAULT 0,
	`riskLevel` enum('low','medium','high','critical') NOT NULL DEFAULT 'low',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `esg_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int,
	`reportingPeriod` varchar(32) NOT NULL,
	`category` enum('environmental','social','governance') NOT NULL,
	`metricName` varchar(256) NOT NULL,
	`metricValue` varchar(256),
	`unit` varchar(64),
	`target` varchar(256),
	`status` enum('on_track','at_risk','off_track','achieved') NOT NULL DEFAULT 'on_track',
	`regulatoryFramework` varchar(128),
	`evidenceUrl` text,
	`notes` text,
	`recordedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `esg_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidence_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`evidenceType` enum('access_log','training_certificate','policy_acknowledgment','audit_report','test_result','screenshot','document','api_response') NOT NULL,
	`source` enum('manual','microsoft365','google_workspace','aws','api','automated') NOT NULL DEFAULT 'manual',
	`relatedPolicyId` int,
	`relatedControlId` varchar(128),
	`fileUrl` text,
	`fileHash` varchar(256),
	`collectedBy` int,
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`expiresAt` timestamp,
	`metadata` json,
	`status` enum('collected','verified','expired','rejected') NOT NULL DEFAULT 'collected',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evidence_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incident_simulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`scenarioType` enum('data_breach','regulatory_change','system_outage','fraud_incident','third_party_failure','cyber_attack','staff_misconduct') NOT NULL,
	`description` text,
	`triggeredBy` int,
	`affectedPolicies` json,
	`simulatedImpact` json,
	`aiAnalysis` text,
	`estimatedFine` varchar(128),
	`notificationRequirements` json,
	`remediationSteps` json,
	`status` enum('running','completed','failed') NOT NULL DEFAULT 'running',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `incident_simulations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`type` enum('reminder','alert','info','warning','success') NOT NULL DEFAULT 'info',
	`category` enum('deadline','compliance','policy','regulatory','system') NOT NULL DEFAULT 'system',
	`relatedEntityType` varchar(64),
	`relatedEntityId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`actionUrl` varchar(512),
	`scheduledFor` timestamp,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`industry` varchar(128),
	`size` enum('1-10','11-50','51-200','201-500','500+'),
	`plan` enum('core','professional','enterprise') NOT NULL DEFAULT 'core',
	`stripeCustomerId` varchar(256),
	`ownerId` int,
	`settings` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `payment_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentIntentId` varchar(256),
	`stripeInvoiceId` varchar(256),
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'GBP',
	`status` enum('succeeded','failed','pending','refunded') NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(128) NOT NULL,
	`settingValue` text,
	`settingType` enum('string','boolean','number','json') NOT NULL DEFAULT 'string',
	`category` varchar(64),
	`description` text,
	`isPublic` boolean DEFAULT false,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`category` enum('compliance','risk_management','data_protection','financial','operational','hr','it_security','environmental') NOT NULL,
	`status` enum('draft','pending_review','approved','active','archived') NOT NULL DEFAULT 'draft',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`effectiveDate` timestamp,
	`reviewDate` timestamp,
	`ownerId` int,
	`departmentScope` varchar(256),
	`complianceScore` int DEFAULT 0,
	`automationEnabled` boolean DEFAULT false,
	`automationRules` json,
	`version` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `policy_reg_mapping` (
	`id` int AUTO_INCREMENT NOT NULL,
	`policyId` int NOT NULL,
	`regUpdateId` int NOT NULL,
	`mappingType` enum('gap_identified','compliant','partially_compliant','not_applicable','pending_review') NOT NULL DEFAULT 'pending_review',
	`gapDescription` text,
	`severity` enum('low','medium','high','critical'),
	`status` enum('pending_review','in_progress','resolved','dismissed') NOT NULL DEFAULT 'pending_review',
	`confidenceScore` int DEFAULT 0,
	`aiAnalysis` json,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policy_reg_mapping_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `policy_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`policyId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`content` text,
	`changesSummary` text,
	`documentUrl` text,
	`changedBy` int,
	`status` enum('draft','pending_review','approved','active','archived') NOT NULL,
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `policy_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regulator_portal_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int,
	`regulatorName` varchar(256) NOT NULL,
	`regulatorEmail` varchar(320),
	`accessToken` varchar(256) NOT NULL,
	`accessScope` json,
	`grantedBy` int,
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`lastAccessedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `regulator_portal_access_id` PRIMARY KEY(`id`),
	CONSTRAINT `regulator_portal_access_accessToken_unique` UNIQUE(`accessToken`)
);
--> statement-breakpoint
CREATE TABLE `regulatory_updates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`summary` text,
	`source` varchar(256),
	`sourceUrl` text,
	`regulatoryBody` varchar(128),
	`jurisdiction` varchar(64) DEFAULT 'UK',
	`effectiveDate` timestamp,
	`impactLevel` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`affectedPolicies` json,
	`status` enum('new','under_review','action_required','implemented','not_applicable') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `regulatory_updates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`reminderType` enum('email','notification','both') NOT NULL DEFAULT 'both',
	`triggerAt` timestamp NOT NULL,
	`relatedEntityType` varchar(64),
	`relatedEntityId` int,
	`status` enum('pending','sent','cancelled') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(256),
	`stripeSubscriptionId` varchar(256),
	`stripePriceId` varchar(256),
	`plan` enum('core','professional','enterprise') NOT NULL DEFAULT 'core',
	`status` enum('active','canceled','past_due','trialing','incomplete') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean DEFAULT false,
	`trialEnd` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `university_partnerships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`institutionName` varchar(256) NOT NULL,
	`contactName` varchar(256),
	`contactEmail` varchar(320),
	`country` varchar(128) DEFAULT 'United Kingdom',
	`programType` enum('student_access','research','curriculum','internship') NOT NULL DEFAULT 'student_access',
	`studentSeats` int DEFAULT 0,
	`status` enum('pending','active','expired','suspended') NOT NULL DEFAULT 'pending',
	`agreementUrl` text,
	`startDate` timestamp,
	`endDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `university_partnerships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendor_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`assessedBy` int,
	`questionnaire` json,
	`responses` json,
	`aiScore` int,
	`aiSummary` text,
	`riskFindings` json,
	`status` enum('pending','in_progress','completed','expired') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendor_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`website` varchar(512),
	`contactEmail` varchar(320),
	`contactName` varchar(256),
	`industry` varchar(128),
	`country` varchar(128) DEFAULT 'United Kingdom',
	`riskTier` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`overallRiskScore` int DEFAULT 0,
	`status` enum('active','under_review','suspended','offboarded') NOT NULL DEFAULT 'active',
	`lastAssessedAt` timestamp,
	`nextReviewDate` timestamp,
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(64) NOT NULL,
	`eventType` varchar(128) NOT NULL,
	`payload` json,
	`status` enum('received','processed','failed') NOT NULL,
	`errorMessage` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `jobTitle` varchar(128);--> statement-breakpoint
ALTER TABLE `agentic_tasks` ADD CONSTRAINT `agentic_tasks_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agentic_tasks` ADD CONSTRAINT `agentic_tasks_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_explainability_logs` ADD CONSTRAINT `ai_explainability_logs_recommendationId_ai_recommendations_id_fk` FOREIGN KEY (`recommendationId`) REFERENCES `ai_recommendations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_explainability_logs` ADD CONSTRAINT `ai_explainability_logs_policyId_policies_id_fk` FOREIGN KEY (`policyId`) REFERENCES `policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_explainability_logs` ADD CONSTRAINT `ai_explainability_logs_regulatoryUpdateId_regulatory_updates_id_fk` FOREIGN KEY (`regulatoryUpdateId`) REFERENCES `regulatory_updates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_explainability_logs` ADD CONSTRAINT `ai_explainability_logs_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_recommendations` ADD CONSTRAINT `ai_recommendations_relatedPolicyId_policies_id_fk` FOREIGN KEY (`relatedPolicyId`) REFERENCES `policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD CONSTRAINT `approval_requests_requesterId_users_id_fk` FOREIGN KEY (`requesterId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD CONSTRAINT `approval_requests_approverId_users_id_fk` FOREIGN KEY (`approverId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD CONSTRAINT `approval_requests_relatedPolicyId_policies_id_fk` FOREIGN KEY (`relatedPolicyId`) REFERENCES `policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD CONSTRAINT `approval_requests_relatedDelegationId_delegation_authority_id_fk` FOREIGN KEY (`relatedDelegationId`) REFERENCES `delegation_authority`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_trail` ADD CONSTRAINT `audit_trail_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `benchmark_snapshots` ADD CONSTRAINT `benchmark_snapshots_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compliance_passports` ADD CONSTRAINT `compliance_passports_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compliance_passports` ADD CONSTRAINT `compliance_passports_issuedTo_users_id_fk` FOREIGN KEY (`issuedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compliance_records` ADD CONSTRAINT `compliance_records_policyId_policies_id_fk` FOREIGN KEY (`policyId`) REFERENCES `policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compliance_records` ADD CONSTRAINT `compliance_records_assessorId_users_id_fk` FOREIGN KEY (`assessorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD CONSTRAINT `contact_submissions_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `delegation_authority` ADD CONSTRAINT `delegation_authority_delegatorId_users_id_fk` FOREIGN KEY (`delegatorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `delegation_authority` ADD CONSTRAINT `delegation_authority_delegateeId_users_id_fk` FOREIGN KEY (`delegateeId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_headId_users_id_fk` FOREIGN KEY (`headId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `esg_metrics` ADD CONSTRAINT `esg_metrics_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `esg_metrics` ADD CONSTRAINT `esg_metrics_recordedBy_users_id_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evidence_items` ADD CONSTRAINT `evidence_items_relatedPolicyId_policies_id_fk` FOREIGN KEY (`relatedPolicyId`) REFERENCES `policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evidence_items` ADD CONSTRAINT `evidence_items_collectedBy_users_id_fk` FOREIGN KEY (`collectedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evidence_items` ADD CONSTRAINT `evidence_items_verifiedBy_users_id_fk` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incident_simulations` ADD CONSTRAINT `incident_simulations_triggeredBy_users_id_fk` FOREIGN KEY (`triggeredBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_history` ADD CONSTRAINT `payment_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_settings` ADD CONSTRAINT `platform_settings_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policies` ADD CONSTRAINT `policies_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policy_reg_mapping` ADD CONSTRAINT `policy_reg_mapping_policyId_policies_id_fk` FOREIGN KEY (`policyId`) REFERENCES `policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policy_reg_mapping` ADD CONSTRAINT `policy_reg_mapping_regUpdateId_regulatory_updates_id_fk` FOREIGN KEY (`regUpdateId`) REFERENCES `regulatory_updates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policy_reg_mapping` ADD CONSTRAINT `policy_reg_mapping_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policy_versions` ADD CONSTRAINT `policy_versions_policyId_policies_id_fk` FOREIGN KEY (`policyId`) REFERENCES `policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policy_versions` ADD CONSTRAINT `policy_versions_changedBy_users_id_fk` FOREIGN KEY (`changedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policy_versions` ADD CONSTRAINT `policy_versions_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `regulator_portal_access` ADD CONSTRAINT `regulator_portal_access_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `regulator_portal_access` ADD CONSTRAINT `regulator_portal_access_grantedBy_users_id_fk` FOREIGN KEY (`grantedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_assessments` ADD CONSTRAINT `vendor_assessments_vendorId_vendors_id_fk` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_assessments` ADD CONSTRAINT `vendor_assessments_assessedBy_users_id_fk` FOREIGN KEY (`assessedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendors` ADD CONSTRAINT `vendors_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;