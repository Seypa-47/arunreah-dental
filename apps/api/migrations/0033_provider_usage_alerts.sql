CREATE TABLE `provider_usage_alerts` (
  `alert_key` text PRIMARY KEY NOT NULL,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
