# Corelane API Terms — Account Termination Policy
**Version 2.3** · **Effective: June 1, 2026**

### 1.1 Purpose and Scope
This Account Termination Policy (the "Policy") establishes the formal framework governing the cessation of services provided by Corelane, Inc. regarding the Corelane API. The objective of this Policy is to provide transparency, legal certainty, and operational clarity concerning the conditions under which access to the Corelane API—a specialized API-as-a-service for LLM inference hosting and embedding generation—may be terminated, either at the election of the customer or by the unilateral action of Corelane, Inc.

This Policy applies to all entities, developers, and organizations (collectively, "Customers") that maintain an active account for the utilization of the Corelane API. The scope of this document encompasses all service tiers offered by Corelane, Inc., specifically the Free, Pro, and Enterprise tiers. Each tier is subject to distinct operational parameters, including but not limited to, monthly quota limitations, uptime SLAs, and data retention protocols as defined in the following table:

| Service Tier | Uptime SLA | Data Retention (Post-Deletion) |
| :--- | :--- | :--- |
| Free | Best-effort | 7 days |
| Pro | 99.5% | 30 days |
| Enterprise | 99.9% | 90 days (or per contract) |

By accessing or utilizing the Corelane API, the Customer acknowledges that this Policy constitutes a binding component of the overarching Terms of Service. This document governs the lifecycle of the Customer's account, the invalidation of any issued API key, and the subsequent handling of data upon the conclusion of the service relationship. The provisions herein are effective as of June 1, 2026, and supersede any prior representations or informal agreements regarding account termination. Failure to adhere to the requirements set forth in this Policy may result in immediate suspension or permanent revocation of access to the Corelane API infrastructure, without prejudice to any other rights or remedies available to Corelane, Inc. under applicable law.

### 1.2 Definitions
This section provides clear definitions for key terms utilized throughout this Account Termination Policy.

**Corelane, Inc.** refers to the corporate entity providing the Corelane API services, its affiliates, subsidiaries, and assigns.

**Corelane API** designates the API-as-a-service product offered by Corelane, Inc. for large language model (LLM) inference hosting and embedding generation.

**Customer** denotes any individual, entity, or organization that has created an account with Corelane, Inc. to access and utilize the Corelane API.

**Account** signifies the formal record maintained by Corelane, Inc. for a Customer, encompassing registration details, service tier selection, usage data, and billing information.

**API Key** refers to the unique, confidential credential issued by Corelane, Inc. to a Customer for authenticating and authorizing access to the Corelane API. Customers are solely responsible for the security and confidentiality of their API keys.

**Service Tier** identifies the specific subscription level selected by a Customer, which dictates the scope of services, features, performance metrics, and support entitlements. Corelane, Inc. offers the following Service Tiers:

*   **Free Tier:** A complimentary service tier priced at $0/month, subject to a rate limit of 60 requests per minute and 1000 requests per day. This tier offers best-effort uptime, which is not contractually guaranteed. Data retention after account deletion is 7 days. No refund policy is applicable due to the absence of a paid subscription.
*   **Pro Tier:** A paid service tier priced at $49/month, subject to a rate limit of 600 requests per minute and 100,000 requests per day. This tier includes a burst allowance of +20% for up to 60 seconds and a guaranteed uptime SLA of 99.5%. Data retention after account deletion is 30 days. A full refund is available within the first 14 days, provided usage has remained under 10% of the monthly quota.
*   **Enterprise Tier:** A custom-priced service tier requiring direct engagement with Corelane, Inc. sales. Rate limits are negotiated, with a minimum of 2000 requests per minute. Burst allowance is determined per the negotiated Service Level Agreement (SLA). This tier guarantees an uptime SLA of 99.9%. Data retention after account deletion is 90 days, or as specified in the individual contract. Refund policies are also defined by individual contract terms.

**Monthly Quota** refers to the maximum permissible usage volume or transaction count allocated to a Customer's account within a calendar month, as defined by their selected Service Tier.

**Rate Limit** specifies the maximum number of requests a Customer's API key can make to the Corelane API within a defined time interval, typically per minute or per day, as determined by the Service Tier.

**Burst Allowance** denotes a temporary increase in the Rate Limit, permitting a higher volume of requests for a limited duration, as specified by the Service Tier.

**Uptime Service Level Agreement (SLA)** represents a contractual commitment by Corelane, Inc. regarding the operational availability of the Corelane API, with specific percentages varying by Service Tier.

**Data Retention Period** signifies the duration for which Corelane, Inc. will store Customer data following account deletion or termination, varying according to the Customer's Service Tier or contractual agreement.

**Effective Date** refers to June 1, 2026, from which this Account Termination Policy is officially in force.

**Termination** means the cessation of a Customer's access to and use of the Corelane API and associated services, whether initiated by the Customer or by Corelane, Inc.

**Voluntary Termination** describes the process by which a Customer initiates the closure of their own Account.

**Involuntary Termination** describes the process by which Corelane, Inc. unilaterally closes a Customer's Account due to reasons such as policy violations, non-payment, or inactivity.

**Security Incident** refers to any event that compromises the confidentiality, integrity, or availability of Corelane API systems or Customer data. In the event of a Security Incident, Corelane, Inc. commits to notifying affected Customers within 72 hours via registered account email and in-dashboard alert banner. Customer API key rotation is required following such an incident. Corelane, Inc.'s liability explicitly excludes incidents caused by customer-side API key leakage or customer infrastructure compromise.

### 2.1 Voluntary Account Termination by Customer
Customers may initiate the voluntary termination of their Corelane API account at any time by submitting a formal request through the Corelane, Inc. administrative dashboard or by providing written notice to the Corelane, Inc. support department. Upon the initiation of a termination request, the Customer acknowledges that all access to the Corelane API, including the functionality of any active API key, shall be subject to immediate or scheduled cessation as defined by the specific service tier requirements.

For Customers subscribed to the Free tier, termination is effective immediately upon the submission of the request. As the Free tier operates at a $0/month price point, no financial reconciliation is required. The Customer is responsible for ensuring that all necessary data exports are completed prior to the initiation of the termination process, as Corelane, Inc. will adhere to the standard data retention policy of 7 days post-deletion before permanent removal of all associated records.

For Customers subscribed to the Pro tier, the termination process requires the Customer to confirm the cessation of all active API integrations. Given the $49/month subscription model, the Customer must ensure that all outstanding usage fees incurred up to the date of termination are settled. Regarding the refund policy, a Pro tier Customer may be eligible for a full refund only if the termination request is submitted within the first 14 days of the initial subscription period and provided that the Customer’s total usage has remained under 10% of the monthly quota. If these conditions are not met, the Customer remains liable for the full monthly subscription fee, and no pro-rated refunds shall be issued for partial months of service.

For Enterprise tier Customers, voluntary termination is governed by the specific terms and conditions outlined in their individual service agreement. In the absence of specific termination clauses within an executed contract, the Customer must provide written notice at least 30 days prior to the intended termination date. Enterprise Customers are required to coordinate with their dedicated account manager to ensure the orderly decommissioning of services and the secure transfer or destruction of data. Financial obligations for Enterprise accounts will be settled in accordance with the payment terms stipulated in the governing contract, and any refunds or credits will be processed strictly as negotiated therein.

Upon the effective date of voluntary termination, the following conditions shall apply to all tiers:

*   **API Key Invalidation:** All API keys associated with the account will be immediately revoked and rendered non-functional.
*   **Access Cessation:** The Customer’s access to the Corelane API dashboard and all associated inference hosting or embedding generation services will be terminated.
*   **Data Retention:** Data will be retained in accordance with the specific tier-based retention periods (7 days for Free, 30 days for Pro, and 90 days or per contract for Enterprise) before being permanently purged from Corelane, Inc. systems.

It is the sole responsibility of the Customer to ensure that all necessary data, logs, and configurations are retrieved prior to the final termination date. Corelane, Inc. assumes no liability for data loss resulting from a failure to export information prior to the account closure.

### 2.2 Involuntary Account Termination by Corelane, Inc. - General Grounds
Corelane, Inc. reserves the right to unilaterally terminate, suspend, or restrict access to the Corelane API at its sole discretion, should a customer engage in activities that compromise the integrity, security, or operational stability of the Corelane API infrastructure. Such actions are deemed necessary to protect the interests of Corelane, Inc., its service providers, and its broader user base. 

General grounds for involuntary account termination include, but are not limited to, the following:

* **Security Compromise:** Any evidence suggesting that a customer’s API key has been compromised, or that the customer’s infrastructure has been utilized to facilitate unauthorized access, data exfiltration, or malicious activity, shall constitute grounds for immediate termination. Corelane, Inc. maintains no liability for incidents caused by customer-side API key leakage or customer infrastructure compromise.
* **Operational Disruption:** Any attempt to circumvent established rate limits, including the monthly quota or the specific rate_limit_per_min and rate_limit_per_day thresholds defined for the Free, Pro, and Enterprise tiers, may result in immediate account suspension or termination. This includes, but is not limited to, the deployment of automated systems designed to bypass burst allowance restrictions or the intentional flooding of the Corelane API endpoints.
* **Abuse of Service:** The utilization of the Corelane API for purposes that violate applicable laws, regulations, or the Corelane, Inc. Acceptable Use Policy, including the generation of prohibited content or the facilitation of illegal activities, will result in the immediate and permanent termination of the account.
* **Fraudulent Activity:** Any attempt to misrepresent identity, engage in payment fraud, or manipulate the billing systems associated with the Pro or Enterprise tiers will result in immediate termination. 
* **Regulatory Compliance:** Corelane, Inc. reserves the right to terminate accounts if required by law, court order, or regulatory directive, or if the continued provision of services to a specific customer poses an unacceptable legal or compliance risk to Corelane, Inc.

In the event of involuntary termination, Corelane, Inc. will endeavor to provide notice via the registered account email or an in-dashboard alert banner, subject to the exigencies of the situation. Upon the effective date of termination, all access to the Corelane API shall be revoked, and all associated API keys will be rendered permanently invalid. 

Customers are reminded that the uptime SLA guarantees—specifically the 99.5% uptime for Pro tier users and the 99.9% uptime for Enterprise tier users—are contingent upon adherence to these terms. Any breach of the aforementioned grounds for termination nullifies any service level commitments provided by Corelane, Inc. Furthermore, Corelane, Inc. retains the right to investigate any account suspected of violating these terms, and during the pendency of such an investigation, the company may temporarily suspend access to the Corelane API without prior notice. The decision to terminate an account under these general grounds is final and binding, subject only to the formal appeal process outlined in Section 6.1 of this policy.

### 2.3 Involuntary Account Termination by Corelane, Inc. - Specific Policy Violations
Corelane, Inc. maintains a stringent policy regarding the appropriate and lawful use of the Corelane API. This Section 2.3 delineates specific categories of violations of Corelane, Inc.'s Terms of Service, Acceptable Use Policy, or any other applicable contractual agreements, which shall constitute grounds for the immediate and involuntary termination of a customer's Corelane API account. Such violations are deemed material breaches and may result in the forfeiture of any rights or privileges associated with the Corelane API service.

**2.3.1 Prohibited and Unlawful Activities**

Any utilization of the Corelane API for activities that are illegal, unethical, or harmful is strictly prohibited. This encompasses, but is not limited to, the following:
*   **Illegal Activities:** Engaging in, promoting, or facilitating any activity that violates applicable local, national, or international laws or regulations. This includes, without limitation, fraud, harassment, defamation, distribution of child sexual abuse material, money laundering, or any form of criminal enterprise.
*   **Malicious Conduct:** Employing the Corelane API to develop, distribute, or execute malware, viruses, worms, Trojan horses, or any other malicious code. This also extends to phishing, pharming, spamming, denial-of-service (DoS) attacks, distributed denial-of-service (DDoS) attacks, or any other actions intended to disrupt, damage, or gain unauthorized access to computer systems, networks, or data.
*   **Intellectual Property Infringement:** Using the Corelane API to infringe upon the intellectual property rights of Corelane, Inc. or any third party, including copyrights, trademarks, patents, trade secrets, or other proprietary rights. This includes, but is not limited to, unauthorized reproduction, distribution, modification, or public display of copyrighted material.
*   **Misrepresentation and Impersonation:** Falsely representing one's identity, affiliation, or source of information, or impersonating any person or entity, including Corelane, Inc. personnel, through the use of the Corelane API.
*   **Competitive Exploitation:** Utilizing the Corelane API for the purpose of competitive analysis, reverse engineering, or the development of products or services that directly compete with the Corelane API or other offerings from Corelane, Inc. without explicit written consent.

**2.3.2 API Key Mismanagement and Security Breaches**

Customers bear sole responsibility for the security and proper management of their API keys. Any failure to adhere to established security protocols or misuse of API keys constitutes a severe violation:
*   **Unauthorized Disclosure:** Sharing, distributing, or otherwise making API keys accessible to unauthorized third parties, whether intentionally or through negligence. API keys are confidential credentials and must be protected with the highest level of security.
*   **Inadequate Security Practices:** Storing API keys in insecure locations, such as publicly accessible code repositories, client-side code, or unencrypted files. Customers must implement robust security measures to prevent unauthorized access to their API keys.
*   **Circumvention of Controls:** Attempting to bypass or circumvent Corelane API's security mechanisms, rate limits, or monthly quotas through the use of multiple accounts, fraudulent API key generation, or any other deceptive means.
*   **Failure to Rotate Compromised Keys:** Neglecting to promptly rotate or revoke API keys upon suspicion or confirmation of compromise. Corelane, Inc. may mandate API key rotation in response to security incidents, and failure to comply with such directives will be considered a violation.

**2.3.3 Data Handling, Privacy, and Confidentiality Violations**

Customers utilizing the Corelane API for processing data must strictly adhere to all applicable data protection and privacy laws and Corelane, Inc.'s data handling policies:
*   **Processing of Sensitive Data:** Processing or transmitting sensitive personal data, protected health information, or other highly confidential information via the Corelane API without obtaining all necessary consents, implementing appropriate safeguards, and ensuring full compliance with relevant data protection regulations (e.g., GDPR, CCPA, HIPAA).
*   **Privacy Infringement:** Using the Corelane API to generate, process, or disseminate content that violates the privacy rights of individuals, including unauthorized collection, storage, or disclosure of personal information.
*   **Breach of Confidentiality:** Any action that results in the unauthorized disclosure of confidential information belonging to Corelane, Inc. or third parties, obtained through or in connection with the use of the Corelane API.

**2.3.4 Content Policy and Acceptable Use Violations**

The Corelane API, designed for LLM inference hosting and embedding generation, must not be used to create, disseminate, or promote content that is harmful, offensive, or violates societal norms:
*   **Hate Speech and Discrimination:** Generating or propagating content that promotes hate speech, discrimination, harassment, or violence against individuals or groups based on race, ethnicity, religion, gender, sexual orientation, disability, or any other protected characteristic.
*   **Exploitative Content:** Creating or distributing content that is sexually explicit, abusive, or exploitative, particularly involving minors. This includes any material that could be construed as child sexual abuse material.
*   **Misinformation and Disinformation:** Intentionally generating or disseminating false or misleading information, propaganda, or disinformation with the intent to deceive, manipulate, or cause harm.
*   **Spam and Unsolicited Communications:** Using the Corelane API to generate or facilitate the distribution of unsolicited commercial communications, bulk messages, or spam.
*   **Self-Harm Promotion:** Generating or promoting content that encourages or glorifies self-harm, suicide, or eating disorders.
*   **Violence and Terrorism:** Creating or disseminating content that promotes, glorifies, or facilitates acts of violence, terrorism, or extremist ideologies.

**2.3.5 System Integrity and Resource Abuse**

Actions that compromise the stability, security, or performance of the Corelane API infrastructure are strictly prohibited:
*   **Excessive Resource Consumption:** Repeatedly and intentionally exceeding established rate limits or monthly quotas in a manner that negatively impacts the performance or availability of the Corelane API for other users, even after receiving warnings or notifications from Corelane, Inc.
*   **Vulnerability Exploitation:** Attempting to probe, scan, or test the vulnerability of the Corelane API system or network, or to breach security or authentication measures without explicit authorization.
*   **Automated Access Violations:** Employing automated or programmatic access methods that are not in strict accordance with the Corelane API documentation, intended use, or Corelane, Inc.'s explicit guidelines.
*   **Interference with Operations:** Any activity that interferes with or disrupts the integrity or performance of the Corelane API or its associated data.

**2.3.6 Non-Compliance with Corelane, Inc. Directives**

Failure to comply with reasonable requests, directives, or investigations initiated by Corelane, Inc. regarding suspected policy violations or security concerns may also lead to account termination. This includes, but is not limited to, failure to provide requested information, implement corrective actions, or cooperate in incident response efforts.

Upon the determination by Corelane, Inc. that a customer has committed any of the aforementioned specific policy violations, Corelane, Inc. reserves the right to terminate the customer's account immediately, without prejudice to any other remedies available at law or in equity. The severity and nature of the violation will dictate the immediacy and finality of such termination.

### 2.4 Involuntary Account Termination by Corelane, Inc. - Non-Payment
Corelane, Inc. reserves the right to terminate any Corelane API account for which outstanding financial obligations remain unsettled or payment defaults occur. This policy applies exclusively to accounts subscribed to paid service tiers, specifically the Pro and Enterprise tiers, as the Free tier incurs no monetary charges and therefore no payment obligations.

### Definition of Non-Payment

A payment default, for the purposes of this policy, occurs when:
*   Any recurring subscription fee for a Pro tier account is not successfully processed on the designated billing date.
*   Any invoice issued for an Enterprise tier account remains unpaid beyond the specified due date, as stipulated in the individual service contract.
*   Any other charges incurred by the customer for Corelane API services, including but not limited to overage fees or custom service charges, are not settled within the agreed payment terms.

### Notification and Grace Period

Prior to initiating account termination for non-payment, Corelane, Inc. shall endeavor to notify the customer of the outstanding balance and provide an opportunity for remediation.
*   For Pro tier accounts, Corelane, Inc. will attempt to process the payment method on file multiple times. Should these attempts fail, a notification will be dispatched to the registered account email address, providing a grace period of seven (7) calendar days to update payment information or settle the outstanding balance.
*   For Enterprise tier accounts, Corelane, Inc. will adhere to the notification and dispute resolution procedures outlined in the customer's individual service contract regarding overdue invoices. In the absence of specific contractual terms, Corelane, Inc. will issue a formal notice of overdue payment, allowing a grace period of fifteen (15) calendar days for resolution.

Failure to resolve the outstanding financial obligation within the specified grace period may result in the suspension of Corelane API services, followed by account termination.

### Effects of Termination for Non-Payment

Upon termination for non-payment, the customer's access to the Corelane API will be immediately revoked, and all associated API keys will be invalidated. Any data stored within the Corelane API infrastructure will be subject to the data retention policies outlined in Section 4.2 of this document, which vary by service tier. The customer remains liable for all accrued charges up to the date of termination, irrespective of service cessation.

### Financial Implications and Refund Policy

*   **Pro Tier:** Customers whose accounts are terminated for non-payment are not eligible for a refund of any portion of the current billing cycle's subscription fee. The refund policy for the Pro tier, which allows a full refund within the first 14 days only if usage stayed under 10% of the monthly quota, does not apply in cases of termination due to non-payment. Any outstanding balance must be settled.
*   **Enterprise Tier:** Financial implications, including responsibility for outstanding charges and any potential refund eligibility, shall be governed strictly by the terms stipulated in the individual contract between Corelane, Inc. and the Enterprise customer.

### Account Reinstatement

Reinstatement of an account terminated for non-payment is at the sole discretion of Corelane, Inc. and is contingent upon the full settlement of all outstanding balances, including any applicable late fees or reinstatement charges. Corelane, Inc. provides no guarantee of data recovery or service continuity upon reinstatement.

### 2.5 Involuntary Account Termination by Corelane, Inc. - Account Inactivity
Corelane, Inc. reserves the right to terminate accounts that exhibit prolonged periods of inactivity. This policy is primarily enforced to ensure the efficient allocation of computational resources and to maintain the integrity of the Corelane API infrastructure. For the purposes of this policy, 'inactivity' is defined as the absence of any API key authentication requests or administrative dashboard activity for a continuous period exceeding ninety (90) calendar days.

### Inactivity Thresholds by Service Tier

| Service Tier | Inactivity Threshold | Termination Action |
| :--- | :--- | :--- |
| Free | 90 Days | Immediate account closure |
| Pro | 180 Days | Review followed by notice |
| Enterprise | Per Contract | As defined in individual SLA |

For customers subscribed to the Free tier, Corelane, Inc. may initiate account termination without prior individual notification upon the expiration of the ninety-day inactivity window. All associated API keys will be rendered permanently invalid, and any remaining data will be subject to the standard seven-day retention period before permanent deletion.

For Pro tier accounts, Corelane, Inc. will provide a formal notification to the registered account email address at least fourteen (14) days prior to the scheduled termination date. If the customer fails to resume active usage or contact support within this notice period, the account will be terminated. Enterprise tier customers are subject to the specific inactivity clauses stipulated within their negotiated service agreements. In the absence of such specific clauses, the default Pro tier inactivity policy shall apply. 

Corelane, Inc. maintains sole discretion in determining whether an account is considered inactive. The resumption of activity must involve legitimate API requests; automated 'heartbeat' pings or trivial requests intended solely to circumvent this policy do not constitute active usage and will not reset the inactivity timer. Upon termination for inactivity, all access to the Corelane API is revoked immediately.

### 3.1 Notice of Termination
Corelane, Inc. maintains a rigorous protocol for the dissemination of notices regarding the termination or suspension of a customer’s access to the Corelane API. Except where prohibited by law or where immediate action is required to mitigate an active security threat, Corelane, Inc. shall provide formal notification to the Customer prior to the execution of account termination. This ensures that Customers are afforded a reasonable opportunity to review the grounds for termination and, where applicable, secure their data or transition their operations.

### Notification Channels and Delivery

All formal notices regarding account status, including warnings of impending termination, shall be delivered through two primary channels: (i) the registered account email address provided by the Customer during the registration process or subsequently updated in the account settings, and (ii) an in-dashboard alert banner visible upon authentication to the Corelane API management console. It is the sole responsibility of the Customer to ensure that the registered account email address remains current and capable of receiving communications from Corelane, Inc. Corelane, Inc. shall not be held liable for a Customer’s failure to receive notice due to outdated contact information or the redirection of emails to spam or junk folders.

### Notice Periods for Involuntary Termination

For terminations resulting from non-payment or general policy violations, Corelane, Inc. will typically provide a notice period of no less than fifteen (15) calendar days prior to the cessation of service. During this period, the Customer may attempt to rectify the breach or export data. However, in the event of a security incident or a material breach of the Acceptable Use Policy that threatens the integrity of the Corelane API infrastructure, Corelane, Inc. reserves the right to terminate or suspend the account and all associated API keys immediately. In such instances, notification will be provided within seventy-two (72) hours of the action, consistent with our security incident response protocols.

### Content of the Termination Notice

Each notice of termination shall explicitly state the specific grounds for termination, the effective date and time of the termination, and the status of the Customer’s API key and monthly quota. Furthermore, the notice will specify the applicable data retention window based on the Customer’s tier—specifically 7 days for the Free tier, 30 days for the Pro tier, or 90 days (or as per contract) for the Enterprise tier—during which data may be retrieved before permanent deletion. Finally, the notice will include instructions for initiating the formal appeal process as outlined in Section 6.1 of this policy.

### 4.1 Effects of Account Termination
Upon the effective date of account termination, all access to the Corelane API, including but not limited to inference hosting services and embedding generation endpoints, shall cease immediately. The customer’s authorization to utilize the Corelane API is revoked in its entirety, and any existing API key associated with the terminated account shall be rendered invalid. Corelane, Inc. assumes no liability for any service interruptions, data loss, or operational downtime experienced by the customer or any third-party applications relying on the customer’s infrastructure following the invalidation of said API keys.

Upon termination, the customer must immediately discontinue all calls to Corelane API endpoints. Any attempt to access the service using an invalidated API key will result in an automated '401 Unauthorized' or '403 Forbidden' response. It is the sole responsibility of the customer to update their internal systems, configurations, and application code to remove references to the Corelane API. Corelane, Inc. shall not be held responsible for any costs, damages, or technical failures arising from the customer’s failure to purge invalidated API keys from their production or development environments.

Furthermore, the termination of the account triggers the immediate suspension of all active processes, including pending inference requests or batch embedding jobs. Any data currently in transit or residing in temporary buffers at the moment of termination will be discarded. The customer acknowledges that Corelane, Inc. is under no obligation to provide a transition period or data export assistance beyond what is explicitly stipulated in the customer’s specific service tier agreement. 

Following the cessation of access, the customer remains liable for all outstanding financial obligations incurred up to the date of termination. Access to the customer dashboard will be restricted to a read-only state for a limited duration, solely for the purpose of retrieving final billing statements or historical usage logs, provided that such access does not violate security protocols. 

Data retention and handling post-termination are strictly governed by the customer's service tier as defined in the following table:

| Service Tier | Data Retention Period Post-Termination |
| :--- | :--- |
| Free | 7 days |
| Pro | 30 days |
| Enterprise | 90 days, or per contract |

Upon the expiration of the applicable retention period, all customer data, including stored embeddings and inference logs, will be permanently purged from Corelane, Inc. systems. This process is irreversible. Customers are advised to perform all necessary data backups prior to the effective date of termination. Corelane, Inc. disclaims all responsibility for the recovery of data once the retention period has elapsed, and no further access to the account or its associated data will be granted under any circumstances.

### 4.2 Post-Termination Data Handling and Retention
Upon the effective date of account termination, Corelane, Inc. shall initiate a structured data lifecycle management process. The handling of customer data, including but not limited to inference logs, embedding vectors, and configuration metadata, is strictly governed by the service tier associated with the account at the time of termination. Corelane, Inc. maintains distinct retention protocols to ensure compliance with data privacy standards and operational efficiency.

### Data Retention Schedules by Service Tier

Following the cessation of services, customer data shall be retained in a restricted, non-production environment for the durations specified below, after which permanent deletion shall occur:

| Service Tier | Data Retention Period Post-Termination |
| :--- | :--- |
| Free | 7 days |
| Pro | 30 days |
| Enterprise | 90 days, or per contract |

During these retention periods, the data remains inaccessible via the Corelane API. Customers who have terminated their accounts may request an export of their data, provided such a request is submitted in writing to the Corelane, Inc. legal department prior to the expiration of the applicable retention window. Corelane, Inc. reserves the right to charge a reasonable administrative fee for the retrieval and secure transfer of such data.

### Data Deletion and Sanitization Protocols

Upon the expiration of the retention period, Corelane, Inc. will execute automated, irreversible deletion procedures. This process ensures that all customer-specific data is purged from our primary databases, secondary storage, and backup systems. Corelane, Inc. employs industry-standard cryptographic erasure techniques to ensure that data is rendered unrecoverable. Once the deletion process is finalized, Corelane, Inc. assumes no further obligation to maintain, provide, or restore any customer data. 

It is the sole responsibility of the customer to ensure that all necessary data backups are performed prior to the termination of their account. Corelane, Inc. shall not be held liable for any loss of data resulting from the customer's failure to export information within the designated retention windows. Furthermore, in the event of an involuntary termination due to a breach of the Acceptable Use Policy, Corelane, Inc. reserves the right to accelerate the deletion process to the extent permitted by applicable law to mitigate security risks.

### Enterprise-Specific Provisions

For customers subscribed to the Enterprise tier, data retention may be subject to specific terms negotiated within an individual Master Service Agreement (MSA). In instances where an MSA contains provisions that conflict with this policy, the terms of the MSA shall prevail. Enterprise customers are encouraged to consult their dedicated account representative to confirm the specific data handling requirements applicable to their organization, particularly regarding regulatory compliance and long-term archival obligations. 

Corelane, Inc. maintains rigorous internal controls to ensure that data is not accessed, processed, or utilized for any purpose other than the secure storage and eventual deletion following account termination. All personnel involved in the data lifecycle management process are bound by strict confidentiality agreements, ensuring that the integrity and privacy of customer data are preserved throughout the retention period.

### 5.1 Financial Implications of Termination
Upon the effective date of account termination, all financial obligations incurred by the Customer up to the moment of cessation shall become immediately due and payable to Corelane, Inc. The termination of an account, whether voluntary or involuntary, does not absolve the Customer of their liability for any outstanding charges, including but not limited to, usage fees accrued against the monthly quota, overage charges, or recurring subscription fees for the current billing cycle. Corelane, Inc. reserves the right to initiate collection proceedings for any unpaid balances remaining after the termination date.

Refund eligibility is strictly governed by the service tier assigned to the Customer’s account at the time of termination. The following table delineates the refund policy applicable to each tier:

| Service Tier | Refund Eligibility Policy |
| :--- | :--- |
| Free | Not applicable; no paid subscription exists. |
| Pro | Full refund available only if termination occurs within the first 14 days of the initial subscription, provided that total usage has remained under 10% of the monthly quota. |
| Enterprise | Subject to the specific terms and conditions stipulated in the individual, signed service contract. |

For Pro tier subscribers, the 14-day refund window is calculated from the date of the initial subscription purchase. Requests for refunds must be submitted in writing to the Corelane, Inc. billing department. Corelane, Inc. will conduct an audit of the account’s historical usage logs to verify that the 10% monthly quota threshold has not been exceeded. Failure to meet these criteria renders the subscription fee non-refundable. Pro-rated refunds for partial months of service are not provided under any circumstances, regardless of the date of termination within the billing cycle.

Customers operating under an Enterprise agreement are governed by the financial provisions set forth in their respective Master Services Agreement or Statement of Work. In the event of a conflict between this policy and an executed Enterprise contract, the terms of the individual contract shall prevail. Enterprise customers remain responsible for any minimum commitment fees or early termination penalties as defined in their specific agreement.

Upon termination, all API keys associated with the account will be immediately invalidated, and no further charges will be incurred for new requests. However, any usage-based billing generated prior to the invalidation of the API key remains the responsibility of the Customer. Corelane, Inc. shall provide a final invoice reflecting all usage up to the point of termination. Payment of this final invoice is required within the standard net-30 terms unless otherwise specified in a separate agreement. Failure to settle final accounts may result in the referral of the debt to a third-party collection agency and the reporting of the delinquency to relevant credit bureaus, where permitted by applicable law.

### 6.1 Appeal Process for Involuntary Termination
The appeal process herein provides a formal mechanism for customers to dispute an involuntary account termination initiated by Corelane, Inc. This procedure is exclusively available to account holders whose Corelane API services have been terminated under sections 2.2, 2.3, 2.4, or 2.5 of this Account Termination Policy.

To initiate an appeal, the affected customer must submit a formal written request to Corelane, Inc. within fifteen (15) calendar days following the termination notice date. This request must be transmitted via the designated appeals portal (accessible through the customer's Corelane API dashboard) or, if inaccessible, via email to `appeals@corelane.com`. The submission must include: registered account ID, termination notice date, detailed grounds for appeal, explanation of perceived error or injustice, and all relevant supporting documentation. Incomplete or untimely submissions may be rejected without further review, at Corelane, Inc.'s sole discretion.

Upon receipt of a complete and timely appeal, Corelane, Inc. shall assign the matter to an internal review committee or designated personnel, independent of the initial termination decision for impartial assessment. The review will encompass the customer's appeal, Corelane, Inc.'s internal records, and all applicable provisions of Corelane, Inc.'s Terms of Service, Acceptable Use Policy, and this Account Termination Policy. Corelane, Inc. endeavors to provide a decision within thirty (30) calendar days from the date of receipt of the complete appeal submission.

The decision of the review committee or designated personnel will be communicated to the customer via their registered account email address. Possible outcomes include: (i) termination upheld; (ii) termination reversed, resulting in account and service reinstatement; or (iii) termination modified, potentially leading to reinstatement under specific conditions or alternative resolutions. The decision rendered through this formal appeal process shall be final and binding, with no further appeals or reviews entertained for the same termination event.

Appeals will not be considered for terminations directly resulting from undisputed violations of applicable laws, governmental regulations, or Corelane, Inc.'s policies where facts are not reasonably disputed. Failure to strictly adhere to procedural requirements, including submission timeframe and provision of all required information and documentation, may also result in immediate dismissal of the appeal without substantive review.

### 7.1 Survival of Terms
Termination of a Corelane API account, whether initiated by the Customer or Corelane, Inc., shall not relieve the Customer of any obligations incurred prior to the effective date of termination. Certain provisions of the Corelane API Terms of Service, this Account Termination Policy, and any other applicable agreements between Corelane, Inc. and the Customer are expressly designed to survive such termination and remain in full force and effect.

These surviving provisions include, but are not limited to: all outstanding payment obligations and accrued charges that remain unpaid as of the termination date; intellectual property rights and licenses granted to Corelane, Inc. by the Customer; confidentiality obligations pertaining to Corelane, Inc.'s proprietary information; disclaimers of warranties; limitations of liability; indemnification clauses; and provisions related to governing law and dispute resolution, as outlined in Section 8.1. The Customer's obligations regarding the proper handling and security of API keys, even if invalidated post-termination, shall persist to the extent necessary to mitigate any residual security risks.

Furthermore, Corelane, Inc.'s rights and obligations pertaining to data handling and retention, as detailed in Section 4.2 of this policy, shall remain in full force and effect following account termination, ensuring compliance with established data management protocols. The intent of these surviving terms is to ensure the protection of Corelane, Inc.'s legitimate interests, facilitate an orderly cessation of services, and enforce liabilities that arose during the period of active service provision.

### 8.1 Governing Law and Jurisdiction
This Account Termination Policy, and any disputes or claims arising out of or in connection with it or its subject matter or formation (including non-contractual disputes or claims), shall be governed by and construed in accordance with the laws of the State of Delaware, United States of America, without regard to its conflict of law principles. This choice of law applies to all aspects of the policy, including its interpretation, validity, and enforcement.

The parties irrevocably agree that the courts of the State of Delaware, and the federal courts located within the State of Delaware, shall have exclusive jurisdiction to settle any dispute or claim that arises out of or in connection with this policy or its subject matter or formation (including non-contractual disputes or claims). Each party hereby waives any objection to jurisdiction and venue in such courts, and agrees to submit to the personal jurisdiction of such courts.

To the fullest extent permitted by applicable law, each party hereby waives its right to a jury trial in any action or proceeding arising out of or relating to this policy. Furthermore, all claims must be brought in the parties’ individual capacity, and not as a plaintiff or class member in any purported class, collective, or representative proceeding. This waiver applies to all disputes, whether in court or in arbitration.

Any controversy or claim arising out of or relating to this policy, or the breach thereof, shall be settled by arbitration administered by the American Arbitration Association in accordance with its Commercial Arbitration Rules, and judgment on the award rendered by the arbitrator(s) may be entered in any court having jurisdiction thereof. The place of arbitration shall be Wilmington, Delaware.
