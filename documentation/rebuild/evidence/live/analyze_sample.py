"""Offline verification of the saved public responses and static PNG bodies."""

from __future__ import annotations

import base64
from collections import Counter
import hashlib
import io
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
Image.MAX_IMAGE_PIXELS = 16_000_000


def read_json(name: str) -> dict:
    return json.loads((ROOT / (name + ".json")).read_text())


def normalized_flag(value: object) -> bool | None:
    if value is True or value == 1:
        return True
    if value is False or value == 0:
        return False
    return None


def main() -> None:
    records = []
    list_records = {}
    for stratum in ("recent-raster", "older-raster", "active-originals"):
        for position, row in enumerate(read_json(stratum)["data"], 1):
            list_records[row["stamp"]] = row
            record = {
                "stratum": stratum,
                "position": position,
                "stamp": row["stamp"],
                "cpid": row["cpid"],
                "txHash": row["tx_hash"],
                "advertisedUrl": row.get("stamp_url"),
                "advertisedMime": row.get("stamp_mimetype"),
                "advertisedFileSizeBytes": row.get("file_size_bytes"),
            }
            request_file = ROOT / ("media-" + str(row["stamp"]) + ".request.json")
            if not request_file.exists():
                record["mediaStatus"] = "intentionally unsupported; no body requested"
                records.append(record)
                continue
            request = json.loads(request_file.read_text())
            suffix = "." + row["stamp_url"].rsplit(".", 1)[1]
            path = ROOT / ("media-" + str(row["stamp"]) + suffix)
            body = path.read_bytes()
            record.update({
                "httpStatus": request["curl"].get("http_code"),
                "responseContentType": request["curl"].get("content_type"),
                "downloadedBytes": len(body),
                "downloadedSha256": hashlib.sha256(body).hexdigest(),
                "hasPngSignature": body.startswith(b"\x89PNG\r\n\x1a\n"),
                "redirectsFollowed": request["curl"].get("num_redirects"),
            })
            try:
                with Image.open(path) as image:
                    image.verify()
                with Image.open(path) as image:
                    image.load()
                    record["decodedFormat"] = image.format
                    record["width"] = image.width
                    record["height"] = image.height
                    record["pixelSha256"] = hashlib.sha256(image.convert("RGBA").tobytes()).hexdigest()
                record["mediaStatus"] = "signature and full pixel decoding passed"
            except Exception as error:
                record["mediaStatus"] = "decoding failed: " + str(error)
            records.append(record)

    comparisons = []
    fields = ("stamp", "cpid", "tx_hash", "creator", "creator_name", "stamp_url", "stamp_mimetype", "block_index", "tx_index", "block_time", "supply")
    for stratum in ("recent-raster", "older-raster"):
        stamp = read_json(stratum)["data"][0]["stamp"]
        detail = read_json("detail-" + str(stamp))["data"]["stamp"]
        row = list_records[stamp]
        comparison = {
            "stamp": stamp,
            "fieldsCompared": list(fields),
            "exactMatches": {field: row.get(field) == detail.get(field) for field in fields},
            "normalizedFlagsMatch": {
                field: normalized_flag(row.get(field)) == normalized_flag(detail.get(field))
                for field in ("locked", "divisible")
            },
        }
        original = base64.b64decode(detail["stamp_base64"], validate=True)
        suffix = "." + row["stamp_url"].rsplit(".", 1)[1]
        served = (ROOT / ("media-" + str(stamp) + suffix)).read_bytes()
        with Image.open(io.BytesIO(original)) as image:
            image.load()
            original_image = image.convert("RGBA")
            original_pixels = original_image.tobytes()
            comparison["base64Dimensions"] = list(image.size)
        with Image.open(io.BytesIO(served)) as image:
            image.load()
            served_image = image.convert("RGBA")
            served_pixels = served_image.tobytes()
            comparison["servedDimensions"] = list(image.size)
        comparison.update({
            "base64Bytes": len(original),
            "servedBytes": len(served),
            "byteIdentical": original == served,
            "decodedRgbaPixelsIdentical": original_pixels == served_pixels,
            "compositedPixelsIdentical": {
                color: Image.alpha_composite(Image.new("RGBA", original_image.size, color), original_image).tobytes()
                == Image.alpha_composite(Image.new("RGBA", served_image.size, color), served_image).tobytes()
                for color in ("black", "white")
            },
        })
        comparisons.append(comparison)

    first_page = read_json("recent-raster")["data"]
    second_page = read_json("recent-raster-page2")["data"]
    older_page = read_json("older-raster")["data"]
    manifest = {
        "selectionPlan": "sampling-plan.json",
        "sourceRevision": "7e3cd554b44302f9c07dc6c8c557ed63a6520294",
        "sampleCount": len(records),
        "uniqueStampCount": len({row["stamp"] for row in records}),
        "advertisedMimeCounts": dict(Counter(row["advertisedMime"] for row in records)),
        "records": records,
        "sourceDataComparisons": comparisons,
        "pagingObservations": {
            "firstPageStampNumbers": [row["stamp"] for row in first_page],
            "secondPageStampNumbers": [row["stamp"] for row in second_page],
            "olderPageStampNumbers": [row["stamp"] for row in older_page],
            "adjacentPageIntersection": sorted({row["stamp"] for row in first_page} & {row["stamp"] for row in second_page}),
            "firstPageTransactionIndexesDescending": [row["tx_index"] for row in first_page] == sorted((row["tx_index"] for row in first_page), reverse=True),
            "secondPageTransactionIndexesDescending": [row["tx_index"] for row in second_page] == sorted((row["tx_index"] for row in second_page), reverse=True),
            "olderTransactionIndexesAscending": [row["tx_index"] for row in older_page] == sorted(row["tx_index"] for row in older_page),
            "snapshotStabilityProven": False,
        },
    }
    requests = [json.loads(path.read_text()) for path in sorted(ROOT.glob("*.request.json"))]
    manifest["requestSummary"] = [{
        "name": item["name"],
        "startedUtc": item["startedUtc"],
        "status": item["curl"].get("http_code"),
        "seconds": item["curl"].get("time_total"),
        "bytes": item["bytesSaved"],
        "exitCode": item["exitCode"],
    } for item in requests]
    (ROOT / "sample-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({
        "sampleCount": manifest["sampleCount"],
        "uniqueStampCount": manifest["uniqueStampCount"],
        "mimeCounts": manifest["advertisedMimeCounts"],
        "media": [{key: row.get(key) for key in ("stamp", "mediaStatus", "width", "height")} for row in records],
        "comparisons": comparisons,
        "paging": manifest["pagingObservations"],
    }, indent=2))


if __name__ == "__main__":
    main()
