# Corelane API Terms — Rate Limits and Quotas Policy
**Version 2.3** · **Effective: June 1, 2026**

### 1.0 Introduction and Definitions
This document, the Corelane API Rate Limits and Monthly Quotas Policy, version 2.3, effective June 1, 2026, establishes the terms and conditions governing the usage of the Corelane API. Corelane, Inc. provides the Corelane API as an API-as-a-service for LLM inference hosting and embedding generation. The primary objective of this policy is to ensure equitable access, maintain service stability, prevent system abuse, and optimize performance for all users of the Corelane API. Adherence to the stipulations outlined herein is mandatory for all customers, irrespective of their subscribed service tier.

This policy delineates the specific operational parameters, including but not limited to, the maximum permissible request rates and overall consumption allowances, applicable to each Corelane API service tier. It further details the mechanisms for monitoring usage, the consequences of exceeding established limits, and the procedures for requesting adjustments to monthly quotas. The scope of this policy extends to all interactions with the Corelane API, encompassing both programmatic and manual access methods, and is integral to the broader Corelane, Inc. Terms of Service.

### 1.1 Definitions

For the purposes of this Corelane API Rate Limits and Monthly Quotas Policy, the following terms shall have the meanings set forth below:

*   **Corelane API**: Refers to the proprietary application programming interface provided by Corelane, Inc. for the purpose of LLM inference hosting and embedding generation.
*   **API Key**: A unique, alphanumeric string issued by Corelane, Inc. to authenticate and authorize a customer's access to the Corelane API. API keys are confidential credentials and must be protected by the customer.
*   **Rate Limit**: The maximum number of requests that a customer's API Key is permitted to make to the Corelane API within a specified time interval, typically measured per minute or per day.
*   **Monthly Quota**: The total aggregate volume of Corelane API usage, measured by requests or other defined metrics, that a customer is permitted to consume within a calendar month. Exceeding the monthly quota may result in service restrictions or additional charges.
*   **Service Tier**: A distinct subscription level offered by Corelane, Inc. for the Corelane API, such as 'Free', 'Pro', or 'Enterprise', each associated with specific entitlements, including varying rate limits, monthly quotas, and service level agreements.
*   **Burst Allowance**: A temporary, predefined increase in the standard rate limit, permitting a customer to exceed their typical request volume for a limited duration, as specified by their service tier.
*   **Uptime SLA**: A Service Level Agreement that contractually defines the minimum percentage of time the Corelane API is expected to be operational and accessible, as committed by Corelane, Inc. to customers of specific service tiers.

### 2.0 General Principles of Usage Policy
Corelane, Inc. establishes and enforces rate limits and monthly quotas as integral components of its operational framework for the Corelane API, an API-as-a-service designed for LLM inference hosting and embedding generation. These policies are not arbitrary restrictions but rather foundational mechanisms implemented to ensure the sustained stability, security, and equitable access to Corelane API resources for all customers. The principles outlined herein apply universally across all Corelane API service tiers, encompassing Free, Pro, and Enterprise subscriptions, albeit with specific numerical thresholds varying according to the respective tier's entitlements.

The primary rationale for the implementation of rate limits is to safeguard the Corelane API infrastructure from potential overload, whether accidental or malicious. By regulating the volume of requests processed within a defined timeframe, Corelane, Inc. mitigates risks associated with denial-of-service attacks, inefficient client-side implementations, and unintended resource exhaustion. This proactive management ensures that the Corelane API remains responsive and available, thereby preserving the quality of service for all legitimate users. Rate limits are critical for maintaining predictable performance characteristics and preventing any single user or application from disproportionately consuming shared computational resources.

Monthly quotas, conversely, are designed to manage the aggregate consumption of Corelane API resources over an extended period. These quotas facilitate sustainable resource allocation and align usage with the economic models of each service tier. They enable Corelane, Inc. to provide differentiated service levels, ensuring that customers subscribing to higher tiers receive guaranteed access to greater capacities, while simultaneously preventing the over-utilization of resources by lower-tier subscribers that could negatively impact the overall service ecosystem. Monthly quotas are instrumental in promoting fair usage patterns and supporting the long-term viability and scalability of the Corelane API.

Furthermore, these usage policies serve as a critical security control. By monitoring and enforcing request volumes, Corelane, Inc. can more effectively detect and respond to anomalous activity that may indicate unauthorized access attempts, data exfiltration, or other forms of API abuse. The consistent application of these limits across all API keys helps to establish a baseline of expected behavior, making deviations more readily identifiable.

Corelane, Inc. emphasizes that adherence to these rate limits and monthly quotas is a mandatory condition for the continued use of the Corelane API. Non-compliance, whether intentional or unintentional, may result in enforcement actions as detailed in subsequent sections of this policy. These foundational principles underpin Corelane, Inc.'s commitment to delivering a robust, secure, and high-performance API service to its entire customer base.

### 3.0 Corelane API Service Tiers: Rate Limits and Monthly Quotas
Corelane, Inc. maintains a structured hierarchy of service tiers to ensure the optimal performance and reliability of the Corelane API. Each tier is governed by specific technical constraints, including rate limits per minute, daily request thresholds, and associated monthly quotas. These parameters are designed to align infrastructure capacity with the operational requirements of our diverse customer base, ranging from individual developers to large-scale enterprise organizations.

### 3.1 Free Tier
The Free tier is intended for evaluation and low-volume development purposes. Usage under this tier is subject to the following constraints:
- Rate Limit per Minute: 60 requests per minute.
- Daily Request Limit: 1,000 requests per day.
- Monthly Quota: Calculated as the daily limit multiplied by the number of days in the billing cycle, resulting in a maximum of 30,000 requests per month.
- Burst Allowance: None. Requests exceeding the 60 requests per minute threshold will be rejected with a 429 Too Many Requests status code.
- Uptime SLA: Best-effort, not contractually guaranteed.

### 3.2 Pro Tier
The Pro tier is designed for production-grade applications requiring higher throughput and predictable performance. The following constraints apply:
- Rate Limit per Minute: 600 requests per minute.
- Daily Request Limit: 100,000 requests per day.
- Monthly Quota: Calculated as the daily limit multiplied by the number of days in the billing cycle, resulting in a maximum of 3,000,000 requests per month.
- Burst Allowance: Customers are permitted a burst allowance of +20% above the standard rate limit for a duration not exceeding 60 seconds. This allowance is intended to accommodate transient traffic spikes without triggering automated rate limiting.
- Uptime SLA: 99.5% uptime commitment.

### 3.3 Enterprise Tier
The Enterprise tier provides tailored infrastructure support for high-scale, mission-critical deployments. Constraints for this tier are defined as follows:
- Rate Limit per Minute: Negotiated per individual contract, with a minimum baseline of 2,000 requests per minute.
- Daily Request Limit: Determined by the negotiated service agreement.
- Monthly Quota: Determined by the negotiated service agreement.
- Burst Allowance: Per negotiated SLA, providing flexibility for high-concurrency environments.
- Uptime SLA: 99.9% uptime commitment.

### 3.4 Calculation and Enforcement Methodology
For the purposes of this policy, the 'monthly quota' is derived from the aggregate daily request limit assigned to the specific tier. Corelane, Inc. employs a sliding window algorithm to monitor request frequency. It is the responsibility of the customer to ensure that their application logic accounts for these limits. 

In instances where a customer approaches their monthly quota, Corelane, Inc. will provide automated notifications via the registered account email. It is imperative to note that the burst allowance provided to Pro and Enterprise tiers is strictly time-bound. Any sustained usage exceeding the base rate limit beyond the 60-second burst window will be subject to standard rate-limiting protocols. 

Customers are advised that the Corelane API infrastructure is monitored in real-time. Any attempt to circumvent these limits through the use of multiple API keys or distributed request patterns that violate the spirit of these tier-based constraints may result in immediate account suspension or termination, as detailed in Section 4.0 of this policy. All customers, regardless of tier, must ensure their integration remains within the defined parameters to maintain service continuity.

### 4.0 Exceeding Established Limits and Enforcement
Corelane, Inc. maintains strict enforcement protocols to ensure the stability, security, and equitable distribution of computational resources across the Corelane API infrastructure. When a customer’s utilization of the Corelane API exceeds the established rate limits or the aggregate monthly quota associated with their specific service tier, Corelane, Inc. reserves the right to implement automated enforcement actions. These measures are designed to protect the integrity of the service for all users and to prevent unauthorized or excessive consumption that may degrade system performance.

### Enforcement Mechanisms

Upon the detection of a breach of the defined rate limits—specifically the requests per minute (RPM) or the daily request threshold—the Corelane API gateway will automatically issue an HTTP 429 'Too Many Requests' response code. This signal indicates that the customer has reached the maximum allowable capacity for their current tier. For customers on the Pro tier, this enforcement includes the application of the defined burst allowance, which permits a temporary increase of 20% over the standard rate limit for a duration not exceeding 60 seconds. Once this burst window expires or the additional capacity is exhausted, subsequent requests will be throttled until the rate of incoming traffic returns to within the permitted parameters.

### Monthly Quota Exceedance

In addition to instantaneous rate limiting, Corelane, Inc. monitors the cumulative monthly quota for each account. If a customer’s total consumption reaches their assigned monthly quota, the API will cease to process further requests for the remainder of the billing cycle. It is the responsibility of the customer to monitor their consumption patterns via the Corelane dashboard to avoid service interruption. Corelane, Inc. does not provide automatic overage billing; rather, service is suspended until the start of the next billing period or until the customer upgrades their service tier to one with a higher or unlimited capacity, subject to the terms of their specific agreement.

### Remediation and Suspension

Corelane, Inc. reserves the right to temporarily suspend or permanently terminate access to the Corelane API if a customer is found to be intentionally circumventing rate limits or engaging in activities that threaten the stability of the infrastructure. Such activities include, but are not limited to, distributed denial-of-service (DDoS) patterns, unauthorized scraping, or the use of multiple API keys to bypass tier-specific restrictions. In instances of repeated or egregious violations, Corelane, Inc. may, at its sole discretion, revoke the customer's API key and terminate the service agreement without prior notice. 

Customers who believe their service has been erroneously throttled or suspended due to a technical error in the monitoring system may submit a formal inquiry through the designated support channels. However, Corelane, Inc. maintains final authority in determining whether a violation of the usage policy has occurred. Continued adherence to the specified rate limits and monthly quotas is a material condition of the service agreement, and failure to comply may result in the forfeiture of any uptime guarantees or service level commitments provided under the customer's selected tier.

### 5.0 Usage Monitoring and Reporting
Corelane, Inc. maintains robust internal systems to monitor, audit, and record all API consumption metrics associated with the Corelane API. Customers are provided with a centralized dashboard accessible via the Corelane developer portal, which serves as the primary interface for real-time visibility into usage statistics. This dashboard displays current consumption against the applicable monthly quota and provides granular insights into request volume, latency, and error rates. It is the responsibility of the customer to monitor their usage metrics regularly to ensure continued service availability and to anticipate potential breaches of their assigned rate limits or monthly quotas.

### Usage Tracking Mechanisms
Corelane, Inc. utilizes automated telemetry to track API calls on a per-request basis. Each request is authenticated via the customer’s unique API key and logged with a high-precision timestamp. These logs are processed to calculate the following metrics:

* **Rate Limit Utilization:** Real-time tracking of requests per minute (RPM) to ensure compliance with the tier-specific rate limit.
* **Monthly Quota Consumption:** Cumulative tracking of requests per day and total monthly volume to ensure adherence to the aggregate monthly quota.
* **Burst Allowance Monitoring:** For Pro and Enterprise tiers, the system tracks burst activity to ensure that usage does not exceed the permitted +20% threshold for the 60-second duration window.

### Internal Auditing and Data Integrity
Corelane, Inc. performs periodic internal audits of usage data to ensure the accuracy of billing and the integrity of service enforcement. These audits are conducted in accordance with our internal data governance policies. While Corelane, Inc. maintains these records for operational purposes, customers are encouraged to maintain their own independent logs of API interactions for reconciliation and internal reporting. In the event of a discrepancy between customer-side logs and Corelane, Inc.’s authoritative usage records, the data captured by Corelane, Inc.’s infrastructure shall be deemed the definitive source of truth.

### Reporting and Notifications
To facilitate proactive management of service limits, Corelane, Inc. provides automated notification triggers. Customers may configure alerts within the developer portal to receive notifications via their registered account email when their usage reaches 75%, 90%, and 95% of their monthly quota. These notifications are intended as a courtesy to assist customers in managing their infrastructure and preventing unexpected service interruptions. The failure of a customer to receive or act upon these notifications does not absolve the customer of their obligation to remain within the established rate limits and monthly quotas defined in their service tier. Corelane, Inc. reserves the right to modify the frequency and granularity of these reporting tools as part of ongoing platform enhancements and version updates.

### 6.0 Requesting Adjustments to Monthly Quotas
Customers requiring an expansion of their assigned monthly quota or an adjustment to their established rate limits must adhere to the formal request procedures established by Corelane, Inc. Requests for modifications are evaluated based on the customer's current service tier, historical usage patterns, and the technical feasibility of the requested capacity increase within the Corelane API infrastructure.

### Submission Procedure
All requests for quota adjustments must be submitted through the official Corelane developer portal via the 'Quota Management' interface. Requests submitted via informal channels, including but not limited to electronic mail to individual employees or social media inquiries, shall not be considered valid and will not be processed. The submission must include a detailed justification for the requested increase, including the anticipated volume of requests per minute and the projected total monthly quota requirements. 

### Evaluation Criteria
Corelane, Inc. reserves the right to approve or deny any request for quota modification at its sole discretion. The evaluation process considers the following factors:

* **Service Tier Eligibility:** Customers on the Free tier are generally ineligible for individual quota adjustments and are encouraged to upgrade to the Pro or Enterprise tier to access higher capacity thresholds.
* **Historical Usage Consistency:** Requests are reviewed against the customer's historical consumption data to ensure that the requested increase aligns with actual operational requirements.
* **Infrastructure Capacity:** Corelane, Inc. must verify that the requested increase does not adversely impact the stability or performance of the Corelane API for other users.
* **Technical Compliance:** The customer must demonstrate that their application architecture is optimized to handle the requested load, including the implementation of appropriate retry logic and back-off strategies.

### Tier-Specific Considerations

| Service Tier | Adjustment Eligibility | Process Overview |
| :--- | :--- | :--- |
| Free | Not applicable | Upgrade to Pro or Enterprise required |
| Pro | Limited | Subject to internal review and potential tier migration |
| Enterprise | Fully supported | Negotiated via dedicated account management |

### Notification and Implementation
Upon submission, Corelane, Inc. will provide an initial acknowledgment of the request within three business days. If additional information is required, the customer will be notified via their registered account email. Once a determination has been reached, the customer will be formally notified of the approval or denial. If approved, the new monthly quota or rate limit will be applied to the customer's API key within 24 hours of the notification. 

Any modification to a monthly quota may result in a revision of the customer's billing cycle or service agreement, particularly for Pro and Enterprise tier customers. Customers are responsible for ensuring that their systems are configured to accommodate the updated limits immediately upon implementation. Corelane, Inc. assumes no liability for service interruptions resulting from a customer's failure to update their internal infrastructure to match the newly provisioned capacity.

### 7.0 API Key Management and Security Incidents
The security and integrity of the Corelane API infrastructure are predicated upon the diligent management of API keys by our customers. An API key serves as the primary credential for authenticating requests to the Corelane API; consequently, the customer assumes full and sole responsibility for the confidentiality, storage, and authorized utilization of their assigned credentials. Customers are strictly prohibited from sharing, hardcoding, or exposing API keys in public repositories, client-side code, or any insecure environment. Any unauthorized access resulting from a failure to adhere to these security standards remains the exclusive liability of the customer.

In the event of a suspected or confirmed security incident, including but not limited to the unauthorized disclosure, theft, or compromise of an API key, the customer is obligated to initiate the incident response protocol immediately. Corelane, Inc. mandates that customers notify our security operations team within 72 hours of discovering a potential breach. Notification must be facilitated through the registered account email or via the in-dashboard alert banner provided within the Corelane developer portal. Upon the occurrence of a security incident, the immediate rotation of the compromised API key is a mandatory requirement. Failure to rotate credentials following a known compromise constitutes a material breach of this policy and may result in the immediate suspension of API access to protect the integrity of the Corelane, Inc. ecosystem.

Corelane, Inc. maintains a rigorous stance regarding liability in the context of security incidents. Our corporate liability explicitly excludes any damages, data loss, or service disruptions arising from incidents caused by customer-side API key leakage or the compromise of customer-side infrastructure. While Corelane, Inc. employs industry-standard encryption and security measures to protect the API gateway, the customer remains responsible for the security of the environment from which requests originate. 

To facilitate robust security management, we recommend the following practices:

*   **Environment Variable Usage:** API keys should be stored exclusively in secure environment variables or dedicated secret management services, never within source control systems.
*   **Principle of Least Privilege:** If the customer architecture permits, utilize scoped API keys that restrict access to specific endpoints or functions, thereby limiting the potential blast radius of a credential compromise.
*   **Regular Rotation:** Regardless of incident status, proactive rotation of API keys is encouraged as a standard security hygiene practice.
*   **Monitoring:** Customers should utilize the usage logs available in the developer portal to audit request patterns, which may serve as an early warning system for unauthorized API key usage.

Should a security incident necessitate the revocation of an API key, Corelane, Inc. will provide technical guidance on the transition to new credentials. However, the customer is responsible for updating their internal applications and infrastructure to reflect these changes. Corelane, Inc. reserves the right to unilaterally revoke any API key if we determine, at our sole discretion, that the key has been compromised or is being utilized in a manner that threatens the stability of the Corelane API. In such instances, Corelane, Inc. will endeavor to provide notice via the registered account email, though immediate revocation may be necessary to mitigate ongoing risk. By maintaining an active account, the customer acknowledges that the security of the API key is a shared responsibility, with the burden of credential protection resting firmly with the customer.

### 8.0 Service Level Agreements (SLA) and Uptime Commitments
Corelane, Inc. maintains distinct Service Level Agreements (SLAs) corresponding to the specific service tier assigned to each customer account. These commitments are intrinsically linked to the operational stability of the Corelane API and are contingent upon the customer’s adherence to the established rate limits and monthly quotas defined within this policy. The uptime SLA represents the percentage of time during a calendar month that the Corelane API infrastructure is available to process valid requests, excluding periods of scheduled maintenance or force majeure events.

### Uptime SLA Commitments by Tier

The following table delineates the uptime SLA commitments provided by Corelane, Inc. based on the selected service tier:

| Service Tier | Uptime SLA Commitment |
| :--- | :--- |
| Free | Best-effort, not contractually guaranteed |
| Pro | 99.5% |
| Enterprise | 99.9% |

For customers subscribed to the Pro and Enterprise tiers, the uptime SLA is calculated based on the availability of the API endpoints to receive and process requests within the defined rate limits. It is imperative to note that the uptime SLA does not apply to requests that are rejected due to a customer exceeding their assigned rate limit per minute or their aggregate monthly quota. Any request rejected by the Corelane API gateway due to a violation of these usage constraints is considered a customer-side error and is excluded from the calculation of uptime performance.

### Relationship Between Usage Limits and SLA

The integrity of the Corelane API service is maintained through the rigorous enforcement of rate limits and monthly quotas. These limits are designed to ensure equitable access to computational resources and to prevent service degradation for all users. Consequently, the uptime SLA is only applicable to traffic that conforms to the parameters of the customer’s specific service tier. If a customer’s usage exceeds the rate limit per minute or the monthly quota, the resulting service interruption is not classified as a failure of the Corelane API infrastructure. Corelane, Inc. assumes no liability for service unavailability resulting from a customer’s failure to manage their API key usage within the prescribed limits.

### Operational Scope and Exclusions

Uptime commitments are measured at the Corelane API gateway level. The SLA does not extend to the performance of the customer’s own infrastructure, network connectivity between the customer’s environment and Corelane, Inc. servers, or any third-party services utilized in conjunction with the Corelane API. Furthermore, the uptime SLA is void in instances where the customer is in breach of the Terms of Service, including but not limited to, the unauthorized use of an API key or the failure to rotate credentials following a security incident as mandated in Section 7.0. Corelane, Inc. reserves the right to perform emergency maintenance to address critical security vulnerabilities, which may temporarily impact service availability. Such emergency maintenance is excluded from the uptime SLA calculation, provided that Corelane, Inc. makes reasonable efforts to notify customers through the registered account email or the in-dashboard alert banner.

### 9.0 Data Retention and Account Termination
Upon the formal termination of a customer account, Corelane, Inc. initiates a structured data decommissioning process. This policy governs the retention of customer-specific data, including API usage logs, stored embeddings, and configuration metadata, to ensure compliance with privacy standards and operational efficiency. The duration for which Corelane, Inc. retains such data is strictly contingent upon the service tier assigned to the account at the time of termination.

### Data Retention Periods by Service Tier

Following the effective date of account termination, data shall be retained for the following durations:

| Service Tier | Data Retention Period |
| :--- | :--- |
| Free | 7 days |
| Pro | 30 days |
| Enterprise | 90 days, or per contract |

During these retention periods, Corelane, Inc. maintains the data in a restricted state, inaccessible via the standard API interface. Customers may request an export of their usage data or stored assets prior to the expiration of the applicable retention window. Once the specified period concludes, all associated data is subject to permanent, irreversible deletion from Corelane, Inc. production and backup environments.

### Interaction with Monthly Quotas and Usage Data

Account termination does not absolve the customer of financial obligations incurred prior to the termination date. In instances where an account is terminated due to a violation of the monthly quota or other terms of service, Corelane, Inc. reserves the right to retain usage logs for a period exceeding the standard retention window if such logs are required for forensic auditing, legal compliance, or the resolution of outstanding billing disputes. 

Furthermore, the cessation of services renders the associated API key immediately invalid. Any attempts to authenticate with an API key post-termination will be rejected by the Corelane API infrastructure. Customers are advised that the deletion of data is final; Corelane, Inc. assumes no liability for the loss of data resulting from the expiration of these retention periods. It remains the sole responsibility of the customer to ensure that all necessary data is migrated or archived prior to the formal closure of their account. For Enterprise-level customers, specific retention requirements stipulated in a master service agreement shall supersede the standard retention timelines defined herein, provided such terms are explicitly documented in the governing contract.

### 10.0 Refund Policy and Usage Thresholds
This Section 10.0 delineates the conditions and criteria under which Corelane, Inc. provides refunds for Corelane API services. Eligibility for a refund is strictly contingent upon adherence to the specified usage thresholds and temporal limitations associated with each service tier. All refund determinations are made by Corelane, Inc. in its sole discretion, based exclusively on its internal system logs and usage metrics.

### 10.1 General Principles of Refund Eligibility

Corelane, Inc. processes all Corelane API usage data through its proprietary monitoring systems. The data recorded by these systems shall serve as the definitive and sole basis for assessing a customer's eligibility for any refund. Customers acknowledge and agree that Corelane, Inc.'s determination of usage and compliance with refund conditions is final and binding. Refunds, if applicable, will be processed to the original payment method used for the subscription.

### 10.2 Free Tier Refund Policy

Customers utilizing the Corelane API under the Free tier are not subject to any subscription fees. Consequently, no refunds are applicable or available for the Free tier, as there are no paid services to reimburse.

### 10.3 Pro Tier Refund Policy

For customers subscribed to the Corelane API Pro tier at a rate of $49 per month, a full refund may be issued, subject to the following stringent conditions:

*   **Temporal Limitation:** The refund request must be initiated and received by Corelane, Inc. within the initial fourteen (14) calendar days following the commencement of the paid Pro tier subscription.
*   **Usage Threshold:** The customer's cumulative Corelane API usage, as measured by Corelane, Inc.'s internal systems, must not have exceeded ten percent (10%) of the monthly quota allocated to the Pro tier during the aforementioned fourteen-day period. The Pro tier's daily rate limit is 100,000 requests. For the purpose of this policy, the monthly quota is calculated as 3,000,000 requests (100,000 requests/day * 30 days). Therefore, the usage threshold for a full refund is 300,000 requests (10% of 3,000,000 requests).

Should a customer's usage surpass 300,000 requests within the initial fourteen days, or if the refund request is submitted beyond this fourteen-day window, the customer shall be ineligible for a refund. All refund requests must be submitted through the designated support channels, providing sufficient account identification details.

### 10.4 Enterprise Tier Refund Policy

Customers subscribed to the Corelane API Enterprise tier operate under custom contractual agreements. The refund policy for Enterprise tier services is exclusively governed by the specific terms and conditions stipulated within the individual contract executed between Corelane, Inc. and the Enterprise customer. Any inquiries or requests pertaining to refunds for Enterprise tier services must be directed to the assigned Corelane, Inc. account representative, referencing the specific contractual provisions.

### 10.5 Refund Processing and Limitations

Approved refunds will typically be processed within thirty (30) business days from the date of approval. Corelane, Inc. reserves the right to deny any refund request that does not strictly adhere to the conditions outlined in this Section 10.0. Refunds are not transferable and apply solely to the account holder who initiated the original subscription. This policy does not obligate Corelane, Inc. to provide refunds for service interruptions or performance issues unless explicitly covered by a separate Service Level Agreement (SLA) as detailed in Section 8.0 of this document.

### 11.0 Policy Modifications and API Versioning
Corelane, Inc. reserves the right to modify this Rate Limits and Quotas Policy at any time, effective upon the date of publication. Any material changes to the terms governing API usage, rate limits, or monthly quotas will be communicated to customers via the registered account email address on file. Customers are responsible for maintaining current contact information to ensure receipt of such notifications. Continued use of the Corelane API following the effective date of any policy modification constitutes binding acceptance of the updated terms.

Corelane, Inc. employs a structured approach to API versioning to ensure stability and backward compatibility for all integrations. The Corelane API utilizes URL path versioning, such as /v1/ or /v2/, to delineate distinct iterations of the service. This methodology allows customers to maintain stable production environments while transitioning to newer features or infrastructure improvements. Corelane, Inc. commits to a minimum deprecation notice period of 180 days prior to the sunsetting of any specific API version. During this 180-day window, Corelane, Inc. will provide technical documentation and guidance to facilitate a seamless migration for all affected customers.

The level of migration support provided by Corelane, Inc. is strictly tiered based on the customer’s active service subscription at the time of the deprecation notice. The following table outlines the support obligations for each tier:

| Service Tier | Migration Support Level |
| :--- | :--- |
| Free | Documentation only |
| Pro | Documentation plus email support during migration window |
| Enterprise | Dedicated migration engineering support |

Customers utilizing the Free tier are provided with comprehensive documentation to assist in self-directed migrations. Pro tier customers are entitled to the aforementioned documentation and may submit inquiries via email to our support team for assistance throughout the migration window. Enterprise tier customers receive dedicated migration engineering support, as defined by their specific service agreement, to ensure minimal disruption to their production workflows. 

It is the responsibility of the customer to monitor the status of their integrated API versions. Corelane, Inc. shall not be held liable for any service interruptions resulting from a customer’s failure to migrate from a deprecated API version within the 180-day notice period. Furthermore, any usage generated during the migration process remains subject to the applicable rate limits and monthly quotas associated with the customer’s current service tier. By maintaining an active subscription, customers acknowledge that Corelane, Inc. may update its infrastructure to optimize performance, and that such updates may necessitate periodic adjustments to client-side implementations to remain compliant with the latest API standards and security protocols.

### 12.0 Contact and Support Information
Customers seeking clarification on the Corelane API Rate Limits and Monthly Quotas Policy or requiring assistance with their account status should utilize the designated support channels corresponding to their service tier. All formal inquiries regarding policy interpretation, compliance, or technical implementation must be submitted in writing to ensure proper documentation and response tracking. Support availability is strictly governed by the customer's selected service tier:

*   **Free Tier**: Support is limited to the official Corelane API Documentation and the self-service knowledge base. No direct technical or administrative support is provided for Free tier accounts.
*   **Pro Tier**: Subscribers may access email-based support for inquiries regarding their monthly quota, API key management, and general technical troubleshooting during the migration window.
*   **Enterprise Tier**: Customers are provided with dedicated migration engineering support and a designated account manager for all policy and technical matters, as stipulated in their individual service contracts.

In the event of a suspected API key compromise or other security-related concerns, customers must immediately report the incident through the 'Security Reporting' interface in the Corelane dashboard. Pursuant to our security protocols, Corelane, Inc. will issue notifications regarding confirmed incidents within 72 hours via the registered account email and in-dashboard alert banners. Following any such incident, the customer is strictly required to perform a mandatory API key rotation to maintain service integrity. For matters pertaining to billing or formal requests for monthly quota adjustments, customers should contact the Corelane Billing Department at the address specified in their account portal.
