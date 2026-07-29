import React from "react";

/**
 * HavensLight's mark: a shield (haven — shelter, protection) with a small
 * beacon of light radiating from its peak (the "light" half of the name).
 * Single source of truth so the icon never drifts between the sidebar,
 * auth screens, and public pages.
 */
export default function BrandMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="-24 -46 48 94">
      <path
        d="M0,-38 L22,-27 V6 C22,27 11,40 0,46 C-11,40 -22,27 -22,6 V-27 Z"
        fill="#F4EFE6"
      />
      <circle cx="0" cy="-46" r="5" fill="#E3A23C" />
      <line x1="-5" y1="-51" x2="-11" y2="-60" stroke="#E3A23C" strokeWidth="3" strokeLinecap="round" />
      <line x1="0" y1="-52" x2="0" y2="-63" stroke="#E3A23C" strokeWidth="3" strokeLinecap="round" />
      <line x1="5" y1="-51" x2="11" y2="-60" stroke="#E3A23C" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
