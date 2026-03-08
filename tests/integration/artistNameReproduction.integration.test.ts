
import { SRC101Repository } from "$server/database/src101Repository.ts";
import { StampRepository } from "$server/database/stampRepository.ts";
import { CreatorService } from "$server/services/creator/creatorService.ts";
import { SecurityService } from "$server/services/security/securityService.ts";
import { assertEquals } from "https://deno.land/std@0.216.0/assert/mod.ts";
import { afterEach, describe, it } from "https://deno.land/std@0.216.0/testing/bdd.ts";
import { restore, spy, stub } from "https://deno.land/std@0.216.0/testing/mock.ts";

describe("Artist Name Corruption & Conflict Reproduction", () => {
    const testAddress = "bc1qtestreproducecorruption" + Date.now();
    const testAddressConflict = "bc1qtestconflict" + Date.now();

    afterEach(() => {
        restore();
    });

    it("should pass unsanitized special characters to DB (Corruption Verification)", async () => {
        const specialName = "Artist 🎸 & Co.";

        // Mock Security
        stub(SecurityService, "validateCSRFToken", () => Promise.resolve(true));

        // Mock Database Manager
        const mockDb = {
            executeQuery: spy(() => Promise.resolve({ affectedRows: 1 })),
            invalidateCacheByCategory: () => Promise.resolve(),
            handleCache: (_key: string, fn: any) => fn(),
            executeQueryWithCache: (_q: string, params: any[]) => {
                return Promise.resolve({ rows: [{ creator_name: specialName }] });
            }
        };

        // Inject Mock DB
        StampRepository.setDatabase(mockDb as any);

        // Act: Update Creator Name
        const success = await StampRepository.updateCreatorName(testAddress, specialName);

        // Assert: Check if executeQuery was called with the special name
        assertEquals(success, true, "Update should succeed with mock DB");

        const calls = mockDb.executeQuery.calls;
        assertEquals(calls.length, 1);

        const params = calls[0].args[1];
        assertEquals(params[1], specialName, "Database should receive the exact special name without sanitization.");
    });

    it("should prioritize SRC101 bitnames over 'creators' table (The Logic Flip Fix)", async () => {
        const src101Expected = "FromSRC101.btc"; // The name we expect to win
        const manualName = "ARWYN";           // The legacy name that should be ignored

        // 1. Mock SRC101 to have a valid bitname
        const originalSrc101Method = SRC101Repository.getPrimaryDomainForAddress;
        SRC101Repository.getPrimaryDomainForAddress = async (addr: string) => {
            if (addr === testAddressConflict) return "FromSRC101";
            return null;
        };

        // 2. Mock StampRepository to also have a valid manual name (The Conflict)
        const originalStampRepoMethod = StampRepository.getCreatorNameByAddress;
        StampRepository.getCreatorNameByAddress = async (addr: string) => {
             if (addr === testAddressConflict) return manualName;
             return null;
        };

        // Act: Call the resolution service
        const resolvedName = await CreatorService.getCreatorNameByAddress(testAddressConflict);

        // Assert: The NEW Priority (SRC101 Wins)
        console.log(`Resolved Name: ${resolvedName}`);
        console.log(`Expected (Winner): ${src101Expected}`);

        assertEquals(resolvedName, src101Expected, "SRC101 Bitname should now take priority over the legacy database entry.");

        // Clean up mocks
        SRC101Repository.getPrimaryDomainForAddress = originalSrc101Method;
        StampRepository.getCreatorNameByAddress = originalStampRepoMethod;
    });
});
