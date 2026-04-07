import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Imagenary.ai and the Imagenary Text Extractor Chrome extension.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: April 7, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-sm text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold mt-0">Overview</h2>
          <p>
            Imagenary.ai (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the imagenary.ai website
            and the Imagenary Text Extractor Chrome extension. This policy explains what data we
            collect, how we use it, and your rights.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">What We Collect</h2>
          <h3 className="text-base font-medium mt-3">Website (imagenary.ai)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account data:</strong> Email address when you sign up (via Google OAuth or email/password).</li>
            <li><strong>Usage data:</strong> Which tools you use, timestamps, duration, and success/error status — stored in our database for your usage history.</li>
            <li><strong>Payment data:</strong> Processed by Stripe. We store your Stripe customer ID but never your card details.</li>
            <li><strong>Uploaded images:</strong> Processed in memory and sent to AI providers (Google Gemini, Stability AI) for the requested operation. We do not permanently store your uploaded images.</li>
          </ul>

          <h3 className="text-base font-medium mt-3">Chrome Extension</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Screenshots:</strong> Captured only when you click &quot;Capture Screenshot&quot; or use the keyboard shortcut. Screenshots are sent directly to the selected AI provider for text extraction and are not stored on our servers.</li>
            <li><strong>API keys:</strong> If you use your own API keys (Gemini, Claude, OpenAI), they are stored locally in Chrome&apos;s storage and are never sent to our servers. Keys are sent only to their respective AI provider.</li>
            <li><strong>Extraction history:</strong> Stored locally in your browser. You can view, export, or delete it at any time from the extension settings.</li>
            <li><strong>Imagenary account token:</strong> If you sign in via Imagenary.ai, an authentication token is stored locally to authenticate API requests.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and improve our AI image tools.</li>
            <li>To track your usage and manage your account balance.</li>
            <li>To send you result emails when using the free tier preview feature.</li>
            <li>To process payments via Stripe.</li>
          </ul>
          <p className="mt-2">We do not sell your data or use it for advertising.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Third-Party Services</h2>
          <p>We use the following third-party services to process your data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Google Gemini:</strong> Image analysis and text extraction.</li>
            <li><strong>Stability AI:</strong> Image generation and enhancement.</li>
            <li><strong>Anthropic (Claude):</strong> Text extraction (extension only, with your own API key).</li>
            <li><strong>OpenAI:</strong> Text extraction (extension only, with your own API key).</li>
            <li><strong>Supabase:</strong> Authentication and database.</li>
            <li><strong>Stripe:</strong> Payment processing.</li>
            <li><strong>Resend:</strong> Transactional emails.</li>
            <li><strong>Vercel:</strong> Hosting.</li>
          </ul>
          <p className="mt-2">Each provider is governed by their own privacy policy.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Data Retention</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account data is retained as long as your account is active.</li>
            <li>Usage logs are retained indefinitely for billing and analytics.</li>
            <li>Uploaded images are processed in memory and not permanently stored.</li>
            <li>Chrome extension data is stored locally and deleted when you uninstall the extension or clear data.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Your Rights</h2>
          <p>You can:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Delete your extraction history from the extension settings.</li>
            <li>Export your extension data at any time.</li>
            <li>Request deletion of your account and associated data by emailing us.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Contact</h2>
          <p>
            For privacy questions or data deletion requests, contact us at{" "}
            <a href="mailto:support@imagenary.ai" className="text-accent hover:underline">support@imagenary.ai</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
