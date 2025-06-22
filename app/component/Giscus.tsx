'use client';

import { useEffect, useRef } from 'react';

interface GiscusProps {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: string;
  strict?: string;
  reactionsEnabled?: string;
  emitMetadata?: string;
  inputPosition?: 'top' | 'bottom';
  theme?: string;
  lang?: string;
  crossOrigin?: 'anonymous';
  loading?: 'lazy' | 'eager';
}

export default function Giscus({
  repo,
  repoId,
  category,
  categoryId,
  mapping = 'pathname',
  strict = '0',
  reactionsEnabled = '1',
  emitMetadata = '0',
  inputPosition = 'bottom',
  theme = 'transparent_dark',
  lang = 'ko',
  crossOrigin = 'anonymous',
  loading = 'lazy',
}: GiscusProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;

    const scriptElem = document.createElement('script');
    scriptElem.src = 'https://giscus.app/client.js';
    scriptElem.async = true;
    scriptElem.crossOrigin = 'anonymous';

    scriptElem.setAttribute('data-repo', repo);
    scriptElem.setAttribute('data-repo-id', repoId);
    scriptElem.setAttribute('data-category', category);
    scriptElem.setAttribute('data-category-id', categoryId);
    scriptElem.setAttribute('data-mapping', mapping);
    scriptElem.setAttribute('data-strict', strict);
    scriptElem.setAttribute('data-reactions-enabled', reactionsEnabled);
    scriptElem.setAttribute('data-emit-metadata', emitMetadata);
    scriptElem.setAttribute('data-input-position', inputPosition);
    scriptElem.setAttribute('data-theme', theme);
    scriptElem.setAttribute('data-lang', lang);
    scriptElem.setAttribute('crossorigin', crossOrigin);
    scriptElem.setAttribute('data-loading', loading);

    ref.current.appendChild(scriptElem);
  }, [
    repo,
    repoId,
    category,
    categoryId,
    mapping,
    strict,
    reactionsEnabled,
    emitMetadata,
    inputPosition,
    theme,
    lang,
    crossOrigin,
    loading,
  ]);

  // changes theme only
  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app');
  }, [theme]);

  return <div ref={ref} />;
}
