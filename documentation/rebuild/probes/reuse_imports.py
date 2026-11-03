"""E01 local import graph probe; never execute legacy application modules."""

import argparse
from collections import deque
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess
from urllib.parse import unquote


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--deno", default="deno")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[3]
    base = root.as_uri() + "/"
    flags = ["--no-remote", "--no-npm", "--no-lock", "--node-modules-dir=none"]

    def run(command):
        result = subprocess.run(
            command, cwd=root, capture_output=True, text=True, timeout=30
        )
        if result.returncode:
            raise RuntimeError(result.stderr or result.stdout)
        return result.stdout

    def relative(specifier):
        return unquote(specifier[len(base):]) if specifier.startswith(base) else specifier

    targets = [
        "client/wallet/wallet.ts",
        "lib/utils/bitcoin/minting/broadcast.ts",
        "lib/utils/bitcoin/minting/TransactionConstructionService.ts",
        "server/database/databaseManager.ts",
        "server/services/aws/previewStorageService.ts",
    ]
    entries = {
        "list_ui": "islands/content/ExplorerContent.tsx",
        "stamp_card": "islands/card/StampCard.tsx",
        "legacy_detail_route": "routes/stamp/[id].tsx",
        "reused_leaves": "documentation/rebuild/probes/reuse-leaves.ts",
    }
    evidence = {
        "captured_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_revision": run(["git", "rev-parse", "HEAD"]).strip(),
        "deno_version": run([args.deno, "--version"]).strip(),
        "method": {
            "graph_command": [args.deno, "info", "--json", *flags, "ENTRY"],
            "interpretation": "Follow Deno's code dependency edges, including literal dynamic imports and barrel reexports; exclude type-only edges.",
            "limits": [
                "No legacy module is executed and no credentials or remote services are used.",
                "Remote and npm resolutions are deliberately disabled; their errors are evidence limits, not reported build failures.",
                "This is a conservative source import graph, not emitted-bundle size or proof that reachable functions execute.",
                "Nonliteral dynamic imports and dependencies behind unresolved external modules are not inventoried.",
                "The legacy detail entry includes its loader; it does not measure an extracted rendering function in isolation.",
            ],
        },
        "graphs": {},
    }
    for label, entry in entries.items():
        data = json.loads(run([args.deno, "info", "--json", *flags, entry]))
        modules = {module["specifier"]: module for module in data["modules"]}
        origin = data["roots"][0]
        paths = {origin: []}
        queue = deque([origin])
        while queue:
            source = queue.popleft()
            for dependency in modules.get(source, {}).get("dependencies", []):
                edge = dependency.get("code", {})
                destination = edge.get("specifier")
                if destination is None or destination in paths:
                    continue
                step = {
                    "source": relative(source),
                    "line": edge["span"]["start"]["line"] + 1,
                    "import": dependency["specifier"],
                    "resolved": relative(destination),
                    "dynamic": dependency.get("isDynamic", False),
                }
                paths[destination] = [*paths[source], step]
                queue.append(destination)
        local = sorted(relative(specifier) for specifier in paths if specifier.startswith(base))
        errors = [
            {"specifier": relative(module["specifier"]), "error": module["error"]}
            for module in data["modules"] if "error" in module
        ]
        evidence["graphs"][label] = {
            "entry": entry,
            "entry_sha256": hashlib.sha256((root / entry).read_bytes()).hexdigest(),
            "local_code_module_count": len(local),
            "external_code_specifiers": sorted(specifier for specifier in paths if not specifier.startswith(base)),
            "local_code_modules": local,
            "shortest_coupling_paths": {
                target: paths.get(base + target) for target in targets
            },
            "unresolved_modules_in_parser_graph": errors,
        }

    smoke_command = [
        args.deno, "run", "--no-prompt", *flags,
        "documentation/rebuild/probes/reuse-leaves.ts",
    ]
    evidence["leaf_execution"] = {
        "command": smoke_command,
        "exit_code": 0,
        "granted_runtime_permissions": [],
        "result": json.loads(run(smoke_command)),
    }
    evidence["option_notes"] = {
        "reusable_without_legacy_ui_graph": [
            "Concrete layout and typography style modules, responsive grid helper, and stamp classification constants execute without runtime permissions in the leaf smoke probe.",
            "ExplorerContent takes props and the stamp route has distinct loader/render functions, providing extraction seams; its existing imported implementations remain coupled.",
            "Existing identifiers, canonical route shapes, design tokens and data-field knowledge can be preserved without copying wallet or transaction controls.",
        ],
        "coupled_components": [
            "ExplorerContent reaches wallet, transaction construction, broadcast, and database modules through static UI imports and barrel reexports.",
            "StampCard and StampInfo directly import the purchase tool; changing only a parent layout or hiding controls does not sever this graph.",
            "Legacy StampImage, image helpers, and detail social-image metadata can reference preview generation; reused display code needs static media and fallback changes.",
        ],
        "least_cost_candidate_to_build": "Keep Deno/Fresh in a restricted proof package and reuse concrete leaves and established contracts. Implement two small display-only page types rather than wrap the full existing explorer/detail UI. This is selective reuse within the owner fork, with no framework migration.",
        "not_yet_proved_here": [
            "Production build, restricted Fresh manifest, package contents, credential-free server boot and deployed route behavior.",
            "Read API availability, paging/filter fidelity, freshness, quotas, data/media permissions, costs and hosting access.",
            "The actual remaining implementation/maintenance effort of either option; module counts are not an effort estimate.",
        ],
    }
    output = root / "documentation/rebuild/evidence/reuse-imports.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(evidence, indent=2) + "\n")
    print(json.dumps({
        "output": str(output),
        "counts": {key: value["local_code_module_count"] for key, value in evidence["graphs"].items()},
        "leaf_execution": evidence["leaf_execution"]["result"],
    }))


if __name__ == "__main__":
    main()
