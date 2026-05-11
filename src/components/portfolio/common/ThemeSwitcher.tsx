// import "react-crud-icons/dist/react-crud-icons.css";

import { useGSAP } from "@gsap/react";
import { usePortalStore, useThemeStore } from "@/stores";
import gsap from "gsap";

import { useEffect, useRef } from "react";
import { isMobile } from "react-device-detect";

const ThemeSwitcher = () => {
  const themeSwitcherRef = useRef<HTMLDivElement>(null);
  const { nextTheme, theme } = useThemeStore();
  const isActive = usePortalStore((state) => state.activePortalId);
  const positionClass = isMobile ? 'top-2 right-2' : 'top-6 right-6';
  const toggleTheme = () => nextTheme();

  useGSAP(() => {
    gsap.to(themeSwitcherRef.current, {
      opacity: isActive ? 0 : 1,
      duration: 1,
      delay: isActive ? 0 : 1,
    });
  }, [isActive]);

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')

    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.color);
    }
  }, [theme.color]);

  return (
    <div className={`fixed ${positionClass}`} ref={themeSwitcherRef} style={{ opacity: 0, zIndex: 2 }}>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme.type === 'light' ? 'dark' : 'light'} theme`}
          className="hover:cursor-pointer bg-transparent border-0 p-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ffd54f]"
        >
          <img src="/icons/night-mode.svg" width={24} height={24} alt="" loading="lazy" />
        </button>
      </div>
    </div>
  );
};

export default ThemeSwitcher;