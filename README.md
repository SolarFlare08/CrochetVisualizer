# Loop Studio

A local-first crochet workspace built with React, Vite and Three.js. Includes a 19-round sample pear, live validation, an editable round table, orbitable stitch geometry, a construction chart, yarn settings, gauge and artistic dimensions, and a persistent crochet counter.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite. `npm run build` produces a static `dist/` folder; `npm run preview` serves that build. On this Windows installation, if npm is absent from PATH, use `& 'C:/Program Files/nodejs/npm.cmd' run dev` in PowerShell.

## Supported notation (US terms)

One round per line, with consecutive round numbers starting at 1:

```text
# Comments begin with a hash
R1: 6 sc in MR (6)
R2: inc x6 (12)
R3: [sc, inc] x6 (18)
R4-6: sc around (18)
R7: [sc, dec] x6 (12)
```

- `MR` / `magic ring`: single-crochet foundation in round 1.
- `sc`: consumes one stitch, produces one.
- `inc`: consumes one, produces two single crochets.
- `dec`: consumes two, produces one single crochet.
- Counts: `6 sc`, `6sc`, `sc x6`, `inc x6`.
- Repeats: `[2 sc, inc] x6` or `(2 sc, inc) x6`. Nested groups accepted, up to 5 levels.
- `sc around` or `sc in each st` / `sc in each stitch`.
- Round labels: `R1:`, `Round 1:`, `1:`, `1.`. Ranges like `R4-6:` repeat the same instructions each round.
- Optional output totals in trailing parentheses, checked against calculated counts.

The parser checks stitch consumption against the preceding round, declared totals, unsupported notation, and consecutive round numbers. Limits: 200 rounds and 2,000 operations per round. Unsupported instructions and mismatched counts show validation messages and an approximate preview. Unknown rounds use declared or preceding counts for visualization only. Chains, flat rows, joined rounds, hdc/dc, colorwork, and free-form prose are not simulated.

## Working on a project

Next/previous stitch moves through output stitches and crosses round boundaries. Mark round complete advances to the next round. Select rounds in the round editor or construction chart to resume there; preceding rounds are treated as completed. Reset progress returns to R1/stitch 0. Editing pattern instructions resets tracking to avoid retaining a misleading position. Invalid current rounds cannot advance.

Pattern, project name, yarn settings, dimensions and progress save automatically to browser localStorage. Keep the same browser profile and localhost port to return to the saved project. Export project downloads a JSON backup; Quick guide → Import project restores one. Clearing browser data removes local progress. There is no account or cloud synchronization.

## Preview limits

Counts are calculated deterministically for supported instructions. Geometry is an illustrative axisymmetric construction, not a physics/tension solver. It shows at most 240 stitch marks per round for performance, while preserving actual totals in the editor and counter. Gauge determines estimated circumference and round height. Artistic width/height scale changes geometry without changing stitch counts. Yarn/hook details are saved project notes; they do not automatically infer gauge. Real dimensions vary with tension, stuffing, yarn and shaping. Use the gauge fields with a measured swatch.

## Validation

```sh
npm test
npm run build
```

Unit tests cover sample counts, increases/decreases, repeats, ranges, invalid syntax, totals, and counter transitions. Browser workflow verified through live editing, validation, round completion, stitch advancement and reload persistence.

## Display modes

- **Realistic**: curved yarn front legs and braided top strands, with stitches tilted to follow shaping.
- **Sketch**: a rotatable structural view with working-direction arrows and links between input/output stitches. Increases fan out; decreases converge.
- **Chart**: a rotatable symbol view on the object surface. X marks sc, V branches mark an increase, and converging branches mark a decrease. One increase symbol spans its two output stitches.
- **Rounds**: the original flat output-stitch map, with click-to-select rounds.

All three 3D modes share orbit/zoom, camera presets, cutaway and live pattern updates. These are illustrative representations of single crochet construction, not a physical yarn topology solver.

Desktop now opens as a canvas-first studio with floating pattern and counter panels and a bottom display-mode switcher. Counter and Yarn & shape buttons toggle the right-hand tools. On smaller screens the panels stack for easier editing. The backing shell is centered within the yarn thickness, and yarn vertices follow the same curved profile through increases/decreases, including the cutaway view.

## Project library and crochet tracking

The Projects screen stores multiple independent projects, migrates your previous workspace into the library, and provides starter templates, clone, archive, and restore. All data stays in this browser. Each project keeps its own pattern, yarn settings and progress; Export/Import provides portable JSON backups.

Worked stitches are teal; the next output stitch is orange, with an arrow showing its position. These colors also appear in Sketch, Chart and Rounds. The numbered stitch strip resumes before a chosen stitch. Active stitch camera follows the counter. Snapshot downloads the current 3D view as a PNG.

Additional accepted single-crochet syntax: `sc2inc`, `sc2tog`, prefix repeats such as `6(sc, sc2inc)`, `R4-R6` ranges, `R0: mr`, and per-round hex colors such as `R1: col[#ffaa00], 6sc`. A first round containing only sc implicitly starts in a magic ring.

This implements the local project workflow and single-crochet workspace inspired by Knotly. It does not reproduce Knotly accounts, cloud sharing, multipart SEW assembly, arbitrary attached branches, chain/oval foundations, or dc/hdc stitch simulation. Those instructions remain validation errors; the displayed fallback is explicitly approximate.
