import { type PropsWithChildren, useEffect, useRef } from 'react';
import { THEME_STUDIO_LAYOUT_CSS } from './theme-studio-shell.styles';

export function ThemeStudioShell({ children }: PropsWithChildren) {
  const shell = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = document.querySelector('[data-app-shell-header]');
    const measure = () => {
      shell.current?.style.setProperty('--studio-header-height', `${header?.getBoundingClientRect().height ?? 0}px`);
    };
    const observer = new ResizeObserver(measure);
    if (header) observer.observe(header);
    measure();
    return () => observer.disconnect();
  }, []);
  return (
    <div className="theme-studio" ref={shell}>
      <style>{THEME_STUDIO_LAYOUT_CSS}</style>
      {children}
    </div>
  );
}
