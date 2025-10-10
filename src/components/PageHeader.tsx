import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  altText: string;
  heightMobile?: string;
  heightDesktop?: string;
  overlayOpacity?: number;
  textColor?: 'light' | 'dark';
  children?: React.ReactNode;
}

export const PageHeader = ({
  title,
  subtitle,
  imageUrl,
  mobileImageUrl,
  altText,
  heightMobile = '200px',
  heightDesktop = '300px',
  overlayOpacity = 0.4,
  textColor = 'light',
  children,
}: PageHeaderProps) => {
  const textColorClass = textColor === 'light' ? 'text-white' : 'text-gray-900';
  const imageSrc = mobileImageUrl || imageUrl;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: heightMobile,
      }}
    >
      <picture>
        {mobileImageUrl && (
          <source media="(max-width: 768px)" srcSet={mobileImageUrl} />
        )}
        <img
          src={imageUrl}
          alt={altText}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </picture>

      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"
        style={{ opacity: overlayOpacity }}
      />

      <div className="absolute inset-0 flex flex-col justify-center items-center px-4 text-center">
        <h1
          className={`text-2xl sm:text-3xl md:text-4xl font-poppins font-bold ${textColorClass} drop-shadow-lg`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`mt-2 text-sm sm:text-base md:text-lg ${textColorClass} drop-shadow-md max-w-2xl`}
          >
            {subtitle}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          div[style*="height"] {
            height: ${heightDesktop} !important;
          }
        }
      `}</style>
    </div>
  );
};
