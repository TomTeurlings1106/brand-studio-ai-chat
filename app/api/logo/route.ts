import { NextRequest, NextResponse } from 'next/server';
import { resolveCompanyToDomain, isDomain } from '@/lib/company-resolver';

export const dynamic = 'force-dynamic';

interface LogoResponse {
  logoUrl: string | null;
  domain: string;
  companyName: string;
  source: 'clearbit' | 'favicon' | 'failed';
  resolution: 'direct' | 'mapped' | 'heuristic';
}

/**
 * Fetch logo from Clearbit API
 */
async function fetchClearbitLogo(domain: string): Promise<string | null> {
  try {
    const logoUrl = `https://logo.clearbit.com/${domain}`;
    
    // Test if logo exists by making a HEAD request
    const response = await fetch(logoUrl, { method: 'HEAD' });
    
    if (response.ok) {
      return logoUrl;
    }
    
    return null;
  } catch (error) {
    console.log('Clearbit logo fetch failed:', error);
    return null;
  }
}

/**
 * Fallback to favicon
 */
function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, domain } = body;
    
    if (!company && !domain) {
      return NextResponse.json(
        { error: 'Either company name or domain is required' },
        { status: 400 }
      );
    }
    
    // Use provided domain or resolve company name to domain
    let targetDomain: string;
    let resolution: 'direct' | 'mapped' | 'heuristic';
    let companyName: string;
    
    if (domain && isDomain(domain)) {
      targetDomain = domain;
      resolution = 'direct';
      companyName = company || domain;
    } else {
      const resolved = resolveCompanyToDomain(company || domain);
      targetDomain = resolved.domain;
      resolution = resolved.source;
      companyName = company || resolved.originalInput;
    }
    
    console.log(`Fetching logo for: ${companyName} -> ${targetDomain} (${resolution})`);
    
    // Try Clearbit first
    let logoUrl = await fetchClearbitLogo(targetDomain);
    let source: 'clearbit' | 'favicon' | 'failed' = 'clearbit';
    
    // Fallback to favicon if Clearbit fails
    if (!logoUrl) {
      logoUrl = getFaviconUrl(targetDomain);
      source = 'favicon';
      console.log(`Using favicon fallback for ${targetDomain}`);
    }
    
    const response: LogoResponse = {
      logoUrl,
      domain: targetDomain,
      companyName,
      source,
      resolution,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in logo API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logo' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get('company');
  const domain = searchParams.get('domain');
  
  if (!company && !domain) {
    return NextResponse.json(
      { error: 'Either company or domain query parameter is required' },
      { status: 400 }
    );
  }
  
  // Redirect to POST handler
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company, domain }),
  }));
}