# Implementation Plan - Fix RFQ Detail Page "Error 500"

The "Error 500" on the RFQ detail page is likely caused by passing non-serializable `Date` objects from the Server Component to a Client Component (`RfqConversation`). Next.js requires props passed across the server-client boundary to be plain serializable objects.

## User Review Required

> [!IMPORTANT]
> This fix involves changing how data is passed between Server and Client components. I will ensure all dates are serialized to ISO strings before they cross the boundary.

## Proposed Changes

### RFQ Feature

#### [MODIFY] [rfq.repository.ts](file:///C:/Users/Al Rehman Laptop/Desktop/gp/gloves-platform/src/features/rfq/repositories/rfq.repository.ts)
- Refine the `findById` method to ensure it handles potential query failures gracefully and returns a clean object structure.

#### [MODIFY] [AdminRfqDetailPage ([id]/page.tsx)](file:///C:/Users/Al Rehman Laptop/Desktop/gp/gloves-platform/src/app/(admin)/admin/rfqs/[id]/page.tsx)
- Serialize `messages` to ensure `createdAt` is a string before passing to the `RfqConversation` client component.
- Add safety checks for `attachments` and other nested arrays.

#### [MODIFY] [CustomerRfqDetailPage ([id]/page.tsx)](file:///C:/Users/Al Rehman Laptop/Desktop/gp/gloves-platform/src/app/(customer)/dashboard/rfqs/[id]/page.tsx)
- Apply similar serialization fixes to the customer-side RFQ detail page.

#### [MODIFY] [rfq-conversation.tsx](file:///C:/Users/Al Rehman Laptop/Desktop/gp/gloves-platform/src/features/rfq/components/rfq-conversation.tsx)
- Update the `Message` type to clearly handle stringified dates and ensure the real-time Supabase payload is also handled correctly.

---

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to ensure no regression in types.

### Manual Verification
- The user should attempt to open an RFQ detail page in the admin panel to verify the "Error 500" is gone.
- Verify that messages are still displayed correctly with timestamps.
- Verify that real-time message updates via Supabase still work.
