# [![WASM Build Status]][WASM actions] [![NPM version]][npmjs.com]

[WASM Build Status]: https://github.com/THCLab/oca-rs/actions/workflows/ci.yml/badge.svg?branch=main
[WASM actions]: https://github.com/THCLab/oca-rs/actions/workflows/ci.yml
[NPM version]: https://img.shields.io/npm/v/oca.js
[npmjs.com]: https://www.npmjs.com/package/oca.js
[oca-rs repo]: https://github.com/THCLab/oca-rs

# oca.js

JavaScript/TypeScript bindings for OCA (Overlays Capture Architecture) using WebAssembly, generated from [oca-sdk-rs][https://github.com/THCLab/oca-bindings/].

## Features

- ✅ **Build OCA bundles** from OCAfile format
- ✅ **Load and validate OCA bundles** from JSON
- ✅ **Attribute validation** with overlay definitions
- ✅ **Full OCA 2.0 support** with community support

## Installation

```bash
npm install oca.js
# or
yarn add oca.js
```

## Quick Start

```javascript
const {
  buildFromOCAfile,
  bundleToJSON
} = require('oca.js');

const ocafile = `--name=my-schema
ADD Attribute name=Text
ADD Attribute age=Numeric
ADD Attribute email=Text

ADD Overlay Meta
  language="en"
  name="Person Schema"
  description="A simple person schema"
`;

const bundle = buildFromOCAfile(ocafile, '');

// Note: bundleToJSON returns double-encoded JSON
const json = JSON.parse(JSON.parse(bundleToJSON(bundle)));

console.log('Bundle digest:', json.digest);
console.log('Attributes:', Object.keys(json.capture_base.attributes));
```

For TypeScript:

```typescript
import {
  buildFromOCAfile,
  bundleToJSON,
  getBundleAttributes
} from 'oca.js';

// ... same usage
```

## Usage Examples

### Example 1: Build OCA Bundle from OCAfile

```javascript
const { buildFromOCAfile, bundleToJSON } = require('oca.js');

const ocafile = `--name=driving-licence
ADD Attribute name=Text
ADD Attribute age=Numeric
ADD Attribute birthdate=DateTime

ADD Overlay Meta
  language="en"
  name="Driving Licence"
  description="Driving licence schema"

ADD OVERLAY Label
  language="en"
  attribute_labels
    name="Full Name"
    age="Age"
    birthdate="Birth Date"
`;

const bundle = buildFromOCAfile(ocafile, '');
const json = JSON.parse(JSON.parse(bundleToJSON(bundle)));

console.log('Classification:', json.capture_base.classification);
console.log('Overlays:', json.overlays.map(o => o.type));
```

### Example 2: Load OCA Bundle from JSON

```javascript
const {
  loadBundle,
  getBundleAttributes,
  bundleToJSON
} = require('oca.js');

const oca_bundle_json = {
  digest: 'E...',
  capture_base: {
    digest: 'E...',
    type: 'capture_base/2.0.0',
    attributes: { name: 'Text', age: 'Numeric' }
  },
  overlays: []
};

const bundle = loadBundle(JSON.stringify(oca_bundle_json), '');
const attributes = getBundleAttributes(bundle);

// Returns Map, so convert to array
const attributeNames = attributes instanceof Map
  ? Array.from(attributes.keys())
  : Object.keys(attributes);

console.log('Attributes:', attributeNames);
```

### Example 3: Validate OCA Bundle

```javascript
const { buildFromOCAfile, validateBundleSemantics } = require('oca.js');

const ocafile = `--name=test-schema
ADD Overlay Meta
  language="en"
  name="Test Schema"
  description="Test description"
`;

const bundle = buildFromOCAfile(ocafile, '');
const bundleObj = JSON.parse(bundle);

const result = validateBundleSemantics(bundleObj);

if (result.valid) {
  console.log('Bundle is valid!');
} else {
  console.error('Validation errors:', result.errors);
}
```

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `buildFromOCAfile(ocafile_str, overlay_file)` | Build OCA bundle from OCAfile format |
| `loadBundle(json_str, overlay_file)` | Load OCA bundle from JSON string |
| `bundleToJSON(bundle)` | **Returns double-encoded JSON string** - use `JSON.parse(JSON.parse(...))` |
| `validateBundleSemantics(bundle)` | Validate bundle semantics, returns `{ valid: boolean, errors: string[] }` |

### Bundle Query Functions

- `getBundleAttributes(bundle)` - Returns `Map<string, string>` with attribute names and types
- `getBundleDigest(bundle)` - Get bundle digest (SAID)
- `getBundleVersion(bundle)` - Get OCA version
- `getBundleType(bundle)` - Get bundle type
- `getOverlayCount(bundle)` - Get number of overlays

### Double JSON Encoding

The `bundleToJSON()` function returns a JSON-encoded string of JSON structure. This is a quirk of the wasm-bindgen implementation:

```javascript
// Correct way to parse
const json = JSON.parse(JSON.parse(bundleToJSON(bundle)));
```

### Map vs Object

`getBundleAttributes()` returns a JavaScript `Map`, not a plain object:

```javascript
const attributes = getBundleAttributes(bundle);
const keys = attributes instanceof Map
  ? Array.from(attributes.keys())
  : Object.keys(attributes);
```

## Documentation

For complete API documentation and more examples, visit the [oca-rs repository](https://github.com/THCLab/oca-rs/tree/main/bindings/js/wasm).

## License

EUPL-1.2 (European Union Public License)


