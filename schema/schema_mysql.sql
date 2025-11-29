CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `firstname` varchar(255),
  `lastname` varchar(255),
  `email` varchar(255) UNIQUE,
  `phone` varchar(255),
  `password` varchar(255),
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE `matches` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `scanner_id` integer,
  `scanned_id` integer,
  `reason` varchar(255),
  `scanner_status` bool,
  `scanned_status` bool,
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE `notification` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `type` ENUM ('Scanner', 'Scanned'),
  `scanner_id` int,
  `scanned_id` int,
  `status` bool,
  `read` bool
);

ALTER TABLE `matches` ADD FOREIGN KEY (`scanner_id`) REFERENCES `users` (`id`);

ALTER TABLE `matches` ADD FOREIGN KEY (`scanned_id`) REFERENCES `users` (`id`);

ALTER TABLE `notification` ADD FOREIGN KEY (`scanner_id`) REFERENCES `users` (`id`);

ALTER TABLE `notification` ADD FOREIGN KEY (`scanned_id`) REFERENCES `users` (`id`);