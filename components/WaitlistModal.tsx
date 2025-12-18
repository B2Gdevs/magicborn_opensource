"use client";

import { useEffect, useRef } from "react";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Load ConvertKit script
      if (!document.querySelector('script[src="https://f.convertkit.com/ckjs/ck.5.js"]')) {
        const script = document.createElement("script");
        script.src = "https://f.convertkit.com/ckjs/ck.5.js";
        script.async = true;
        document.body.appendChild(script);
      }

      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />

      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-[420px] max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ConvertKit Form - inline format to display properly */}
        <form 
          action="https://app.kit.com/forms/8842918/subscriptions" 
          className="seva-form formkit-form" 
          method="post" 
          data-sv-form="8842918" 
          data-uid="b23a7ba91f" 
          data-format="inline" 
          data-version="5"
          style={{ borderRadius: '8px', maxWidth: '420px' }}
        >
          <div data-style="full" style={{ borderRadius: '8px' }}>
            <div 
              className="formkit-background" 
              style={{ 
                backgroundImage: 'url("https://embed.filekitcdn.com/e/ctvVfDAwdnQi8HBQsffXHB/mQmmmfk5ByF3LPNYcggv8f")',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                height: '100%',
                position: 'absolute',
                width: '100%',
                borderRadius: '8px',
              }} 
            />
            <div 
              className="formkit-container" 
              style={{ 
                background: 'linear-gradient(180deg, #2E2E2E12 0%, #2E2E2ED4 64.06%, #2E2E2E 88.54%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '25px',
                position: 'relative',
                width: '100%',
                minHeight: '500px',
                borderRadius: '8px',
              }}
            >
              <div className="formkit-header" style={{ color: 'rgb(255, 255, 255)', fontWeight: 700, fontSize: '36px', marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>Magicborn</h2>
              </div>
              <div className="formkit-content" style={{ color: 'rgb(255, 255, 255)', fontSize: '18px', lineHeight: 1.5, marginBottom: '36px' }}>
                <p style={{ margin: 0 }}>Join the waitlist for the most enduring spell crafting RPG</p>
              </div>
              <ul className="formkit-alert formkit-alert-error" data-element="errors" data-group="alert" style={{ listStyle: 'none', padding: 0, margin: 0 }} />
              <div data-element="fields" className="seva-fields formkit-fields" style={{ color: 'rgb(255, 255, 255)' }}>
                <div className="formkit-field" style={{ marginBottom: '10px' }}>
                  <input 
                    className="formkit-input" 
                    name="email_address" 
                    aria-label="Email Address" 
                    placeholder="Email Address" 
                    required 
                    type="email" 
                    style={{ 
                      color: 'rgb(110, 110, 110)', 
                      fontWeight: 400, 
                      backgroundColor: 'rgb(27, 27, 27)', 
                      borderRadius: '4px',
                      border: 0,
                      fontSize: '16px',
                      padding: '14px 15px',
                      width: '100%',
                    }} 
                  />
                </div>
                <div className="formkit-field">
                  <fieldset data-group="checkboxes" style={{ border: 0, padding: 0, margin: 0 }}>
                    {[
                      { id: '13165068', label: 'Get world short stories as they are created in email' },
                      { id: '13165070', label: 'Get development updates' },
                      { id: '13165077', label: 'Get promotions' },
                    ].map(({ id, label }) => (
                      <div 
                        key={id}
                        className="formkit-checkboxes" 
                        data-element="tags-checkboxes" 
                        data-group="checkbox" 
                        style={{ 
                          color: 'rgb(200, 200, 200)', 
                          fontWeight: 400, 
                          backgroundColor: 'rgb(27, 27, 27)', 
                          borderRadius: '4px',
                          padding: '10px 12px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        <input 
                          className="formkit-checkbox" 
                          id={`tag-${id}`} 
                          type="checkbox" 
                          name="tags[]" 
                          value={id}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor={`tag-${id}`} style={{ cursor: 'pointer', fontSize: '14px' }}>{label}</label>
                      </div>
                    ))}
                  </fieldset>
                </div>
                <button 
                  data-element="submit" 
                  className="formkit-submit" 
                  style={{ 
                    color: 'rgb(255, 255, 255)', 
                    backgroundColor: 'rgb(0, 0, 0)', 
                    borderRadius: '4px', 
                    fontWeight: 700,
                    border: 0,
                    padding: '12px 24px',
                    width: '100%',
                    fontSize: '15px',
                    cursor: 'pointer',
                    marginTop: '15px',
                  }}
                >
                  <span>Subscribe</span>
                </button>
              </div>
              <div className="formkit-disclaimer" style={{ color: 'rgb(203, 203, 203)', fontSize: '13px', marginTop: '10px' }}>
                We respect your privacy. Unsubscribe at any time.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
