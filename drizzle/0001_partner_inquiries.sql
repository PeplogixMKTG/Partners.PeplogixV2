CREATE TABLE `partner_assets` (
	`id` varchar(96) NOT NULL,
	`inquiryId` varchar(64),
	`role` enum('logo','asset'),
	`name` varchar(255) NOT NULL,
	`type` varchar(128) NOT NULL,
	`size` int NOT NULL,
	`dataBase64` longtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_inquiries` (
	`id` varchar(64) NOT NULL,
	`requestId` varchar(36) NOT NULL,
	`company` varchar(200) NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`partnerships` longtext NOT NULL,
	`data` longtext NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_inquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_inquiries_request_id_unique` UNIQUE(`requestId`)
);
--> statement-breakpoint
CREATE INDEX `partner_assets_inquiry_id_idx` ON `partner_assets` (`inquiryId`);--> statement-breakpoint
CREATE INDEX `partner_assets_created_at_idx` ON `partner_assets` (`createdAt`);--> statement-breakpoint
CREATE INDEX `partner_inquiries_submitted_at_idx` ON `partner_inquiries` (`submittedAt`);