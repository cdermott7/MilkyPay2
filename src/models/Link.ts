/**
 * Link Model
 * 
 * In a production app, this would be a database model.
 * For this hackathon project, we're using a simple in-memory store.
 * This is just a type definition for the structure.
 */

export interface Link {
  id: string;
  balanceId: string;
  senderPublicKey: string;
  recipientPublicKey: string;
  amount: string;
  asset: string;
  pinHash: string; // Hashed PIN, not stored in plain text
  createdAt: Date;
  expiresAt: Date;
  claimed: boolean;
  claimedAt?: Date;
  refunded: boolean;
  refundedAt?: Date;
}

// In-memory store (replace with database in production)
export const linkStore: Record<string, Link> = {};

/**
 * Create a new link
 */
export const createLink = (
  id: string, 
  balanceId: string,
  senderPublicKey: string,
  recipientPublicKey: string,
  amount: string,
  asset: string,
  pinHash: string
): Link => {
  const now = new Date();
  const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const link: Link = {
    id,
    balanceId,
    senderPublicKey,
    recipientPublicKey,
    amount,
    asset,
    pinHash,
    createdAt: now,
    expiresAt: oneDayLater,
    claimed: false,
    refunded: false
  };
  
  // Store the link
  linkStore[id] = link;
  
  return link;
};

/**
 * Get a link by ID
 */
export const getLinkById = (id: string): Link | undefined => {
  return linkStore[id];
};

/**
 * Mark a link as claimed
 */
export const markLinkAsClaimed = (id: string): Link | undefined => {
  const link = linkStore[id];
  
  if (link) {
    link.claimed = true;
    link.claimedAt = new Date();
  }
  
  return link;
};

/**
 * Mark a link as refunded
 */
export const markLinkAsRefunded = (id: string): Link | undefined => {
  const link = linkStore[id];
  
  if (link) {
    link.refunded = true;
    link.refundedAt = new Date();
  }
  
  return link;
};