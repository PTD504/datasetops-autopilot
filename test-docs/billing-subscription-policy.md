# Corelane API Terms — Billing and Subscription Policy
**Version 2.3** · **Effective: June 1, 2026**

### 1.1 Purpose and Scope
This Billing and Subscription Policy (hereinafter, 'Policy') delineates the comprehensive terms and conditions governing the access, utilization, and financial obligations associated with the Corelane API, a proprietary API-as-a-service developed and operated by Corelane, Inc. (hereinafter, 'Corelane'). The Corelane API is specifically designed to facilitate advanced functionalities, including, but not limited to, large language model (LLM) inference hosting and embedding generation, providing robust infrastructure for diverse computational linguistics applications.

The primary objective of this Policy is to establish a transparent and legally binding framework that defines the rights, responsibilities, and operational parameters for all entities and individuals (hereinafter, 'Users') engaging with the Corelane API. This encompasses the entire spectrum of the service lifecycle, from initial subscription and recurring billing procedures to detailed service level agreements, stringent data management protocols, and comprehensive security provisions. It serves as the foundational document for understanding the contractual relationship between Corelane and its Users.

This Policy applies universally to all Users of the Corelane API, irrespective of their chosen subscription tier, which include the Free, Pro, and Enterprise tiers. It meticulously sets forth the specific conditions pertaining to monthly quotas, rate limits, pricing structures, acceptable payment terms, refund eligibility criteria, data retention policies, secure API key management practices, and Corelane's defined incident response protocols. Adherence to the stipulations contained herein is mandatory for continued access to and uninterrupted use of the Corelane API. This Policy, designated as version 2.3, becomes effective on June 1, 2026, and supersedes all prior versions, agreements, and understandings related to the Corelane API.

### 1.2 Definitions
For the purposes of this Billing and Subscription Policy, the following terms shall have the meanings set forth below:

*   **Corelane, Inc.:** Refers to Corelane, Inc., the corporate entity providing the Corelane API.
*   **Corelane API:** The API-as-a-service product offered by Corelane, Inc. for large language model (LLM) inference hosting and embedding generation.
*   **User or Customer:** Any individual, entity, or organization utilizing the Corelane API under any Subscription Tier.
*   **API Key:** A unique, confidential credential issued by Corelane, Inc. for User authentication and authorization to access the Corelane API. Users are responsible for its secure management.
*   **Subscription Tier:** A distinct service plan for the Corelane API, defining specific features, pricing, monthly quotas, rate limits, and service level agreements. Tiers include Free, Pro, and Enterprise.
*   **Monthly Quota:** The maximum permissible volume of API requests or usage allocated to a Subscription Tier within a calendar month.
*   **Rate Limit:** The maximum number of API requests allowed within a defined time interval (e.g., per minute, per day) for a given Subscription Tier.
*   **Burst Allowance:** A temporary, time-limited increase in the standard Rate Limit, available to certain Subscription Tiers, enabling a short-term surge in API requests.
*   **Uptime SLA (Service Level Agreement):** A contractual commitment by Corelane, Inc. regarding the operational availability of the Corelane API, expressed as a percentage of uptime over a defined period.
*   **Data Retention:** Corelane, Inc.'s policy governing the duration for which User data is stored following account deletion or subscription termination.
*   **Effective Date:** June 1, 2026, the date this Policy, Version 2.3, becomes operative.
*   **Policy Version:** Version 2.3, identifying the currently applicable terms and conditions of this document.
*   **Security Incident:** An event compromising the confidentiality, integrity, or availability of Corelane API systems or User data.
*   **Deprecation Notice:** Formal notification from Corelane, Inc. regarding the planned discontinuation of an API version or feature, providing a minimum of 180 days for User migration.

### 1.3 Policy Version and Effective Date
This Billing and Subscription Policy, governing the use of the Corelane API, is designated as Version 2.3. This version supersedes all prior iterations of the Corelane API Billing and Subscription Policy and establishes the definitive terms and conditions for all Corelane API subscriptions and related services.

This Policy Version 2.3 shall become effective on June 1, 2026. As of this effective date, all users and subscribers of the Corelane API are bound by the provisions articulated herein. Continued access to or utilization of the Corelane API after June 1, 2026, constitutes explicit acceptance of these terms.

Corelane, Inc. reserves the right to amend or update this policy periodically. Any modifications will be communicated to users in accordance with the procedures outlined in Section 7.2 (Policy Modifications), ensuring transparency and adequate notice regarding changes to the governing terms.

### 2.1 Overview of Corelane API Subscription Tiers
This section delineates the various subscription tiers available for the Corelane API, each structured to address distinct operational requirements and usage scales. Corelane, Inc. offers a tiered service model to provide flexibility and tailored resources to its clientele, ranging from individual developers to large-scale enterprises. Each tier encompasses specific entitlements regarding pricing, usage capacity, service availability, data retention, and support mechanisms.

The Corelane API subscription tiers are categorized as Free, Pro, and Enterprise, with escalating features and service commitments across these levels.

**Free Tier:**
The Free Tier is designed for initial exploration and limited development activities. It is provided at no monetary cost, specifically priced at "$0/month". This tier includes a monthly quota with a rate limit of 60 requests per minute and a daily limit of 1000 requests. No burst allowance is provided for this tier. Service availability for the Free Tier is offered on a best-effort basis and is not contractually guaranteed by a Service Level Agreement (SLA). Data retention after account deletion is limited to 7 days. Due to the absence of a paid subscription, a refund policy is not applicable to this tier. Migration support for API version changes is limited to documentation only.

**Pro Tier:**
The Pro Tier is tailored for professional developers and small to medium-sized businesses requiring enhanced capacity and reliability. This tier is available at a fixed price of "$49/month". Subscribers to the Pro Tier benefit from a significantly increased monthly quota, featuring a rate limit of 600 requests per minute and a daily limit of 100,000 requests. A burst allowance of an additional 20% capacity is permitted for durations up to 60 seconds. The Pro Tier includes a guaranteed uptime SLA of 99.5%. Data retention after account deletion is extended to 30 days. The refund policy for the Pro Tier allows for a full refund within the first 14 days of subscription, provided that usage has remained under 10% of the allocated monthly quota. Migration support for API version changes includes documentation and email support during the designated migration window.

**Enterprise Tier:**
The Enterprise Tier is engineered for large organizations with substantial and mission-critical Corelane API usage, demanding the highest levels of performance, customization, and dedicated support. Pricing for the Enterprise Tier is custom and requires direct engagement with Corelane, Inc. sales representatives. Rate limits are subject to negotiation, with a stipulated minimum of 2000 requests per minute. Burst allowances are also determined per the individual negotiated Service Level Agreement (SLA). This tier guarantees a robust uptime SLA of 99.9%. Data retention after account deletion is set at 90 days, or as otherwise specified within the individual contractual agreement. The refund policy for the Enterprise Tier is exclusively governed by the terms outlined in the individual contract. Dedicated migration engineering support is provided for API version changes, ensuring seamless transitions for complex integrations.

This structure ensures that Corelane, Inc. can provide appropriate resources and service commitments commensurate with the varying needs and investment levels of its diverse customer base.

### 2.2 Pricing Structure and Payment Terms
Corelane, Inc. provides access to the Corelane API through a structured system of subscription tiers, each characterized by a distinct pricing model. The 'Free' tier is offered at no monetary cost, designed to facilitate initial exploration and limited development activities with the Corelane API. This tier does not incur any recurring charges. The 'Pro' tier is available for a fixed monthly subscription fee of $49.00 (forty-nine U.S. Dollars). This fee grants subscribers access to an expanded set of features and increased monthly quotas, as comprehensively detailed in subsequent sections of this policy. For organizations with advanced requirements, high-volume demands, or specialized operational needs, the 'Enterprise' tier operates under a custom pricing framework. Prospective 'Enterprise' tier subscribers are required to initiate direct engagement with Corelane, Inc.'s dedicated sales department to negotiate and establish specific terms, conditions, and pricing, which will be formally documented and governed by a bespoke contractual agreement.

Subscription fees for the 'Pro' tier are exclusively payable via valid credit card or other electronic payment methods that Corelane, Inc. may designate and support from time to time. Subscribers are under a strict obligation to ensure that their payment information on file within their Corelane API account remains accurate, current, and valid throughout the subscription period. Any failure to maintain valid payment credentials may result in the immediate suspension or, ultimately, the termination of services, as outlined in Section 7.1. For 'Enterprise' tier subscriptions, the acceptable payment methods, which may encompass wire transfers or other mutually agreed-upon financial arrangements, will be explicitly detailed and stipulated within the individual contractual agreement executed between Corelane, Inc. and the 'Enterprise' subscriber.

Invoices for 'Pro' tier subscriptions are systematically generated on a monthly basis, preceding the commencement of each new billing cycle. These invoices provide a detailed breakdown of charges and will be delivered electronically to the primary email address registered to the subscriber's Corelane API account. Additionally, all invoices will be readily accessible for review and download within the subscriber's dedicated Corelane API dashboard. Payment for 'Pro' tier subscriptions is due immediately upon the generation of the invoice and will be automatically processed using the designated payment method on file. In the event of a payment failure, Corelane, Inc. reserves the right to reattempt the transaction. Persistent failure to remit timely payment may lead to the suspension or termination of the 'Pro' tier subscription, as further elaborated in Section 7.1. For 'Enterprise' tier subscribers, the specific invoicing procedures, including billing frequency, delivery mechanisms, and payment terms, shall be comprehensively defined and agreed upon within the negotiated contractual agreement.

All prices quoted for Corelane API subscriptions are presented exclusive of any applicable taxes, duties, levies, or similar governmental assessments. This includes, but is not limited to, sales tax, value-added tax (VAT), goods and services tax (GST), and withholding taxes (collectively referred to as 'Taxes'). Subscribers bear the sole responsibility for the timely payment of all such Taxes imposed on their Corelane API subscription, with the singular exception of Taxes based on Corelane, Inc.'s net income. Corelane, Inc. reserves the unequivocal right to add any legally mandated Taxes to the subscriber's invoice where required by applicable jurisdiction. Furthermore, subscribers shall be exclusively responsible for any supplementary fees incurred as a result of currency conversion, foreign transaction charges, or chargeback fees that may arise from their selected payment method or associated financial institution actions. Corelane, Inc. explicitly disclaims liability for any such additional charges.

### 2.3 Billing Cycle and Proration
Corelane API subscriptions operate on a recurring monthly billing cycle. For new subscriptions, the initial billing cycle commences on the date of successful subscription activation. Subsequent billing cycles automatically renew on the corresponding calendar day of each month. Should the activation day not exist in a subsequent month (e.g., the 31st), the renewal will occur on the last day of that particular month.

Charges are determined based on the specific subscription tier selected by the subscriber. The Free tier incurs no monetary charges. The Pro tier is subject to a fixed monthly fee of $49. The Enterprise tier's charges are custom and established through a separate contractual agreement, which may define specific billing cycles and proration methodologies distinct from the standard monthly cycle. All applicable charges are processed at the commencement of each billing cycle.

When a new paid subscription (e.g., Pro or Enterprise) is initiated partway through a calendar month, the initial charge for the first billing cycle will be calculated on a prorated basis. This proration reflects only the remaining days of the current month, from the activation date until the end of that month. The full monthly subscription fee will be applied to all subsequent, complete billing cycles.

Upon an upgrade from a lower-tier subscription to a higher-tier subscription (e.g., from Free to Pro, or Pro to Enterprise), the change in service tier becomes effective immediately. The subscriber's account will be charged a prorated amount for the higher-tier service for the remainder of the current billing cycle. Concurrently, a credit will be applied to the subscriber's account for any unused portion of the previously paid, lower-tier subscription fee for the same billing cycle, if applicable.

Requests for downgrades from a higher-tier subscription to a lower-tier subscription (e.g., from Pro to Free, or Enterprise to Pro) are processed to take effect at the conclusion of the current active billing cycle. Subscribers will retain access to the features and benefits of their current higher tier until the end of that billing cycle. Corelane, Inc. does not issue prorated refunds for downgrades that occur within an active billing cycle, unless specific terms within an Enterprise contract explicitly stipulate otherwise.

In the event of subscription cancellation, access to the Corelane API service under the current tier will continue until the end of the then-current billing cycle. No prorated refunds are provided for any unused portion of a subscription period following a cancellation, except as expressly detailed within the Refund Policy (Section 4.1).

### 3.1 Monthly Quotas and Rate Limits
Corelane, Inc. implements specific monthly quotas and rate limits across all Corelane API subscription tiers to ensure equitable resource distribution, maintain service stability, and prevent abuse. These operational parameters define the maximum permissible volume of requests an account may submit to the Corelane API within defined timeframes. Adherence to these limits is a mandatory condition for continued access to the Corelane API services.

Monthly quotas represent the total number of API requests or computational units an account is permitted to consume within a calendar month. Rate limits, conversely, define the maximum number of requests that can be processed within a shorter, specified interval, typically per minute or per day. These limits are applied per API key and are designed to prevent sudden spikes in traffic from impacting the overall service availability for all users. Exceeding these limits may result in temporary service degradation, request rejection, or other enforcement actions as detailed in Section 3.2 (Overage Policies).

### Subscription Tier Specifics

The specific monthly quotas, per-minute rate limits, and burst allowances vary significantly by subscription tier, reflecting the differing service level commitments and resource allocations for each plan:

#### Free Tier

Subscribers to the Free Tier are subject to the following limitations, designed for evaluation and low-volume development purposes. This tier does not include any burst allowance capabilities.

*   **Rate Limit (Per Minute):** 60 requests
*   **Rate Limit (Per Day):** 1,000 requests
*   **Burst Allowance:** Not applicable

#### Pro Tier

The Pro Tier provides enhanced capacity suitable for production applications requiring higher throughput and includes a limited burst allowance to accommodate temporary spikes in demand.

*   **Rate Limit (Per Minute):** 600 requests
*   **Rate Limit (Per Day):** 100,000 requests
*   **Burst Allowance:** An additional 20% of the per-minute rate limit, permissible for a maximum duration of 60 consecutive seconds. This allowance is designed to absorb short-term traffic surges without immediate request rejection.

#### Enterprise Tier

The Enterprise Tier offers highly customizable resource allocations tailored to specific organizational requirements. All operational parameters, including rate limits and burst allowances, are subject to individual negotiation and formalization within a dedicated Service Level Agreement (SLA).

*   **Rate Limit (Per Minute):** Negotiated, with a guaranteed minimum of 2,000 requests per minute.
*   **Rate Limit (Per Day):** Defined within the negotiated SLA.
*   **Burst Allowance:** Determined and specified within the individual contractual agreement.

All rate limits and monthly quotas reset at the beginning of their respective measurement periods (e.g., per minute, per day, per month). Corelane, Inc. continuously monitors API usage against these established thresholds. Customers are responsible for managing their API consumption to remain within the parameters of their subscribed tier. Failure to adhere to these limits may invoke the overage policies or other enforcement mechanisms outlined in the Corelane API Terms of Service.

### 3.2 Overage Policies
Corelane, Inc. implements stringent policies to manage usage of the Corelane API, ensuring equitable access and service stability for all subscribers. As detailed in Section 3.1, each subscription tier is subject to specific monthly quotas and rate limits. Exceeding these established thresholds will result in the application of overage protocols, primarily involving the temporary restriction or rejection of API requests.

For subscribers utilizing the Free tier, any API requests that surpass the allocated 60 requests per minute or 1,000 requests per day will be automatically rejected. This rejection mechanism is immediate and designed to prevent sustained over-utilization beyond the free allowance. No financial charges are incurred for overages in the Free tier; however, service continuity cannot be guaranteed once limits are reached.

Pro tier subscribers are allocated a rate limit of 600 requests per minute and 100,000 requests per day. While a burst allowance of an additional 20% for up to 60 seconds is provided, sustained usage beyond the standard rate limits or exhaustion of the burst allowance will result in the rejection of subsequent API requests until the rate limit window resets. Corelane, Inc. does not impose direct overage charges for exceeding these limits; instead, service availability is temporarily curtailed. Subscribers consistently approaching or exceeding Pro tier limits may receive notifications recommending an upgrade to a higher tier to ensure uninterrupted service.

For Enterprise tier subscribers, overage policies, including specific thresholds, burst allowances, and any potential implications for exceeding negotiated limits, are exclusively defined within the individual service contract or Service Level Agreement (SLA) established between Corelane, Inc. and the Enterprise client.

Corelane, Inc. continuously monitors API usage. In instances where a subscriber's usage patterns indicate a consistent or significant breach of their allocated monthly quota or rate limits, Corelane, Inc. reserves the right to review the account, issue formal warnings, or, in severe or repeated cases, initiate account suspension or termination as outlined in Section 7.1. These measures are implemented to safeguard the integrity and performance of the Corelane API for all users.

### 4.1 Refund Policy
Corelane, Inc. maintains a comprehensive refund policy for its Corelane API subscriptions, which is strictly delineated by the specific subscription tier to which a customer is subscribed. This policy is designed to ensure fairness and transparency while aligning with the operational and financial commitments associated with each service level. Eligibility for a refund is contingent upon adherence to the specific criteria outlined herein for each respective tier.

For customers utilizing the Corelane API under the 'Free' tier, no monetary transactions are involved. Consequently, the concept of a refund is not applicable to this subscription level. Access to the Corelane API under the 'Free' tier is provided without charge, and therefore, no financial reimbursement can be issued.

Subscribers to the 'Pro' tier may be eligible for a full refund of their initial subscription fee, provided that specific conditions are met. A refund request must be initiated within fourteen (14) calendar days from the original subscription activation date. Furthermore, the customer's cumulative usage of the Corelane API during this fourteen-day period must not have exceeded ten percent (10%) of the total monthly quota allocated to the 'Pro' tier. This usage threshold is rigorously monitored and includes, but is not limited to, API calls, data processed, and any other metered service consumption.

Should a 'Pro' tier subscriber's usage surpass the aforementioned ten percent (10%) threshold, or if the refund request is submitted beyond the fourteen-day eligibility window, the subscription will be deemed ineligible for a refund. To request a refund, eligible 'Pro' tier customers must submit a formal request through their Corelane account dashboard or by contacting Corelane Support directly, providing their account identification and the reason for the request. Corelane, Inc. reserves the right to review all usage data and account activity to verify eligibility prior to processing any refund.

Customers subscribed to the 'Enterprise' tier operate under bespoke contractual agreements. As such, the refund policy applicable to 'Enterprise' subscriptions is exclusively governed by the specific terms and conditions stipulated within their individual service contract with Corelane, Inc. The general refund provisions outlined for other tiers do not apply to 'Enterprise' accounts. Any inquiries or requests pertaining to refunds for 'Enterprise' subscriptions must be directed to the designated Corelane account representative, referencing the specific clauses within the executed contract.

Approved refunds will typically be processed within thirty (30) business days following the confirmation of eligibility. Reimbursements will be issued via the original payment method used for the subscription purchase, where feasible. Corelane, Inc. is not responsible for any delays in funds availability caused by the customer's financial institution. Please note that any third-party transaction fees or taxes incurred during the initial purchase or refund process may not be refundable, depending on applicable laws and payment processor policies. Upon the issuance of a refund, access to the Corelane API services associated with the refunded subscription will be immediately terminated.

### 4.2 Subscription Cancellation Procedures
Subscription to the Corelane API may be terminated by the customer at any time. The procedure for initiating a cancellation varies based on the subscription tier.

For **Free Tier** and **Pro Tier** subscriptions, customers may initiate cancellation directly through their Corelane API account management dashboard. This process typically involves navigating to the 'Subscription' or 'Billing' section and following the provided prompts to confirm the cancellation request. Upon successful initiation, the subscription will remain active until the conclusion of the current billing cycle, at which point it will not automatically renew. No further charges will be incurred following the effective date of cancellation.

For **Enterprise Tier** subscriptions, cancellation procedures are governed by the specific terms and conditions outlined in the individual service agreement executed between Corelane, Inc. and the customer. Customers holding an Enterprise Tier subscription must adhere to the notice periods and formal communication methods stipulated within their contract to effectuate a valid cancellation. Failure to comply with contractual cancellation provisions may result in continued billing obligations.

Upon the effective date of subscription cancellation, access to the Corelane API and associated services will cease. Corelane, Inc. will retain customer data in accordance with the Data Retention Policy outlined in Section 5.1 of this document. It is the customer's sole responsibility to extract any necessary data prior to the cessation of service. Corelane, Inc. does not provide refunds for partial billing periods following cancellation, except where explicitly permitted by the Refund Policy detailed in Section 4.1. Any outstanding balances or accrued charges up to the effective date of cancellation remain due and payable.

### 5.1 Data Retention Policy
Corelane, Inc. is committed to the secure and responsible management of customer data. This Data Retention Policy outlines the periods for which Corelane retains data associated with customer accounts following the termination of a subscription or the deletion of an account. The specific retention period is contingent upon the customer's subscription tier at the time of termination or deletion.

Upon the termination of a Corelane API subscription or the explicit deletion of a customer account, Corelane initiates a process to securely remove associated customer data from its active systems. This process is designed to ensure that data is not retained indefinitely beyond its operational necessity, while also allowing for a brief grace period for potential account reactivation or data retrieval, where applicable.

The retention periods for customer data, including but not limited to API request logs, inference inputs and outputs, embedding generation data, and associated metadata, are strictly enforced as follows:

*   **Free Tier:** For accounts operating under the Free tier, customer data will be retained for a period of **seven (7) days** following account deletion or subscription termination. After this period, all associated data will be permanently and irreversibly deleted from Corelane's systems.
*   **Pro Tier:** For customers subscribed to the Pro tier, customer data will be retained for a period of **thirty (30) days** following account deletion or subscription termination. Upon the expiration of this 30-day period, all associated data will be permanently and irreversibly deleted from Corelane's systems.
*   **Enterprise Tier:** For Enterprise tier customers, customer data will be retained for a period of **ninety (90) days** following account deletion or subscription termination, or for such other period as explicitly stipulated within the individual contractual agreement between Corelane, Inc. and the Enterprise customer. The terms of the individual contract shall supersede this general policy where a specific retention period is defined.

It is imperative that customers retrieve any data they wish to retain prior to initiating account deletion or subscription termination. Corelane, Inc. does not guarantee the availability of customer data beyond the specified retention periods for each tier. The deletion process is irreversible, and once data has been purged, it cannot be recovered by Corelane.

Notwithstanding the foregoing, Corelane, Inc. reserves the right to retain certain data for longer periods if required by applicable law, regulatory obligations, or for legitimate business purposes such as fraud prevention, dispute resolution, or to enforce our agreements. In such instances, data retention will be limited to the minimum necessary scope and duration. This policy applies to data stored and processed directly by Corelane in the provision of the Corelane API service.

This policy is subject to Corelane's overarching Privacy Policy and Terms of Service, which provide additional details regarding data handling, security, and customer rights.

### 5.2 API Key Management and Security
The security of API keys is paramount for maintaining the integrity and confidentiality of customer data and preventing unauthorized access to the Corelane API. Each API key issued by Corelane, Inc. serves as a unique credential that authenticates and authorizes access to the Corelane API, enabling the utilization of its LLM inference hosting and embedding generation services. Customers are solely responsible for the secure management, storage, and protection of their API keys. Failure to adequately protect API keys may result in unauthorized usage of the Corelane API, potential data breaches, and financial liabilities.

Customers must treat API keys with the same level of confidentiality and security as they would other sensitive credentials, such as passwords or private cryptographic keys. Corelane, Inc. strongly recommends adherence to industry best practices for API key management, which include, but are not limited to, the following:

*   **Secure Storage:** API keys must not be hardcoded directly into application source code. Instead, they should be stored in secure environment variables, dedicated secret management systems, or encrypted configuration files, ensuring they are not directly accessible within public repositories or client-side code.
*   **Access Control:** Limit access to API keys to only those personnel and automated systems that explicitly require them for operational purposes. Implement strict role-based access controls (RBAC) to manage who can retrieve or utilize API keys within your organization.
*   **Network Restrictions:** Where technically feasible and supported by the Corelane API dashboard, restrict API key usage to specific IP addresses or network ranges. This measure helps mitigate the risk of unauthorized access from untrusted locations by ensuring that API calls can only originate from approved sources.
*   **Avoid Public Exposure:** Never embed API keys directly into client-side code (e.g., JavaScript in web browsers, mobile applications) or expose them in public repositories, logs, or unencrypted communications. Any public exposure of an API key constitutes a severe security risk.
*   **Regular Monitoring:** Implement monitoring solutions to detect unusual or suspicious activity associated with API key usage, such as sudden spikes in requests, requests from unexpected geographical locations, or attempts to access unauthorized endpoints. Prompt investigation of such anomalies is critical.

Corelane, Inc. implements robust security measures to protect its infrastructure and the Corelane API. However, Corelane's liability explicitly excludes incidents caused by customer-side API key leakage or customer infrastructure compromise. The responsibility for safeguarding API keys once they are issued rests entirely with the customer.

In the event of a security incident, or if there is any suspicion that an API key may have been compromised or exposed, **Corelane, Inc. mandates that customers immediately rotate the affected API key(s).** This mandatory rotation is a critical step in mitigating potential damage and re-establishing the security posture of the customer's integration with the Corelane API. To rotate an API key, customers should generate a new API key through their Corelane API dashboard and then revoke the compromised key. Prompt action in such scenarios is essential to prevent continued unauthorized access and potential misuse of services.

Customers are strongly encouraged to implement a proactive API key rotation schedule as a general security practice, even in the absence of a known compromise. Regular rotation minimizes the window of opportunity for a compromised key to be exploited. Corelane provides mechanisms within the customer dashboard to facilitate the generation of new keys and the revocation of old or compromised keys. It is the customer's responsibility to ensure that all applications and services are updated with the new API key following any rotation.

### 5.3 Security Incident Response Protocol
Corelane, Inc. maintains robust security protocols designed to protect the integrity, confidentiality, and availability of the Corelane API and associated customer data. This Security Incident Response Protocol ("Protocol") outlines the procedures Corelane will undertake in the event of a confirmed security incident impacting the Corelane API infrastructure or customer data under Corelane's direct control. This Protocol is designed to ensure timely and transparent communication with affected customers while safeguarding Corelane's operational security.

Corelane employs a multi-layered security architecture and continuous monitoring systems to detect and respond to potential security threats and incidents. Upon detection of a suspected security event, Corelane's dedicated security team initiates a comprehensive investigation, containment, eradication, recovery, and post-incident analysis process. The primary objective during an incident is to mitigate any potential impact, restore normal operations, and prevent recurrence.

### Customer Notification Procedures

In the event of a confirmed security incident that Corelane determines has impacted or may reasonably impact customer data or the operational availability of the Corelane API, Corelane commits to notifying affected customers promptly.

*   **Notification Window**: Corelane will endeavor to notify affected customers within seventy-two (72) hours of confirming a security incident. This timeframe allows for initial investigation and verification to ensure accurate and actionable information is disseminated.
*   **Notification Channels**: Notifications will be disseminated through the following official channels:
    *   The registered account email address associated with the customer's Corelane API account.
    *   An in-dashboard alert banner displayed within the customer's Corelane API management portal.

Customers are solely responsible for maintaining current and accurate contact information within their Corelane API account settings to ensure timely receipt of critical security notifications.

### Customer Responsibilities Post-Incident

Following notification of a security incident, customers are required to take specific actions to protect their own systems and data.

*   **API Key Rotation**: Customers are mandated to rotate all Corelane API keys associated with their account immediately upon receiving notification of a security incident. This measure is critical to mitigate any potential unauthorized access that may have resulted from the incident. Corelane provides mechanisms within the customer dashboard for secure API key rotation.
*   **Internal Review**: Customers are advised to conduct an internal review of their own security posture and systems to identify any potential vulnerabilities or compromises that may be related to or exacerbated by the Corelane API incident.

### Limitations of Liability

Corelane's liability under this Protocol is strictly limited. Corelane shall not be liable for any incidents, damages, or losses arising from or related to:

*   Incidents caused by customer-side API key leakage. This includes, but is not limited to, API keys being exposed in public repositories, insecurely stored on customer systems, or transmitted over insecure channels by the customer.
*   Incidents resulting from the compromise of customer infrastructure. This encompasses any security breaches or vulnerabilities within the customer's own systems, networks, or applications that utilize the Corelane API.

Customers bear sole responsibility for the security of their API keys and their own infrastructure. Corelane's obligations are limited to incidents directly impacting Corelane's infrastructure and services as defined herein.

Corelane continuously reviews and enhances its security measures and incident response capabilities. This includes regular security audits, penetration testing, and updates to its security policies and technologies to adapt to evolving threat landscapes.

### 6.1 Service Level Agreements (SLA)
Corelane, Inc. is committed to providing reliable and highly available services for the Corelane API. This Section 6.1 outlines the Service Level Agreements (SLAs) applicable to the Corelane API, detailing the guaranteed uptime percentages and service commitments for each subscription tier. These commitments are designed to ensure operational continuity for our customers, with specific provisions varying based on the selected service tier.

For customers utilizing the **Free** tier of the Corelane API, service availability is provided on a best-effort basis. Corelane, Inc. endeavors to maintain high availability for the Free tier; however, no contractual uptime guarantee is extended for this service level. Consequently, no service credits or other remedies are applicable in the event of service interruptions or unavailability for Free tier users. This tier is intended for evaluation and non-critical applications, and users should not rely on a guaranteed level of service availability.

Customers subscribed to the **Pro** tier are afforded a guaranteed monthly uptime percentage. Corelane, Inc. commits to an uptime Service Level Agreement of 99.5% for the Corelane API for Pro tier subscribers. Uptime is measured as the percentage of time during a calendar month that the Corelane API is available for processing requests, excluding scheduled maintenance periods and other defined exclusions. Should Corelane, Inc. fail to meet this 99.5% monthly uptime commitment, Pro tier customers may be eligible for service credits, as detailed within the overarching Corelane API Terms of Service. The specific calculation and application of such credits are governed by those terms.

For our **Enterprise** tier customers, Corelane, Inc. provides the highest level of service availability commitment. The Enterprise tier includes a robust Service Level Agreement guaranteeing 99.9% monthly uptime for the Corelane API. Similar to the Pro tier, uptime for Enterprise customers is defined as the percentage of time within a calendar month during which the Corelane API is operational and capable of processing requests, exclusive of pre-notified maintenance windows and other agreed-upon exceptions. The precise terms, conditions, and remedies, including any applicable service credits for failure to meet the 99.9% uptime guarantee, are individually negotiated and stipulated within the dedicated service contract between Corelane, Inc. and the Enterprise customer.

It is important to note that these Service Level Agreements are subject to certain exclusions. Uptime calculations do not account for unavailability stemming from: (i) scheduled maintenance activities, provided reasonable prior notice is given; (ii) factors beyond Corelane, Inc.'s reasonable control, such as force majeure events, internet access or related problems beyond the Corelane API interface, or denial-of-service attacks; (iii) issues arising from customer-side infrastructure, applications, or third-party services; (iv) customer's failure to adhere to Corelane API documentation or terms of service; or (v) incidents caused by customer-side API key leakage or customer infrastructure compromise, as further detailed in Section 5.3. Corelane, Inc. reserves the right to modify scheduled maintenance windows with appropriate notification.

### 6.2 API Versioning and Deprecation Policy
Corelane, Inc. implements a robust and transparent API versioning strategy for the Corelane API to ensure stability, facilitate the introduction of new features, and provide a predictable development environment for all users. The Corelane API utilizes a URL path versioning scheme, whereby each distinct API version is explicitly identified within the request Uniform Resource Locator (URL). For example, API endpoints will incorporate version identifiers such as `/v1/` or `/v2/` to designate the specific iteration of the API being invoked. This architectural approach permits the concurrent operation of multiple API versions, thereby enabling developers to manage their integration timelines effectively and transition between versions in a controlled manner. Corelane is committed to minimizing operational disruption during API evolution and will provide clear and timely communication regarding any modifications that may impact existing customer integrations.

In the event that an API version or a specific endpoint is designated for deprecation, Corelane, Inc. shall issue a minimum deprecation notice period of one hundred eighty (180) days. This notice period shall commence from the date of the official announcement, which will be disseminated through established communication channels including, but not limited to, the Corelane developer portal, registered account email addresses, and in-dashboard notifications. Throughout this stipulated deprecation period, the affected API version or endpoint will continue to operate with its documented functionality, affording customers sufficient time to migrate their integrations to the newer, supported versions. Upon the expiration of the aforementioned deprecation notice period, Corelane reserves the unequivocal right to discontinue support for the deprecated API version or endpoint. Such discontinuation may result in service degradation, functional limitations, or complete cessation of service for applications that continue to utilize the deprecated components. Customers bear the sole responsibility for ensuring their applications are updated to supported API versions prior to the effective deprecation date.

Corelane, Inc. provides differentiated levels of migration support to assist customers in the transition between API versions, with the scope of support being contingent upon the customer's active subscription tier. This tiered support structure is designed to address the varying operational and technical requirements of our customer base:

*   **Free Tier**: Customers subscribed to the Free tier shall be granted access to comprehensive documentation, including detailed API change logs, migration guides, and illustrative examples. Direct technical support specifically for migration efforts is not encompassed within the entitlements of this tier.
*   **Pro Tier**: Pro tier subscribers shall receive access to all aforementioned documentation resources, augmented by dedicated email support for migration-related inquiries. This specialized email support will be available exclusively throughout the designated migration window for the deprecated API version.
*   **Enterprise Tier**: Enterprise customers are entitled to dedicated migration engineering support. This includes personalized assistance, strategic consultation, and direct engagement with Corelane's engineering team to facilitate a seamless and efficient transition between API versions, as further delineated within their individual contractual agreements.

Corelane's overarching objective is to ensure a transparent and orderly process for API evolution, thereby upholding the reliability and performance of the Corelane API while simultaneously integrating technological advancements. Adherence to these policies is paramount for maintaining continuous and optimal utilization of Corelane API services.

### 7.1 Account Suspension and Termination
Corelane, Inc. reserves the unequivocal right to suspend or terminate a customer's access to the Corelane API and associated services, or the customer's entire account, under specific conditions and in accordance with the procedures outlined herein. This policy is designed to ensure the stability, security, and integrity of the Corelane API for all users and to enforce compliance with Corelane's governing terms.

### 7.1.1 Grounds for Suspension or Termination

Access to the Corelane API may be suspended or terminated, without limitation, for any of the following reasons:

*   **Breach of Agreement**: Any material breach by the customer of the Corelane API Terms of Service, Acceptable Use Policy, or any other agreement governing the use of Corelane services, including but not limited to this Billing and Subscription Policy.
*   **Non-Payment**: Failure to remit timely payment for any Corelane API subscription or service fees when due. For paid tiers, non-payment may result in suspension of service until outstanding balances are settled, followed by termination if payment remains delinquent.
*   **Abuse or Misuse of Service**: Engagement in activities that, in Corelane's sole discretion, compromise the security, integrity, or availability of the Corelane API, Corelane's infrastructure, or the experience of other users. This includes, but is not limited to, unauthorized access attempts, malicious attacks, or persistent and excessive resource consumption that significantly exceeds established monthly quotas or rate limits (as detailed in Section 3.1) and negatively impacts system performance or stability.
*   **Illegal or Prohibited Use**: Use of the Corelane API for any illegal, fraudulent, or abusive purposes, or in any manner that violates applicable laws or regulations.
*   **Security Risk**: Any activity that poses a significant security risk to Corelane, its customers, or third parties, including but not limited to, suspected compromise of API keys or customer accounts.
*   **Customer Request**: Voluntary request by the customer for account closure or service termination.

### 7.1.2 Suspension Procedures

In most instances, Corelane will endeavor to provide prior written notice to the customer, typically via the registered account email address, detailing the nature of the violation and specifying a reasonable period for the customer to cure the breach. During this cure period, Corelane may, at its discretion, implement temporary restrictions on API usage. However, Corelane reserves the right to suspend access to the Corelane API immediately and without prior notice in situations involving:

*   Imminent security threats or actual security incidents.
*   Suspected fraudulent activity.
*   Actions causing immediate and material harm to the Corelane API, its infrastructure, or other users.
*   Violations of law or governmental regulations.

During a period of suspension, the customer's access to the Corelane API will be restricted or entirely revoked, though account data may remain accessible for a defined period to facilitate resolution.

### 7.1.3 Termination Procedures and Effects

If a violation is not cured within the specified notice period, or if the nature of the violation warrants immediate termination, Corelane may proceed with the permanent termination of the customer's account and access to the Corelane API. Upon termination:

*   All access to the Corelane API and associated services will cease immediately.
*   Any outstanding financial obligations, including accrued but unpaid fees, shall become immediately due and payable.
*   For paid subscriptions, no refunds will be issued for any unused portion of the subscription period if termination is a result of the customer's breach of policy.
*   Corelane will handle customer data in accordance with its Data Retention Policy, as detailed in Section 5.1. This may include the deletion of customer data after a specified period, varying by subscription tier.

Corelane's exercise of its right to suspend or terminate shall not limit any other rights or remedies available to Corelane under its Terms of Service or applicable law.

### 7.2 Policy Modifications
Corelane, Inc. reserves the unequivocal right to amend, modify, or update this Billing and Subscription Policy at its sole discretion. Such revisions may be necessitated by, but not limited to, changes in legal or regulatory requirements, technological advancements, service enhancements, or evolving business practices.

Corelane, Inc. shall provide notice of any material modifications to this Policy to its customers. This notification will be disseminated via the registered account email address, an in-dashboard alert banner, or through a prominent announcement on the official Corelane API website. Unless otherwise specified, such modifications shall become effective thirty (30) calendar days following the date of notification.

Continued utilization of the Corelane API services subsequent to the effective date of any revised Policy shall constitute the customer's explicit acceptance of the updated terms. Customers bear the sole responsibility for regularly reviewing the most current version of this Policy, which will always be accessible on the Corelane API website. The version number and effective date, as specified in Section 1.3, will be updated with each revision.

Should a customer not agree with the revised terms, their sole recourse is to terminate their Corelane API subscription in accordance with the procedures outlined in Section 4.2 prior to the effective date of the modifications.

### 7.3 Dispute Resolution and Governing Law
Corelane, Inc. is committed to fair and transparent billing practices. Should a customer identify a discrepancy or error in an invoice or charge, they must submit a formal dispute in writing to Corelane's billing department within thirty (30) calendar days from the date of the disputed invoice or charge. The written dispute must include specific details regarding the nature of the discrepancy, the amount in question, and any supporting documentation. Corelane will investigate all validly submitted disputes and endeavor to provide a resolution or response within thirty (30) calendar days of receipt of the dispute. During the dispute resolution process, customers are obligated to pay all undisputed amounts by their due dates. Failure to submit a dispute within the specified timeframe shall constitute a waiver of the customer's right to dispute such charges.

This Billing and Subscription Policy, and any disputes or claims arising out of or in connection with it or its subject matter or formation (including non-contractual disputes or claims), shall be governed by and construed in accordance with the laws of the State of Delaware, United States of America, without regard to its conflict of law principles. The parties irrevocably agree that the courts located in the State of Delaware, United States of America, shall have exclusive jurisdiction to settle any dispute or claim that arises out of or in connection with this policy or its subject matter or formation (including non-contractual disputes or claims). Each party hereby waives any objection to such jurisdiction and venue.
