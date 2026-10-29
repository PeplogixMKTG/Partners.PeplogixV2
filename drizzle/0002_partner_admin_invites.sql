CREATE TABLE `partner_admin_invites` (
	`id` varchar(36) NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	CONSTRAINT `partner_admin_invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_admin_invites_tokenHash_unique` UNIQUE(`tokenHash`)
);
