# Open Questions

Questions that came up during the website build. Need Peter's input before finalizing.

## Content

1. **API base URL** — `api.corpo.dev` is used as placeholder in the agents page. Is this the actual domain, or should it be something else?

2. **Status page** — `status.corpo.dev` is referenced. Does this exist yet?

3. **CLI installation** — The agents page uses `uvx corpo` as the install method. Is `corpo` published to PyPI yet, or should this be a different install command?

4. **Agent constitution schema** — The YAML schema on the agents page is a best-guess from the spec. Need to verify the actual field names and structure match the real `corpo.yaml` format.

5. **Escalation contact** — The constitution example shows `operator@example.com`. Should there be a real default or is this intentionally left as an example?

## Design

6. **About section** — The spec mentions an optional `/about` page or section on home. Currently omitted. Worth adding as a section on the home page?

7. **Dot grid pattern** — Defined in the identity brief as the only permitted texture. Currently available as a CSS class but not used on any section. Should it appear as a background on any section?

8. **Mobile nav** — Currently the nav is a simple flex layout that works on mobile. A hamburger menu isn't in brand — should mobile nav just stack or remain horizontal?

## Deployment

9. **Domain** — Is the site deploying to `corpo.dev`, a subdomain, or somewhere else?

10. **Analytics** — Any analytics or tracking to include?
