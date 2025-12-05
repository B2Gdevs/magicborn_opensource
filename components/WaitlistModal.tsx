"use client";

import { useEffect, useRef } from "react";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Load ConvertKit script if not already loaded
      if (!document.querySelector('script[src="https://f.convertkit.com/ckjs/ck.5.js"]')) {
        const script = document.createElement("script");
        script.src = "https://f.convertkit.com/ckjs/ck.5.js";
        script.async = true;
        document.body.appendChild(script);
      }

      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close on backdrop click
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-[420px] max-h-[90vh] overflow-y-auto bg-shadow border border-border rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-text-secondary hover:text-ember-glow transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Form container */}
        <div ref={formRef} className="p-0">
          <form
            action="https://app.kit.com/forms/8842918/subscriptions"
            className="seva-form formkit-form"
            method="post"
            data-sv-form="8842918"
            data-uid="b23a7ba91f"
            data-format="modal"
            data-version="5"
            data-options='{"settings":{"after_subscribe":{"action":"message","success_message":"Success! Now check your email to confirm your subscription.","redirect_url":""},"analytics":{"google":null,"fathom":null,"facebook":null,"segment":null,"pinterest":null,"sparkloop":null,"googletagmanager":null},"modal":{"trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15},"powered_by":{"show":true,"url":"https://kit.com/features/forms?utm_campaign=poweredby&utm_content=form&utm_medium=referral&utm_source=dynamic"},"recaptcha":{"enabled":false},"return_visitor":{"action":"show","custom_content":""},"slide_in":{"display_in":"bottom_right","trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15},"sticky_bar":{"display_in":"top","trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15}},"version":"5"}'
            min-width="400 500 600 700 800"
            style={{ borderRadius: "0px" }}
          >
            <div data-style="full" style={{ "--border-radius": "0px" } as React.CSSProperties}>
              <div
                className="formkit-background"
                style={{
                  backgroundImage:
                    'url("https://embed.filekitcdn.com/e/ctvVfDAwdnQi8HBQsffXHB/mQmmmfk5ByF3LPNYcggv8f")',
                }}
              />
              <div
                className="formkit-container"
                style={{
                  "--bg-color": "#2E2E2E",
                  "--bg-color-07": "#2E2E2E12",
                  "--bg-color-83": "#2E2E2ED4",
                } as React.CSSProperties}
              >
                <div
                  className="formkit-header"
                  data-element="header"
                  style={{ color: "rgb(255, 255, 255)", fontWeight: 700 }}
                >
                  <h2>Magicborn</h2>
                </div>
                <div
                  className="formkit-content"
                  data-element="content"
                  style={{ color: "rgb(255, 255, 255)" }}
                >
                  <p>Join the waitlist for the most enduring spell crafting RPG</p>
                </div>
                <ul
                  className="formkit-alert formkit-alert-error"
                  data-element="errors"
                  data-group="alert"
                />
                <div
                  data-element="fields"
                  className="seva-fields formkit-fields"
                  style={{ color: "rgb(255, 255, 255)" }}
                >
                  <div className="formkit-field">
                    <input
                      className="formkit-input"
                      name="email_address"
                      aria-label="Email Address"
                      placeholder="Email Address"
                      required
                      type="email"
                      style={{
                        color: "rgb(110, 110, 110)",
                        fontWeight: 400,
                        backgroundColor: "rgb(27, 27, 27)",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  <div className="formkit-field">
                    <div role="button" tabIndex={0}>
                      <fieldset
                        data-group="checkboxes"
                        className="formkit-6797"
                        group="field"
                        type="Custom"
                        order="1"
                        save-as="Tag"
                      >
                        <div
                          className="formkit-checkboxes"
                          data-element="tags-checkboxes"
                          data-group="checkbox"
                          style={{
                            color: "rgb(110, 110, 110)",
                            fontWeight: 400,
                            backgroundColor: "rgb(27, 27, 27)",
                            borderRadius: "4px",
                          }}
                        >
                          <input
                            className="formkit-checkbox"
                            id="tag-6797-13165068"
                            type="checkbox"
                            name="tags[]"
                            value="13165068"
                          />
                          <label htmlFor="tag-6797-13165068">
                            Get world short stories as they are created in email
                          </label>
                        </div>
                        <div
                          className="formkit-checkboxes"
                          data-element="tags-checkboxes"
                          data-group="checkbox"
                          style={{
                            color: "rgb(110, 110, 110)",
                            fontWeight: 400,
                            backgroundColor: "rgb(27, 27, 27)",
                            borderRadius: "4px",
                          }}
                        >
                          <input
                            className="formkit-checkbox"
                            id="tag-6797-13165070"
                            type="checkbox"
                            name="tags[]"
                            value="13165070"
                          />
                          <label htmlFor="tag-6797-13165070">Get development updates</label>
                        </div>
                        <div
                          className="formkit-checkboxes"
                          data-element="tags-checkboxes"
                          data-group="checkbox"
                          style={{
                            color: "rgb(110, 110, 110)",
                            fontWeight: 400,
                            backgroundColor: "rgb(27, 27, 27)",
                            borderRadius: "4px",
                          }}
                        >
                          <input
                            className="formkit-checkbox"
                            id="tag-6797-13165077"
                            type="checkbox"
                            name="tags[]"
                            value="13165077"
                          />
                          <label htmlFor="tag-6797-13165077">Get promotions</label>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                  <button
                    data-element="submit"
                    className="formkit-submit formkit-submit"
                    style={{
                      color: "rgb(255, 255, 255)",
                      backgroundColor: "rgb(245, 113, 72)",
                      borderRadius: "4px",
                      fontWeight: 700,
                    }}
                  >
                    <div className="formkit-spinner">
                      <div />
                      <div />
                      <div />
                    </div>
                    <span className="">Download</span>
                  </button>
                </div>
                <div
                  className="formkit-disclaimer"
                  data-element="disclaimer"
                  style={{ color: "rgb(203, 203, 203)" }}
                >
                  We respect your privacy. Unsubscribe at any time.
                </div>
                <div className="formkit-powered-by-convertkit-container">
                  <a
                    href="https://kit.com/features/forms?utm_campaign=poweredby&utm_content=form&utm_medium=referral&utm_source=dynamic"
                    data-element="powered-by"
                    className="formkit-powered-by-convertkit"
                    data-variant="light"
                    target="_blank"
                    rel="nofollow"
                  >
                    Built with Kit
                  </a>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

