interface ChefHatIconProps {
  className?: string;
}

export function ChefHatIcon({ className }: ChefHatIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14 23.5C12.3 20.1 13.8 15.9 17 14.4C18.8 10.9 22.4 8.8 26.3 9C30.2 9.2 33.6 11.8 35 15.4C38.3 15.8 40.9 18.6 41 22C41.1 25.6 38.2 28.5 34.6 28.5H13.8C10.6 28.5 8 25.9 8 22.7C8 19.9 10 17.4 12.7 16.9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 28.5H32V33.5C32 36.5 29.5 39 26.5 39H21.5C18.5 39 16 36.5 16 33.5V28.5Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M20 19.5C20.9 18.2 22.4 17.4 24 17.4C25.6 17.4 27.1 18.2 28 19.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M23 28.5V39"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M17.5 33.5H30.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}