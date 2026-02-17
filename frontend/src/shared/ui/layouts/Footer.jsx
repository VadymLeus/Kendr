// frontend/src/shared/ui/layouts/Footer.jsx
import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full mt-auto py-6 bg-(--platform-card-bg) border-t border-(--platform-border-color) relative shrink-0 z-10">
      <div className="max-w-7xl mx-auto px-4 flex justify-center items-center">
        <p className="text-(--platform-text-secondary) opacity-70 text-sm font-medium">
          © {year} Kendr. Усі права захищено.
        </p>
      </div>
    </footer>
  );
};

export default Footer;