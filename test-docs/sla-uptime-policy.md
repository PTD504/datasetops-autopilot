# Corelane API Terms — SLA and Uptime Policy
**Version 2.3** · **Effective: June 1, 2026**

### 1.0 Introduction and Policy Scope
This document constitutes the official Service Level Agreement and Uptime Policy (hereinafter referred to as "this Policy") for Corelane, Inc. This Policy is designed to formally delineate the commitments of Corelane, Inc. regarding the operational availability and performance of its Corelane API services. The Corelane API, which functions as an API-as-a-service for LLM inference hosting and embedding generation, is subject to the terms and conditions set forth herein.

This Policy is effective as of June 1, 2026, and supersedes all prior agreements, understandings, or representations, whether written or oral, pertaining to the service levels and uptime guarantees of the Corelane API. The current version of this Policy is 2.3. Corelane, Inc. reserves the right to update or amend this Policy in accordance with Section 13.0, with such changes becoming effective upon the specified date of revision.

The primary objective of this Policy is to establish clear, measurable standards for service delivery and to define the responsibilities of Corelane, Inc. in maintaining the operational integrity of the Corelane API. It outlines the foundational terms for service availability, performance metrics, and the mechanisms for addressing any deviations from these established standards. Furthermore, this Policy serves to inform Corelane API users of their rights and the remedies available in the event of a failure by Corelane, Inc. to meet the stipulated service levels.

The scope of this Policy encompasses all Corelane API services provided by Corelane, Inc., including but not limited to the infrastructure, software, and associated components necessary for the provision of LLM inference hosting and embedding generation capabilities. This Policy applies uniformly to all subscription tiers of the Corelane API, with specific service level objectives and agreements detailed in subsequent sections, tailored to each respective tier.

### 2.0 Definitions
"Downtime" refers to any period during which the Corelane API, encompassing its core functionalities such as LLM inference hosting and embedding generation, is unavailable or inoperable for a substantial portion of Corelane, Inc.'s customer base, as measured and confirmed by Corelane, Inc.'s internal monitoring systems. This unavailability must prevent the Corelane API from processing requests or returning valid responses for a continuous period. Downtime specifically excludes:

*   Scheduled maintenance periods, provided Corelane, Inc. has given prior notice.
*   Issues arising from customer-side infrastructure, network connectivity, or software.
*   Incidents caused by customer-side API key leakage or customer infrastructure compromise.
*   Suspension or termination of Corelane API access due to customer's breach of the Corelane Terms of Service or Acceptable Use Policy.
*   Events of Force Majeure, including but not limited to acts of God, war, terrorism, riots, embargoes, fires, floods, earthquakes, or strikes.
*   Beta or experimental features of the Corelane API.

"Monthly Uptime Percentage" is the metric used to quantify the operational availability of the Corelane API during a given calendar month. It is calculated using the following formula:

Monthly Uptime Percentage = (Total Minutes in Month – Downtime Minutes) / Total Minutes in Month × 100.

"Total Minutes in Month" refers to the total number of minutes in the calendar month for which the calculation is being performed. "Downtime Minutes" refers to the cumulative duration, in minutes, of confirmed Downtime within that same calendar month. This percentage is calculated by Corelane, Inc.'s monitoring systems and forms the basis for assessing compliance with Service Level Agreements.

"Service Credit" refers to a monetary credit, denominated in United States Dollars, that Corelane, Inc. may, at its sole discretion, apply to a customer's future Corelane API invoices. Service Credits are issued as a remedy for verified breaches of the applicable Service Level Agreement (SLA) for paid subscription tiers (Pro and Enterprise), as detailed in Section 6.0 of this policy. Service Credits are not transferable, have no cash value, and cannot be exchanged for cash. The application of a Service Credit is the sole and exclusive remedy for any failure by Corelane, Inc. to meet its SLA obligations. Service Credits do not constitute a refund and are distinct from any refund policies applicable to initial subscription periods or specific cancellation terms.

An "API Key" is a unique, alphanumeric string issued by Corelane, Inc. to a customer for the purpose of authenticating and authorizing access to the Corelane API. Each API Key is intrinsically linked to a specific customer account and is essential for making requests to Corelane API endpoints. Customers are solely responsible for the security and confidentiality of their API Keys. Any actions performed using a customer's API Key are deemed to be actions performed by that customer. Corelane, Inc. explicitly disclaims liability for any incidents or damages resulting from the leakage, compromise, or unauthorized use of a customer's API Key, as further detailed in Section 5.0 and Section 9.0.

A "Monthly Quota" represents the maximum aggregate volume of Corelane API requests that a customer is permitted to make within a single calendar month, as defined by their specific subscription tier. This quota is designed to ensure fair usage, maintain service stability, and prevent abuse of the Corelane API. Once a customer reaches their Monthly Quota, Corelane, Inc. reserves the right to temporarily suspend or throttle further API requests until the commencement of the next calendar month or until the customer upgrades their subscription tier. Monthly Quotas are distinct from, but work in conjunction with, rate limits (e.g., requests per minute, requests per day) which govern the speed at which requests can be made within shorter timeframes. Specific Monthly Quota allocations and associated rate limits are detailed in Section 7.0 of this policy.

### 3.0 Service Level Objectives and Agreements by Tier
Corelane, Inc. maintains distinct Service Level Objectives (SLOs) and Service Level Agreements (SLAs) tailored to the specific requirements of each subscription tier for the Corelane API. These commitments reflect our dedication to providing reliable LLM inference hosting and embedding generation services. The following provisions delineate the uptime guarantees and performance expectations associated with each tier, effective as of June 1, 2026.

### 3.1 Free Tier
For users subscribed to the Free tier, Corelane, Inc. provides service on a best-effort basis. There is no contractually guaranteed uptime associated with this tier. Consequently, Corelane, Inc. does not provide financial remedies, service credits, or performance guarantees for any downtime, latency, or service interruptions experienced by Free tier users. Users of this tier acknowledge that the service is provided 'as-is' and that Corelane, Inc. assumes no liability for service availability or performance degradation.

### 3.2 Pro Tier
Corelane, Inc. commits to a Monthly Uptime Percentage of 99.5% for the Pro tier. This uptime guarantee is calculated based on the total number of minutes in a given calendar month, excluding periods of scheduled maintenance or other exclusions defined in Section 5.0 of this policy. In the event that the Corelane API fails to meet the 99.5% uptime threshold, Pro tier customers may be eligible for service credits as outlined in Section 6.0. This commitment is intended to provide a stable environment for production-grade applications that require consistent access to inference and embedding capabilities.

### 3.3 Enterprise Tier
For Enterprise tier customers, Corelane, Inc. provides an enhanced uptime guarantee of 99.9%. This tier represents our highest level of service commitment, designed for mission-critical infrastructure. The 99.9% uptime objective is supported by rigorous monitoring and prioritized incident response protocols. Enterprise customers are entitled to specific remedies for any failure to meet this uptime SLA, as governed by their individual master service agreements. The 99.9% threshold is calculated monthly and excludes pre-approved maintenance windows and force majeure events as defined herein.

### 3.4 Summary of Uptime Commitments

| Subscription Tier | Uptime SLA | Service Guarantee Status |
| :--- | :--- | :--- |
| Free | N/A | Best-effort, not contractually guaranteed |
| Pro | 99.5% | Contractually guaranteed per SLA terms |
| Enterprise | 99.9% | Contractually guaranteed per SLA terms |

### 3.5 Operational Interpretation
It is imperative to note that the uptime percentages listed above refer specifically to the availability of the Corelane API endpoints. These metrics do not encompass the performance of third-party networks, the customer's own infrastructure, or any external dependencies outside the direct control of Corelane, Inc. The measurement of these objectives is conducted via internal monitoring systems, which serve as the definitive record for all SLA compliance calculations. Customers are encouraged to review Section 4.0 for a detailed explanation of the methodology used to calculate the Monthly Uptime Percentage and Section 6.0 for the specific procedures required to claim remedies should an SLA breach occur.

### 4.0 Service Availability Calculation Methodology
Corelane, Inc. employs a rigorous and transparent methodology to calculate the Monthly Uptime Percentage for the Corelane API, ensuring consistent and verifiable adherence to its Service Level Agreements (SLAs). This calculation is fundamental to determining service performance and, where applicable, eligibility for Service Credits.

The measurement period for Monthly Uptime Percentage is defined as a complete calendar month. For each calendar month, Corelane, Inc. continuously monitors the availability and performance of the Corelane API endpoints from multiple geographically distributed monitoring locations. These monitoring systems are designed to simulate actual customer requests, thereby providing an accurate representation of the service experience.

An "unavailability event" is formally declared when Corelane's monitoring systems detect that the Corelane API is returning an error rate exceeding a predefined threshold, or is otherwise unresponsive, for a continuous period of at least five (5) consecutive minutes. This threshold is set to distinguish between transient network issues or minor service fluctuations and actual service degradation impacting customer operations. The duration of an unavailability event is measured from the moment Corelane's monitoring systems first detect the issue until the Corelane API service is restored and operating within acceptable performance parameters. Partial unavailability, where a subset of API functionality or a limited number of requests are affected, may be aggregated to contribute to an unavailability event if the cumulative impact meets the defined criteria for service degradation.

The Monthly Uptime Percentage is calculated using the following formula:

`Monthly Uptime Percentage = ((Total Scheduled Monthly Minutes - Downtime Minutes) / Total Scheduled Monthly Minutes) * 100`

Where:
*   "Total Scheduled Monthly Minutes" represents the total number of minutes in the given calendar month. This figure accounts for all 24 hours a day, 7 days a week, throughout the entire month.
*   "Downtime Minutes" represents the aggregate number of minutes during which the Corelane API experienced an unavailability event within that same calendar month, as determined by Corelane, Inc.'s monitoring systems. Each unavailability event contributes its full duration to the "Downtime Minutes" total.

It is imperative to note that certain circumstances are explicitly excluded from the calculation of Downtime Minutes, as detailed in Section 5.0 of this policy, "Exclusions from Service Level Agreement." These exclusions typically include scheduled maintenance, customer-induced errors, or events beyond Corelane, Inc.'s reasonable control. The authoritative source for all uptime calculations and unavailability event determinations shall be Corelane, Inc.'s internal monitoring and logging systems. Corelane, Inc. maintains comprehensive records of service availability to support these calculations. This methodology is applied uniformly across all Corelane API subscription tiers, ensuring a consistent basis for evaluating service performance against the respective SLA commitments.

### 5.0 Exclusions from Service Level Agreement
The calculation of the Monthly Uptime Percentage for the Corelane API shall exclude any performance degradation, service interruption, or unavailability resulting from the following events or circumstances. Corelane, Inc. maintains that these exclusions are necessary to ensure the integrity of our service metrics and to delineate the boundaries of our operational responsibility.

### Excluded Events

1. **Scheduled Maintenance:** Any unavailability occurring during pre-announced maintenance windows. Corelane, Inc. will provide reasonable notice for such events, and these periods shall not be factored into the Monthly Uptime Percentage calculation.

2. **Force Majeure:** Any failure or delay in performance due to causes beyond the reasonable control of Corelane, Inc., including but not limited to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, network infrastructure failures, or strikes.

3. **Customer-Side Compromise:** Any service disruption, data breach, or unauthorized access resulting from the compromise of the customer’s infrastructure, local network, or hardware. This includes, without limitation, any incident directly or indirectly caused by the leakage, theft, or unauthorized disclosure of a customer’s API key.

4. **Usage Violations:** Any unavailability or throttling resulting from the customer’s failure to adhere to the established Monthly Quota or rate limits defined for their specific subscription tier. If a customer exceeds their allocated requests per minute or requests per day, any subsequent service degradation is deemed a result of customer usage patterns and is excluded from SLA calculations.

5. **Third-Party Dependencies:** Failures or delays caused by third-party software, hardware, or network services not under the direct control of Corelane, Inc., including public internet routing issues or failures in third-party cloud infrastructure providers.

6. **Beta or Experimental Features:** Any services, features, or endpoints explicitly designated as 'Beta,' 'Preview,' or 'Experimental' are provided on an 'as-is' basis and are excluded from all uptime guarantees and SLA calculations.

Corelane, Inc. expressly disclaims all liability for incidents arising from the aforementioned exclusions. Specifically, regarding security incidents, Corelane, Inc. shall not be held liable for any service impact or data exposure resulting from customer-side API key leakage or the failure of the customer to maintain adequate security protocols within their own environment. Customers are solely responsible for the secure management and rotation of their API keys to prevent unauthorized access.

### 6.0 Service Credits and Remedies for SLA Breach
Corelane, Inc. maintains a commitment to the operational integrity of the Corelane API. This section outlines the framework for addressing instances where service availability falls below the standards defined for paid subscription tiers. 

### 6.1 Eligibility and Assessment

Service Credits are available exclusively to Pro and Enterprise tier subscribers. The Free tier is provided on a best-effort basis and is ineligible for service credits. Eligibility for any remedy is contingent upon the customer’s account being in good standing and in full compliance with the Corelane API Terms of Service. Corelane, Inc. reserves the right to assess the validity of any claim based on internal system logs and performance metrics.

### 6.2 Claim Submission and Review

Eligible customers may submit a formal request for review following an incident of service unavailability. Such requests must be submitted within thirty (30) calendar days of the occurrence and must include comprehensive documentation regarding the impact of the event. Corelane, Inc. will evaluate the request, taking into account the severity, duration, and operational context of the reported outage. All determinations regarding the issuance of service credits are made at the sole discretion of Corelane, Inc.

### 6.3 Nature of Remedies

Where Corelane, Inc. determines that a remedy is appropriate, the company may issue service credits to the customer’s account. The value and nature of such credits are determined qualitatively, reflecting the specific circumstances of the service disruption. Service credits are applied solely as a reduction to future invoices and possess no cash value. For Enterprise customers, any specific remedies are governed by the terms set forth in their individual Enterprise Service Agreement.

### 6.4 Limitations and Exclusions

Service credits represent the sole and exclusive remedy for any failure to meet service availability standards. Corelane, Inc. disclaims liability for any indirect or consequential damages. Credits will not be issued for outages resulting from factors outside of Corelane, Inc.’s reasonable control, including but not limited to customer-side API key leakage, compromises to customer infrastructure, or scheduled maintenance.

### 7.0 Rate Limiting and Monthly Quota Policy
To maintain the integrity, stability, and equitable distribution of computational resources across the Corelane API infrastructure, Corelane, Inc. enforces strict rate limiting and monthly quota policies. These measures are designed to prevent service degradation and ensure that all users receive consistent performance according to their respective subscription tiers. Usage is monitored in real-time, and any request exceeding the defined thresholds will be rejected with a 429 Too Many Requests HTTP status code.

### Tiered Rate Limiting and Quota Specifications

The following table delineates the operational constraints applicable to each subscription tier. Users are responsible for architecting their applications to respect these limits to avoid service interruptions.

| Subscription Tier | Requests Per Minute | Requests Per Day | Burst Allowance |
| :--- | :--- | :--- | :--- |
| Free | 60 | 1,000 | None |
| Pro | 600 | 100,000 | +20% for up to 60 seconds |
| Enterprise | 2,000 (min) | Negotiated | Per negotiated SLA |

### Burst Allowance and Traffic Management

For Pro tier subscribers, Corelane, Inc. provides a burst allowance to accommodate transient spikes in traffic. This allowance permits a temporary increase of 20% above the standard requests-per-minute limit for a duration not exceeding 60 seconds. This feature is intended for short-term traffic volatility and should not be utilized as a sustained operational baseline. Corelane, Inc. reserves the right to throttle traffic that consistently exceeds the burst allowance threshold to protect the stability of the broader API ecosystem.

### Enforcement and Monitoring

Corelane, Inc. employs automated monitoring systems to track API key usage against the assigned monthly quota and rate limits. The 'requests per minute' metric is calculated on a rolling window basis. The 'requests per day' metric is calculated based on a 24-hour UTC cycle. It is the sole responsibility of the customer to monitor their own usage via the Corelane dashboard. Corelane, Inc. provides programmatic access to usage metrics, and customers are encouraged to implement exponential backoff strategies in their client-side code to gracefully handle rate-limit responses.

### Policy on Quota Exhaustion

Upon reaching the daily or monthly quota, the Corelane API will cease processing requests associated with the specific API key until the next reset period. For Free tier users, no additional capacity may be purchased. Pro tier users may contact support to discuss temporary quota adjustments if business requirements necessitate an increase, subject to approval and potential additional fees. Enterprise tier users are governed by the specific terms outlined in their individual service contracts, which may include provisions for overage charges or dynamic scaling.

### Prohibited Practices

Any attempt to circumvent these rate limits through the use of multiple API keys, distributed denial-of-service (DDoS) tactics, or other obfuscation techniques is strictly prohibited. Such actions constitute a material breach of the Corelane, Inc. Terms of Service and may result in the immediate suspension or permanent termination of the account, without prejudice to any other legal remedies available to Corelane, Inc. Customers are expected to maintain the security of their API key to prevent unauthorized third-party usage that could lead to inadvertent quota exhaustion.

### 8.0 Data Retention and Deletion Policy
Upon the termination of a Corelane API subscription, or upon the formal submission of a data deletion request by the account holder, Corelane, Inc. shall initiate the systematic removal of all customer-associated data from its production environments. This process is governed by the specific retention requirements associated with the customer’s subscription tier at the time of termination. Corelane, Inc. maintains distinct data lifecycle management protocols to ensure compliance with operational standards and regulatory obligations.

### Data Retention Periods by Subscription Tier

Following the effective date of account closure or the receipt of a valid deletion request, customer data shall be retained for the periods specified below before undergoing permanent, non-recoverable erasure:

| Subscription Tier | Data Retention Period |
| :--- | :--- |
| Free | 7 days |
| Pro | 30 days |
| Enterprise | 90 days, or per contract |

For Free tier accounts, the 7-day retention period serves as a grace period to facilitate potential account restoration. Upon the expiration of this 7-day window, all associated API keys, request logs, and stored embedding vectors are purged from active storage. Pro tier accounts are afforded a 30-day retention period, providing an extended window for data retrieval or account reactivation. Enterprise tier customers are subject to a 90-day retention period, unless otherwise stipulated in a separate, signed Master Service Agreement (MSA) or individual contract, which shall take precedence over these standard terms.

### Data Deletion Procedures

Corelane, Inc. employs industry-standard cryptographic erasure techniques to ensure that data is rendered unrecoverable once the retention period has elapsed. During the retention period, customer data remains subject to the same security and privacy controls as active accounts. However, the customer acknowledges that once the retention period concludes, Corelane, Inc. assumes no obligation to maintain, recover, or provide access to any data, including but not limited to historical request logs, custom model weights, or cached embedding outputs. 

It is the sole responsibility of the customer to export or backup any necessary data prior to the initiation of account termination. Corelane, Inc. shall not be held liable for any loss of data resulting from the expiration of these retention periods. Requests for expedited deletion may be submitted through the administrative dashboard; however, Corelane, Inc. reserves the right to verify the identity of the requestor before executing such actions. All data deletion processes are logged for internal audit purposes to ensure compliance with our internal data governance policies.

### 9.0 Security Incident Response and Notification
Corelane, Inc. maintains a robust and structured security incident response protocol designed to protect the integrity, confidentiality, and availability of the Corelane API and associated customer data. This protocol is integral to our commitment to providing a secure API-as-a-service for LLM inference hosting and embedding generation. Our security operations center operates continuously to detect, analyze, and respond to potential security threats and incidents affecting our infrastructure and services. Upon detection of any event that may compromise the security of the Corelane API or customer data, Corelane, Inc. initiates a predefined incident response plan to mitigate impact, restore service, and prevent recurrence.

Corelane, Inc. is committed to transparent and timely communication with affected customers in the event of a verified security incident. Should a security incident occur that impacts customer data or the operational security of the Corelane API, Corelane, Inc. shall endeavor to notify affected customers within seventy-two (72) hours of confirming the incident's scope and impact. This notification will be disseminated through official communication channels to ensure authenticity and reliability. The designated notification channels are:

*   **Registered Account Email:** An email will be dispatched to the primary email address associated with the customer's Corelane API account. It is the customer's responsibility to ensure this email address is current and actively monitored.
*   **In-Dashboard Alert Banner:** A prominent alert banner will be displayed within the customer's Corelane API dashboard, providing a direct and immediate notification upon login.

These notifications will contain pertinent information regarding the incident, including its nature, the potential impact on customer data or service, the steps Corelane, Inc. is taking to address the incident, and any recommended actions for the customer. Corelane, Inc. will provide updates as new material information becomes available, utilizing the same official channels. Customers are advised to rely solely on these official communications for information regarding security incidents.

Following any security incident that affects the Corelane API infrastructure or a customer's specific account, Corelane, Inc. mandates the rotation of all customer API keys associated with the affected services or accounts. This requirement is a critical security measure designed to neutralize any potential compromise of API keys that may have occurred during the incident, even if direct evidence of compromise is not immediately apparent. Customers are responsible for implementing this API key rotation promptly upon notification of an incident. Failure to rotate API keys following such a notification may expose customer accounts to continued risk and may impact Corelane, Inc.'s ability to provide full support or mitigate further unauthorized access. Corelane, Inc. provides tools and documentation within the Corelane API dashboard to facilitate secure API key management and rotation.

It is imperative for customers to understand the scope of Corelane, Inc.'s liability concerning security incidents. Corelane, Inc. explicitly excludes liability for incidents caused by customer-side API key leakage or customer infrastructure compromise. This exclusion encompasses, but is not limited to, scenarios where:

*   An API key is exposed due to insecure storage practices on the customer's systems.
*   Unauthorized access to the Corelane API occurs as a result of a breach or compromise of the customer's internal systems, networks, or applications.
*   Customer credentials or API keys are obtained through phishing, malware, or other social engineering attacks targeting customer personnel.
*   Any security vulnerability or misconfiguration within the customer's own infrastructure leads to unauthorized access to their Corelane API account or data.

Customers bear the primary responsibility for maintaining the confidentiality and security of their API keys and for securing their own infrastructure that interacts with the Corelane API. Corelane, Inc. provides guidance on secure API key management and integration best practices, and customers are strongly encouraged to adhere to these recommendations to minimize their exposure to such risks. Corelane, Inc.'s security measures are designed to protect the Corelane API service itself, and while we provide a secure platform, the security of the customer's environment and their handling of API keys remains their sole responsibility.

Upon resolution of a security incident, Corelane, Inc. conducts a thorough post-mortem analysis to identify root causes, evaluate the effectiveness of the response, and implement corrective and preventative actions. This continuous improvement process is fundamental to enhancing the overall security posture of the Corelane API. Corelane, Inc. may, at its discretion, share relevant non-confidential findings from such analyses with affected customers to aid in their own security enhancements.

### 10.0 API Versioning and Deprecation Policy
Corelane, Inc. maintains a rigorous API versioning and deprecation policy designed to ensure the long-term stability and reliability of the Corelane API while facilitating the continuous delivery of enhancements to our LLM inference and embedding generation services. To provide customers with a predictable environment for their production applications, Corelane, Inc. utilizes a URL path versioning scheme. This methodology requires that the version identifier be explicitly included in the base URI for all requests (e.g., `https://api.corelane.com/v1/` or `https://api.corelane.com/v2/`). This approach ensures that updates to the underlying model logic, response schemas, or endpoint behaviors do not disrupt existing integrations that rely on a specific version's contract.

### 10.1 Versioning Methodology and Breaking Changes

Corelane, Inc. distinguishes between breaking and non-breaking changes to the Corelane API. Non-breaking changes include, but are not limited to, the addition of new optional request parameters, the inclusion of additional fields in JSON response objects, or changes to the internal optimization of inference models that do not alter the output format. Such changes may be implemented within an existing API version without prior notice. 

Conversely, breaking changes—defined as the removal of existing endpoints, the renaming of required parameters, or significant modifications to the structure of response data—will always necessitate the issuance of a new API version. When a new version is released, the preceding version is officially designated as 'Deprecated.'

### 10.2 Deprecation Notice Period

Upon the designation of an API version as Deprecated, Corelane, Inc. provides a minimum deprecation notice period of 180 days. This 180-day window is intended to allow customers sufficient time to audit their current implementations, perform necessary code adjustments, and execute testing against the new API version. The notice period commences on the date the deprecation is officially announced via the registered account email and the in-dashboard alert banner, as specified in our communication protocols. During this 180-day period, the deprecated version of the Corelane API will remain fully operational and will continue to be governed by the Service Level Agreements (SLA) applicable to the customer’s subscription tier.

### 10.3 Tiered Migration Support

Corelane, Inc. recognizes that migrating between API versions requires varying levels of technical effort. To assist in this transition, we provide migration support tailored to each subscription tier:

| Subscription Tier | Migration Support Level |
| :--- | :--- |
| **Free** | Access to comprehensive online documentation, including migration guides and updated API references. Support is limited to self-service resources. |
| **Pro** | All documentation provided to the Free tier, supplemented by email-based technical support. Pro customers may submit inquiries regarding specific migration challenges during the 180-day window. |
| **Enterprise** | Dedicated migration engineering support. Enterprise customers are assigned a technical point of contact to assist with architectural reviews, migration planning, and direct engineering guidance to ensure a seamless transition. |

### 10.4 Decommissioning and End of Life

At the conclusion of the 180-day deprecation notice period, the deprecated API version will reach its 'End of Life' (EOL) status. At this point, Corelane, Inc. will decommission the associated endpoints, and any requests made using the EOL version identifier will result in a 410 Gone or 404 Not Found error. It is the sole responsibility of the customer to ensure that their API keys and infrastructure are updated to point to a supported version of the Corelane API prior to the EOL date. Corelane, Inc. shall not be liable for any service interruptions resulting from a customer's failure to migrate from a decommissioned API version within the allotted 180-day timeframe.

### 11.0 Customer Responsibilities
The integrity and performance of the Corelane API are contingent upon the diligent fulfillment of specific responsibilities by the Customer. Primarily, the Customer assumes absolute responsibility for the management, confidentiality, and security of all issued API keys. Corelane, Inc. expressly excludes any and all liability for security incidents, data breaches, or unauthorized access resulting from customer-side API key leakage or the compromise of the Customer’s internal infrastructure. It is the Customer’s obligation to implement robust internal controls and secure storage mechanisms to prevent the unauthorized disclosure or misappropriation of these credentials.

Furthermore, Customers must ensure that their utilization of the Corelane API remains within the parameters of their designated subscription tier. This includes strict adherence to the monthly quota and rate limits established for the Free, Pro, and Enterprise tiers. For instance, Pro tier users must manage their request volume to align with the 600 requests per minute limit, while accounting for the provided burst allowance of +20% for durations not exceeding 60 seconds. Any attempt to circumvent these technical limitations or engage in prohibited activities—such as reverse engineering the inference hosting models or embedding generation processes—constitutes a material breach of this policy and may result in immediate service termination.

Technical compatibility is a prerequisite for continued service delivery. Customers are responsible for configuring their infrastructure to support Corelane’s URL path versioning scheme (e.g., /v1/, /v2/). Upon the issuance of a deprecation notice, which Corelane, Inc. provides at least 180 days in advance, the Customer must execute the necessary migrations to newer API versions. While Corelane provides varying levels of migration support based on the Customer’s tier, the ultimate execution of infrastructure updates remains the Customer’s duty.

Finally, in the event of a suspected or confirmed security incident, the Customer is contractually required to perform an immediate API key rotation. Failure to rotate keys following a notification from Corelane, Inc. may result in the temporary suspension of service to protect the broader ecosystem. Customers must also ensure that their registered account email is monitored continuously to receive critical security alerts and in-dashboard alert banners within the 72-hour notification window.

### 12.0 Support and Communication Channels
This section delineates the official channels through which Corelane API users may seek assistance, report service anomalies, and receive critical communications from Corelane, Inc.

For general inquiries, technical support, and the reporting of service issues, Corelane, Inc. provides a dedicated support portal accessible via the official Corelane website. Customers are encouraged to utilize this portal for submitting support tickets, which ensures efficient tracking and resolution of reported concerns. The level of support provided may vary by subscription tier, consistent with the service level commitments outlined in this policy. Specifically, Free tier users have access to comprehensive online documentation and community forums. Pro tier subscribers are afforded access to email-based technical support in addition to documentation. Enterprise tier clients benefit from dedicated account management and direct engineering support channels, as stipulated in their individual service contracts.

Corelane, Inc. maintains a public status page, accessible at status.corelane.com, which provides real-time information regarding the operational status of the Corelane API. All users are advised to consult this resource for immediate updates on service availability or scheduled maintenance. Official notifications regarding service status, policy amendments, security incidents, or other material changes will be disseminated via registered account email and prominently displayed through in-dashboard alert banners within the Corelane API management console. Customers are responsible for maintaining current and accurate contact information within their Corelane API account to ensure timely receipt of such critical communications.

### 13.0 Policy Updates and Amendments
Corelane, Inc. reserves the unilateral right to modify, amend, or replace this Service Level Agreement and Uptime Policy (the "Policy") at its sole discretion to reflect changes in legal requirements, industry standards, or service enhancements. This Policy, currently designated as Version 2.3, remains in full effect as of June 1, 2026, until such time as a subsequent version is formally published and enacted.

### 13.1 Notification of Amendments
In the event of a material amendment to this Policy, Corelane, Inc. shall provide notice to customers through the primary communication channels established in Section 12.0. These notification procedures include:
*   **Registered Account Email:** A formal notice sent to the administrative email address associated with the customer's account.
*   **In-Dashboard Alert Banner:** A prominent notification displayed within the Corelane API management console.

For modifications that significantly impact service commitments or financial obligations, Corelane, Inc. will endeavor to provide at least thirty (30) days' notice prior to the effective date of the revised Policy, unless such changes are necessitated by immediate security exigencies or regulatory mandates.

### 13.2 Acceptance of Terms
The "Effective Date" of any revised Policy will be clearly stated at the commencement of the updated document. A customer’s continued utilization of the Corelane API—including the generation of requests via an API key or the consumption of any portion of the monthly quota—following the effective date of an amendment constitutes binding legal acceptance of the revised terms. Customers who do not agree to the amended Policy must cease all use of the Corelane API and terminate their account prior to the effective date of the revisions.

### 14.0 Governing Law and Dispute Resolution
This Policy and any disputes arising out of or in connection with the Corelane API service shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of laws principles. 

Any legal action or proceeding arising under this Policy shall be brought exclusively in the federal or state courts located in the State of Delaware. Both Corelane, Inc. and the customer hereby consent to the personal jurisdiction and venue of such courts for the resolution of any such matters.

Prior to initiating any formal legal action, the parties agree to engage in good faith negotiations to resolve any dispute, controversy, or claim arising out of or relating to this Policy or the Corelane API service. Such negotiations shall commence promptly upon written notice from one party to the other detailing the nature of the dispute. If the parties are unable to resolve the dispute through negotiation within a reasonable period, either party may then pursue available legal remedies.
