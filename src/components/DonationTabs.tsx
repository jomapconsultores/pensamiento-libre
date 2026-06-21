'use client';

import { useState } from 'react';
import { DonationForm } from './DonationForm';
import { DonationPackages } from './DonationPackages';

export function DonationTabs() {
  const [tab, setTab] = useState<'packages' | 'free'>('packages');

  return (
    <div>
      <div className="flex bg-brand-cream rounded-2xl p-1.5 max-w-lg mx-auto mb-12 shadow-inner border border-brand-navy/8">
        <button
          onClick={() => setTab('packages')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
            tab === 'packages'
              ? 'bg-white text-brand-navy shadow-md'
              : 'text-brand-navy/60 hover:text-brand-navy'
          }`}
        >
          <span>🎁</span>
          Paquetes de impacto
        </button>
        <button
          onClick={() => setTab('free')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
            tab === 'free'
              ? 'bg-white text-brand-navy shadow-md'
              : 'text-brand-navy/60 hover:text-brand-navy'
          }`}
        >
          <span>💛</span>
          Donación libre
        </button>
      </div>

      {tab === 'packages' ? (
        <DonationPackages />
      ) : (
        <div className="max-w-2xl mx-auto">
          <DonationForm />
        </div>
      )}
    </div>
  );
}
