# Compliance and privacy

> Last verified: 2026-11-16

Scope: personal data regulations and certifications that trigger technical obligations. Not legal advice.

## Triggers

| Regulation | Applies when |
|----------|-----------|
| Indonesia PDP Law (Law 27/2022) + Government Regulation 33/2026 | Processing personal data in Indonesia, or with legal effect on Indonesian citizens |
| GDPR / UK GDPR | Users or an establishment in the EU/UK |
| CCPA/CPRA | California consumers above the threshold |
| HIPAA | US health data |
| EU AI Act | AI features marketed or used in the EU |
| PCI DSS | Accepting cards. Use a processor (Stripe etc.), never store PAN/CVV |
| SOC 2, ISO 27001 | Requested by enterprise customers |

Indonesia sector rules: PSE registration (Komdigi), OJK rules for finance.

## Indonesia PDP Law

- Status: transition period ended 17 Oct 2024. GR 33/2026 (promulgated 16 Jul 2026) is the implementing regulation. The supervisory authority's powers take effect 16 Jan 2027, and the agency is not yet formed. The controller obligations already apply.
- Specific data (Article 4): health, biometric, genetic, criminal records, children's data, personal finance. Collect only if necessary.
- Children's data: consent from a parent or guardian (Article 25).
- Legal bases (Article 20): explicit consent, contract, legal obligation, vital interest, public task, or legitimate interest. Do not rely on consent for everything. Keep proof of consent.
- Data subject rights: access and copy, correction, deletion, withdraw consent, restrict processing, object to automated decisions, portability. Many requests must be handled within 3x24 hours.
- Deletion: hard delete or irreversible anonymization. Document backup delays and legal holds.
- Keep records of processing activities (Article 31). DPIA for high-risk processing (Article 34): specific data, large scale, profiling, new technology.
- Processors (vendors) require a written contract (Article 51).
- Breach (Article 46): written notice within 3x24 hours to the data subject and the agency. GDPR: 72 hours to the authority.
- Cross-border transfer (Article 56): the destination country offers equivalent protection, or adequate and binding protection (contract), or consent. Relevant for foreign SaaS (DB hosting, auth, analytics).
- Data protection officer / DPO (Article 53): required for public services, large-scale systematic monitoring, or large-scale specific data.
- Penalties: administrative fines up to 2% of annual revenue (Article 57); criminal penalties up to 6 years / Rp 6 billion.

## Technical practice

Data minimization, defined retention, encryption in transit and at rest, least privilege, audit logs for access to sensitive data, a clear privacy notice, export and delete flows, an incident runbook with the 3x24 and 72-hour deadlines. Non-essential cookies in the EU need consent. In Indonesia, cookies that process personal data need an Article 20 basis.

## EU AI Act

Prohibitions and transparency obligations already apply. High-risk obligations are postponed through the Digital Omnibus: standalone systems on 2 Dec 2027, product components on 2 Aug 2028.
