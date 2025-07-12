import React from 'react';

export const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export const SparkleIcon = ({ className }) => (
  <svg className={`absolute ${className}`} width="60" height="60" viewBox="0 0 117 117" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M58.5 0L68.0312 24.9066L89.1658 20.3342L84.5934 41.4688L109.5 51L84.5934 60.5312L89.1658 81.6658L68.0312 77.0934L58.5 102L48.9688 77.0934L27.8342 81.6658L32.4066 60.5312L7.5 51L32.4066 41.4688L27.8342 20.3342L48.9688 24.9066L58.5 0Z" fill="#FFC700" />
    <path d="M58.5 24L64.75 38.5714L81 42L64.75 45.4286L58.5 60L52.25 45.4286L36 42L52.25 38.5714L58.5 24Z" fill="#FFEFB8" />
  </svg>
);

export const BlobIcon = () => (
  <svg className="absolute bottom-[-2rem] left-[-1.5rem] w-24 h-24 text-green-400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M62.4,-31.3C73.3,-11.2,70.1,16.9,56.5,36.5C42.9,56.1,18.9,67.2,-5.9,67.8C-30.7,68.4,-56.3,58.5,-67.7,39.3C-79.1,20.1,-76.3,-8.3,-62.9,-28.8C-49.5,-49.3,-24.7,-61.8,1.6,-62.4C27.9,-63,51.5,-51.5,62.4,-31.3Z" transform="translate(100 100)" />
  </svg>
);

export const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
