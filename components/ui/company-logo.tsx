'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface CompanyLogoProps {
  company?: string;
  domain?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showFallback?: boolean;
}

interface LogoData {
  logoUrl: string | null;
  domain: string;
  companyName: string;
  source: 'clearbit' | 'favicon' | 'failed';
  resolution: 'direct' | 'mapped' | 'heuristic';
}

export function CompanyLogo({ 
  company, 
  domain, 
  size = 'md', 
  className = '',
  showFallback = true 
}: CompanyLogoProps) {
  const [logoData, setLogoData] = useState<LogoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  useEffect(() => {
    if (!company && !domain) return;

    const fetchLogo = async () => {
      setLoading(true);
      setError(false);
      
      try {
        const response = await fetch('/api/logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company, domain }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch logo');
        }

        const data: LogoData = await response.json();
        setLogoData(data);
      } catch (err) {
        console.error('Error fetching logo:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, [company, domain]);

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800`}>
        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !logoData?.logoUrl) {
    if (!showFallback) return null;
    
    // Fallback: Company initials
    const initials = (logoData?.companyName || company || domain || 'C')
      .split(' ')
      .map(word => word[0]?.toUpperCase())
      .join('')
      .slice(0, 2);

    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm`}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <img
        src={logoData.logoUrl}
        alt={`${logoData.companyName} logo`}
        className="w-full h-full object-contain rounded-lg"
        onError={() => setError(true)}
      />
      {logoData.source === 'favicon' && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white dark:border-slate-800" 
             title="Favicon fallback" />
      )}
    </div>
  );
}

interface LogoWithInfoProps extends CompanyLogoProps {
  showInfo?: boolean;
}

export function LogoWithInfo({ 
  showInfo = false, 
  ...logoProps 
}: LogoWithInfoProps) {
  const [logoData, setLogoData] = useState<LogoData | null>(null);

  useEffect(() => {
    if (!logoProps.company && !logoProps.domain) return;

    const fetchLogo = async () => {
      try {
        const response = await fetch('/api/logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            company: logoProps.company, 
            domain: logoProps.domain 
          }),
        });

        if (response.ok) {
          const data: LogoData = await response.json();
          setLogoData(data);
        }
      } catch (err) {
        console.error('Error fetching logo:', err);
      }
    };

    fetchLogo();
  }, [logoProps.company, logoProps.domain]);

  return (
    <div className="flex items-center gap-3">
      <CompanyLogo {...logoProps} />
      {showInfo && logoData && (
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <div className="font-medium">{logoData.companyName}</div>
          <div className="text-xs opacity-75">
            {logoData.domain} • {logoData.source}
          </div>
        </div>
      )}
    </div>
  );
}