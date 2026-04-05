// Protocol constants — mirrors on-chain values

// In demo mode (NEXT_PUBLIC_DEMO_MODE=true), vouch activation is instant.
// In production, vouches require 48h cooldown before they become active.
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const VOUCH_ACTIVATION_DELAY_HOURS = IS_DEMO ? 0 : 48;
export const GRACE_PERIOD_DAYS = 7;
export const LATE_FEE_PERCENT = 2;
export const DEFAULT_COOLDOWN_DAYS = 30;
export const MIN_VOUCH_AMOUNT = 10; // USDC
export const MAX_VOUCHES_PER_USER = 5;
export const MAX_CONCENTRATION_PERCENT = 40;
export const INSURANCE_CONTRIBUTION_PERCENT = 1;
export const VOUCHER_YIELD_PERCENT = 80; // 80% of interest goes to vouchers
export const PROTOCOL_FEE_PERCENT = 20; // 20% of interest goes to protocol

export const REP_GAIN_REPAY = 10;
export const REP_LOSS_LATE = -10;
export const REP_LOSS_DEFAULT = -50;
export const REP_DECAY_MONTHS_INACTIVE = 3; // start decay after 3 months
export const REP_DECAY_PER_MONTH = 5;
export const REP_MIN = 0;
export const REP_MAX = 1000;
export const REP_FROZEN_THRESHOLD = 100;
