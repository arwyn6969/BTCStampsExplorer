import type { ComponentChildren } from "preact";

interface PageProps {
  title: string;
  children: ComponentChildren;
}

export function Page({ title, children }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="color-scheme" content="dark" />
        <meta
          name="description"
          content="Browse Bitcoin Stamps and their creation records."
        />
        <title>{title}</title>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/style.css" />
        <script src="/app.js" defer />
      </head>
      <body>
        <a href="#main" class="skip-link">Skip to content</a>
        <header class="site-header">
          <div class="header-inner">
            <a class="brand" href="/explorer" aria-label="Stampchain explorer">
              <img src="/logo.svg" width="27" height="27" alt="" />
              <span>
                STAMP<span class="brand-tail">CHAIN</span>
              </span>
            </a>
            <nav aria-label="Main navigation">
              <a href="/explorer">Explorer</a>
            </nav>
            <span class="preview-tag">Browsing preview</span>
            <span class="network">
              <span aria-hidden="true" /> Bitcoin
            </span>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer class="site-footer">
          <p>Bitcoin Stamps. Art that stays.</p>
          <p>
            Data from{" "}
            <a
              href="https://stampchain.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stampchain
            </a>. Original images and existing HTML previews are shown where
            available.
          </p>
        </footer>
      </body>
    </html>
  );
}

export function ErrorState(
  { message, href, backHref = "/explorer", heading = "h2" }: {
    message: string;
    href: string;
    backHref?: string;
    heading?: "h1" | "h2";
  },
) {
  const Heading = heading;
  return (
    <section class="error-state" role="alert">
      <span class="eyebrow">Unable to load</span>
      <Heading>This view is unavailable</Heading>
      <p>{message}</p>
      <div class="error-actions">
        <a class="button primary" href={href}>Try again</a>
        <a href={backHref}>Return to explorer</a>
      </div>
    </section>
  );
}
