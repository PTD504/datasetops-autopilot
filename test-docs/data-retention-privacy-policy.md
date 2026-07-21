# Corelane API Terms — Data Retention and Privacy Policy
**Version 2.3** · **Effective: June 1, 2026**

### 1.0 Introduction and Scope
This Data Retention and Privacy Policy (the "Policy") governs the retention and privacy practices of Corelane, Inc. ("Corelane," "we," "us," or "our") concerning the Corelane API, an API-as-a-service for LLM inference hosting and embedding generation (the "Service"). This Policy is an integral part of the Corelane API Terms of Service and applies to all users of the Corelane API, irrespective of their subscription tier.

The primary purpose of this Policy is to provide transparency regarding the lifecycle of data processed through the Corelane API. This includes detailing the types of data collected, the purposes for which such data is processed, the duration of its retention, and the procedures for its eventual deletion or anonymization. Adherence to this Policy is crucial for maintaining compliance with applicable data protection regulations and ensuring the security and privacy of customer data.

This Policy is effective as of June 1, 2026 (the "Effective Date"). All provisions herein shall apply from the Effective Date onwards. Corelane is committed to safeguarding the confidentiality and integrity of all data processed via the Corelane API. This commitment extends to implementing robust data handling procedures and maintaining appropriate technical and organizational measures to protect data throughout its lifecycle.

The scope of this Policy encompasses all data generated or processed in connection with the use of the Corelane API. This includes, but is not limited to:
*   **Customer Account Data:** Information provided by users during account creation and management.
*   **Usage Data:** Metrics and logs related to API calls, performance, and service utilization.
*   **Customer Data:** Any data, including text, code, or other information, submitted by customers to the Corelane API for processing, inference, or embedding generation.

Corelane reserves the right to amend this Policy periodically. Customers will be notified of any material changes in accordance with the procedures outlined in the Corelane API Terms of Service and Section 14.0 (Policy Versioning and Amendments) of this Policy. Continued use of the Corelane API after the Effective Date signifies acceptance of this Policy and any subsequent amendments.

### 2.0 Definitions
For the purposes of this Data Retention and Privacy Policy, the following terms shall have the meanings ascribed to them below. These definitions are intended to ensure consistent interpretation of Corelane, Inc.’s obligations and the rights of the customer regarding the Corelane API.

*   **API Key**: A unique alphanumeric string issued by Corelane, Inc. to a customer, serving as the primary credential for authenticating requests to the Corelane API. The security of this key is the sole responsibility of the customer.
*   **Corelane API**: The proprietary API-as-a-service platform provided by Corelane, Inc., designed for LLM inference hosting and embedding generation.
*   **Customer Data**: Any information, including text, prompts, or datasets, transmitted by the customer to the Corelane API for the purpose of processing, inference, or embedding generation.
*   **Monthly Quota**: The maximum volume of requests or data processing capacity allocated to a customer based on their selected service tier, as defined in the Corelane, Inc. service agreement.
*   **Service Tiers**: The distinct levels of service offered by Corelane, Inc., categorized as Free, Pro, and Enterprise. Each tier is subject to specific constraints, including rate limits, uptime SLAs, and data retention periods.
*   **Data Retention Period**: The duration for which Corelane, Inc. maintains Customer Data within its systems following a deletion request or the termination of a service agreement. This period varies by service tier:

| Service Tier | Retention Period (Post-Deletion) |
| :--- | :--- |
| Free | 7 days |
| Pro | 30 days |
| Enterprise | 90 days (or per contract) |

*   **Security Incident**: Any unauthorized access, acquisition, or disclosure of Customer Data or the compromise of Corelane, Inc. infrastructure that necessitates notification under Section 11.0. This definition explicitly excludes incidents resulting from customer-side API key leakage or the compromise of customer-side infrastructure.
*   **Uptime SLA**: The contractually defined percentage of time the Corelane API is expected to be operational and accessible. This metric is subject to the specific guarantees associated with the customer’s chosen service tier.
*   **Subprocessor**: Any third-party entity engaged by Corelane, Inc. to assist in the provision of the Corelane API, which may have access to or process Customer Data in accordance with our security standards.

These definitions apply to all documentation and agreements governing the use of the Corelane API, effective as of June 1, 2026, under Policy Version 2.3.

### 3.0 Data Collection and Processing
Corelane, Inc. collects and processes various categories of data in connection with the provision and operation of the Corelane API. This data collection is strictly limited to what is necessary for the performance of services, maintenance of security, compliance with legal obligations, and improvement of the Corelane API, in accordance with applicable data protection laws and regulations.

### 3.1 Customer Account Data

Upon registration for the Corelane API, Corelane, Inc. collects specific information pertaining to the customer account. This includes, but is not limited to, organizational name, contact person's name, email address, billing address, payment information, and other administrative details required for account setup and management. This data is essential for establishing and maintaining the contractual relationship, facilitating billing, providing customer support, and communicating important service updates or policy changes.

### 3.2 Usage Data

Corelane, Inc. automatically collects data related to the customer's interaction with the Corelane API. This Usage Data encompasses technical information generated during API calls, which is critical for monitoring service performance, ensuring system stability, and enforcing service-level agreements and monthly quotas. Collected Usage Data includes:

*   **API Request Metadata:** Timestamps of API requests, specific API endpoints accessed, request and response sizes, HTTP status codes, and originating IP addresses.
*   **API Key Identifiers:** Unique identifiers associated with the API key used for authentication of each request, enabling the tracking of individual customer usage against their allocated monthly quota and rate limits.
*   **Performance Metrics:** Data concerning API latency, error rates, and overall system health, utilized for diagnostic purposes and service optimization.
*   **Quota Consumption Metrics:** Detailed records of API calls made, enabling accurate calculation of monthly quota utilization and adherence to defined rate limits per minute and per day.

This Usage Data is primarily utilized for operational purposes, including service delivery, billing, capacity planning, security monitoring, and the identification of potential service abuses or anomalies.

### 3.3 Customer Data

Customer Data refers to the content, prompts, inputs, and other information that customers submit to the Corelane API for processing, such as for LLM inference hosting or embedding generation. Corelane, Inc. acts as a processor of this Customer Data, handling it strictly in accordance with the customer's instructions as implied by their use of the Corelane API. Corelane, Inc. does not use Customer Data for training its models, for marketing purposes, or for any purpose other than fulfilling the specific API request initiated by the customer.

Upon the customer's deletion of Customer Data from the Corelane API or termination of their Corelane API account, Corelane, Inc. initiates a process to securely delete or anonymize such data. The retention period for Customer Data following deletion or account termination varies based on the customer's service tier:

*   **Free Tier:** Customer Data is retained for 7 days.
*   **Pro Tier:** Customer Data is retained for 30 days.
*   **Enterprise Tier:** Customer Data is retained for 90 days, or as otherwise specified within the individual contract terms.

These retention periods are designed to allow for data recovery in case of accidental deletion by the customer, while ensuring timely and secure data disposal. During these retention periods, Customer Data remains subject to the same security and confidentiality safeguards as active data.

### 4.0 Lawful Basis for Processing
Corelane, Inc. processes personal data in strict accordance with applicable data protection regulations, ensuring that all processing activities are supported by a valid legal basis. The processing of data within the Corelane API is conducted under the following frameworks:

### 4.1 Contractual Necessity
For the majority of data processing activities, the lawful basis is the performance of the contract between the customer and Corelane, Inc. This includes the provision of LLM inference hosting and embedding generation services. Processing is necessary to authenticate requests via the API key, monitor adherence to the monthly quota, and ensure the delivery of service levels as defined by the customer's selected tier (Free, Pro, or Enterprise). Without the processing of this data, Corelane, Inc. would be unable to fulfill its obligations under the Terms of Service.

### 4.2 Legitimate Interests
Corelane, Inc. processes certain usage and technical data based on its legitimate interests in maintaining the security, integrity, and availability of the Corelane API. This includes, but is not limited to, the detection and mitigation of unauthorized access, the prevention of fraudulent activity, and the optimization of system performance. Such processing is conducted in a manner that does not override the fundamental rights and freedoms of the data subjects. 

### 4.3 Legal Obligations
In specific instances, Corelane, Inc. processes personal data to comply with mandatory legal obligations, such as responding to lawful requests from public authorities or fulfilling regulatory requirements related to financial record-keeping and security incident reporting. 

### 4.4 Consent
Where required by applicable law, Corelane, Inc. may rely on the explicit consent of the data subject for specific processing activities that fall outside the scope of contractual necessity or legitimate interests. Customers retain the right to withdraw such consent at any time, provided that such withdrawal does not impact the core functionality of the Corelane API services.

### 5.0 Data Usage and Purpose Limitation
Corelane, Inc. processes data collected in connection with the Corelane API strictly for the purposes necessary to provide, maintain, and improve the Corelane API, in alignment with the lawful bases articulated in Section 4.0 of this policy. This commitment ensures that all data handling is purposeful, transparent, and limited to the scope required for delivering a robust and secure service.

### 5.1 Service Provision

Data is utilized primarily to facilitate the core functionality of the Corelane API. This includes, but is not limited to, processing API requests for LLM inference hosting and embedding generation as initiated by the customer. API keys are employed for authentication and authorization, ensuring that only authorized entities can access and utilize the service. Customer account information is processed for subscription management, billing, and to provide access to specific service tiers and features. Usage data, such as request counts and throughput, is collected to accurately meter service consumption and apply appropriate charges or enforce monthly quotas.

### 5.2 Service Maintenance and Security

To ensure the continuous availability, stability, and security of the Corelane API, collected data is used for operational purposes. This encompasses monitoring system performance, identifying and resolving technical issues, and conducting necessary debugging. Data is also critical for detecting and preventing security incidents, fraudulent activities, and policy violations. This includes analyzing request patterns to identify potential abuse, enforcing rate limits, and safeguarding the integrity of the Corelane API infrastructure. Corelane, Inc. may analyze aggregated and anonymized operational data to proactively identify vulnerabilities and enhance system resilience.

### 5.3 Service Improvement

Corelane, Inc. employs data analysis to enhance the Corelane API's functionality, performance, and user experience. This involves analyzing aggregated and anonymized usage patterns to understand service demand, optimize resource allocation, and identify areas for feature development or existing feature refinement. It is a fundamental principle that Customer Data, specifically the content submitted by customers for LLM inference or embedding generation, is processed solely for the purpose of fulfilling the specific API request. Such Customer Data is not utilized for training Corelane's foundational models, developing new models, or for any other secondary purpose without explicit, separate consent from the customer. For Enterprise tier customers, any deviation from this principle would be explicitly defined and agreed upon within their individual service contract.

### 5.4 Data Minimization and Non-Secondary Use

Corelane, Inc. adheres to the principle of data minimization, processing only the data that is directly relevant and necessary for the stated purposes. Data collected in connection with the Corelane API is not used for marketing, advertising, or any other unrelated commercial purposes without the explicit and informed consent of the customer. Any processing beyond the scope of providing, maintaining, and improving the Corelane API is strictly prohibited unless mandated by legal obligation or explicitly agreed upon by the customer.

### 6.0 Data Storage and Security Measures
Corelane, Inc. maintains a rigorous security posture designed to protect the integrity, confidentiality, and availability of all data processed through the Corelane API. We employ a multi-layered defense-in-depth strategy that integrates technical controls, organizational policies, and continuous monitoring to mitigate risks associated with unauthorized access, disclosure, alteration, or destruction of information.

### Technical Safeguards
All data in transit is protected via Transport Layer Security (TLS) 1.3, ensuring that communications between the customer’s infrastructure and the Corelane API remain encrypted. At rest, Customer Data and account information are stored using industry-standard AES-256 encryption. Access to production environments is strictly restricted to authorized personnel, governed by the principle of least privilege, and requires multi-factor authentication (MFA) for all administrative access.

### API Key Security
Corelane, Inc. treats every API key as a highly sensitive credential. Customers are responsible for the secure management of their API keys. Our infrastructure monitors for anomalous patterns that may indicate a compromise of an API key. In the event of a detected security incident, Corelane, Inc. reserves the right to invalidate compromised credentials, and customers are required to rotate their API keys immediately to restore service continuity. Corelane, Inc. disclaims all liability for incidents arising from customer-side API key leakage or compromises within the customer’s own infrastructure.

### Organizational Controls
Corelane, Inc. conducts regular internal and third-party security audits to validate the efficacy of our controls. Our personnel undergo mandatory security awareness training, and access to sensitive systems is logged and audited on a continuous basis. We maintain a robust incident response framework that aligns with our commitment to transparency and regulatory compliance. As specified in our security incident response protocols, we commit to notifying affected customers within 72 hours of confirming a material security incident via the registered account email and the in-dashboard alert banner.

### Infrastructure Resilience
To ensure the reliability of the Corelane API, we implement redundant storage and compute architectures. Our uptime Service Level Agreements (SLA) are tiered according to the customer's subscription level:

| Service Tier | Uptime SLA |
| :--- | :--- |
| Free | Best-effort, not contractually guaranteed |
| Pro | 99.5% |
| Enterprise | 99.9% |

These safeguards are subject to periodic review and enhancement to address the evolving threat landscape. By utilizing the Corelane API, customers acknowledge that while Corelane, Inc. implements industry-leading security measures, no system can be rendered entirely immune to all potential threats. Customers are encouraged to implement their own complementary security measures, including robust monitoring of their own API usage and adherence to secure coding practices when integrating with our services.

### 7.0 Data Retention Policy
Corelane, Inc. is committed to the responsible and lawful retention of data processed through the Corelane API. This section delineates the policies governing the duration for which various categories of data are retained, ensuring compliance with legal obligations, contractual agreements, and operational necessities.

### 7.1 General Principles of Data Retention

Corelane, Inc. retains data only for the period strictly necessary to fulfill the purposes for which it was collected, to provide the Corelane API service, to comply with legal and regulatory obligations, to resolve disputes, and to enforce our agreements. Data retention periods are established based on the type of data, the service tier subscribed by the customer, and applicable legal requirements.

### 7.2 Customer Data Retention Post-Deletion

Upon a customer's explicit request for deletion of their data submitted via the Corelane API, or upon the termination of a customer's account, Corelane, Inc. implements a secure deletion process. Notwithstanding immediate cessation of active processing, a backup copy of such data may be retained for a limited period to facilitate recovery from accidental deletion or system failures, in accordance with the customer's subscribed service tier:

*   **Free Tier**: Customer data is retained for a period of **7 days** following deletion or account termination.
*   **Pro Tier**: Customer data is retained for a period of **30 days** following deletion or account termination.
*   **Enterprise Tier**: Customer data is retained for a period of **90 days**, or as specifically stipulated within the individual contractual agreement between Corelane, Inc. and the Enterprise customer, following deletion or account termination.

During these post-deletion retention periods, the data is maintained in an inactive state and is not subject to active processing, except as required for system integrity, legal compliance, or recovery operations. Following the expiration of these periods, all remaining copies of the customer data are securely and irrevocably deleted or anonymized.

### 7.3 Active Customer Data Retention

For the duration of an active Corelane API subscription, customer data submitted via the API is retained as necessary to provide the requested services. This includes, but is not limited to, data required for LLM inference hosting and embedding generation. Customers maintain control over their data and may delete it at any time through the provided API mechanisms or dashboard interfaces, at which point the post-deletion retention policies outlined in Section 7.2 will apply.

### 7.4 Account and Operational Data Retention

Beyond customer-submitted data, Corelane, Inc. retains certain account and operational data for specific purposes:

*   **Account Information**: Data pertaining to customer accounts, including registration details, contact information, and subscription status, is retained for the entire duration of the active account and for a period of up to seven (7) years thereafter. This retention is necessary for legal, audit, financial reporting, and dispute resolution purposes.
*   **Billing Records**: Financial transaction records, invoices, and payment history are retained for a period of up to seven (7) years, in compliance with applicable tax and accounting regulations.
*   **Service Usage Logs (Non-Content)**: Logs detailing API requests, system performance, and general service utilization (excluding customer-submitted content) are retained for operational analysis, security monitoring, and service improvement for a period of up to twenty-four (24) months. After this period, such logs are either aggregated, anonymized, or securely deleted.

### 7.5 Exceptions to Retention Periods

Notwithstanding the retention periods outlined above, Corelane, Inc. reserves the right to retain data for longer periods if required by law, court order, governmental or regulatory request, or if necessary to protect the legal rights, safety, or property of Corelane, Inc., its customers, or the public. Data subject to a legal hold or ongoing investigation will be retained until the resolution of such matters.

### 7.6 Policy Review

Corelane, Inc. periodically reviews its data retention policies and practices to ensure ongoing compliance with evolving legal and regulatory requirements and industry best practices.

### 8.0 Data Deletion and Anonymization
Corelane, Inc. is committed to the secure and timely deletion or anonymization of data that is no longer required for the provision of the Corelane API, or upon valid request from the customer. This section outlines the procedures and timelines governing the removal of Customer Data and associated information from Corelane, Inc. systems. Data deletion or anonymization is initiated upon the expiration of defined retention periods, as detailed in Section 7.0, or following a customer's explicit request for data removal or account termination.

Upon the initiation of a deletion event, Corelane, Inc. employs industry-standard secure deletion methodologies designed to render data irrecoverable. This process includes the logical deletion of data from active systems and the subsequent physical or cryptographic erasure from backup and archival storage within specified timeframes. The duration for which Customer Data remains in Corelane, Inc.'s systems following a customer-initiated deletion request or account termination is contingent upon the customer's service tier:

*   **Free Tier**: Customer Data will be securely deleted from Corelane, Inc. systems within seven (7) days following the effective date of the deletion request or account termination.
*   **Pro Tier**: Customer Data will be securely deleted from Corelane, Inc. systems within thirty (30) days following the effective date of the deletion request or account termination.
*   **Enterprise Tier**: Customer Data will be securely deleted from Corelane, Inc. systems within ninety (90) days following the effective date of the deletion request or account termination, or as otherwise stipulated in the individual contractual agreement between Corelane, Inc. and the Enterprise customer.

During these post-deletion retention periods, data is maintained solely for operational integrity, legal compliance, and to facilitate potential account reactivation, if applicable and permissible. Access to such data is strictly limited and subject to the same stringent security controls as active data.

In certain circumstances, Corelane, Inc. may anonymize data instead of, or in addition to, deletion. Anonymization processes are designed to irreversibly remove or alter personally identifiable information such that the data subject cannot be identified directly or indirectly. Anonymized data, particularly aggregated usage statistics or performance metrics, may be retained indefinitely for product improvement, statistical analysis, and research purposes, provided that it cannot be linked back to an individual customer or data subject. This ensures that Corelane, Inc. can continue to enhance the Corelane API while upholding privacy commitments.

Notwithstanding the above, Corelane, Inc. reserves the right to retain certain data for longer periods if required by applicable law, regulatory obligations, or for the establishment, exercise, or defense of legal claims. Such data retention will be strictly limited to the minimum necessary scope and duration. Furthermore, data residing in system backups may be retained until the backup media is cycled out of use and securely destroyed, a process that may extend beyond the primary deletion timelines but is subject to strict access controls. Customers are solely responsible for exporting any data they wish to retain prior to initiating a deletion request or account termination. Corelane, Inc. will not be liable for any data loss resulting from a customer's failure to retrieve their data before deletion.

### 9.0 Data Sharing and Disclosure
Corelane, Inc. maintains a strict policy of data confidentiality and limits the disclosure of Customer Data to third parties to the minimum extent necessary to provide the Corelane API. We do not sell, rent, or lease Customer Data to third parties for marketing or advertising purposes. Disclosure is strictly confined to the following categories and circumstances:

### 9.1 Subprocessors and Service Providers
Corelane, Inc. engages select third-party subprocessors to assist in the delivery, maintenance, and security of the Corelane API. These entities may include, but are not limited to, cloud infrastructure providers, data center operators, and security monitoring services. All such subprocessors are subject to rigorous contractual obligations that mandate the protection of Customer Data at a standard equivalent to or exceeding the protections outlined in this policy. Access to Customer Data by these subprocessors is restricted to the specific functions required to support the Corelane API infrastructure.

### 9.2 Legal and Regulatory Compliance
Corelane, Inc. may disclose Customer Data if required to do so by law, regulation, or legal process, such as a subpoena, court order, or request from a government authority. In such instances, Corelane, Inc. will, to the extent legally permissible, provide the affected customer with prompt notice of the request to allow the customer to seek a protective order or other appropriate remedy. Corelane, Inc. reserves the right to disclose information where it believes, in good faith, that such action is necessary to comply with applicable laws, protect the rights or property of Corelane, Inc., or ensure the safety of our users and the public.

### 9.3 Business Transfers
In the event of a merger, acquisition, reorganization, or sale of all or a portion of Corelane, Inc.’s assets, Customer Data may be transferred as part of the transaction. In such an event, Corelane, Inc. will ensure that the acquiring entity adheres to the data protection obligations set forth in this policy and will provide notification to customers via their registered account email prior to the transfer of sensitive data.

### 9.4 Security Incident Disclosure
In accordance with our security protocols, Corelane, Inc. may share anonymized or aggregated metadata with third-party security auditors or law enforcement agencies in the event of a security incident. Such disclosures are limited to information necessary to investigate the incident and prevent further unauthorized access. As specified in our security incident response policy, Corelane, Inc. will notify customers within 72 hours of identifying a material breach, utilizing the registered account email and the in-dashboard alert banner, provided that such notification does not compromise ongoing forensic investigations or legal requirements.

### 10.0 Customer Responsibilities for Data Security
Customers of the Corelane API bear primary and sole responsibility for the security and integrity of their API keys and any data processed or transmitted through their utilization of the Corelane API. This obligation extends to all aspects of API key management and the secure integration of the Corelane API within the customer's operational environment.

**10.1 API Key Management**
Customers are solely responsible for maintaining the confidentiality and security of their API keys. This responsibility encompasses, but is not limited to, the following:
*   **Secure Storage:** API keys must be stored securely, utilizing industry-standard practices such as encryption at rest and robust access controls. API keys shall not be embedded directly into client-side code, publicly accessible repositories, or unencrypted configuration files.
*   **Access Control:** Access to API keys must be strictly limited to authorized personnel who require such access for legitimate operational purposes. Multi-factor authentication and the principle of least privilege shall be applied.
*   **Regular Rotation:** Customers are strongly advised to implement a policy of regular API key rotation. In the event of any suspected or actual compromise of an API key, immediate rotation is mandatory.
*   **Proactive Monitoring:** Customers shall implement monitoring mechanisms to detect unauthorized use or anomalous activity associated with their API keys.

Corelane, Inc. explicitly disclaims liability for any security incidents, data breaches, or other damages arising from customer-side API key leakage or any compromise of customer infrastructure. The security measures implemented by Corelane, Inc. pertain exclusively to the Corelane API infrastructure and do not extend to the customer's systems or the handling of API keys within the customer's control.

**10.2 Customer Data Responsibility**
Customers are solely responsible for the legality, accuracy, quality, and integrity of all data, including any personal data, that they submit to or process using the Corelane API. This includes ensuring that:
*   All data transmitted to the Corelane API complies with applicable laws, regulations, and contractual obligations, including data protection and privacy laws in all relevant jurisdictions.
*   Customers possess all necessary rights, consents, and permissions to collect, process, and transmit such data to Corelane, Inc. for the purposes of utilizing the Corelane API.
*   Data minimization principles are applied, and only data strictly necessary for the intended use of the Corelane API is transmitted.
*   Appropriate security measures are implemented by the customer to protect data prior to its transmission to the Corelane API and upon its retrieval.

Corelane, Inc. acts as a data processor for customer data submitted via the Corelane API. The customer remains the data controller and is responsible for fulfilling all obligations incumbent upon a data controller under applicable data protection legislation. Any security incident or data breach originating from the customer's systems, networks, or processes, prior to data ingress into Corelane, Inc.'s controlled environment or subsequent to data egress, falls under the sole responsibility of the customer.

### 11.0 Security Incident Response
Corelane, Inc. maintains a rigorous security incident response framework designed to identify, mitigate, and remediate potential threats to the Corelane API infrastructure. Upon the detection of a confirmed security incident that compromises the confidentiality, integrity, or availability of Customer Data, Corelane, Inc. shall initiate its internal incident response protocol. This protocol ensures that all identified vulnerabilities are addressed with the urgency commensurate with the severity of the threat.

### Notification Obligations
In the event of a security incident, Corelane, Inc. commits to notifying affected customers within a maximum window of 72 hours from the point of formal confirmation of the incident. Notifications shall be disseminated through the following designated channels to ensure receipt:

* Registered account email address associated with the primary account holder.
* In-dashboard alert banner displayed upon the customer's next successful authentication to the Corelane API management console.

### Remediation and Key Management
Security integrity is a shared responsibility. Following any confirmed security incident, Corelane, Inc. mandates the immediate rotation of the affected API key. Customers are required to generate a new API key via the management console and update their respective integrations to maintain service continuity. Failure to rotate an API key following a notified incident may result in the suspension of service to prevent further unauthorized access or data exfiltration.

### Liability and Exclusions
Corelane, Inc. assumes responsibility for security incidents originating within its proprietary infrastructure and managed services. However, in accordance with our terms of service, Corelane, Inc. expressly disclaims all liability for security incidents, data breaches, or unauthorized access resulting from customer-side failures. Specifically, Corelane, Inc. liability excludes:

1. Incidents caused by the leakage, improper storage, or unauthorized disclosure of an API key by the customer or their personnel.
2. Compromises originating from the customer’s own infrastructure, third-party integrations, or local network environments.
3. Failure of the customer to implement adequate access controls or security patches within their own operational environment.

### Incident Review
Following the resolution of a significant security incident, Corelane, Inc. may, at its sole discretion, provide an incident summary report to Enterprise-tier customers, detailing the nature of the breach, the scope of the impact, and the corrective measures implemented to prevent recurrence. For Free and Pro-tier customers, Corelane, Inc. will provide general status updates via the official service health dashboard. All incident response activities are conducted in strict adherence to the data protection standards outlined in this policy and applicable regulatory requirements.

### 12.0 Data Subject Rights
Corelane, Inc. recognizes the fundamental importance of data privacy and the rights afforded to individuals under applicable data protection regulations. As a provider of the Corelane API, we are committed to facilitating the exercise of these rights for all data subjects whose personal information is processed within our infrastructure. This section delineates the rights available to individuals and the formal procedures required to exercise such rights in connection with our services.

### 12.1 Scope of Data Subject Rights
Individuals whose personal data is processed by Corelane, Inc. possess the following rights, subject to the limitations and exceptions provided by applicable law:

*   **Right of Access:** The right to request confirmation as to whether Corelane, Inc. is processing personal data concerning them and to obtain access to such data.
*   **Right to Rectification:** The right to request the correction of inaccurate or incomplete personal data held by Corelane, Inc.
*   **Right to Erasure (Right to be Forgotten):** The right to request the deletion of personal data, provided that such data is no longer necessary for the purposes for which it was collected or processed, or where the legal basis for processing is withdrawn.
*   **Right to Restrict Processing:** The right to request the limitation of processing activities under specific circumstances, such as when the accuracy of the data is contested.
*   **Right to Data Portability:** The right to receive personal data provided to Corelane, Inc. in a structured, commonly used, and machine-readable format.
*   **Right to Object:** The right to object to the processing of personal data based on legitimate interests or the performance of a task in the public interest.

### 12.2 Procedures for Exercising Rights
To exercise any of the aforementioned rights, data subjects must submit a formal request to our designated privacy office. Requests must be submitted in writing and include sufficient information to verify the identity of the requester. Corelane, Inc. reserves the right to request additional information to authenticate the identity of the individual before fulfilling the request.

Upon receipt of a valid request, Corelane, Inc. will process the inquiry in accordance with statutory timelines. Please note that while we strive to accommodate all requests, our ability to fulfill them may be constrained by our legal obligations, the necessity of data for the continued provision of the Corelane API, or the specific retention requirements associated with the customer's service tier (Free, Pro, or Enterprise). For instance, data deletion requests will be processed in alignment with the retention periods specified in Section 7.0, ensuring that data is purged from our systems within the applicable 7, 30, or 90-day windows post-deletion, depending on the service tier. All inquiries regarding these rights should be directed to the contact information provided in Section 16.0.

### 13.0 International Data Transfers
Corelane, Inc. operates the Corelane API globally, necessitating the potential transfer and processing of data across international borders. Such transfers may occur when data is processed by Corelane, Inc. personnel, its affiliates, or third-party subprocessors located in jurisdictions outside of the user's originating region. Corelane, Inc. is committed to ensuring that all international data transfers are conducted in compliance with applicable data protection laws and regulations, maintaining a high standard of data privacy and security regardless of the data's geographical location.

To facilitate lawful international data transfers, Corelane, Inc. implements robust legal and technical safeguards. For transfers of personal data originating from the European Economic Area (EEA), United Kingdom, or Switzerland to countries not deemed to provide an adequate level of data protection by the relevant authorities, Corelane, Inc. relies on appropriate transfer mechanisms. These mechanisms primarily include the use of Standard Contractual Clauses (SCCs) as approved by the European Commission or other competent regulatory bodies, integrated into our data processing agreements with subprocessors and internal company policies. These clauses impose contractual obligations on the data importer to protect the data to the standard required by European data protection law.

Furthermore, Corelane, Inc. conducts thorough due diligence on all third-party subprocessors involved in data processing activities, irrespective of their location. This due diligence ensures that subprocessors maintain security measures and data protection practices commensurate with Corelane, Inc.'s internal standards and regulatory requirements. Technical safeguards, including end-to-end encryption for data in transit and robust encryption for data at rest, are uniformly applied to protect data during and after international transfers. Access to data, regardless of its location, is strictly controlled and monitored, adhering to the principle of least privilege.

Corelane, Inc. also monitors developments in data protection laws and guidance concerning international data transfers to adapt its practices as necessary. In the event of governmental requests for data, Corelane, Inc. assesses such requests rigorously to ensure their legal validity and proportionality, challenging them where appropriate, and notifying affected customers unless legally prohibited. The overarching objective is to ensure that data processed via the Corelane API retains its protected status throughout its lifecycle, including during any cross-border movements.

### 14.0 Policy Versioning and Amendments
Corelane, Inc. reserves the right to amend, modify, or update this Data Retention and Privacy Policy at its sole discretion. Each iteration of this policy shall be identified by a distinct version number and an effective date, currently designated as Version 2.3, effective June 1, 2026.

Amendments may be necessitated by various factors, including, but not limited to, changes in applicable laws, regulations, industry standards, Corelane, Inc.'s service offerings, or internal operational procedures. Corelane, Inc. is committed to ensuring that this policy accurately reflects its data processing practices and legal obligations.

In the event of any material changes to this policy, Corelane, Inc. shall provide reasonable prior notice to its customers. Such notification will be disseminated through official communication channels, which may include, but are not limited to, the registered account email address associated with the customer's Corelane API account, prominent in-dashboard alert banners within the Corelane API management portal, and publication on the official Corelane, Inc. website. The notification will clearly indicate the nature of the material changes, the revised policy's effective date, and a direct link to the updated document.

Customers are responsible for reviewing any revised policy. Continued access to or use of the Corelane API after the effective date of any such amendments shall constitute the customer's unequivocal acceptance of the revised Data Retention and Privacy Policy. Should a customer not agree with the terms of a revised policy, their sole recourse is to cease all use of the Corelane API and terminate their account in accordance with the Corelane API Terms of Service.

### 15.0 Limitation of Liability
Corelane, Inc. maintains a robust framework for data security; however, the liability of Corelane, Inc. regarding data privacy and security is strictly limited to the scope of its direct operational control. Corelane, Inc. expressly disclaims all liability for any data breaches, unauthorized access, or loss of data resulting from circumstances outside of its reasonable control or infrastructure.

Specifically, Corelane, Inc. shall not be held liable for any security incidents, data exfiltration, or service disruptions arising from the following:

*   **Customer-Side API Key Leakage:** Any unauthorized access to the Corelane API resulting from the failure of the customer to maintain the confidentiality of their API key, including but not limited to improper storage, accidental exposure in public repositories, or unauthorized sharing of credentials.
*   **Customer Infrastructure Compromise:** Any breach originating from the customer’s own systems, networks, or third-party integrations that interact with the Corelane API.
*   **Unauthorized Use:** Any actions taken by third parties using a valid API key, regardless of whether such use was authorized by the account holder.

In accordance with the security protocols of Corelane, Inc., customers bear the sole responsibility for the management and rotation of their API keys. While Corelane, Inc. provides notification of security incidents within 72 hours via registered account email and in-dashboard alert banners, this obligation is contingent upon the incident occurring within the Corelane-managed environment. Corelane, Inc. assumes no liability for damages, loss of profits, or loss of data arising from the customer's failure to implement adequate security measures on their own infrastructure. To the maximum extent permitted by applicable law, the total aggregate liability of Corelane, Inc. for any claims related to data privacy or security shall not exceed the total fees paid by the customer to Corelane, Inc. during the twelve-month period immediately preceding the event giving rise to the claim.

### 16.0 Contact Information
For inquiries, formal notices, or concerns regarding the interpretation, implementation, or compliance of this Data Retention and Privacy Policy, customers and data subjects are directed to contact the Corelane, Inc. Legal and Compliance Department. All official correspondence must be submitted in writing to ensure proper documentation and timely resolution.

### Designated Contact Channels

*   **General Privacy Inquiries:** For questions regarding data processing activities or the exercise of data subject rights, please direct communications to privacy@corelane.com.
*   **Legal Notices:** Any formal legal notices, including those pertaining to liability, contractual disputes, or regulatory inquiries, must be sent via certified mail to our corporate headquarters at: Corelane, Inc., Legal Department, 1000 Enterprise Way, Suite 500, San Francisco, CA 94107.
*   **Security and Incident Reporting:** In the event of a suspected security incident or to report a potential vulnerability, please contact our security operations center immediately at security-ops@corelane.com. 

Corelane, Inc. endeavors to acknowledge receipt of all formal inquiries within five business days. Please note that inquiries regarding specific account configurations or technical support should be directed through the Corelane API dashboard support portal, as the Legal and Compliance Department is exclusively reserved for policy-related matters and regulatory governance.
