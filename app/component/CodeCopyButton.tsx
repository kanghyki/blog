'use client';

import { useEffect } from 'react';

export default function CodeCopyButton() {
  useEffect(() => {
    // 코드 블럭에 복사 버튼 추가
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('pre code');

      codeBlocks.forEach(codeBlock => {
        const pre = codeBlock.parentElement as HTMLPreElement;

        // 이미 버튼이 있는지 확인
        if (pre.querySelector('.code-copy-btn')) {
          return;
        }

        // 복사 버튼 생성
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-btn';
        copyButton.textContent = 'Copy';
        copyButton.setAttribute('aria-label', 'Copy code to clipboard');

        // 복사 기능
        copyButton.addEventListener('click', async () => {
          try {
            const codeText = codeBlock.textContent || '';
            await navigator.clipboard.writeText(codeText);

            // 성공 피드백
            copyButton.textContent = 'Copied!';
            copyButton.classList.add('copied');

            // 2초 후 원래 상태로 복원
            setTimeout(() => {
              copyButton.textContent = 'Copy';
              copyButton.classList.remove('copied');
            }, 2000);
          } catch (err) {
            console.error('Failed to copy code: ', err);

            // 실패 피드백
            copyButton.textContent = 'Failed';
            setTimeout(() => {
              copyButton.textContent = 'Copy';
            }, 2000);
          }
        });

        // pre 요소에 버튼 추가
        pre.appendChild(copyButton);
      });
    };

    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addCopyButtons);
    } else {
      addCopyButtons();
    }

    // 동적으로 추가되는 코드 블럭을 위한 MutationObserver
    const observer = new MutationObserver(() => {
      addCopyButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 클린업
    return () => {
      observer.disconnect();
      document.removeEventListener('DOMContentLoaded', addCopyButtons);
    };
  }, []);

  return null; // UI 렌더링 없음
}
