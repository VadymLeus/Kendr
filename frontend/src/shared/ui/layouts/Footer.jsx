// frontend/src/shared/ui/layouts/Footer.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import { Globe, Store, LogIn } from 'lucide-react';

const Footer = () => {
  const { user } = useContext(AuthContext);
  const year = new Date().getFullYear();
  const links = [
      { to: "/", label: "Головна", icon: Globe },
      { to: "/catalog", label: "Каталог сайтів", icon: Store },
      ...(!user ? [{ to: "/login", label: "Авторизація", icon: LogIn }] : []),
      { to: "/support", label: "Підтримка" },
      { to: "/rules", label: "Правила" }
  ];

  return (
    <footer className="platform-footer">
      <div className="max-w-300 mx-auto flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-8">
          {links.map((link, i) => (
            <Link key={i} to={link.to} className="flex items-center gap-2 hover:text-(--platform-text-primary) transition-colors font-medium">
              {link.icon && <link.icon size={16} className="opacity-70"/>}
              {link.label}
            </Link>
          ))}
        </div>
        <div className="w-full max-w-50 h-px bg-(--platform-border-color) opacity-50" />
        <p className="opacity-70 text-sm">© {year} Kendr. Усі права захищено.</p>
      </div>
    </footer>
  );
};
export default Footer;