-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "revoke_reason" VARCHAR(16);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "sync_bytes" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "sync_row_count" BIGINT NOT NULL DEFAULT 0;

-- Backfill: tokens revoked before this migration. replaced_by set => rotated, else logout.
UPDATE "refresh_tokens"
SET "revoke_reason" = CASE WHEN "replaced_by" IS NOT NULL THEN 'rotated' ELSE 'logout' END
WHERE "revoked_at" IS NOT NULL AND "revoke_reason" IS NULL;

-- Backfill quota row counts from the existing sync tables (bytes start at 0 and converge as rows are rewritten).
UPDATE "users" u SET "sync_row_count" = c.n
FROM (
  SELECT user_id, COUNT(*) AS n FROM (
    SELECT user_id FROM "profiles" UNION ALL SELECT user_id FROM "settings"
    UNION ALL SELECT user_id FROM "salah_entries" UNION ALL SELECT user_id FROM "salah_days"
    UNION ALL SELECT user_id FROM "dhikr_logs" UNION ALL SELECT user_id FROM "gym_logs"
    UNION ALL SELECT user_id FROM "career_logs" UNION ALL SELECT user_id FROM "habits"
    UNION ALL SELECT user_id FROM "habit_events" UNION ALL SELECT user_id FROM "transactions"
    UNION ALL SELECT user_id FROM "vaults" UNION ALL SELECT user_id FROM "zakat_profiles"
    UNION ALL SELECT user_id FROM "kv"
  ) AS all_rows GROUP BY user_id
) AS c
WHERE u.id = c.user_id;
