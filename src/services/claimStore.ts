/**
 * ClaimStore Service
 * 
 * This service manages the storage and retrieval of claim links and their associated
 * transaction details. In a real application, this would be managed by a server,
 * but for this demo, we're using local storage.
 */

interface ClaimLink {
  id: string;
  pin: string;
  amount: string;
  asset: string;
  sender: string;
  recipient: string;
  createdAt: string;
  balanceId?: string; // Optional Stellar claimable balance ID
  memo?: string;
  claimed: boolean;
  claimedAt?: string;
}

// Local storage key
const CLAIM_STORE_KEY = 'milkypay_claim_links';

/**
 * Save a new claim link to storage
 */
export const saveClaimLink = (claimLink: Omit<ClaimLink, 'claimed' | 'createdAt'>): ClaimLink => {
  const newLink: ClaimLink = {
    ...claimLink,
    claimed: false,
    createdAt: new Date().toISOString()
  };
  
  // Get existing claim links
  const existingLinksStr = localStorage.getItem(CLAIM_STORE_KEY);
  const existingLinks: Record<string, ClaimLink> = existingLinksStr ? 
    JSON.parse(existingLinksStr) : {};
  
  // Add new link
  existingLinks[newLink.id] = newLink;
  
  // Save to local storage
  localStorage.setItem(CLAIM_STORE_KEY, JSON.stringify(existingLinks));
  
  console.log('Saved claim link:', newLink);
  return newLink;
};

/**
 * Get a claim link by ID
 */
export const getClaimLink = (id: string): ClaimLink | null => {
  const linksStr = localStorage.getItem(CLAIM_STORE_KEY);
  if (!linksStr) {
    return null;
  }
  
  const links: Record<string, ClaimLink> = JSON.parse(linksStr);
  return links[id] || null;
};

/**
 * Verify a claim PIN
 */
export const verifyClaimPin = (id: string, pin: string): boolean => {
  const link = getClaimLink(id);
  
  if (!link) {
    return false;
  }
  
  return link.pin === pin;
};

/**
 * Mark a claim link as claimed
 */
export const markClaimLinkAsClaimed = (id: string): ClaimLink | null => {
  const link = getClaimLink(id);
  
  if (!link) {
    return null;
  }
  
  // Mark as claimed
  link.claimed = true;
  link.claimedAt = new Date().toISOString();
  
  // Update in storage
  const linksStr = localStorage.getItem(CLAIM_STORE_KEY);
  const links: Record<string, ClaimLink> = linksStr ? 
    JSON.parse(linksStr) : {};
  
  links[id] = link;
  localStorage.setItem(CLAIM_STORE_KEY, JSON.stringify(links));
  
  return link;
};

/**
 * Get all claim links
 */
export const getAllClaimLinks = (): ClaimLink[] => {
  const linksStr = localStorage.getItem(CLAIM_STORE_KEY);
  if (!linksStr) {
    return [];
  }
  
  const links: Record<string, ClaimLink> = JSON.parse(linksStr);
  return Object.values(links);
};

export default {
  saveClaimLink,
  getClaimLink,
  verifyClaimPin,
  markClaimLinkAsClaimed,
  getAllClaimLinks
};