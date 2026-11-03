// E01: exercise concrete existing leaves without loading the UI barrels.
// No runtime permissions, credentials, network requests, or preview generation.
import { container2, gridCard } from "../../../components/layout/styles.ts";
import { cardStampNumber } from "../../../components/text/styles.ts";
import { STAMP_TYPES } from "../../../lib/constants/stampConstants.ts";

const result = {
  containerStyleAvailable: container2.includes("rounded-2xl"),
  responsiveGridAvailable: gridCard("cardSquare", true).includes("grid-cols-2"),
  typographyStyleAvailable: cardStampNumber.includes("font-extrabold"),
  classicStampType: STAMP_TYPES.CLASSIC,
};

if (
  !result.containerStyleAvailable || !result.responsiveGridAvailable ||
  !result.typographyStyleAvailable || result.classicStampType !== "classic"
) {
  throw new Error("Existing leaf import probe failed");
}

console.log(JSON.stringify(result));
