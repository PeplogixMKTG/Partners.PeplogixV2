CREATE TABLE `partner_notifications` (
	`inquiryId` varchar(64) NOT NULL,
	`payload` longtext NOT NULL,
	`status` enum('pending','sending','sent','failed','needs_review') NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`claimToken` varchar(36),
	`leaseUntil` timestamp,
	`nextAttemptAt` timestamp NOT NULL DEFAULT (now()),
	`firstAttemptAt` timestamp,
	`providerId` varchar(128),
	`lastError` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`sentAt` timestamp,
	CONSTRAINT `partner_notifications_inquiryId` PRIMARY KEY(`inquiryId`)
);
--> statement-breakpoint
CREATE INDEX `partner_notifications_retry_idx` ON `partner_notifications` (`status`,`nextAttemptAt`);