"""Bounded, public, read-only contract sample; never calls content or previews."""

from __future__ import annotations

import datetime
import hashlib
import json
from pathlib import Path
import resource
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
MAX_BYTES = 2 * 1024 * 1024


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, indent=2) + "\n")


def request(name: str, url: str, suffix: str = ".json") -> dict:
    """GET without credentials or redirects; curl and OS both bound saved bytes."""
    target = ROOT / (name + suffix)
    headers = ROOT / (name + ".headers.txt")

    def bound_file_size() -> None:
        resource.setrlimit(resource.RLIMIT_FSIZE, (MAX_BYTES, MAX_BYTES))

    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result = subprocess.run(
        [
            "curl", "--silent", "--show-error", "--compressed",
            "--max-time", "15", "--connect-timeout", "5",
            "--max-filesize", str(MAX_BYTES), "--proto", "=https",
            "--max-redirs", "0", "--header", "API-Version: 2.3",
            "--user-agent", "stampchain-explorer-proof/0.1",
            "--dump-header", str(headers), "--output", str(target),
            "--write-out", "%{json}", url,
        ],
        capture_output=True, text=True, timeout=18, preexec_fn=bound_file_size,
    )
    try:
        timing = json.loads(result.stdout)
    except json.JSONDecodeError:
        timing = {"unparsed": result.stdout[:1000]}
    body = target.read_bytes() if target.exists() else b""
    record = {
        "name": name, "startedUtc": started, "requestedUrl": url,
        "exitCode": result.returncode, "error": result.stderr[:2000],
        "bytesSaved": len(body), "sha256": hashlib.sha256(body).hexdigest(),
        "curl": timing,
    }
    write_json(ROOT / (name + ".request.json"), record)
    print(json.dumps({
        "name": name, "status": timing.get("http_code"),
        "exitCode": result.returncode, "bytes": len(body),
        "seconds": timing.get("time_total"), "error": result.stderr[:200],
    }), flush=True)
    return record


def collect_lists() -> None:
    plan = json.loads((ROOT / "sampling-plan.json").read_text())
    for stratum in plan["strata"]:
        request(stratum["name"], "https://stampchain.io/api/v2/stamps?" + stratum["query"])


def collect_details() -> None:
    request("recent-raster-page2", "https://stampchain.io/api/v2/stamps?limit=4&page=2&sortBy=DESC&type=classic&filetype=png,jpg,gif,webp")
    for stratum in ("recent-raster", "older-raster"):
        envelope = json.loads((ROOT / (stratum + ".json")).read_text())
        stamp = envelope["data"][0]["stamp"]
        request("detail-" + str(stamp), "https://stampchain.io/api/v2/stamps/" + str(stamp))
    request("invalid-page", "https://stampchain.io/api/v2/stamps?limit=1&page=0&sortBy=DESC&type=classic")


def collect_media() -> None:
    for stratum in ("recent-raster", "older-raster", "active-originals"):
        envelope = json.loads((ROOT / (stratum + ".json")).read_text())
        for stamp in envelope["data"]:
            url = stamp.get("stamp_url", "")
            if not re.fullmatch(r"https://stampchain\.io/stamps/[a-f0-9]{64}\.(png|jpg|jpeg|gif|webp)", url):
                continue
            if stamp.get("stamp_mimetype") not in ("image/png", "image/jpeg", "image/gif", "image/webp"):
                continue
            suffix = "." + url.rsplit(".", 1)[1]
            request("media-" + str(stamp["stamp"]), url, suffix)


if __name__ == "__main__":
    if len(sys.argv) == 1 or sys.argv[1] == "lists":
        collect_lists()
    elif len(sys.argv) == 2 and sys.argv[1] == "details":
        collect_details()
    elif len(sys.argv) == 2 and sys.argv[1] == "media":
        collect_media()
    else:
        raise SystemExit("Usage: collect_sample.py [lists | details | media]")
