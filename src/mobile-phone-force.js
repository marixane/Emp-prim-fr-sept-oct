function applyMobilePhoneForce() {
  if (document.getElementById('mobile-phone-force-style')) return;

  const style = document.createElement('style');
  style.id = 'mobile-phone-force-style';
  style.textContent = `
    @media (max-width: 768px) {
      html,
      body,
      #root {
        width: 100% !important;
        height: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }

      .education-top-navbar {
        display: none !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
      }

      .app-shell {
        width: 100vw !important;
        height: 100vh !important;
        min-width: 100vw !important;
        max-width: 100vw !important;
        min-height: 100vh !important;
        max-height: 100vh !important;
        display: grid !important;
        grid-template-columns: 20vw 80vw !important;
        grid-template-rows: 100vh !important;
        gap: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
      }

      .panel {
        grid-column: 1 !important;
        width: 20vw !important;
        min-width: 20vw !important;
        max-width: 20vw !important;
        height: 100vh !important;
        min-height: 100vh !important;
        max-height: 100vh !important;
        position: relative !important;
        left: auto !important;
        top: auto !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 5px !important;
        padding: 6px 3px !important;
        margin: 0 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        box-sizing: border-box !important;
        border-radius: 0 !important;
        border-right: 1px solid #cbd5e1 !important;
        background: #ffffff !important;
        box-shadow: none !important;
      }

      .panel h1,
      .panel .intro,
      .panel .form-group > label,
      .exercise-count-section h2,
      .note-scale-title,
      .note-scale-counter,
      .page-count-card label {
        display: none !important;
      }

      .panel .eyebrow,
      .panel .form-group,
      .assignment-control,
      .note-scale-control,
      .note-scale-buttons,
      .exercise-count-section,
      .page-count-grid,
      .page-count-card,
      .page-count-card .compact-control {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 5px !important;
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        box-sizing: border-box !important;
      }

      .panel button,
      .assignment-control button,
      .note-scale-button,
      .pdf-lines-toggle,
      .bar-ribbon-toggle,
      .panel > button:not(.pdf-lines-toggle):not(.bar-ribbon-toggle),
      .page-count-card .compact-control button {
        width: 30px !important;
        min-width: 30px !important;
        max-width: 30px !important;
        height: 30px !important;
        min-height: 30px !important;
        padding: 0 !important;
        margin: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 9px !important;
        font-size: 0 !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }

      .panel button::before,
      .assignment-control button::before,
      .note-scale-button::before,
      .pdf-lines-toggle::before,
      .bar-ribbon-toggle::before,
      .page-count-card .compact-control button::before {
        position: static !important;
        width: auto !important;
        height: auto !important;
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
        font-size: 14px !important;
        font-weight: 900 !important;
        color: currentColor !important;
      }

      .assignment-control button:nth-child(1)::before { content: 'I' !important; }
      .assignment-control button:nth-child(2)::before { content: 'M' !important; }
      .note-scale-button:nth-child(1)::before { content: '10' !important; font-size: 12px !important; }
      .note-scale-button:nth-child(2)::before { content: '20' !important; font-size: 12px !important; }
      .pdf-lines-toggle::before { content: 'L' !important; }
      .bar-ribbon-toggle::before { content: 'Pts' !important; font-size: 10px !important; }
      .pdf-lines-toggle::after,
      .bar-ribbon-toggle::after { content: '' !important; display: none !important; }

      .page-count-card .compact-control strong {
        width: 30px !important;
        min-width: 30px !important;
        max-width: 30px !important;
        height: 22px !important;
        line-height: 22px !important;
        padding: 0 !important;
        border-radius: 7px !important;
        font-size: 11px !important;
      }

      .page-count-card .compact-control strong::after { content: '' !important; display: none !important; }
      .page-count-card .compact-control button:first-child::before { content: '-' !important; }
      .page-count-card .compact-control button:last-child::before { content: '+' !important; }
      .panel > button.secondary::before { content: 'PDF' !important; font-size: 9px !important; }

      .preview-zone {
        grid-column: 2 !important;
        width: 80vw !important;
        min-width: 80vw !important;
        max-width: 80vw !important;
        height: 100vh !important;
        min-height: 100vh !important;
        max-height: 100vh !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 18px !important;
        padding: 8px 0 40px 6px !important;
        margin: 0 !important;
        overflow: auto !important;
        box-sizing: border-box !important;
        background: #e8edf4 !important;
      }

      .preview-zone .a4-page {
        transform: scale(0.47) !important;
        transform-origin: top left !important;
        margin: 0 0 -430px 0 !important;
        flex: 0 0 auto !important;
      }
    }

    @media (max-width: 430px) {
      .preview-zone .a4-page {
        transform: scale(0.45) !important;
        margin-bottom: -455px !important;
      }
    }
  `;

  document.head.appendChild(style);
}

applyMobilePhoneForce();
setTimeout(applyMobilePhoneForce, 100);
setTimeout(applyMobilePhoneForce, 500);
setTimeout(applyMobilePhoneForce, 1000);
