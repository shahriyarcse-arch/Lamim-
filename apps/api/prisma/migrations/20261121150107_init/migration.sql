-- pgvector for the Phase 3 knowledge base. Installed into public and referenced schema-qualified
-- so the migration also applies cleanly inside isolated (test) schemas.
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Server revision stamped on every accepted sync write (nextval in the push transaction).
CREATE SEQUENCE "sync_rev" AS BIGINT START WITH 1 INCREMENT BY 1 NO CYCLE;

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "family_id" UUID NOT NULL,
    "device_id" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    "replaced_by" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("user_id","id")
);

-- CreateTable
CREATE TABLE "profile_owners" (
    "profile_id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_owners_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "legacy_id" VARCHAR(128),
    "name" VARCHAR(200) NOT NULL,
    "gender" VARCHAR(32),
    "dob" VARCHAR(10),
    "client_created_at" BIGINT NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "lang" VARCHAR(8) NOT NULL,
    "currency" VARCHAR(8) NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "location_name" VARCHAR(200),
    "method" VARCHAR(32) NOT NULL,
    "asr" VARCHAR(16) NOT NULL,
    "hijri_offset" INTEGER NOT NULL,
    "theme" VARCHAR(16) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salah_entries" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "date" VARCHAR(10) NOT NULL,
    "prayer" VARCHAR(16) NOT NULL,
    "status" VARCHAR(16) NOT NULL,

    CONSTRAINT "salah_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salah_days" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "date" VARCHAR(10) NOT NULL,
    "jummah" BOOLEAN NOT NULL,
    "tahajjud" JSONB NOT NULL,
    "tahajjud_rakat" INTEGER NOT NULL,
    "witr" JSONB NOT NULL,
    "sunnah" JSONB NOT NULL,
    "notes" JSONB NOT NULL,
    "fasting" BOOLEAN,

    CONSTRAINT "salah_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dhikr_logs" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "date" VARCHAR(10) NOT NULL,
    "counts" JSONB NOT NULL,

    CONSTRAINT "dhikr_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gym_logs" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "date" VARCHAR(10) NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "gym_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_logs" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "date" VARCHAR(10) NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "career_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habits" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "legacy_id" VARCHAR(128),
    "label" VARCHAR(200) NOT NULL,
    "icon" VARCHAR(64),
    "color" VARCHAR(64),
    "start_date" VARCHAR(40) NOT NULL,
    "tracked_since" VARCHAR(40),

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_events" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "habit_id" VARCHAR(64) NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "type" VARCHAR(16) NOT NULL,
    "at" VARCHAR(40),
    "reason" VARCHAR(1000),
    "streak" INTEGER,

    CONSTRAINT "habit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "legacy_id" VARCHAR(128),
    "type" VARCHAR(16) NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "currency" VARCHAR(8) NOT NULL,
    "fx_rate_micro" BIGINT,
    "base_minor" BIGINT,
    "category_id" VARCHAR(128),
    "description" VARCHAR(1000) NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "vault_id" VARCHAR(64),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaults" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "legacy_id" VARCHAR(128),
    "name" VARCHAR(200) NOT NULL,
    "target_minor" BIGINT NOT NULL,
    "saved_minor" BIGINT NOT NULL,
    "currency" VARCHAR(8) NOT NULL,

    CONSTRAINT "vaults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zakat_profiles" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "currency" VARCHAR(8) NOT NULL,
    "nisab_minor" BIGINT NOT NULL,
    "cash_minor" BIGINT NOT NULL,
    "gold_minor" BIGINT NOT NULL,
    "silver_minor" BIGINT NOT NULL,
    "business_minor" BIGINT NOT NULL,
    "stocks_minor" BIGINT NOT NULL,
    "liabilities_minor" BIGINT,

    CONSTRAINT "zakat_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kv" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "profile_id" VARCHAR(64) NOT NULL,
    "updated_at" BIGINT NOT NULL,
    "deleted_at" BIGINT,
    "device_id" VARCHAR(64) NOT NULL,
    "rev" BIGINT NOT NULL,
    "extra" JSONB,
    "key" VARCHAR(200) NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "kv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "lang" VARCHAR(8) NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" public.vector(768),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_family_id_idx" ON "refresh_tokens"("family_id");

-- CreateIndex
CREATE INDEX "profile_owners_user_id_idx" ON "profile_owners"("user_id");

-- CreateIndex
CREATE INDEX "profiles_user_id_rev_idx" ON "profiles"("user_id", "rev");

-- CreateIndex
CREATE INDEX "profiles_profile_id_idx" ON "profiles"("profile_id");

-- CreateIndex
CREATE INDEX "settings_user_id_rev_idx" ON "settings"("user_id", "rev");

-- CreateIndex
CREATE INDEX "settings_profile_id_idx" ON "settings"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "settings_user_id_profile_id_key" ON "settings"("user_id", "profile_id");

-- CreateIndex
CREATE INDEX "salah_entries_user_id_rev_idx" ON "salah_entries"("user_id", "rev");

-- CreateIndex
CREATE INDEX "salah_entries_profile_id_idx" ON "salah_entries"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "salah_entries_user_id_profile_id_date_prayer_key" ON "salah_entries"("user_id", "profile_id", "date", "prayer");

-- CreateIndex
CREATE INDEX "salah_days_user_id_rev_idx" ON "salah_days"("user_id", "rev");

-- CreateIndex
CREATE INDEX "salah_days_profile_id_idx" ON "salah_days"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "salah_days_user_id_profile_id_date_key" ON "salah_days"("user_id", "profile_id", "date");

-- CreateIndex
CREATE INDEX "dhikr_logs_user_id_rev_idx" ON "dhikr_logs"("user_id", "rev");

-- CreateIndex
CREATE INDEX "dhikr_logs_profile_id_idx" ON "dhikr_logs"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "dhikr_logs_user_id_profile_id_date_key" ON "dhikr_logs"("user_id", "profile_id", "date");

-- CreateIndex
CREATE INDEX "gym_logs_user_id_rev_idx" ON "gym_logs"("user_id", "rev");

-- CreateIndex
CREATE INDEX "gym_logs_profile_id_idx" ON "gym_logs"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "gym_logs_user_id_profile_id_date_key" ON "gym_logs"("user_id", "profile_id", "date");

-- CreateIndex
CREATE INDEX "career_logs_user_id_rev_idx" ON "career_logs"("user_id", "rev");

-- CreateIndex
CREATE INDEX "career_logs_profile_id_idx" ON "career_logs"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "career_logs_user_id_profile_id_date_key" ON "career_logs"("user_id", "profile_id", "date");

-- CreateIndex
CREATE INDEX "habits_user_id_rev_idx" ON "habits"("user_id", "rev");

-- CreateIndex
CREATE INDEX "habits_profile_id_idx" ON "habits"("profile_id");

-- CreateIndex
CREATE INDEX "habit_events_user_id_rev_idx" ON "habit_events"("user_id", "rev");

-- CreateIndex
CREATE INDEX "habit_events_profile_id_date_idx" ON "habit_events"("profile_id", "date");

-- CreateIndex
CREATE INDEX "habit_events_habit_id_idx" ON "habit_events"("habit_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_rev_idx" ON "transactions"("user_id", "rev");

-- CreateIndex
CREATE INDEX "transactions_profile_id_date_idx" ON "transactions"("profile_id", "date");

-- CreateIndex
CREATE INDEX "transactions_vault_id_idx" ON "transactions"("vault_id");

-- CreateIndex
CREATE INDEX "vaults_user_id_rev_idx" ON "vaults"("user_id", "rev");

-- CreateIndex
CREATE INDEX "vaults_profile_id_idx" ON "vaults"("profile_id");

-- CreateIndex
CREATE INDEX "zakat_profiles_user_id_rev_idx" ON "zakat_profiles"("user_id", "rev");

-- CreateIndex
CREATE INDEX "zakat_profiles_profile_id_idx" ON "zakat_profiles"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "zakat_profiles_user_id_profile_id_key" ON "zakat_profiles"("user_id", "profile_id");

-- CreateIndex
CREATE INDEX "kv_user_id_rev_idx" ON "kv"("user_id", "rev");

-- CreateIndex
CREATE INDEX "kv_profile_id_idx" ON "kv"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "kv_user_id_profile_id_key_key" ON "kv"("user_id", "profile_id", "key");

-- CreateIndex
CREATE INDEX "knowledge_chunks_source_idx" ON "knowledge_chunks"("source");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_owners" ADD CONSTRAINT "profile_owners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salah_entries" ADD CONSTRAINT "salah_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salah_days" ADD CONSTRAINT "salah_days_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dhikr_logs" ADD CONSTRAINT "dhikr_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_logs" ADD CONSTRAINT "gym_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_logs" ADD CONSTRAINT "career_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_events" ADD CONSTRAINT "habit_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaults" ADD CONSTRAINT "vaults_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zakat_profiles" ADD CONSTRAINT "zakat_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kv" ADD CONSTRAINT "kv_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
