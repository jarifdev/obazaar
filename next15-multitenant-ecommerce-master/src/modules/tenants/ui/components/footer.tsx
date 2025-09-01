import Link from "next/link";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export const Footer = () => {
  return (
    <footer
      className="border-t font-medium text-white"
      style={{ backgroundColor: "#1c476f" }}
    >
      <div className="max-w-(--breakpoint-xl) mx-auto flex items-center h-full gap-2 px-4 py-6 lg:px-12 justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Start A Conversation
            </h3>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-white">
                {/* phone icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.09 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.97.37 1.92.73 2.82a2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6 6l1.26-1.26a2 2 0 0 1 2.11-.45c.9.36 1.85.61 2.82.73A2 2 0 0 1 22 16.92z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <a
                  href="tel:+96896696139"
                  className="text-white hover:text-gray-200"
                >
                  +96896696139
                </a>
              </div>

              <div className="flex items-center gap-2 text-white">
                {/* mail icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M4 4h16v16H4z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <path
                    d="M22 6l-10 7L2 6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <a
                  href="mailto:info@obazaar.om"
                  className="text-white hover:text-gray-200"
                >
                  info@obazaar.om
                </a>
              </div>

              {/* Support ticket removed per request */}

              <div className="flex items-center gap-2 text-white">
                {/* location icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="10"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-white">qurum Muscat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* social icons - X, LinkedIn, Instagram */}
          <a
            href="https://x.com/Obazaar_om"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="p-2 rounded-full border border-white flex items-center justify-center w-9 h-9 text-white hover:bg-white hover:text-[#1c476f] transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          <a
            href="https://www.linkedin.com/in/obazaarom/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="p-2 rounded-full border border-white flex items-center justify-center w-8 h-8 text-white hover:bg-white hover:text-[#1c476f] transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M16 8a6 6 0 0 1 6 6v6h-4v-6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6h-4v-12h4v2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="2"
                y="8"
                width="4"
                height="12"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="4"
                cy="4"
                r="2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          <a
            href="https://www.instagram.com/obazaar.om"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-2 rounded-full border border-white flex items-center justify-center w-8 h-8 text-white hover:bg-white hover:text-[#1c476f] transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.5 6.5h.01"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        <div className="sr-only">
          {/* Keep 'Powered by' for accessibility or future use */}
          <p className="text-white">
            Powered by{" "}
            <Link href={process.env.NEXT_PUBLIC_APP_URL!}>
              <span
                className={cn(
                  "text-2xl font-semibold text-white",
                  poppins.className
                )}
              >
                Obazaar
              </span>
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
