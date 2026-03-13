# Business Requirements Map

This summary exists to keep `SKILL.md` short. For original wording, read `/opt/reference/screen/사업내용.txt`.

## Primary business themes from `사업내용.txt`

- Carbon footprint and net reduction calculation support for demand companies
- CCUS lifecycle data integration across capture, transport, storage, and utilization
- Carbon transaction and matching support
- Monitoring, statistics, and reporting for reduction performance
- Certificate and report application, review, issuance, objection, and cancellation flows
- Customer support, notices, Q&A, 자료실, and content management
- Account, authority, menu, board, and admin environment management
- Data quality, governance, interoperability, and external agency linkage

## Repeated platform requirements

- Bilingual or externally presentable outputs are important
- Operator-facing management screens are required across many domains
- Roles differ by operator, evaluator, and applicant
- Status-based handling is central for review and issuance workflows
- Attachment upload, reason entry, history, and notification appear repeatedly
- Real-time or near-real-time monitoring and accumulated statistics are expected

## Concrete admin requirements already implied by the source

- Menu and board management with tree editing, ordering, visibility, and access control
- Content, banner, and popup management with history and restore expectations
- Common code management with duplicate prevention and standardization
- Account and authority management with role-menu-feature control
- IP-restricted administrator access
- Member and company lifecycle management, including withdrawal and destruction policies

## Concrete line-of-business requirements already implied by the source

- Enterprise-specific reduction calculation support
- Report and certificate application workflow
- Approval and rejection handling with reason and attachment support
- Objection handling after rejection
- Fee, refund account, tax invoice, and issuance/cancellation management
- Schedule, statistics, integration history, and operational support

## How to use this reference

- If the user gives only a screen artifact, infer the nearest business area from the menu name and this file
- If the screen belongs to a status-heavy workflow, expect hidden rules around:
  - approval or rejection
  - attachment evidence
  - audit history
  - notification
  - role-scoped visibility
- Do not silently invent those rules. Implement only what is explicit in the request or existing code, and report missing policy assumptions clearly

## Screen source folders

- `/opt/reference/screen/0. Gnb메뉴`
- `/opt/reference/screen/1. 메인화면`
- `/opt/reference/screen/2. 회원인증`
- `/opt/reference/screen/4. 메뉴화면`
- `/opt/reference/screen/고객지원 메뉴`
- `/opt/reference/screen/관리자화면`
- `/opt/reference/screen/일반관리자화면`
