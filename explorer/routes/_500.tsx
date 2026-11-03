import { Page } from "../components/Page.tsx";

export default function ServerError() {
  return (
    <Page title="Source unavailable">
      <main id="main" class="shell empty-state">
        <h1>This view is temporarily unavailable.</h1>
        <p>Please try the explorer again.</p>
        <a class="button primary" href="/explorer">Back to explorer</a>
      </main>
    </Page>
  );
}
