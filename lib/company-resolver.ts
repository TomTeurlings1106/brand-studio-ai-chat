// Company name to domain resolution utility

interface CompanyMapping {
  [key: string]: string;
}

// Common company mappings
const COMPANY_DOMAINS: CompanyMapping = {
  // Tech Giants
  'apple': 'apple.com',
  'google': 'google.com',
  'microsoft': 'microsoft.com',
  'amazon': 'amazon.com',
  'meta': 'meta.com',
  'facebook': 'facebook.com',
  'netflix': 'netflix.com',
  'tesla': 'tesla.com',
  'twitter': 'twitter.com',
  'x': 'x.com',
  'linkedin': 'linkedin.com',
  'instagram': 'instagram.com',
  'youtube': 'youtube.com',
  'tiktok': 'tiktok.com',
  'snapchat': 'snapchat.com',
  'discord': 'discord.com',
  'slack': 'slack.com',
  'spotify': 'spotify.com',
  'adobe': 'adobe.com',
  'salesforce': 'salesforce.com',
  'oracle': 'oracle.com',
  'ibm': 'ibm.com',
  'intel': 'intel.com',
  'nvidia': 'nvidia.com',
  'amd': 'amd.com',
  
  // Retail & E-commerce
  'walmart': 'walmart.com',
  'target': 'target.com',
  'ebay': 'ebay.com',
  'etsy': 'etsy.com',
  'shopify': 'shopify.com',
  'alibaba': 'alibaba.com',
  
  // Financial
  'paypal': 'paypal.com',
  'stripe': 'stripe.com',
  'visa': 'visa.com',
  'mastercard': 'mastercard.com',
  'jpmorgan': 'jpmorganchase.com',
  'goldman sachs': 'goldmansachs.com',
  
  // Airlines & Travel
  'airbnb': 'airbnb.com',
  'uber': 'uber.com',
  'lyft': 'lyft.com',
  'booking': 'booking.com',
  'expedia': 'expedia.com',
  
  // Food & Beverage
  'mcdonalds': 'mcdonalds.com',
  'starbucks': 'starbucks.com',
  'coca cola': 'coca-cola.com',
  'pepsi': 'pepsi.com',
  
  // Automotive
  'toyota': 'toyota.com',
  'ford': 'ford.com',
  'bmw': 'bmw.com',
  'mercedes': 'mercedes-benz.com',
  'volkswagen': 'volkswagen.com',
  
  // Fashion & Retail
  'nike': 'nike.com',
  'adidas': 'adidas.com',
  'zara': 'zara.com',
  'h&m': 'hm.com',
  'uniqlo': 'uniqlo.com',
};

/**
 * Convert company name to domain
 */
export function companyNameToDomain(companyName: string): string {
  const normalized = companyName.toLowerCase().trim();
  
  // Direct mapping
  if (COMPANY_DOMAINS[normalized]) {
    return COMPANY_DOMAINS[normalized];
  }
  
  // Try variations
  const variations = [
    normalized.replace(/\s+/g, ''), // Remove spaces: "coca cola" -> "cocacola"
    normalized.replace(/\s+/g, '-'), // Replace spaces with dashes: "coca cola" -> "coca-cola"
    normalized.replace(/[^a-z0-9\s]/g, ''), // Remove special characters
  ];
  
  for (const variation of variations) {
    if (COMPANY_DOMAINS[variation]) {
      return COMPANY_DOMAINS[variation];
    }
  }
  
  // Heuristic: company name + .com
  const heuristic = normalized.replace(/\s+/g, '') + '.com';
  return heuristic;
}

/**
 * Validate if a string looks like a domain
 */
export function isDomain(input: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.)*[a-zA-Z]{2,}$/;
  return domainRegex.test(input.trim());
}

/**
 * Extract company names from text using common patterns
 */
export function extractCompanyNames(text: string): string[] {
  const companies: string[] = [];
  
  // Check for known companies in the mapping
  Object.keys(COMPANY_DOMAINS).forEach(company => {
    const regex = new RegExp(`\\b${company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text)) {
      companies.push(company);
    }
  });
  
  return Array.from(new Set(companies)); // Remove duplicates
}

/**
 * Main function to resolve company input to domain
 */
export function resolveCompanyToDomain(input: string): {
  domain: string;
  source: 'direct' | 'mapped' | 'heuristic';
  originalInput: string;
} {
  const trimmed = input.trim();
  
  // If already a domain, return as-is
  if (isDomain(trimmed)) {
    return {
      domain: trimmed,
      source: 'direct',
      originalInput: input,
    };
  }
  
  // Try to map company name to domain
  const domain = companyNameToDomain(trimmed);
  const isKnownMapping = Object.values(COMPANY_DOMAINS).includes(domain);
  
  return {
    domain,
    source: isKnownMapping ? 'mapped' : 'heuristic',
    originalInput: input,
  };
}