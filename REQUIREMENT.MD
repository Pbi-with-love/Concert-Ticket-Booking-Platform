# Product Backend Engineer Test – Requirements Summary

## 1. Assignment Overview

This assignment requires designing and implementing a simple backend system for an **Online Concert Ticket Booking Platform**.

The goal is not to build a fully production-ready system, but to demonstrate backend engineering thinking, system design, code structure, trade-off decisions, and the ability to reason about real-world operational problems.

The submission should include both the backend codebase and supporting documents that explain the system design, database design, implementation scope, assumptions, limitations, setup instructions, and API usage.

---

## 2. Important Notes

### Submission Timeframe

- The result must be submitted within the informed timeframe of **48 hours**.
- If there is any change in the test timeframe, the new timeframe must be updated as soon as possible.
- The updated timeframe must still be within the allowed time after receiving the first email.

### Use of Resources

Candidates may use:

- Google
- AI tools
- Online resources
- Any technologies considered necessary

However, the candidate must fully understand and be able to explain every technical decision included in the submission.

The evaluation focuses more on:

- Backend design thinking
- Engineering trade-offs
- Reasoning behind technical decisions
- Code organization
- Handling business-critical issues

Rather than simply building many features.

---

## 3. Company References

- GEEK Up business: https://geekup.vn
- GEEK Up environment: https://www.facebook.com/GEEKUpAdventure

---

## 4. Business Context

A startup is preparing to launch an **Online Concert Ticket Booking Platform**.

The platform allows customers to:

- Browse concerts
- View ticket categories and prices
- Reserve tickets
- Apply promotional vouchers
- Track booking status

In addition to the customer-facing platform, the startup also needs an **Internal Operation Dashboard** for operators and administrators.

The Operation Dashboard helps the operation team to:

- Monitor bookings
- Manage and publish new concert tickets
- Validate ticket availability
- Manage voucher campaigns
- Handle failed or suspicious bookings
- Update booking status manually when necessary

---

## 5. Business Expectation

During launch week, the startup will run a **Flash Sale Campaign** for a highly anticipated concert event.

Expected traffic:

- Around **50,000 users**
- Peak traffic of approximately **300–500 booking requests per minute**

Each concert event has:

- Limited ticket quantity
- Multiple ticket categories, such as VIP and Standard
- Limited promotional vouchers

The startup is especially concerned about:

- Overselling tickets
- Duplicate bookings caused by user retries
- Users abusing promotional vouchers
- System instability during flash sale traffic spikes

---

## 6. Main Objective

The candidate is expected to work as a Software Engineer and help design and implement a simple backend system that supports both:

1. Customer-facing booking flows
2. Internal operation workflows

The backend system should reflect the proposed architecture and demonstrate how the system handles the main business risks, especially during flash sale traffic.

---

## 7. Required Backend Scope

### 7.1 Customer-facing Booking Flows

The backend should provide APIs that allow customers to perform actions such as:

- Browse available concerts
- View ticket categories and prices
- Create a booking or reserve tickets
- Apply a voucher during booking
- Track booking status

Important issues to consider:

- Preventing ticket overselling
- Handling limited ticket stock
- Handling voucher limits
- Avoiding duplicate bookings caused by retries
- Supporting clear booking status transitions

---

### 7.2 Internal Operation Workflows

The backend should provide APIs or workflows that allow operators or administrators to:

- Monitor bookings
- Manage concerts and ticket categories
- Publish or prepare tickets for sale
- Validate ticket availability
- Manage voucher campaigns
- Handle failed or suspicious bookings
- Manually update booking status when necessary

The implementation does not need to cover every possible operation feature, but the selected scope must be clearly explained.

---

## 8. Expected Deliverables

The final submission should be uploaded into **one folder** and submitted via a link in email.

The folder should include the following items.

---

### 8.1 System and Database Design Documents

The candidate should provide documents related to system design and database design, including:

- Architecture overview
- Main backend components
- Database schema or entity design
- Relationship between entities
- Booking flow explanation
- Voucher usage flow explanation
- Ticket availability handling
- Concurrency and race condition handling
- Idempotency or duplicate request handling
- Assumptions and trade-offs

The document should explain not only what was built, but also why certain technical decisions were made.

---

### 8.2 Codebase

The codebase should include:

- Source code
- Clear project structure
- Backend API implementation
- Database integration
- Any required infrastructure configuration, if applicable
- Seed data, if needed

The codebase should reflect the architecture described in the system design document.

---

### 8.3 Coding Guideline and Convention

The submission should include documentation that explains:

- How the project is structured
- How to add a new API
- Naming conventions
- Error handling convention
- Response format convention
- Service/controller/repository structure, if applicable
- How to write or run unit tests

---

### 8.4 Local Setup and Run Instructions

The submission should include clear instructions for running the project locally, such as:

- Required software and versions
- Environment variables
- Database setup
- Redis or cache setup, if used
- How to install dependencies
- How to run migrations
- How to seed data
- How to start the backend server
- How to run tests

The goal is that reviewers should be able to run the system locally without confusion.

---

### 8.5 API Documentation

The submission should include API documentation, for example:

- Swagger / OpenAPI documentation
- API route list
- Request body examples
- Response examples
- Error response examples
- Authentication or authorization notes, if applicable

---

### 8.6 API Testing Collection

The submission should include an API testing collection, for example:

- Postman collection
- Insomnia collection
- Any other API testing file

The collection should work with the local setup.

It should allow reviewers to test key flows such as:

- Creating concerts or ticket categories
- Creating bookings
- Applying vouchers
- Checking booking status
- Updating booking status from the operation side

---

### 8.7 Scope, Assumptions, and Limitations Document

The submission should include a document describing:

- What has been implemented
- What has not been implemented
- Assumptions made during design
- Feature limitations
- Technical limitations
- Possible future improvements

Example topics:

- Booking status states assumed by the system
- Whether payment is simulated or not implemented
- Whether voucher update/delete is supported
- Whether authentication/authorization is implemented
- Whether the operation dashboard is implemented as APIs only
- Whether suspicious booking detection is manual or automated

---

## 9. Suggested Feature Prioritization

Because the assignment is time-limited, the candidate should prioritize features that deliver the greatest business value.

Recommended priorities:

1. Core booking flow
2. Ticket stock validation
3. Anti-overselling mechanism
4. Idempotency for duplicate booking retries
5. Voucher validation and usage limit handling
6. Booking status management
7. Basic operation APIs
8. Documentation and testing collection

Lower-priority features may be simplified or documented as limitations.

---

## 10. Critical Business Problems to Address

### 10.1 Overselling Tickets

The system should prevent selling more tickets than the available quantity.

Possible approaches include:

- Database transaction
- Atomic stock update
- Row-level locking
- Optimistic locking
- Redis-based reservation strategy

The chosen approach should be explained clearly.

---

### 10.2 Duplicate Bookings from Retries

Users may retry requests due to network issues or slow responses.

The system should consider using an idempotency mechanism to avoid creating duplicate bookings for the same user action.

Possible approach:

- Client sends an `idempotencyKey`
- Backend stores and reuses the result for the same key
- Duplicate requests return the original booking result instead of creating a new booking

---

### 10.3 Voucher Abuse

The system should prevent users from abusing limited promotional vouchers.

Possible validations:

- Voucher code exists
- Voucher is active
- Voucher is within valid time range
- Voucher usage limit is not exceeded
- User has not already used the voucher, if per-user limitation is applied

---

### 10.4 Flash Sale Traffic Spikes

The system should be designed with traffic spikes in mind.

Possible considerations:

- Keep booking flow efficient
- Avoid unnecessary database queries
- Use indexes for frequent queries
- Use caching for read-heavy data
- Use transactions only where necessary
- Keep critical writes consistent

---

## 11. Possible Core Entities

The system may include entities such as:

| Entity | Purpose |
| --- | --- |
| Concert | Represents a concert event |
| TicketCategory | Represents ticket types such as VIP or Standard |
| Booking | Represents a customer booking/order |
| BookingItem | Represents selected ticket categories and quantities inside a booking |
| Voucher | Represents promotional voucher campaigns |
| VoucherUsage | Tracks voucher usage and prevents abuse |
| User or Customer | Represents the customer making the booking |
| IdempotencyKey | Stores request keys to prevent duplicate bookings |

The actual entity design may vary depending on implementation decisions.

---

## 12. Possible Booking Status Design

The candidate may define booking statuses based on the selected scope.

Example booking statuses:

| Status | Meaning |
| --- | --- |
| RECEIVED | Booking request has been received |
| WAITING_FOR_PAYMENT | Tickets are reserved and waiting for payment |
| PAID | Payment has been completed |
| CANCELLED | Booking has been cancelled |
| FAILED | Booking failed due to stock, voucher, or system issue |
| EXPIRED | Booking reservation expired before payment |

If payment is not implemented, the system can simulate payment-related states and clearly document the limitation.

---

## 13. Expected Engineering Explanation

The candidate should be ready to explain:

- Why the chosen architecture fits the requirement
- How the database schema supports the business flow
- How the system prevents overselling
- How the system handles retries and duplicate bookings
- How voucher usage is validated
- How booking status transitions are controlled
- What trade-offs were made due to limited time
- What would be improved in a production-ready version

---

## 14. What Is Not Expected

The assignment does not require a fully production-ready system.

The following items may be simplified if clearly documented:

- Real payment gateway integration
- Full authentication and authorization
- Full frontend dashboard
- Advanced fraud detection
- Distributed queue system
- Complex monitoring infrastructure
- Production-grade deployment
- Complete CI/CD pipeline

The candidate should clearly state which features are implemented and which are intentionally left out of scope.

---

## 15. Evaluation Focus

The reviewers want to understand:

- How the candidate thinks about backend design
- How the candidate structures code
- How the candidate reasons about workflows and failure cases
- How the candidate handles business-critical risks
- How clearly the candidate defines scope and limitations
- Whether the candidate can explain technical decisions

A smaller but well-designed and well-explained system is preferred over a large system with unclear reasoning.

---

## 16. Recommended Submission Folder Structure

```text
submission-folder/
├── source-code/
├── docs/
│   ├── requirement.md
│   ├── system-design.md
│   ├── database-design.md
│   ├── assumptions-and-limitations.md
│   ├── coding-guideline.md
│   └── local-setup.md
├── api-docs/
│   └── swagger.yaml or swagger.json
├── postman/
│   └── concert-ticket-booking.postman_collection.json
└── README.md
```

---

## 17. Requirement Summary

The backend system should demonstrate a practical design for a concert ticket booking platform that supports both customers and internal operators.

The most important requirements are:

- Customers can browse concerts and reserve tickets
- The system can handle limited ticket quantities
- The system prevents overselling
- The system handles duplicate booking retries
- The system validates voucher usage
- Operators can monitor and manage bookings
- The codebase is easy to run locally
- APIs are documented and testable
- The scope, assumptions, and limitations are clearly explained

