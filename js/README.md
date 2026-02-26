## JavaScript WASM Bindings

This package provides JavaScript/TypeScript bindings for OCA (Overlays Capture Architecture) using WebAssembly.

### Features

- ✅ **Build OCA bundles** from OCAfile format
- ✅ **Load and validate OCA bundles** from JSON
- ✅ **Attribute validation** with overlay definitions
- ✅ **Full OCA 2.0 support** with community overlays

### Installation

#### From npm (when published)

```bash
npm install oca.js
# or
yarn add oca.js
```

### From local source (for development)

```bash
cd ../js/example
yarn install
```

The package is installed from the local `../wasm/pkg` directory using the `file:` protocol in `package.json`:

```json
{
  "dependencies": {
    "oca.js": "file:../wasm/pkg"
  }
}
```

### Building WASM Package

```bash
cd js/wasm
cargo install -f wasm-bindgen-cli
bash build-pkg.sh
```

This builds the Rust code to WebAssembly and generates JavaScript bindings in the `pkg/` directory.

### Quick Start

```javascript
const {
  buildFromOCAfile,
  bundleToJSON,
  getBundleAttributes
} = require('oca.js');

const overlay_file = '...'; // Load your overlay definitions
const ocafile = `--name=my-schema
ADD Attribute name=Text
ADD Attribute age=Numeric
`;

const bundle = buildFromOCAfile(ocafile, overlay_file);

// Note: bundleToJSON returns double-encoded JSON
const json = JSON.parse(JSON.parse(bundleToJSON(bundle)));
console.log(json);
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

### Usage Examples

#### Building OCA Bundles from OCAfile

```javascript
const { buildFromOCAfile, bundleToJSON } = require('oca.js');
const fs = require('fs');

const overlay_file = fs.readFileSync('./semantic.overlayfile', 'utf8');

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

const bundle = buildFromOCAfile(ocafile, overlay_file);
const json = JSON.parse(JSON.parse(bundleToJSON(bundle)));
```

#### Loading OCA Bundles from JSON

```javascript
const {
  loadBundle,
  getBundleAttributes,
  getBundleClassification,
  bundleToJSON
} = require('oca.js');
const fs = require('fs');

const overlay_file = fs.readFileSync('./semantic.overlayfile', 'utf8');
const oca_bundle_json = JSON.parse(fs.readFileSync('./oca_bundle.json', 'utf8'));

const bundle = loadBundle(JSON.stringify(oca_bundle_json), overlay_file);

// Get attributes (returns Map)
const attributes = getBundleAttributes(bundle);
const keys = attributes instanceof Map
  ? Array.from(attributes.keys())
  : Object.keys(attributes);

// Convert to JSON
const json = JSON.parse(bundleToJSON(bundle));
```

#### Validating OCA Bundles

```javascript
const { buildFromOCAfile, validateBundleSemantics } = require('oca.js');

const overlay_file = '...';
const ocafile = `--name=test-schema
ADD Overlay Meta
  language="en"
  name="Test Schema"
  description="Test description"
`;

const bundle = buildFromOCAfile(ocafile, overlay_file);
const bundleObj = JSON.parse(bundle);

const result = validateBundleSemantics(bundleObj);

console.log('Valid:', result.valid);
console.log('Errors:', result.errors);
```

#### Working with Attributes

```javascript
const {
  addAttributeToBundle,
  addOverlayToBundle,
  createBundleWithAttributes
} = require('oca.js');

// Create bundle with attributes
const attributes = {
  attr_name: 'Text',
  attr_age: 'Numeric',
  attr_email: 'Text'
};

const bundle = createBundleWithAttributes('my_classification', attributes);

// Add attribute to existing bundle
bundle = addAttributeToBundle(bundle, 'attr_phone', 'Text');

// Add overlay
const overlayProperties = {
  language: 'en',
  name: 'My Schema',
  description: 'Test description'
};

bundle = addOverlayToBundle(bundle, 'meta', 'meta', overlayProperties);
```

### API Reference

#### Bundle Creation & Loading

- `buildFromOCAfile(ocafile_str, overlay_file) → Bundle` - Build OCA bundle from OCAfile format
- `loadBundle(json_str, overlay_file) → Bundle` - Load OCA bundle from JSON string
- `createBundleWithAttributes(classification, attributes) → Bundle` - Create new bundle with attributes

#### Bundle Query Functions

- `getBundleAttributes(bundle) → Map | Record` - Get bundle attributes (returns Map)
- `getBundleClassification(bundle) → string` - Get bundle classification
- `getBundleDigest(bundle) → string` - Get bundle digest (SAID)
- `getBundleVersion(bundle) → string` - Get OCA version
- `getBundleType(bundle) → string` - Get bundle type
- `getBundleFlaggedAttributes(bundle) → any` - Get flagged attributes
- `getOverlayCount(bundle) → number` - Get number of overlays
- `getOverlayNames(bundle) → any` - Get overlay names
- `hasOverlays(bundle) → boolean` - Check if bundle has overlays

#### Bundle Modification

- `addAttributeToBundle(bundle, attribute_name, attribute_type) → Bundle` - Add attribute to bundle
- `removeAttributeFromBundle(bundle, attribute_name) → Bundle` - Remove attribute from bundle
- `addOverlayToBundle(bundle, overlay_name, overlay_type, properties) → Bundle` - Add overlay to bundle
- `removeOverlayFromBundle(bundle, overlay_name) → Bundle` - Remove overlay from bundle

#### Serialization & Generation

- `bundleToJSON(bundle) → string` - **Returns double-encoded JSON string** (use `JSON.parse(JSON.parse(...))`)
- `generateOCAfile(bundle, overlay_file) → string` - Generate OCAfile from bundle
- `parseOCAfile(ocafile_str, overlay_file) → any` - Parse OCAfile

#### Validation

- `validateBundleSemantics(bundle) → { valid: boolean, errors: string[] }` - Validate bundle semantics

#### Types

- `AttributeType` - Enum: `Boolean`, `Binary`, `Text`, `Numeric`, `DateTime`
- `Encoding` - Enum: `Base64`, `Utf8`, `Iso8859_1`, `Utf16`, `Utf16Be`, `Utf16Le`

### Important Notes

#### OCA 2.0 Format Changes

This library uses OCA 2.0 format:

1. **Overlays are now arrays**: `overlays` is an array instead of an object
2. **Overlay type format**: Changed from `spec/overlays/label/1.0` to `overlay/label/2.0.0`
3. **Digest key**: Uses `digest` instead of `d`
4. **Language codes**: Uses `en`, `fr`, `pl` instead of `eng`, `fra`, `pol`
5. **Properties nesting**: Overlay properties are under a `properties` key

Example OCA 2.0 structure:
```json
{
  "digest": "E...",
  "capture_base": {
    "digest": "E...",
    "type": "capture_base/2.0.0",
    "attributes": {}
  },
  "overlays": [
    {
      "digest": "E...",
      "type": "overlay/meta/2.0.0",
      "properties": {
        "language": "en",
        "name": "My Schema"
      }
    }
  ]
}
```

#### Double JSON Encoding

The `bundleToJSON()` function returns a JSON-encoded string of JSON structure:

```javascript
const json = JSON.parse(JSON.parse(bundleToJSON(bundle)));
```

This is a quirk of the wasm-bindgen implementation.

#### Map vs Object

`getBundleAttributes()` returns a JavaScript `Map`, not a plain object:

```javascript
const attributes = getBundleAttributes(bundle);
const keys = attributes instanceof Map
  ? Array.from(attributes.keys())
  : Object.keys(attributes);
```

### Running Examples

```bash
cd example

# Run the example script
yarn example

# Run all tests
yarn test

# Run a specific test
yarn test building-oca.test.ts
```

### Build Process

The build process uses `wasm-bindgen` to compile Rust code to JavaScript:

1. **Rust compilation**: `cargo build --target wasm32-unknown-unknown --release`
2. **WASM generation**: `wasm-bindgen` converts .wasm to JS bindings
3. **Package generation**: Creates npm package in `pkg/` directory
4. **TypeScript definitions**: Automatically generated from Rust code

### Documentation

For detailed API documentation and more examples, see [wasm/README.md](./wasm/README.md).

### License

**EUPL-1.2** (European Union Public License)

### Links

- [OCA Specification](https://github.com/the-human-colossus-foundation/oca-spec)
- [OCA SDK](https://github.com/THCLab/oca-sdk-rs)
- [OCA Bindings (Dart)](../dart)
