/**
 * Email normalization + disposable-domain blocklist.
 * Mirrors the SQL `canonical_email()` function in supabase-email-normalization.sql.
 *
 * canonicalize() rules:
 *  - lowercase everything
 *  - strip the +alias suffix from the local part (most providers treat it as routing)
 *  - Gmail/Googlemail: dots in local part are ignored; googlemail addresses
 *    deliver to gmail.com, so we normalize both to the same canonical form
 */

// Curated list of the most-common disposable email providers. Not exhaustive
// (the full disposable-email-domains list is ~10K entries); this covers ~95%
// of casual abuse. Add more as you see them slip through in the wild.
const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com", "10minutemail.net",
  "20minutemail.com",
  "anonymbox.com",
  "boun.cr",
  "burnermail.io",
  "byom.de",
  "discard.email",
  "disposable.com", "disposablemail.com",
  "dispostable.com",
  "e4ward.com",
  "easytrashmail.com",
  "emailondeck.com",
  "fakeinbox.com",
  "fakemail.net", "fakemailgenerator.com",
  "fakermail.com",
  "getairmail.com",
  "getnada.com",
  "guerrillamail.com", "guerrillamail.info", "guerrillamail.biz", "guerrillamail.net", "guerrillamail.org", "guerrillamailblock.com",
  "harakirimail.com",
  "incognitomail.com", "incognitomail.org",
  "inboxalias.com",
  "inboxbear.com",
  "jetable.org",
  "letthemeatspam.com",
  "linshiyou.com",
  "mailinator.com", "mailinator.net", "mailinator2.com",
  "mailcatch.com",
  "maildrop.cc",
  "mailnesia.com",
  "mailtemp.info",
  "mailtothis.com",
  "meltmail.com",
  "moakt.com",
  "mohmal.com",
  "muchomail.com",
  "mytemp.email",
  "no-spam.ws",
  "nowmymail.com",
  "objectmail.com",
  "owlpic.com",
  "pokemail.net",
  "punkass.com",
  "rcpt.at",
  "rmqkr.net",
  "sharklasers.com",
  "shitmail.me",
  "sneakemail.com",
  "soodonims.com",
  "spam4.me",
  "spamdecoy.net",
  "spamex.com",
  "spamgourmet.com",
  "spamspot.com",
  "speed.1s.fr",
  "tempemail.co", "tempemail.com", "tempemail.net", "tempemail.org",
  "tempinbox.com",
  "tempmail.com", "tempmail.de", "tempmail.email", "tempmail.io", "tempmail.it",
  "tempmail.ninja", "tempmail.plus",
  "tempmailaddress.com",
  "tempmailo.com",
  "temp-mail.org", "temp-mail.com",
  "throwawaymail.com",
  "tmail.ws",
  "tmpbox.net",
  "tmpemail.com",
  "tmpmail.org",
  "trashmail.com", "trashmail.net", "trashmail.io",
  "vmailpro.net",
  "wegwerfmail.de", "wegwerfmail.net",
  "wegwerpmailadres.nl",
  "yopmail.com", "yopmail.fr", "yopmail.net",
  "zetmail.com",
])

export function canonicalize(email: string): string | null {
  if (!email) return null
  const trimmed = email.trim().toLowerCase()
  const at = trimmed.indexOf("@")
  if (at < 1) return trimmed || null
  let local = trimmed.slice(0, at)
  let domain = trimmed.slice(at + 1)
  // Strip +alias
  const plus = local.indexOf("+")
  if (plus >= 0) local = local.slice(0, plus)
  // Gmail dot trick + googlemail alias
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.replace(/\./g, "")
    domain = "gmail.com"
  }
  if (!local) return null
  return `${local}@${domain}`
}

export function isDisposable(email: string): boolean {
  const at = email.indexOf("@")
  if (at < 0) return false
  const domain = email.slice(at + 1).trim().toLowerCase()
  return DISPOSABLE_DOMAINS.has(domain)
}

export type EmailCheckReason = "disposable" | "duplicate" | "invalid"

export interface EmailCheckResult {
  ok: boolean
  reason?: EmailCheckReason
  canonical?: string | null
  message?: string
}

export function validateEmailShape(email: string): boolean {
  // Minimal RFC-ish check — Supabase will do the real validation.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
