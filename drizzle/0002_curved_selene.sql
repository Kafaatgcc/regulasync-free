ALTER TABLE `users` MODIFY COLUMN `loginMethod` varchar(64) DEFAULT 'password';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','company_admin','compliance_manager','department_user','auditor','user','admin') NOT NULL DEFAULT 'department_user';--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `organizationId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `invitedBy` int;--> statement-breakpoint
ALTER TABLE `users` ADD `inviteToken` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `inviteTokenExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetToken` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetExpiry` timestamp;