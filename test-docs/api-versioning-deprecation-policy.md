# Corelane API Terms — API Versioning and Deprecation Policy
**Version 2.3** · **Effective: June 1, 2026**

### 1.1 Purpose and Scope
This API Versioning and Deprecation Policy (the "Policy") establishes the formal framework governing the lifecycle, versioning methodology, and deprecation protocols for the Corelane API, provided by Corelane, Inc. The primary objective of this Policy is to ensure operational stability, predictability, and transparency for all developers and organizations integrating with our API-as-a-service platform for LLM inference hosting and embedding generation. By defining clear standards for how Corelane, Inc. introduces, maintains, and retires API versions, this Policy serves to mitigate integration risks and facilitate seamless transitions for our customers.

This Policy applies to all versions of the Corelane API, including all endpoints, request/response schemas, and associated documentation. It governs the relationship between Corelane, Inc. and any entity accessing the Corelane API, regardless of the service tier subscribed to by the customer. The scope of this document encompasses the entirety of the API lifecycle, from initial release through to the eventual End-of-Life (EOL) status of legacy versions. 

Corelane, Inc. is committed to maintaining a robust and reliable infrastructure. To support this commitment, this Policy mandates a minimum deprecation notice period of 180 days for any version reaching its EOL. This ensures that customers have sufficient time to adjust their integrations and migrate to newer, supported versions of the API. The specific migration support provided by Corelane, Inc. is contingent upon the customer's service tier, as detailed in the following table:

| Service Tier | Migration Support Level |
| :--- | :--- |
| Free | Documentation only |
| Pro | Documentation plus email support during migration window |
| Enterprise | Dedicated migration engineering support |

Customers are expected to adhere to the guidelines set forth in this document to maintain the integrity of their integrations. This Policy is effective as of June 1, 2026, and supersedes all prior communications regarding API versioning. By continuing to utilize the Corelane API, customers acknowledge and agree to the terms and procedures outlined herein, ensuring a consistent and professional standard of service across the Corelane ecosystem.

### 1.2 Definitions
This section provides precise definitions for key terminology employed throughout this API Versioning and Deprecation Policy.

*   **Corelane API**: Refers to the proprietary API-as-a-service provided by Corelane, Inc. for the purpose of LLM inference hosting and embedding generation.

*   **API Version**: A distinct iteration of the Corelane API, identified through URL path versioning (e.g., `/v1/`, `/v2/`). Each version specifies a unique set of functionalities, data structures, and operational behaviors.

*   **Backward Compatibility**: The property of an API modification that allows existing client applications, developed against a prior API version, to continue functioning correctly without requiring code changes or re-deployment. This signifies that the modification introduces no breaking changes to the established API contract.

*   **Backward Incompatibility**: The property of an API modification that necessitates changes to existing client applications developed against a prior API version to maintain functionality. Such modifications disrupt the established API contract, often involving alterations to existing endpoints, data structures, or fundamental API behaviors.

*   **Deprecation**: The formal announcement by Corelane, Inc. of its intent to discontinue active support and future enhancements for a specific Corelane API version. During the deprecation period, the API version remains operational, but customers are advised to migrate to a newer, actively supported version.

*   **Deprecation Notice Period**: The minimum duration, measured in calendar days, that Corelane, Inc. provides between the formal announcement of an API version's deprecation and its subsequent End-of-Life (EOL) date. This period is established to facilitate customer migration and shall be no less than 180 days.

*   **End-of-Life (EOL)**: The definitive date upon which a deprecated Corelane API version is officially retired. After the EOL date, Corelane, Inc. ceases to guarantee the operational availability or support for the specified API version and reserves the right to disable access without further notification.

*   **API Key**: A unique, confidential alphanumeric credential issued by Corelane, Inc. to authenticate and authorize a customer's access to the Corelane API. Customers are solely responsible for the secure management and protection of their API keys.

*   **Monthly Quota**: A predefined limit on the aggregate volume of requests or computational resources that a customer's account may consume within a single calendar month for Corelane API services. Exceeding this quota may result in service limitations or additional charges, contingent upon the customer's service tier.

*   **Service Tiers**: The structured subscription levels offered by Corelane, Inc. for the Corelane API, each delineating specific entitlements, including but not limited to rate limits, uptime Service Level Agreements (SLAs), and migration support. These tiers comprise "Free," "Pro," and "Enterprise" options.

*   **Uptime SLA (Service Level Agreement)**: A formal commitment by Corelane, Inc. regarding the guaranteed operational availability of the Corelane API. The specific uptime percentage varies by service tier: the "Free" tier receives best-effort availability, the "Pro" tier guarantees 99.5% uptime, and the "Enterprise" tier guarantees 99.9% uptime.

### 2.1 Corelane API Versioning Scheme
Corelane, Inc. employs a structured URL path versioning methodology to manage the evolution of the Corelane API. This approach ensures that all requests directed to the Corelane API infrastructure explicitly identify the intended version of the service, thereby providing a stable and predictable environment for developers and enterprise systems. By embedding the version identifier directly into the request URI, Corelane, Inc. facilitates the concurrent operation of multiple API versions, allowing for seamless transitions and long-term support for legacy integrations.

All requests to the Corelane API must include the version prefix immediately following the base domain. The versioning scheme utilizes a major version identifier, represented as an integer prefixed by the letter 'v' (e.g., /v1/, /v2/). This identifier signifies the primary version of the API contract. For instance, a request to the embedding generation endpoint would be structured as follows: https://api.corelane.com/v1/embeddings. This explicit pathing mechanism ensures that the Corelane API routing layer can accurately direct traffic to the appropriate backend infrastructure, ensuring that the specific logic, data schemas, and security protocols associated with that version are applied consistently.

This URL path versioning strategy is fundamental to the Corelane, Inc. commitment to service stability. By requiring the version in the URL, Corelane, Inc. eliminates ambiguity regarding the expected response format and behavior of the API. It further allows for the implementation of breaking changes in a new major version without disrupting existing integrations that rely on previous versions. Customers are advised that the version identifier is mandatory for all API calls. Failure to include a valid version prefix will result in a 404 Not Found error, as the API gateway cannot route requests that do not conform to the established pathing convention.

Furthermore, this methodology supports the Corelane, Inc. policy regarding the lifecycle of API services. As new versions are released, the URL path versioning allows for the coexistence of multiple versions during the mandatory 180-day deprecation notice period. This ensures that customers have sufficient time to update their applications and migrate their infrastructure to the latest version. Corelane, Inc. maintains strict adherence to this versioning scheme across all service tiers, including Free, Pro, and Enterprise. While the level of migration support varies by tier, the underlying technical implementation of the versioning scheme remains uniform, ensuring that the Corelane API remains a reliable and scalable solution for LLM inference hosting and embedding generation. Customers are encouraged to monitor the official Corelane API documentation for announcements regarding the release of new major versions and the subsequent deprecation of older paths.

### 2.2 Major, Minor, and Patch Version Increments
Corelane, Inc. employs a structured versioning methodology to ensure the stability, predictability, and long-term viability of the Corelane API. To facilitate clear communication regarding the nature of updates and their potential impact on existing integrations, all modifications are categorized into major, minor, or patch increments. This classification system is designed to provide developers with the necessary transparency to manage their infrastructure effectively.

### Major Version Increments
A major version increment (e.g., transitioning from /v1/ to /v2/) signifies a fundamental change to the Corelane API that is inherently backward-incompatible. Such changes include, but are not limited to, the removal of existing endpoints, the modification of required request parameters, changes to the structure of mandatory response objects, or the alteration of authentication protocols. Because major versions represent a significant departure from previous iterations, they require explicit action from the customer to update their client-side code. Corelane, Inc. guarantees a minimum deprecation notice period of 180 days for any major version transition, ensuring that customers have sufficient time to perform necessary testing and migration.

### Minor Version Increments
Minor version increments represent the introduction of new functionality or the expansion of existing capabilities within the current major version path. These updates are strictly backward-compatible, meaning that existing integrations will continue to function without modification. Minor updates may include the addition of optional request parameters, the introduction of new, non-breaking endpoints, or the inclusion of additional fields within existing JSON response payloads. Customers are encouraged to adopt minor version features to leverage the latest advancements in LLM inference hosting and embedding generation, though such adoption remains optional for the duration of the major version's lifecycle.

### Patch Version Increments
Patch version increments are reserved for non-functional changes, such as security enhancements, performance optimizations, or the correction of documented bugs. Patch updates do not alter the API contract, nor do they introduce new features or remove existing ones. These updates are applied transparently to the Corelane API infrastructure to maintain the highest standards of service reliability and security. As patch updates are designed to be entirely invisible to the consumer, they do not require any adjustments to customer-side integrations. 

### Summary of Versioning Implications

| Version Type | Impact on Integration | Compatibility | Notice Requirement |
| :--- | :--- | :--- | :--- |
| Major | High (Requires code changes) | Backward-Incompatible | 180 Days |
| Minor | Low (Optional adoption) | Backward-Compatible | None |
| Patch | None (Transparent) | Backward-Compatible | None |

By adhering to these strict definitions, Corelane, Inc. ensures that all consumers, regardless of their service tier, can maintain robust and reliable connections to our services. It remains the responsibility of the customer to monitor the Corelane API documentation for updates regarding versioning and to ensure that their systems are configured to handle the versioning scheme appropriately.

### 3.1 Definition of Backward Compatibility
Backward compatibility, within the context of the Corelane API, refers to the characteristic of an API modification or enhancement that permits existing client applications to continue operating without requiring any alterations, recompilation, or redeployment. A change is deemed backward compatible if it does not introduce any breaking modifications to the established API contract, thereby preserving the functionality and integrity of integrations developed against prior versions of the Corelane API. The primary objective of maintaining backward compatibility is to minimize operational overhead and development costs for Corelane API consumers, ensuring a stable and predictable environment for their applications.

Corelane, Inc. adheres to a stringent policy regarding backward compatibility to safeguard the stability of customer integrations. Any modification to the Corelane API is classified as backward compatible if it satisfies the fundamental criterion of not necessitating any code changes on the client side to maintain existing functionality. This principle applies to all aspects of the API contract, including but not limited to, request formats, response structures, endpoint availability, and behavioral semantics.

Specific types of modifications that are generally considered backward compatible include:

*   **Addition of New Resources or Endpoints:** The introduction of entirely new API endpoints or resources that do not alter the behavior or contract of existing endpoints.
*   **Addition of Optional Request Parameters:** The inclusion of new parameters in request bodies or query strings, provided these parameters are explicitly designated as optional and do not affect the processing of requests that omit them.
*   **Addition of New Fields to Existing Response Objects:** The augmentation of JSON response payloads with new key-value pairs, where existing client applications are designed to ignore unrecognized fields. Clients are expected to implement robust parsing mechanisms that tolerate the presence of additional, unexpected fields in API responses.
*   **Addition of New Enumerated Values:** The expansion of predefined sets of values (enums) for existing fields, provided client applications are designed to handle new, unrecognized enum values gracefully without error.
*   **Relaxation of Validation Rules:** Any modification that makes existing validation less restrictive, such as changing a previously required field to optional, or expanding the range of acceptable values for a parameter.
*   **Internal Implementation Changes:** Modifications to the Corelane API's internal architecture, algorithms, or infrastructure that do not manifest as changes in the external API contract, behavior, or performance characteristics beyond expected operational variances.
*   **Performance Enhancements and Bug Fixes:** Updates aimed at improving the efficiency, reliability, or correctness of the Corelane API, provided these do not alter the functional contract or introduce regressions in existing features.

It is imperative that Corelane API consumers design their integrations with forward compatibility in mind, particularly by employing flexible parsing strategies that can accommodate the addition of new, optional elements in API responses. This approach ensures that client applications remain resilient to backward-compatible updates deployed by Corelane, Inc. without requiring immediate intervention.

### 3.2 Permitted Backward-Compatible Changes
Corelane, Inc. reserves the right to implement specific modifications to the Corelane API without the requirement of incrementing the major version number, provided such changes maintain backward compatibility. These modifications are designed to enhance the utility, performance, and security of the API-as-a-service platform while ensuring that existing customer integrations remain functional and stable. The following categories of modifications are classified as backward-compatible and may be deployed at the discretion of Corelane, Inc.:

*   **Addition of Optional Parameters:** Corelane, Inc. may introduce new optional request parameters to existing API endpoints. Consumers are not required to update their client-side code to utilize these parameters, as existing requests will continue to be processed according to the established default behaviors.
*   **Addition of Response Fields:** New fields may be appended to existing JSON response objects. Client applications should be developed to ignore unrecognized fields in response payloads to ensure resilience against such additions.
*   **Introduction of New Endpoints:** The deployment of entirely new API endpoints or resources does not constitute a breaking change and will not necessitate a major version increment.
*   **Expansion of Enumerated Values:** Corelane, Inc. may add new values to existing enumerated types within request or response schemas. Clients must ensure their integration logic is capable of handling unexpected values gracefully.
*   **Performance and Security Enhancements:** Modifications to internal infrastructure, including but not limited to, changes in load balancing, database optimization, or the implementation of more robust encryption standards, are considered backward-compatible provided they do not alter the established API contract or the expected structure of data exchange.
*   **Correction of Non-Functional Documentation:** Updates to API documentation, error message clarity, or metadata that do not alter the functional behavior of the API are permitted without version changes.

To maintain the integrity of integrations, Corelane, Inc. mandates that all consumers design their client applications with forward compatibility in mind. This includes, but is not limited to, the implementation of robust error handling and the use of flexible JSON parsing libraries that do not fail upon encountering unknown fields or unexpected data types. While these changes are non-breaking, Corelane, Inc. will endeavor to communicate significant additions through the standard notification channels associated with the customer's account. It remains the responsibility of the customer to monitor their integration performance following any platform updates. By continuing to utilize the Corelane API, the customer acknowledges that these non-breaking modifications are a standard component of the service lifecycle and do not constitute a breach of the established service level agreements or the terms of service governing the Corelane API.

### 4.1 Definition of Backward Incompatibility
A modification to the Corelane API is classified as backward incompatible if it alters the existing contract between the Corelane API and the consumer in a manner that causes previously functional integrations to fail, produce erroneous results, or experience unexpected behavior. Corelane, Inc. maintains a strict policy requiring the issuance of a new major version—indicated by a change in the URL path versioning (e.g., from /v1/ to /v2/)—whenever a proposed change meets the criteria for backward incompatibility. This ensures that existing production environments remain stable and predictable.

Backward incompatibility is defined by the following categories of change:

* **Removal of Endpoints or Methods:** The deletion of any existing API endpoint, or the removal of support for HTTP methods (e.g., GET, POST, DELETE) previously available on an existing resource.
* **Modification of Required Parameters:** Any change that transforms an optional parameter into a mandatory one, or the removal of a parameter that was previously required for a successful request.
* **Data Structure Alterations:** The renaming of existing fields in JSON request or response bodies, the modification of data types for existing fields (e.g., changing an integer to a string), or the removal of fields from response objects upon which consumers rely.
* **Authentication and Authorization Changes:** Any modification to the validation logic or structure of the API key, or changes to the security protocols that would prevent existing, valid API keys from accessing the service.
* **Behavioral Changes:** Any alteration to the fundamental logic of an endpoint that changes the expected output or side effects, such that a client application following the previous documentation would receive a different, non-equivalent result.
* **Error Code Modifications:** The removal or redefinition of existing HTTP status codes or error response schemas that client applications are programmed to handle.

Corelane, Inc. recognizes that these changes, while disruptive, are occasionally necessary to evolve the Corelane API-as-a-service for LLM inference hosting and embedding generation. By mandating a new major version for these modifications, we provide consumers with the necessary isolation to migrate their integrations at their own pace, ensuring that the transition does not impact the uptime or performance of their current production deployments. Any change that does not strictly adhere to the backward compatibility criteria defined in section 3.1 is subject to this major versioning requirement.

### 4.2 Scenarios Requiring a New Major Version
Corelane, Inc. mandates the release of a new major version of the Corelane API whenever modifications are introduced that fundamentally alter the contract between the API and the consumer. A major version increment is strictly required when changes are implemented that cannot be consumed by existing client integrations without modification. Such changes are classified as backward-incompatible and necessitate the transition to a new URL path versioning scheme (e.g., from /v1/ to /v2/).

The following scenarios constitute mandatory triggers for the release of a new major version:

* **Removal of Endpoints:** The permanent decommissioning or removal of any existing API endpoint, resource, or method that was previously available in a stable release.
* **Modification of Required Parameters:** Any change that transforms an optional request parameter into a mandatory one, or the removal of an existing parameter upon which current integrations rely for successful request processing.
* **Structural Data Schema Alterations:** Significant modifications to the structure of JSON response payloads, including the renaming of existing fields, the alteration of data types for established fields, or the nesting of previously flat data structures, which would cause parsing failures in existing client-side logic.
* **Authentication and Authorization Protocol Changes:** Any modification to the authentication handshake, the structure or validation requirements of the API key, or the fundamental security protocols governing access to the Corelane API.
* **HTTP Status Code Reassignment:** The repurposing of existing HTTP status codes to signify different operational outcomes, which would disrupt error-handling logic implemented by the consumer.
* **Removal of Supported Data Formats:** The discontinuation of support for specific request or response content types (e.g., removing support for JSON in favor of an alternative format) that were previously documented as supported.

Corelane, Inc. reserves the right to determine, at its sole discretion, whether a proposed change constitutes a major version increment. However, the primary objective remains the preservation of stability for all consumers. When such changes are deemed necessary to facilitate technical advancements, security enhancements, or architectural improvements, Corelane, Inc. will initiate the versioning process. This ensures that consumers are provided with a clear, distinct migration path. By utilizing URL path versioning, Corelane, Inc. allows for the concurrent operation of multiple major versions, thereby providing consumers with the necessary temporal window to update their integrations in accordance with the deprecation notice periods defined in Section 5.1. Consumers are advised that failure to migrate from a deprecated major version prior to its end-of-life status may result in a complete cessation of service for that specific version, as Corelane, Inc. cannot guarantee the continued maintenance or security of legacy API versions indefinitely.

### 5.1 Deprecation Notice Period
Corelane, Inc. is committed to maintaining the stability and reliability of the Corelane API for all customers. To ensure that developers and organizations have sufficient time to adjust their integrations, Corelane, Inc. mandates a minimum deprecation notice period of 180 days prior to the formal decommissioning of any API version. This notice period commences on the date of the official deprecation announcement, which is disseminated through our primary communication channels.

During this 180-day window, the deprecated API version will remain fully operational and supported by Corelane, Inc. This duration is specifically calculated to provide customers with adequate time to perform necessary code modifications, conduct rigorous testing, and execute a seamless transition to the successor version. Corelane, Inc. recognizes that infrastructure updates require careful planning; therefore, this period is strictly enforced to prevent service disruptions for our users.

It is important to note that the 180-day notice period applies to all major version deprecations. While Corelane, Inc. reserves the right to release patches or minor updates to a deprecated version during this window to address critical security vulnerabilities or severe performance regressions, no new features will be introduced to versions marked for deprecation. Customers are strongly encouraged to prioritize migration efforts immediately upon receipt of a deprecation notice to avoid potential service interruptions upon the conclusion of the 180-day term.

Upon the expiration of the 180-day notice period, the deprecated API version will reach its End-of-Life (EOL) status. At this juncture, Corelane, Inc. will cease all support, maintenance, and availability for the version in question. Any requests directed to an EOL endpoint will result in an error response. To maintain continuous service, customers must ensure that their applications are configured to utilize the current, active API versions as documented in the Corelane developer portal. Corelane, Inc. assumes no liability for service outages resulting from a customer's failure to migrate their integrations within this established 180-day timeframe. By continuing to utilize the Corelane API, customers acknowledge and agree to adhere to these deprecation timelines, ensuring that their systems remain compatible with the latest standards and security protocols maintained by Corelane, Inc.

### 5.2 Deprecation Announcement Procedures
Corelane, Inc. is committed to providing clear and timely communication regarding the deprecation of Corelane API versions. Upon the decision to deprecate an API version, Corelane, Inc. shall initiate a formal notification process to all affected customers. This process will commence precisely at the beginning of the mandatory 180-day deprecation notice period, as stipulated in Section 5.1 of this policy.

The primary communication channels for deprecation announcements shall include:

*   **Official Corelane API Documentation**: A dedicated section within the Corelane API documentation portal will be updated to reflect the status of deprecated versions, including their effective deprecation date and End-of-Life (EOL) date.
*   **Developer Portal Announcements**: Prominent notices will be posted on the Corelane Developer Portal, accessible to all Corelane API users.
*   **Email Notifications**: A formal email notification will be dispatched to the primary email address associated with each Corelane API account that is identified as utilizing the version slated for deprecation. It is the customer's responsibility to ensure their registered account email is current and actively monitored.
*   **In-Dashboard Alerts**: For active users, an alert banner or notification will be displayed within the Corelane API management dashboard, providing direct visibility of upcoming deprecations.

Each deprecation announcement shall contain, at minimum, the following critical information:

1.  The specific Corelane API version(s) subject to deprecation.
2.  The official date marking the commencement of the 180-day deprecation notice period.
3.  The projected End-of-Life (EOL) date, after which the deprecated version will cease to function.
4.  A concise rationale for the deprecation, such as security enhancements, performance optimizations, or the introduction of superior functionality in newer versions.
5.  Clear instructions and guidance for migrating to the recommended successor API version(s). This will include direct links to updated API documentation, migration guides, and relevant technical resources.
6.  Information regarding the scope of support available for the deprecated version during the 180-day notice period, consistent with Section 5.1.

Corelane, Inc. strongly advises all Corelane API consumers to regularly consult the official Corelane API documentation, monitor the developer portal, and ensure their registered account email addresses are accurate to receive timely notifications. Failure to receive or act upon deprecation notices due to outdated contact information or insufficient monitoring of designated channels shall not absolve the customer of their responsibilities to migrate their integrations prior to the End-of-Life date. Enterprise-tier customers may also receive direct communication from their assigned account representatives, supplementing the aforementioned general notification channels.

### 5.3 End-of-Life (EOL) Policy
Upon the expiration of the 180-day deprecation notice period, the specified version of the Corelane API shall reach its designated End-of-Life (EOL) status. Effective as of the EOL date, Corelane, Inc. will cease all maintenance, security patching, and technical support for the affected API version. Customers are strictly advised that continued reliance on an EOL version poses significant operational and security risks, as these versions will no longer receive updates to address vulnerabilities or infrastructure compatibility requirements.

Following the EOL date, the following operational consequences shall take effect:

* **Service Termination:** Corelane, Inc. reserves the right to disable all endpoints associated with the EOL version. Any requests directed to these endpoints will return a 410 Gone HTTP status code, indicating that the resource is no longer available and no forwarding address is provided.
* **Infrastructure Decommissioning:** Corelane, Inc. will initiate the permanent removal of the EOL version from its production environment. This process includes the reclamation of server resources and the deletion of version-specific routing configurations.
* **Data Access:** While data generated or stored during the lifecycle of the EOL version remains subject to the prevailing data retention policies of the customer's service tier, the API methods required to programmatically access such data via the legacy version will be rendered non-functional. Customers must ensure that all necessary data migration or archival processes are completed prior to the EOL date.

Corelane, Inc. assumes no liability for service interruptions, data loss, or system failures resulting from a customer's failure to migrate from an EOL version within the prescribed 180-day notice period. It is the sole responsibility of the customer to monitor the developer portal and registered account communications to ensure timely compliance with versioning transitions. Requests for temporary extensions or emergency support for EOL versions will not be granted, as the deprecation timeline is designed to provide sufficient opportunity for all customers to update their integrations. By continuing to utilize the Corelane API, customers acknowledge that they are bound by these terms and accept the risks associated with legacy version obsolescence. For assistance during the transition, customers should refer to the migration resources provided in accordance with their specific service tier.

### 6.1 Corelane, Inc. Migration Support
Corelane, Inc. is committed to providing appropriate resources and assistance to its clientele to facilitate the transition between Corelane API versions. The level and nature of migration support provided are expressly differentiated based upon the customer's active service tier, reflecting the varying operational requirements and contractual commitments associated with each tier. It is incumbent upon all Corelane API consumers to proactively manage their integration updates in response to deprecation notices, as outlined in Section 5.1, to ensure continuous service availability and functionality.

Corelane, Inc. provides the following migration support mechanisms, categorized by service tier:

**Free Tier Support**

Customers operating under the Free tier are afforded access to comprehensive self-service resources designed to aid in API version migration. This support is exclusively limited to documentation. Corelane, Inc. maintains and publishes detailed API documentation, including but not limited to:

*   **API Reference Guides**: Exhaustive specifications for all endpoints, request/response formats, and data models for each Corelane API version.
*   **Migration Guides**: Step-by-step instructions and best practices for transitioning from a deprecated API version to its successor. These guides delineate changes in functionality, parameter modifications, and potential integration impacts.
*   **Release Notes**: Detailed summaries of all changes introduced in new API versions, including new features, enhancements, and backward-incompatible modifications.
*   **Code Samples and Tutorials**: Illustrative examples demonstrating proper integration patterns and migration strategies.

Direct technical support, including email, chat, or telephonic assistance, specifically for migration-related inquiries or troubleshooting customer-specific integration code, is not provided for Free tier accounts. Customers are expected to leverage the available documentation and public community forums for guidance.

**Pro Tier Support**

Subscribers to the Pro tier receive an enhanced level of migration assistance, encompassing both the comprehensive documentation available to Free tier users and dedicated email support during the designated migration window. The migration window is defined as the 180-day period commencing from the issuance of a formal deprecation notice for a specific Corelane API version, as stipulated in Section 5.1.

Pro tier email support for migration purposes includes:

*   **Clarification on Documentation**: Assistance in interpreting complex aspects of API documentation or migration guides.
*   **Guidance on Common Migration Challenges**: Advice on general strategies for addressing typical integration issues encountered during API version transitions.
*   **Troubleshooting API-Specific Issues**: Support for diagnosing and resolving problems directly related to the Corelane API's functionality during the migration process. This support is focused on the API's behavior and not on debugging customer application code.

Response times for email support are subject to Corelane, Inc.'s standard service level objectives for the Pro tier. This support is intended to facilitate a smoother transition by providing expert clarification and guidance, but it does not constitute dedicated engineering resources for custom integration development or extensive code review.

**Enterprise Tier Support**

Enterprise tier customers benefit from the most comprehensive level of migration assistance, which includes dedicated migration engineering support. This bespoke support is designed to ensure a seamless and efficient transition between Corelane API versions, acknowledging the complex and mission-critical nature of Enterprise integrations. The scope of dedicated migration engineering support is typically defined within the individual contractual agreement between Corelane, Inc. and the Enterprise customer.

Key components of Enterprise tier migration support may include:

*   **Dedicated Technical Account Management**: Assignment of a specific Corelane, Inc. representative to serve as a primary point of contact for all technical and migration-related inquiries.
*   **Proactive Migration Planning**: Collaborative development of migration strategies, including impact assessments, phased rollout plans, and risk mitigation.
*   **Direct Engineering Consultation**: Access to Corelane, Inc.'s engineering team for in-depth technical discussions, architectural guidance, and complex problem resolution pertaining to API version upgrades.
*   **Integration Review and Optimization**: Consultation on customer integration patterns to ensure optimal performance and adherence to best practices with the new API version.
*   **Customized Support**: Tailored assistance addressing unique integration requirements or specific operational constraints of the Enterprise customer.

The precise terms, availability, and scope of dedicated migration engineering support for Enterprise customers are subject to the specific Master Service Agreement or other contractual documents executed between Corelane, Inc. and the respective Enterprise client. This level of support is designed to minimize operational disruption and maximize the efficiency of API version transitions for critical business operations.

It is imperative for all customers, regardless of tier, to initiate migration efforts promptly upon receiving a deprecation notice. Corelane, Inc.'s migration support services are designed to assist in this process but do not absolve customers of their responsibility to adapt their systems within the stipulated deprecation timelines. Support for deprecated API versions ceases entirely upon their End-of-Life date, as detailed in Section 5.3.

### 6.2 Customer Responsibilities During Migration
Customers of the Corelane API bear the primary responsibility for maintaining the integrity and functionality of their own integrations throughout the lifecycle of any API version. Upon the issuance of a formal deprecation notice by Corelane, Inc., customers are obligated to initiate and complete the necessary technical adjustments to their systems to ensure compatibility with the successor API version. This responsibility includes, but is not limited to, the modification of request structures, the updating of client-side libraries, and the rigorous testing of all endpoints to confirm that the integration remains operational within the established 180-day deprecation window.

To facilitate a seamless transition, customers must adhere to the following requirements:

* **Proactive Monitoring:** Customers are expected to monitor official Corelane, Inc. communication channels, including the registered account email and the in-dashboard alert banner, for notifications regarding version deprecation and end-of-life schedules.
* **Integration Auditing:** Upon receiving a deprecation notice, customers must conduct a comprehensive audit of their existing codebase to identify all dependencies on the deprecated API version. This audit should be completed within the first 30 days of the 180-day notice period to allow sufficient time for development and remediation.
* **API Key Management:** Customers must ensure that their API key usage remains compliant with the security protocols associated with the new version. If a migration necessitates the rotation of an API key, the customer is responsible for updating their environment variables and secure storage mechanisms accordingly.
* **Testing and Validation:** Customers are required to validate their integrations against the new API version in a staging or development environment prior to the final decommission date. Corelane, Inc. shall not be held liable for service interruptions resulting from a customer's failure to perform adequate testing or to update their integration before the expiration of the 180-day notice period.

Failure to migrate to a supported API version prior to the end-of-life date may result in the cessation of service for the deprecated endpoints. Corelane, Inc. reserves the right to terminate access to deprecated versions without further notice once the 180-day period has elapsed. It is the customer's sole responsibility to ensure that their infrastructure is prepared for the transition, and any downtime resulting from a failure to migrate within the specified timeframe remains the liability of the customer.

### 7.1 Policy Review and Updates
Corelane, Inc. maintains a rigorous commitment to the integrity and relevance of its API Versioning and Deprecation Policy. To ensure that this policy remains aligned with evolving industry standards, technological advancements in LLM inference hosting, and the operational requirements of the Corelane API, this document is subject to periodic review. Formal reviews of this policy shall be conducted by the Corelane, Inc. legal and engineering departments no less than once every twelve (12) months, or upon the introduction of significant architectural changes to the Corelane API infrastructure.

Any amendments, modifications, or updates to this policy shall be documented under the current policy version, which is version 2.3, effective as of June 1, 2026. In the event of a material change to the terms herein, Corelane, Inc. will provide notice to all registered account holders via the primary contact email address associated with their API key. Continued use of the Corelane API following the effective date of any updated policy constitutes formal acceptance of the revised terms by the customer.

Customers are encouraged to monitor the official Corelane, Inc. documentation portal for the most current version of this policy. While Corelane, Inc. reserves the right to update this policy at its sole discretion, we remain dedicated to providing transparency regarding our versioning methodology and deprecation timelines. The following principles govern our update process:

* **Consistency:** Updates will not retroactively alter the minimum 180-day deprecation notice period for existing API versions.
* **Clarity:** All modifications will be clearly delineated in the policy change log, accessible within the customer dashboard.
* **Compliance:** Any changes to the policy will maintain strict adherence to the service level agreements (SLAs) defined for Free, Pro, and Enterprise tiers.

Failure to review updated policies does not exempt customers from their obligations regarding API integration maintenance and compliance with the current versioning standards.

### 7.2 Contact and Support
For any inquiries pertaining to the interpretation or application of this API Versioning and Deprecation Policy (version 2.3, effective June 1, 2026), Corelane, Inc. clients are directed to submit their questions via the designated support portal accessible within their Corelane API dashboard. All submissions must clearly reference the specific section and clause of this policy requiring clarification. Corelane, Inc. endeavors to provide timely and accurate responses to all policy-related queries.

Assistance with Corelane API versioning matters, including but not limited to understanding API changes, migration planning, and troubleshooting integration issues, is provided in accordance with the client's subscribed service tier. Corelane, Inc. offers differentiated support mechanisms to facilitate a smooth transition between API versions.

Specifically, support for API version migration is structured as follows:
*   **Free Tier**: Clients on the Free tier are provided with comprehensive documentation to guide their migration efforts. Direct technical support for migration is not included within this tier.
*   **Pro Tier**: Clients subscribed to the Pro tier receive access to all available documentation and are eligible for email support during the designated migration window for a deprecated API version. This support is intended to address specific technical challenges encountered during the migration process.
*   **Enterprise Tier**: Enterprise clients benefit from dedicated migration engineering support. This includes personalized assistance, strategic planning, and direct technical engagement to ensure seamless transitions between Corelane API versions, as further detailed within their individual service contracts.

All formal communications regarding support requests, policy clarifications, or technical assistance must be initiated through official Corelane, Inc. channels. Unsolicited communications or inquiries submitted through non-official channels may not receive a response. Corelane, Inc. reserves the right to prioritize support requests based on the severity of the issue and the client's service tier.
