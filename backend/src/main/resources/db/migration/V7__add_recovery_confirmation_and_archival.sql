-- V7__add_recovery_confirmation_and_archival.sql
ALTER TABLE claims ADD COLUMN finder_confirmed_at DATETIME NULL;
ALTER TABLE claims ADD COLUMN claimant_confirmed_at DATETIME NULL;
ALTER TABLE claims ADD COLUMN handover_confirmed_at DATETIME NULL;
ALTER TABLE items ADD COLUMN archived_at DATETIME NULL;
