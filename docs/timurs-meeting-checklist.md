# Meeting with Timurs: decisions, accounts, and launch checklist

Prepared 29 October 2026. Use the checkboxes as a meeting agenda. Account access and product decisions can be completed together; verification, professional advice, and production engineering may require follow-up.

Current position: gallery, photo administration, administrator sign-in, currency suggestions, and a local test purchase/download implementation exist. Actual Stripe test Checkout still needs account configuration and end-to-end testing. Emails currently stay in a private local outbox. The app is not deployed and does not accept real payments. Customer accounts and purchase history remain to be implemented.

Do not put passwords, API keys, bank details, identity documents, or recovery codes into this checklist, GitHub, or chat. Record only decisions and whether access has been granted. Timurs should enter verification and banking details directly into the provider's own service.

## Before the meeting — Michael

- [ ] Bring a laptop with the project, working local database, and latest code.
- [ ] Bring the email addresses used for your Stripe/developer invitations, GitHub, and hosting access.
- [ ] Open the app and `docs/test-purchases.md` so you can demonstrate what exists.
- [ ] Ask Timurs to bring access to his email and phone for verification, plus a representative selection of photo files, including his largest originals.
- [ ] Ask Timurs to have the business, identity, tax, and bank information Stripe requests available privately. Do not ask him to send you copies in advance.

## 1. Establish ownership and business identity — together

- [ ] Confirm who legally sells the photos: Timurs personally/as a sole trader, or an existing company. Record the public trading name and the correct seller details for the website and receipts.
- [ ] Choose Timurs's owner/admin email, a customer support email, and who will answer purchase/download problems.
- [ ] Agree that Timurs owns the live Stripe account, domain, and production-service accounts. Michael receives an individual collaborator login. If development resources remain in Michael's accounts temporarily, document the eventual handover.
- [ ] Enable multifactor authentication on important accounts and let each owner retain their own recovery methods.
- [ ] Agree who can approve expenses, refunds, and changes to live payment settings.

Done when: the seller, account owner, support contact, and Michael's role are clear.

## 2. Create Stripe and grant access — Timurs leads; Michael assists

- [ ] Timurs creates or signs into Stripe with his own email and selects the correct UK business details.
- [ ] Create a sandbox/test environment for this shop.
- [ ] Invite Michael using his own login. Prefer access limited to the relevant sandbox initially. Accept the invitation and confirm Michael can access its API keys, events, and webhook tools.
- [ ] If using a live-account Developer role later, review its actual permissions together. It can create powerful API keys and is not a read-only role. Do not give account ownership or full administrator access merely to get development started.
- [ ] Timurs begins Stripe's requested identity/business verification himself. Record outstanding requirements; final activation can depend on completed website/business information.
- [ ] For live payouts, Timurs supplies the appropriate bank details directly to Stripe and checks ownership, payout currency, and schedule.
- [ ] Choose the public business name, support information, and a recognisable statement descriptor.
- [ ] Review GBP/EUR/USD payment acceptance, settlement currency, and applicable currency-conversion/payment fees in the account. These are separate from our shop's currency-price suggestions.
- [ ] Michael configures sandbox secret keys locally and the Stripe CLI webhook listener using `docs/test-purchases.md`. Keep secrets outside Git.
- [ ] Complete a real Stripe sandbox Checkout transaction, confirm the webhook, order record, purchase email, and correct original download. Confirm cancelled/failed payments grant no access and duplicate events create no duplicate email.

Access guidance: [Stripe user roles](https://docs.stripe.com/get-started/account/teams/roles), [sandbox-specific access](https://docs.stripe.com/sandboxes/dashboard/manage-access), [inviting team members](https://support.stripe.com/questions/invite-team-members-or-developers-to-access-your-stripe-account).

Done when: Timurs owns the account, Michael has the intended test access, a sandbox purchase works, and any activation requirements have an owner.

## 3. Decide exactly what is being sold — Timurs; Michael records

- [ ] Choose an initial collection and provide titles, descriptions, categories, and any required credits.
- [ ] Decide the actual downloadable product: high-quality JPEG only, TIFF, RAW, a ZIP bundle, or different formats for different licences. The current implementation accepts JPEG/PNG and delivers one original file.
- [ ] Inspect typical and largest file sizes and pixel dimensions. Use these to choose the upload limit and processing approach; the present 20 MiB/50-megapixel limits are development defaults.
- [ ] Decide whether location/GPS, names, and other EXIF metadata should remain in sold files. Previews are stripped, but the current original download preserves the uploaded bytes. Prepare the intended sale masters accordingly.
- [ ] Confirm ownership/permission to sell each photograph and identify any people, property, artwork, or other content needing a release or restrictions on commercial use.
- [ ] Approve watermark wording/position, preview quality, logo/shop name, short biography, and contact details.
- [ ] Set personal and commercial GBP prices. Confirm the EUR/USD suggestion rule: dated rates, nearest 0.50, manual overrides, and fixed prices after saving.
- [ ] Decide whether there are per-photo prices, default prices by collection, discounts, or any products that must not have a commercial licence.

Done when: there is an upload-ready launch collection and a clearly defined product and price for each photo/licence.

## 4. Approve licences and customer policies — Timurs, with appropriate professional review

- [ ] Define personal-use rights: printing, personal devices/social posts, attribution, and sharing restrictions.
- [ ] Define commercial-use rights: allowed business uses, client work, seats/users, duration, territory, print/use limits, and prohibited uses. Decide whether any uses need a separate negotiated licence.
- [ ] Decide whether licences are non-exclusive and whether copyright stays with Timurs; have the final wording reviewed. Current app licence text is explicitly TEST wording.
- [ ] Agree refunds, duplicate purchases, wrong-file problems, chargebacks, and the consequences for download access/licence rights.
- [ ] Agree the repeat-download policy and what happens if a photo is later withdrawn. Current 30-day purchase links and five-minute download URLs are provisional test settings.
- [ ] Prepare sale terms, privacy notice, and a support/refund process using the actual seller, services, and operating policies.
- [ ] Review the immediate-download consent/cancellation wording and how the app must record it and include it in confirmation emails. Avoid a blanket “digital downloads are never refundable” policy.

UK guidance requires explicit agreement to immediate digital delivery and acknowledgement of the effect on cancellation rights, with confirmation information supplied to the customer. This needs implementation as well as final wording: [GOV.UK online selling and downloads](https://www.gov.uk/online-and-distance-selling-for-businesses/online-selling).

Done when: final approved documents replace the current test terms and the required consent/confirmation behaviour is specified.

## 5. Decide launch markets and tax treatment — Timurs and accountant

- [ ] Choose the countries where customers may buy at launch. Offering GBP/EUR/USD does not mean the business is ready to sell in every country.
- [ ] Confirm Timurs's VAT registration status and which sales records/invoices the accountant needs.
- [ ] Ask an accountant familiar with digital sales about UK, EU, and any intended US/other sales, including customer-location evidence, VAT/sales tax, business buyers, registrations, and whether displayed prices include tax.
- [ ] Decide which billing/location information must be collected even though public customer profiles will be minimal.
- [ ] Have Michael implement and test the resulting collection and tax rules before opening those markets.

HMRC explicitly includes automatically downloaded stock photographs in its digital-services examples; cross-border treatment depends on customer location and other facts. Stripe payment processing does not by itself settle the seller's tax obligations. [HMRC digital-services guidance](https://www.gov.uk/guidance/the-vat-rules-if-you-supply-digital-services-to-private-consumers).

Done when: the launch countries and tax/record-keeping requirements are confirmed. Escalate unresolved questions to the accountant instead of guessing during the meeting.

## 6. Domain, real email, hosting, and access — together

- [ ] Choose the domain and confirm who controls its registrar/DNS. Check whether Timurs already owns it through Crazy Domains or elsewhere. There is no need to commit the app hosting to the domain provider.
- [ ] Grant Michael appropriate delegated DNS/project access where supported, rather than sharing the owner's password.
- [ ] Choose support and sender addresses, for example `support@…` and `photos@…`. Decide who monitors replies and failed-delivery alerts.
- [ ] Set a monthly running-cost ceiling, an initial storage allowance, and who pays provider bills and receives cost alerts. Include database, original files, bandwidth, email, backups, and application hosting.
- [ ] Agree requirements and choose suitable application hosting, managed PostgreSQL, private object storage, and transactional email services with Michael. Provider selection can follow the meeting once volume/budget are known.
- [ ] Set up the selected production accounts in Timurs's ownership and invite Michael with the minimum useful project permissions.
- [ ] Michael configures the sending domain and provider-required DNS records, including SPF/DKIM and an appropriate DMARC policy; test real delivery to representative inboxes.
- [ ] Agree backup retention and ownership of a separate copy of the original photo collection. GitHub backs up code, not the uploaded files or database.

Done when: domain control, delegated access, the budget, billing ownership, and provider-selection authority are agreed. Actual provider provisioning and DNS propagation may follow later.

## 7. Customer experience and everyday administration — Timurs demonstrates his needs

- [ ] Have Timurs use the local administration himself: sign in, upload, set GBP prices, review currency suggestions, publish, edit, and unpublish. Record anything confusing.
- [ ] Confirm the customer-account requirement: optional private email-verified accounts, purchase history, repeat downloads, and access to earlier guest purchases only after verifying the matching email. These features are still outstanding.
- [ ] Confirm guest checkout remains available and which order/receipt/licence details buyers should receive.
- [ ] Choose Timurs's actual administrator email and decide whether Michael should keep access after handover.
- [ ] Agree who handles refunds, download resets, customer deletion requests, disputes, and urgent incidents.
- [ ] Identify the minimum handover material: a short illustrated guide or walkthrough, provider/account inventory, and a recovery/support contact.

Done when: Timurs is comfortable with the workflow and the remaining customer/account requirements are confirmed.

## After the meeting — Michael's engineering work before launch

- [ ] Finish and test the Stripe sandbox journey using Timurs's account.
- [ ] Implement the agreed customer accounts and verified guest-purchase linking.
- [ ] Replace the local email outbox with real transactional delivery, retry/failure handling, and the approved receipt/licence/consent content.
- [ ] Move database and private originals to production services; implement the agreed file sizes/formats and secure upload/download approach.
- [ ] Implement tax, billing details, final licences, cancellation consent, refund/dispute handling, and agreed download policies.
- [ ] Prepare production authentication, HTTPS/Secure cookies, secrets management, live webhooks, and production-safe access controls. The present development-only guards deliberately prevent production use; launch requires an explicit reviewed production configuration, not merely substituting a live Stripe key.
- [ ] Configure backups and demonstrate database/file restoration. Add monitoring for errors, webhook failures, email delivery, storage, and costs.
- [ ] Remove test data/wording from the production shop while preserving the sandbox for future testing.
- [ ] Run mobile, keyboard/accessibility, purchase failure/retry, email, and download tests on the deployed staging environment.
- [ ] Perform a security review of the actual production configuration and complete Timurs's final acceptance test.

## Launch day — Timurs approves; Michael operates

- [ ] Confirm seller verification/payout settings, approved content/policies/tax configuration, and operational ownership.
- [ ] Enable live payments only after explicit Timurs approval and production checks.
- [ ] Make an agreed small real purchase and verify the charge, order, actual email, licence, original download, and refund workflow. Check the first payout when Stripe schedules it.
- [ ] Confirm Timurs can operate the shop, owns its accounts, and knows how to obtain support.

## The useful outputs to bring back from the meeting

- [ ] Stripe owner established, Michael's sandbox invitation accepted, and any outstanding verification tasks recorded.
- [ ] Seller/trading details, admin/support emails, domain ownership, and delegated-access arrangements agreed.
- [ ] Representative original files, launch collection, file-format/size requirements, branding, and GBP prices supplied.
- [ ] Licence, refund, download, and customer-account decisions recorded, with legal/accounting questions assigned for follow-up.
- [ ] Launch countries, tax adviser/actions, hosting budget, billing owner, and support responsibilities agreed.

Do not treat an unfinished identity check, unanswered tax question, or unchosen provider as a reason to rush a live launch. Record the owner and next action; development can continue on the independent items.
