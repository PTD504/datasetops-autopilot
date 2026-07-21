# Corelane API Terms — Security Incident Response Policy
**Version 2.3** · **Effective: June 1, 2026**

### 1.0 Introduction and Purpose
This Security Incident Response Policy (the "Policy") establishes the formal framework governing the identification, management, and remediation of security incidents affecting the Corelane API, a service provided by Corelane, Inc. The primary objective of this Policy is to ensure the integrity, confidentiality, and availability of the Corelane API infrastructure while maintaining transparency with our customers regarding potential security threats. This document applies to all Corelane API services, including LLM inference hosting and embedding generation, and is binding for all users of the Corelane API platform.

Corelane, Inc. is committed to maintaining a robust security posture. This Policy outlines the structured methodologies employed by our security operations teams to detect, analyze, and mitigate risks. By utilizing the Corelane API, customers acknowledge that they are subject to the protocols defined herein, including mandatory notification timelines and requirements for API key management following a security event. 

Key operational parameters defined within this Policy include:

* **Notification Window:** Corelane, Inc. commits to notifying affected customers of confirmed security incidents within 72 hours of verification.
* **Communication Channels:** Notifications shall be disseminated exclusively via the registered account email and the in-dashboard alert banner.
* **Security Obligations:** Customers are required to perform mandatory API key rotation following any security incident identified by Corelane, Inc. as impacting their specific account credentials.

This Policy serves as an integral component of the Corelane API service agreement. It is designed to provide clarity on the division of responsibilities between Corelane, Inc. and its customers. While Corelane, Inc. maintains rigorous internal controls, this Policy explicitly disclaims liability for incidents arising from customer-side API key leakage or compromises within the customer's own infrastructure. Adherence to these procedures is essential for the continued secure operation of the Corelane API ecosystem.

### 2.0 Definitions
### API Key
A unique, confidential alphanumeric string issued by Corelane, Inc. to a Customer, serving as the primary authentication credential for accessing and utilizing the Corelane API. Customers bear sole responsibility for the security and protection of their API Keys, and any compromise thereof.

### Corelane API
The proprietary API-as-a-service provided by Corelane, Inc. for large language model (LLM) inference hosting and embedding generation.

### Customer
Any individual, entity, or organization registered with Corelane, Inc. and utilizing the Corelane API under the established terms of service.

### Customer Key Rotation
The mandatory process for Customers to generate a new API key and revoke any previously issued API key that has been compromised or is suspected of compromise, as required following a confirmed Security Incident.

### Customer Notification Window
The maximum timeframe of 72 hours from incident confirmation within which Corelane, Inc. will notify affected Customers of a confirmed Security Incident. Notifications will be disseminated via the Customer's registered account email and through an in-dashboard alert banner.

### Data Retention
The policy governing the storage duration of Customer data and incident-related information by Corelane, Inc. following account termination or explicit data deletion requests. Retention periods vary by service tier:
*   **Free Tier**: 7 days after deletion.
*   **Pro Tier**: 30 days after deletion.
*   **Enterprise Tier**: 90 days after deletion, or as specifically stipulated in the individual contractual agreement.

### Corelane Liability Exclusions
Specific circumstances under which Corelane, Inc. disclaims responsibility for damages, losses, or service interruptions arising from a Security Incident. These exclusions specifically encompass incidents caused by customer-side API key leakage or compromise of customer infrastructure.

### Monthly Quota
The maximum volume of API requests or computational units allocated to a Customer's account per calendar month, determined by their subscribed service tier.

### Rate Limit
The maximum number of API requests permitted from a Customer's API key within specified time intervals (per minute, per day). Rate limits are tiered:
*   **Free Tier**: 60 requests per minute, 1000 requests per day.
*   **Pro Tier**: 600 requests per minute, 100,000 requests per day.
*   **Enterprise Tier**: Negotiated, with a minimum threshold of 2000 requests per minute.

### Security Incident
An event or series of events that compromises or poses significant risk to the confidentiality, integrity, or availability of Corelane, Inc.'s systems, data, or the Corelane API.

### Uptime SLA (Service Level Agreement)
A contractual commitment by Corelane, Inc. regarding the operational availability of the Corelane API. Uptime SLAs are tiered:
*   **Free Tier**: Service is provided on a best-effort basis; uptime is not contractually guaranteed.
*   **Pro Tier**: A 99.5% uptime guarantee is provided.
*   **Enterprise Tier**: A 99.9% uptime guarantee is provided, with specific terms detailed in the individual contract.

### API Version Deprecation Notice
The minimum 180-day advance notification period provided by Corelane, Inc. before an older Corelane API version is retired and no longer supported.

### 3.0 Incident Classification and Severity Levels
This section delineates the established criteria and systematic methodology employed by Corelane, Inc. for the classification and assignment of severity levels to security incidents impacting the Corelane API and its underlying infrastructure. This ensures a consistent, objective, and timely response commensurate with actual and potential impact.

Corelane, Inc. classifies security incidents based on a comprehensive assessment of critical factors, including: the scope of affected systems or data, the confidentiality, integrity, and availability (CIA) impact on Corelane API services, the number and type of affected customers, potential financial and reputational damage, and relevant regulatory or contractual obligations. This multi-faceted evaluation ensures incidents are prioritized and managed effectively.

### 3.1 Incident Severity Levels

Corelane, Inc. categorizes security incidents into four distinct severity levels, each dictating the urgency and resources allocated for response:

*   **Severity 1: Critical**
    *   **Definition:** Widespread, sustained outage or complete unavailability of the Corelane API, or a confirmed breach of sensitive customer data affecting multiple Corelane API users. Includes incidents compromising the core integrity of the Corelane API platform.
    *   **Impact:** Severe and immediate operational disruption for a significant customer base. Direct violation of contractual uptime Service Level Agreements (SLAs) for Pro (99.5%) and Enterprise (99.9%) tier customers. Significant financial, reputational, and legal implications.
    *   **Examples:** Global Corelane API service outage, mass exfiltration of customer API keys, complete compromise of Corelane API production databases.

*   **Severity 2: High**
    *   **Definition:** Significant degradation of Corelane API services, localized outages affecting a substantial subset of customers, or a confirmed breach of sensitive customer data impacting a single customer or limited group. Encompasses compromise of critical, non-core infrastructure components.
    *   **Impact:** Substantial operational disruption for affected customers, potentially violating Pro tier uptime SLAs. Moderate financial, reputational, and legal implications. Requires immediate attention.
    *   **Examples:** Regional Corelane API endpoint failure, unauthorized access to specific customer data, exploitation of a critical vulnerability in a non-core service.

*   **Severity 3: Medium**
    *   **Definition:** Minor service disruptions, performance degradation, or potential exposure of non-sensitive data without confirmed exfiltration. Includes exploitation of vulnerabilities with limited impact or scope, or policy violations not immediately compromising system integrity or customer data.
    *   **Impact:** Limited operational impact on a small number of customers or specific functionalities. No immediate violation of contractual uptime SLAs. Requires prompt investigation and remediation.
    *   **Examples:** Intermittent latency spikes affecting an API endpoint, discovery of a medium-severity vulnerability, blocked unauthorized access attempts indicating potential weakness.

*   **Severity 4: Low**
    *   **Definition:** Minor security policy violations, discovery of low-severity vulnerabilities with minimal exploitability, or non-critical system anomalies not directly impacting Corelane API service availability, integrity, or customer data.
    *   **Impact:** Negligible operational impact. Primarily requires documentation, routine investigation, and remediation during scheduled maintenance.
    *   **Examples:** Failed login attempts indicating brute-force activity, informational security misconfiguration, minor compliance deviations.

### 3.2 Severity Assignment Methodology

The assignment of an incident's severity level is an initial assessment by the Corelane Incident Response Team upon detection and preliminary analysis. This assessment considers immediate impact, potential for escalation, and specific contractual obligations pertaining to affected customer tiers. For instance, an incident affecting an Enterprise tier customer may be assigned a higher severity due to the stringent 99.9% uptime SLA and customized data retention terms, compared to an identical incident affecting a Free tier customer, which operates under a "Best-effort" uptime commitment. Severity levels are dynamic and may be re-evaluated and adjusted throughout the incident response lifecycle as more information becomes available or as the incident's scope or impact changes.

### 4.0 Roles and Responsibilities
The efficacy of the Corelane, Inc. security posture relies upon the clearly defined roles and responsibilities of the Corelane Incident Response Team (CIRT) and associated organizational stakeholders. The CIRT is the primary body responsible for the orchestration, execution, and oversight of all activities related to the identification, containment, and remediation of security incidents affecting the Corelane API. The team is structured to ensure rapid decision-making, technical precision, and adherence to the service level agreements (SLAs) defined for Free, Pro, and Enterprise tiers.

### 4.1 Corelane Incident Response Team (CIRT) Composition
The CIRT is comprised of cross-functional personnel, including:

*   **Incident Commander (IC):** The IC holds ultimate authority during an active incident. This individual is responsible for the strategic direction of the response, resource allocation, and final approval of communication strategies directed toward affected customers.
*   **Technical Lead:** Responsible for the forensic analysis, containment of the threat, and the technical restoration of services. The Technical Lead ensures that all actions taken are consistent with the integrity of the Corelane API infrastructure.
*   **Legal and Compliance Counsel:** This role ensures that all response actions comply with regulatory requirements and the contractual obligations set forth in the Corelane API service agreements, including the 72-hour customer notification window.
*   **Communications Liaison:** Tasked with managing the dissemination of information via the registered account email and the in-dashboard alert banner, ensuring that all messaging is accurate, timely, and consistent with the severity levels established in Section 3.0.

### 4.2 Functional Responsibilities
Each member of the CIRT is bound by the following operational mandates:

1.  **Continuous Monitoring and Readiness:** The CIRT must maintain operational readiness to address incidents 24/7. This includes the proactive review of system logs and the maintenance of incident response playbooks tailored to the specific infrastructure requirements of the Corelane API.
2.  **Tier-Specific Support Coordination:** The CIRT must differentiate response efforts based on the customer's subscription tier. For Enterprise customers, the CIRT is responsible for coordinating with dedicated account managers to provide high-touch communication and support. For Pro and Free tier customers, the CIRT utilizes automated notification channels to ensure broad, efficient coverage.
3.  **Mandatory API Key Management Oversight:** Following any security incident, the CIRT is responsible for enforcing the mandatory rotation of API keys where a compromise is suspected. This responsibility includes providing clear, actionable guidance to customers on how to perform key rotation within their respective dashboards.
4.  **Forensic Preservation:** The CIRT must ensure that all data relevant to an incident is preserved in accordance with the retention policies outlined in Section 14.0, ensuring that forensic evidence is protected from unauthorized alteration or premature deletion.

All personnel involved in incident response are subject to strict confidentiality agreements and are required to undergo periodic training to ensure that their actions remain aligned with the security standards of Corelane, Inc. Failure to adhere to these defined roles may result in disciplinary action, up to and including termination of employment.

### 5.0 Incident Detection and Reporting
Corelane, Inc. maintains a robust and multi-layered approach to the detection and reporting of potential security incidents within its infrastructure supporting the Corelane API. This comprehensive strategy is designed to identify anomalous activities, system compromises, and policy violations promptly.

Detection mechanisms encompass both automated systems and human vigilance. Automated systems include, but are not limited to, Security Information and Event Management (SIEM) platforms, Intrusion Detection and Prevention Systems (IDPS), Endpoint Detection and Response (EDR) solutions, network traffic analysis tools, and continuous vulnerability scanning. These systems are configured with predefined rules, behavioral analytics, and threat intelligence feeds to generate alerts upon detecting indicators of compromise (IoCs) or suspicious patterns. Furthermore, Corelane, Inc. implements proactive threat hunting exercises to uncover stealthy or novel attack vectors that may evade automated controls. Internal personnel are also trained and encouraged to report any observed suspicious activities or potential security anomalies through established internal channels.

Upon the generation of an alert or the receipt of an internal or external report concerning a potential security event, the initial assessment phase commences. This phase is critical for distinguishing genuine security incidents from false positives. Designated security operations personnel conduct a preliminary verification, which involves correlating data from various monitoring sources, analyzing system logs, reviewing network telemetry, and assessing the potential scope and impact of the reported event. The objective of this initial assessment is to rapidly determine the legitimacy and preliminary severity of the potential incident.

Should the initial assessment confirm the presence of a legitimate security incident, formal reporting and escalation protocols are immediately activated. The incident is meticulously documented within Corelane, Inc.'s centralized incident management system, capturing all pertinent details, including the time of detection, affected systems, initial observations, and preliminary classification. This formal documentation serves as the foundational record for all subsequent incident response activities. The incident is then escalated to the Corelane Incident Response Team (CIRT), as delineated in Section 4.0, 'Roles and Responsibilities'. The Incident Commander is promptly notified, and a provisional incident classification and severity level are assigned in accordance with the criteria established in Section 3.0, 'Incident Classification and Severity Levels'. This formal reporting and escalation process ensures that the appropriate resources are mobilized swiftly to initiate the subsequent phases of incident response, thereby minimizing potential impact and facilitating a structured resolution.

### 6.0 Incident Response Phases Overview
Corelane, Inc. maintains a rigorous, four-phase security incident response framework designed to ensure the integrity, availability, and confidentiality of the Corelane API. This structured methodology is engineered to provide a predictable and efficient response to any identified security event, minimizing potential disruption to customer operations and ensuring compliance with our established service level agreements.

### The Four Phases of Incident Response

1. **Phase 1: Preparation**
   This phase focuses on the proactive establishment of the necessary infrastructure, tools, and personnel training required to manage security incidents effectively. It includes the maintenance of robust monitoring systems, the development of standardized response playbooks, and the regular auditing of our security posture to ensure that Corelane, Inc. remains resilient against evolving threats.

2. **Phase 2: Identification and Analysis**
   Upon the detection of a potential security event, the Corelane Incident Response Team initiates a systematic analysis to verify the incident's legitimacy. This phase involves the collection of forensic evidence, the determination of the scope of the impact, and the classification of the incident based on severity levels. The objective is to confirm the nature of the threat and assess its potential impact on the Corelane API infrastructure.

3. **Phase 3: Containment, Eradication, and Recovery**
   Once an incident is confirmed, Corelane, Inc. executes immediate containment strategies to prevent further unauthorized access or data exposure. Following containment, the team proceeds to eradicate the root cause of the incident. The recovery phase involves the restoration of affected services to their normal operational state, ensuring that all systems are verified as secure before returning to full production capacity.

4. **Phase 4: Post-Incident Activity**
   The final phase involves a comprehensive review of the incident lifecycle. Corelane, Inc. conducts a formal post-mortem analysis to document the root cause, evaluate the effectiveness of the response, and identify areas for improvement. This phase is critical for refining our security protocols and implementing corrective measures to prevent the recurrence of similar incidents.

This lifecycle approach ensures that Corelane, Inc. maintains a disciplined and transparent response process. By adhering to these defined phases, we ensure that all security incidents are managed with the requisite level of urgency and technical precision, upholding our commitment to the security of the Corelane API and the protection of our customers' data.

### 7.0 Phase 1: Preparation
Corelane, Inc. implements a comprehensive and proactive preparedness strategy, constituting Phase 1 of its incident response lifecycle. This foundational phase establishes and refines the capabilities, resources, and processes essential for effective and timely incident detection, analysis, containment, and recovery, thereby minimizing impact on the Corelane API and associated infrastructure.

Key preparatory activities include:

*   **Policy, Team, and Training:** Corelane, Inc. develops and maintains robust security policies, incident response plans, and operational procedures. A dedicated Incident Response Team (IRT), comprising specialized cybersecurity and operations personnel, is formally established. Team members receive continuous training on threat landscapes and response methodologies, with clearly delineated roles.
*   **Security Monitoring and Vulnerability Management:** Advanced SIEM, IDS/IPS, and EDR solutions are deployed to continuously monitor the Corelane API environment for anomalous activities and indicators of compromise (IoCs), enabling early threat detection. Concurrently, a systematic vulnerability management program encompasses regular security assessments, penetration testing, and scanning, with identified vulnerabilities prioritized and promptly remediated.
*   **Data Backup and Recovery Planning:** Comprehensive data backup and disaster recovery plans are developed and routinely tested. These plans ensure the integrity, availability, and recoverability of critical Corelane API data and services following an incident.
*   **Communication Protocols and Stakeholder Engagement:** Pre-established communication plans define internal and external notification procedures. This includes identifying key stakeholders, defining communication channels (e.g., registered account email, in-dashboard alert banner for customer notifications), and preparing template communications. Customer API key rotation post-incident is integrated.
*   **Incident Response Drills and Exercises:** Corelane, Inc. conducts periodic tabletop exercises and simulated incident drills. These test incident response plan effectiveness, validate team readiness, and identify areas for continuous improvement.

### 8.0 Phase 2: Identification and Analysis
Upon the detection of anomalous activity within the Corelane API infrastructure, the Incident Response Team (IRT) shall immediately initiate Phase 2: Identification and Analysis. This phase is critical for establishing the veracity of a potential security incident and determining its scope, impact, and technical characteristics. The IRT shall employ a systematic methodology to ensure that all findings are documented with the precision required for subsequent remediation and regulatory compliance.

### Initial Verification and Triage
Upon receipt of an alert from monitoring systems, the IRT shall perform an initial triage to distinguish between false positives and genuine security incidents. This process involves:
- Correlating logs from multiple sources, including API gateway traffic, authentication logs, and system-level telemetry.
- Assessing the integrity of the API key authentication layer to determine if unauthorized access has occurred.
- Evaluating whether the observed activity deviates from established baseline behaviors for the Corelane API.

### Data Gathering and Forensic Preservation
Once an incident is confirmed, the IRT shall proceed with the collection of pertinent data. To maintain the chain of custody and ensure the admissibility of evidence, all data gathering shall be conducted in accordance with established forensic protocols. This includes:
- Capturing volatile memory and system snapshots from affected nodes.
- Aggregating logs related to the specific API key or keys involved in the suspected breach.
- Isolating network traffic patterns to identify the origin and destination of malicious requests.

### Incident Analysis and Scoping
Following data collection, the IRT shall conduct a comprehensive analysis to determine the nature of the threat. This analysis focuses on the following objectives:
- **Root Cause Determination:** Identifying the vulnerability or vector exploited to gain unauthorized access or disrupt service.
- **Impact Assessment:** Quantifying the extent of data exposure or service degradation. This includes determining if the incident impacts the monthly quota of specific customers or if it poses a broader risk to the Corelane API infrastructure.
- **Severity Classification:** Assigning a severity level based on the potential impact to data confidentiality, integrity, and availability. This classification dictates the urgency of the subsequent containment phase.

### Documentation and Reporting
Throughout the identification and analysis process, the IRT is required to maintain a detailed incident log. This log must include timestamps, the identity of the personnel involved, the specific systems analyzed, and the preliminary findings. This documentation serves as the foundation for the subsequent phases of the response lifecycle and ensures that Corelane, Inc. remains in compliance with its internal security standards and external reporting obligations. The IRT shall ensure that all analysis is conducted without compromising the security of unaffected segments of the Corelane API environment. If the analysis indicates that a customer-side API key leakage is the primary vector, the IRT shall immediately flag the account for mandatory rotation as per the requirements outlined in Section 12.0.

### 9.0 Phase 3: Containment, Eradication, and Recovery
The Corelane Incident Response Team (CIRT) initiates Phase 3, encompassing Containment, Eradication, and Recovery, immediately following the comprehensive identification and analysis detailed in Section 8.0. The primary objective of this phase is to mitigate the impact of a security incident, eliminate its root cause, and restore Corelane API services and associated infrastructure to a secure and fully operational state. All actions undertaken during this phase are meticulously documented to support subsequent post-incident analysis and compliance requirements.

### 9.1 Containment

Upon confirmation and initial scoping of a security incident, the CIRT implements immediate containment strategies designed to limit the incident's scope, prevent further unauthorized access, and minimize potential damage to Corelane, Inc.'s systems, data, and the Corelane API. Containment measures are dynamic and are selected based on the nature and severity of the incident, as determined during the identification and analysis phase.

Specific containment actions may include, but are not limited to:
*   **Isolation of Affected Systems:** Temporarily disconnecting or segmenting compromised servers, network components, or data stores from the broader Corelane infrastructure to prevent lateral movement of threats.
*   **Blocking Malicious Traffic:** Implementing firewall rules, intrusion prevention system (IPS) policies, or network access control lists (ACLs) to block identified malicious IP addresses, domains, or traffic patterns.
*   **Disabling Compromised Accounts:** Suspending or revoking credentials for any Corelane internal accounts or Corelane API customer accounts identified as compromised or exhibiting suspicious activity.
*   **Temporary Service Degradation:** In severe cases, temporarily limiting access to specific Corelane API endpoints or functionalities to prevent further exploitation, while maintaining essential service availability where feasible.
*   **Data Loss Prevention Measures:** Activating or reinforcing data loss prevention (DLP) controls to prevent unauthorized exfiltration of sensitive data.

The CIRT prioritizes containment actions to minimize disruption to legitimate Corelane API operations while effectively neutralizing the threat. Temporary containment measures are maintained until the eradication phase is complete and permanent solutions are implemented.

### 9.2 Eradication

The Eradication phase focuses on the complete removal of the security incident's root cause and all associated malicious artifacts from Corelane, Inc.'s environment. This phase leverages the forensic evidence and analysis conducted in previous stages to ensure thorough remediation.

Key activities during eradication include:
*   **Root Cause Analysis:** Detailed investigation to identify the specific vulnerability, misconfiguration, or attack vector that facilitated the incident.
*   **Malware Removal:** Comprehensive scanning and removal of all identified malware, viruses, or other malicious software from affected systems.
*   **Vulnerability Remediation:** Applying necessary security patches, configuration changes, or architectural modifications to address the identified vulnerabilities. This may include updating software, firmware, or operating systems.
*   **Credential Reset:** For any accounts identified as compromised, a mandatory reset of all associated credentials is performed. For Corelane API customers, this necessitates the rotation of API keys, as detailed in Section 12.0.
*   **Removal of Backdoors and Persistence Mechanisms:** Identifying and eliminating any unauthorized access points or mechanisms established by attackers to maintain persistence within the Corelane infrastructure.

The eradication process is meticulously verified through security scans, integrity checks, and re-assessment of affected systems to confirm the complete removal of the threat and its underlying causes.

### 9.3 Recovery

The Recovery phase is dedicated to restoring Corelane API services and affected systems to full operational status in a secure and validated manner. This phase ensures that the Corelane API is not only functional but also resilient against similar future incidents.

Recovery procedures encompass:
*   **System Restoration:** Rebuilding or restoring compromised systems from trusted, clean backups. This includes databases, application servers, and network devices. Data integrity and consistency are verified post-restoration.
*   **Service Validation:** Thorough testing of all Corelane API functionalities and associated services to confirm full operational capability and performance.
*   **Security Hardening:** Implementing enhanced security controls and configurations beyond pre-incident levels, where appropriate, to improve the overall security posture.
*   **Continuous Monitoring:** Activating or enhancing monitoring tools and alerts to detect any signs of recurrence or new threats post-recovery.
*   **Phased Rollout:** For complex incidents, a phased recovery approach may be adopted, prioritizing the restoration of critical Corelane API services before less critical components.
*   **Customer Communication:** As outlined in Section 11.0, Corelane, Inc. will communicate the status of recovery efforts and any required customer actions (e.g., API key rotation) to affected Corelane API customers.

Corelane, Inc. disclaims liability for incidents caused by customer-side API key leakage or customer infrastructure compromise, as specified in Section 13.0. However, Corelane, Inc. undertakes these recovery actions to maintain the integrity and availability of the Corelane API service. The successful completion of the Recovery phase marks the transition to post-incident activities, including comprehensive review and lessons learned.

### 10.0 Phase 4: Post-Incident Activity
Following the successful containment, eradication, and recovery of the Corelane API infrastructure, Corelane, Inc. initiates the post-incident activity phase. This phase is mandatory for all security incidents to ensure institutional learning, process refinement, and the continuous improvement of our security posture. The primary objective is to conduct a comprehensive analysis of the incident lifecycle to identify systemic vulnerabilities and procedural deficiencies.

### Post-Incident Review and Documentation
Within ten business days of service restoration, the Corelane Incident Response Team shall compile a formal Post-Incident Report (PIR). This document must include:
* A chronological timeline of the incident, from initial detection to final resolution.
* A detailed analysis of the root cause, including technical vectors and human or process-related failures.
* An assessment of the effectiveness of the containment and recovery strategies employed.
* A summary of the impact on the Corelane API, including any potential data exposure or service degradation.

### Lessons Learned and Corrective Actions
Corelane, Inc. utilizes the findings from the PIR to drive actionable improvements. The Incident Response Team will facilitate a 'lessons learned' session with relevant engineering and security stakeholders to evaluate the efficacy of existing protocols. Based on this evaluation, Corelane, Inc. will implement corrective actions, which may include:
* Updates to system architecture to mitigate identified vulnerabilities.
* Enhancements to monitoring and alerting thresholds to improve detection capabilities.
* Revisions to internal security policies and standard operating procedures.
* Targeted training for personnel to address identified skill gaps or procedural non-compliance.

### Accountability and Verification
All corrective actions identified during the post-incident phase are assigned to specific department heads with defined completion deadlines. The Chief Information Security Officer (CISO) is responsible for verifying the implementation of these measures. Documentation regarding the completion of these actions is maintained in the internal security audit log. This rigorous review process ensures that Corelane, Inc. maintains the integrity of the Corelane API and upholds the trust of our customers. By systematically addressing the root causes of incidents, we strive to minimize the probability of recurrence and enhance the overall resilience of our infrastructure against evolving threat landscapes. Failure to implement assigned corrective actions within the designated timeframe is considered a violation of internal compliance standards and will be escalated to executive management for immediate resolution.

### 11.0 Customer Notification Procedures
Corelane, Inc. maintains a rigorous commitment to transparency and security integrity regarding the Corelane API. In the event of a confirmed security incident that compromises the confidentiality, integrity, or availability of customer data or service operations, Corelane, Inc. shall initiate formal notification protocols. The primary objective of these protocols is to provide affected customers with timely, actionable information to facilitate the mitigation of potential downstream risks.

### Notification Timelines
Corelane, Inc. commits to a maximum customer notification window of 72 hours following the formal confirmation of a security incident by the Corelane Incident Response Team. This window is calculated from the moment the incident is verified as having a material impact on customer-specific data or service access. While Corelane, Inc. endeavors to provide notification as expeditiously as possible, the 72-hour period serves as the outer limit for formal communication to ensure that initial forensic analysis is sufficiently accurate to provide meaningful guidance to the customer.

### Communication Channels
To ensure that notifications reach the appropriate stakeholders, Corelane, Inc. utilizes the following designated communication channels:

*   **Registered Account Email:** All primary account holders and designated security contacts will receive formal correspondence via the email address currently registered within the Corelane API account profile. It is the sole responsibility of the customer to ensure that this contact information remains current and accurate.
*   **In-Dashboard Alert Banner:** For active users, a high-priority alert banner will be displayed within the Corelane API management console. This banner serves as a secondary notification mechanism to ensure visibility for users who may not have immediate access to their registered email accounts.

### Content of Notifications
Each notification issued by Corelane, Inc. shall contain, at a minimum, the following information:

1.  **Incident Overview:** A high-level description of the nature of the security incident.
2.  **Impact Assessment:** A summary of the potential impact on the customer’s data or API usage, to the extent that such information is known at the time of notification.
3.  **Recommended Remediation:** Specific steps the customer should take to secure their environment, including mandatory procedures for API key management.
4.  **Support Resources:** Information regarding how to contact the Corelane support team for further clarification or assistance during the remediation process.

### Customer Obligations
Upon receipt of a security incident notification, customers are required to acknowledge the communication and execute any recommended security measures immediately. Failure to adhere to these recommendations may exacerbate the impact of the incident. Corelane, Inc. reserves the right to suspend API access if an incident is deemed to pose an ongoing threat to the broader Corelane API infrastructure or other customers. All notifications are provided on a confidential basis and are intended solely for the use of the recipient. Customers must treat the information contained within these notifications with the appropriate level of sensitivity and security, consistent with their own internal data protection policies.

### 12.0 Customer Responsibilities and API Key Management
Following the notification of a security incident by Corelane, Inc., customers utilizing the Corelane API bear specific and mandatory responsibilities to safeguard their accounts and data. This section delineates these obligations, emphasizing proactive security measures and required responses to mitigate potential risks.

### 12.1 Mandatory API Key Rotation

Upon receipt of a security incident notification from Corelane, Inc., customers are **mandatorily required** to initiate the rotation of all API keys associated with their Corelane API account. This requirement is critical to neutralize any potential compromise of API keys that may have occurred, either directly or indirectly, as a result of the incident. Failure to promptly rotate API keys following such notification may perpetuate vulnerabilities, expose customer data, and could lead to unauthorized access to Corelane API services under the customer's account. Corelane, Inc. reserves the right to suspend access for accounts where API key rotation has not been demonstrably performed within a reasonable timeframe post-notification, to protect the integrity of the Corelane API ecosystem.

### 12.2 API Key Security Best Practices

Customers are solely responsible for the secure management and protection of their API keys. Corelane, Inc. strongly recommends and expects adherence to the following security best practices:

*   **Secure Storage:** API keys must never be hardcoded directly into application source code. Instead, they should be stored securely using environment variables, dedicated secrets management services, or secure configuration files with appropriate access controls.
*   **Least Privilege:** API keys should be granted only the minimum necessary permissions required for their intended function. Avoid using a single API key with broad administrative privileges across multiple applications or services.
*   **Regular Rotation:** Beyond incident-driven requirements, customers are advised to implement a policy of regular, periodic API key rotation as a proactive security measure.
*   **Access Control:** Limit access to API keys to authorized personnel only. Implement strong authentication mechanisms and access logging for systems that store or utilize API keys.
*   **Monitoring and Auditing:** Customers should implement monitoring solutions to detect unusual activity or unauthorized use associated with their API keys. Prompt investigation of suspicious patterns is essential.
*   **Secure Transmission:** Ensure that API keys are always transmitted over secure, encrypted channels (e.g., HTTPS/TLS).

### 12.3 Customer Infrastructure and API Key Leakage

Corelane, Inc.'s security incident response protocols and associated liabilities explicitly exclude incidents caused by customer-side API key leakage or compromise of customer infrastructure. Customers acknowledge and agree that they bear full responsibility for the security of their own systems, networks, and applications that interact with the Corelane API. Any security incident originating from or exacerbated by vulnerabilities within the customer's operational environment, including but not limited to, insecure storage of API keys, unauthorized access to customer systems, or misconfigurations, falls outside the scope of Corelane, Inc.'s direct liability. It is incumbent upon the customer to implement robust security controls and practices to prevent such occurrences.

### 12.4 Consequences of Non-Compliance

Non-adherence to the mandatory API key rotation requirements or a demonstrable failure to implement adequate security measures for API key management may result in severe consequences. These may include, but are not limited to:
*   Unauthorized access to the customer's Corelane API account and associated data.
*   Exceeding monthly quota limits due to malicious usage, incurring additional charges.
*   Interruption or suspension of Corelane API services to the customer's account.
*   Loss or compromise of customer data.
*   Financial liabilities arising from unauthorized usage or data breaches.

Corelane, Inc. provides documentation and support resources to assist customers in implementing secure API key management practices. Customers are encouraged to consult these resources and contact Corelane Support for guidance on securing their integration with the Corelane API.

### 13.0 Limitation of Liability
Corelane, Inc. maintains a robust security posture; however, the provision of the Corelane API is subject to the limitations of liability set forth in this policy. In the event of a security incident, Corelane, Inc. shall not be held liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business interruption, arising out of or in connection with the use or inability to use the Corelane API, even if Corelane, Inc. has been advised of the possibility of such damages.

Corelane, Inc. expressly disclaims all liability for security incidents, data breaches, or unauthorized access resulting from circumstances outside of its direct control. Specifically, Corelane, Inc. disclaims liability for incidents caused by customer-side API key leakage or customer infrastructure compromise. It is the sole responsibility of the customer to ensure the secure storage, transmission, and management of their API key. Any unauthorized access to the Corelane API facilitated by the exposure of a customer’s credentials shall be deemed the full responsibility of the customer, and Corelane, Inc. shall bear no obligation to indemnify or compensate the customer for losses incurred therefrom.

Furthermore, Corelane, Inc. does not guarantee that the Corelane API will be uninterrupted or error-free. While Corelane, Inc. commits to the uptime Service Level Agreements (SLAs) associated with the customer’s specific tier—ranging from best-effort for the Free tier to 99.9% for the Enterprise tier—these SLAs do not constitute a warranty against security vulnerabilities or external malicious activity. Corelane, Inc. shall not be liable for any failure to perform its obligations where such failure results from any cause beyond its reasonable control, including, but not limited to, mechanical, electronic, or communications failure.

In the event of a security incident, the total aggregate liability of Corelane, Inc. for any claims arising under this policy shall be limited to the amount paid by the customer to Corelane, Inc. for the use of the Corelane API during the twelve (12) month period immediately preceding the event giving rise to the claim. For customers on the Free tier, where no monetary consideration is provided, Corelane, Inc. assumes no financial liability for any damages resulting from a security incident. 

Customers acknowledge that the security of their applications and the integrity of their data remain their primary responsibility. By utilizing the Corelane API, the customer agrees that Corelane, Inc. is not responsible for the security of the customer’s own systems, networks, or the third-party services integrated with the Corelane API. Any failure by the customer to implement adequate security measures, including but not limited to the rotation of an API key following a suspected compromise, shall constitute a waiver of any potential claims against Corelane, Inc. regarding the resulting security incident.

### 14.0 Data Retention and Forensic Analysis
Corelane, Inc. maintains a rigorous data preservation and forensic analysis protocol to ensure the integrity of the Corelane API infrastructure. In the event of a security incident, Corelane, Inc. reserves the right to retain system logs, metadata, and relevant traffic patterns for the duration necessary to conduct a comprehensive forensic investigation. This data is preserved to identify the root cause, assess the scope of unauthorized access, and implement necessary remediation measures to protect the ecosystem.

### Data Retention Periods
Following the termination of a customer account or the deletion of specific resources, Corelane, Inc. adheres to the following data retention schedules based on the customer's subscription tier:

| Subscription Tier | Data Retention After Deletion |
| :--- | :--- |
| Free | 7 days |
| Pro | 30 days |
| Enterprise | 90 days, or per contract |

During these periods, Corelane, Inc. may sequester specific logs associated with the affected API key to facilitate forensic analysis. Once the applicable retention period expires, all associated data is securely purged from production and backup environments in accordance with our internal data destruction standards. 

### Forensic Analysis Procedures
Corelane, Inc. employs industry-standard forensic methodologies to analyze security incidents. This process includes the examination of API request logs, authentication attempts, and system-level telemetry. Customers acknowledge that while Corelane, Inc. performs forensic analysis on its own infrastructure, the company is not obligated to provide raw forensic data to customers unless required by applicable law or as explicitly negotiated within an Enterprise service agreement. 

In instances where a security incident necessitates a deeper investigation, Corelane, Inc. may extend the retention of specific logs beyond the standard periods defined above, provided such extension is required for legal compliance or the resolution of the incident. All forensic data is handled with strict confidentiality and is accessible only to authorized personnel within the Corelane Incident Response Team. Customers are reminded that the responsibility for maintaining their own application-level logs and audit trails remains with the customer. Corelane, Inc. does not act as a long-term data repository for customer-side forensic evidence. Any request for data preservation beyond the standard retention windows must be submitted in writing to the Corelane legal department and will be evaluated on a case-by-case basis, subject to technical feasibility and legal obligations.

### 15.0 Policy Review and Enforcement
This Security Incident Response Policy ("Policy") is subject to continuous review and refinement to maintain its efficacy and alignment with evolving security standards, technological advancements, and regulatory obligations. Corelane, Inc. shall conduct a formal review of this Policy no less frequently than annually. Additional reviews may be initiated proactively in response to significant changes in the threat landscape, the Corelane API architecture, or relevant legal and compliance frameworks. The Corelane Legal Department, in conjunction with the Security Operations and Product Management teams, is responsible for overseeing these reviews and proposing necessary amendments.

Any proposed modifications to this Policy shall undergo a rigorous internal approval process involving relevant departmental stakeholders and senior management. Upon approval, an updated version of the Policy will be published, clearly indicating its new version number and effective date. Corelane, Inc. is committed to transparent communication regarding policy updates. Customers utilizing the Corelane API will be notified of material changes to this Policy via their registered account email addresses and through official announcements within the Corelane API documentation portal. Continued use of the Corelane API following the effective date of any revised Policy constitutes acceptance of the updated terms.

This Policy is binding upon all Corelane, Inc. employees, contractors, and any third parties engaged in the provision or support of the Corelane API. Furthermore, all users of the Corelane API are obligated to adhere to the provisions outlined herein, particularly those pertaining to customer responsibilities and API key management. Non-compliance by Corelane, Inc. personnel with the internal procedures stipulated in this Policy may result in disciplinary action, up to and including termination of employment or contract. Corelane, Inc. reserves the right to enforce the terms of this Policy, including but not limited to, the suspension or termination of Corelane API access for customers found to be in material breach of their obligations as defined within this document.
