import { Page } from "../components/Page.tsx";

export default function NotFound() {
  return (
    <Page title="Page not found · Stampchain">
      <div class="page-shell">
        <section class="error-state" aria-labelledby="missing-title">
          <span class="eyebrow">404</span>
          <h1 id="missing-title">Page not found</h1>
          <p>This browsing preview includes the explorer and stamp details.</p>
          <a class="button primary" href="/explorer">Go to explorer</a>
        </section>
      </div>
    </Page>
  );
}
