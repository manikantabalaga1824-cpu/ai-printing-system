# Strict Engineering Rules — AI PrintOS

1. Use only semantic HTML5, CSS3 and vanilla JavaScript for the frontend. No React, Vue, Angular, build tools, or unnecessary dependencies.
2. Inspect existing code before edits and preserve working functionality. Keep state, persistence, editor operations, rendering, API access and styles modular.
3. Never expose API keys, secrets, access tokens, or private credentials in frontend code or committed files. All private API calls must use a serverless/backend proxy.
4. Never fake integrations, AI generation, authentication, cloud persistence, editor actions, downloads or test results. Clearly label unavailable functionality.
5. Connect Canva and Adobe Express only via officially supported SDK/API workflows with required account permissions and authorization.
6. Implement real image generation with loading, success, failure, retry and download states; verify image payloads before reporting success.
7. Every visible button, form, input, menu, filter and route must work or be visibly disabled with an explanation.
8. Maintain responsive layout, accessible labels, keyboard support, contrast, input validation, secure file parsing, error handling and reduced-motion support.
9. Avoid duplicated code, unnecessary dependencies, excessive animation and placeholder content presented as production data.
10. Never introduce architecture that conflicts with the frontend-only constraint. Optional serverless functions are integration boundaries, not a frontend framework.
11. Test critical workflows, browser-console errors, failure states and responsiveness. Never claim a test passed unless it actually ran.
12. Support Vercel and Netlify where compatible and document platform-specific handler and environment differences.
13. ZIP delivery must include source, README, `.env.example`, host configuration and setup/deployment docs, with no real secrets.
14. Before completion, summarize implemented functionality, verified tests, limitations, required API permissions and deployment actions.
15. Do not add fake customer reviews, testimonials or customer experience comments.
16. Never trade security or correct behavior for visual polish.

Priority: Security → Correctness → Maintainability → Performance → Responsiveness → Visual polish.
