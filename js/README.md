## JavaScript WASM Bindings

This package provides JavaScript bindings for OCA (Overlays Capture
Architecture) using WebAssembly.

It expose oca-sdk-rs into Java Scritp Ecosystem.

### Features

- ✅ **Load and validate OCA bundles** from JSON
- ✅ **Build OCA bundles** with attributes, overlays, and metadata
- ✅ **Parse and generate AST** (Abstract Syntax Tree)
- ✅ **Attribute validation** with overlay definitions
- ✅ **Multiple attribute types**: Text, Numeric, Boolean, DateTime, Binary, Reference, Array, etc.
- ✅ **Overlay support**: Meta, Label, Format, Information, CharacterEncoding, Unit, Conformances, EntryCodes, Entry, Link, and more
- ✅ **Framing support** for ontology alignment

### Installation

```bash
# Install locally
cd oca-bindings/js
yarn install

# Or use npm
npm install

# Build the WASM package
cd wasm
bash build-pkg.sh

# The package will be built in the `pkg` directory
```

### Usage Examples

#### Basic OCA Bundle Creation

```javascript
const { OCABox, Attribute, create_nested_attr_type_from_js } = require('oca.js');

// Create a new OCA bundle
const oca = new OCABox()
  .addClassification("GICS:35102020")
  .generateBundle();

console.log('OCA Bundle:', oca);
```

#### Adding Attributes

```javascript
const numericType = create_nested_attr_type_from_js("Numeric");
const oca = new OCABox()
  .addClassification("GICS:35102020")
  .addAttribute(
    new Attribute("age")
      .setAttributeType(numericType)
      .setLabel({ eng: "Age", pol: "Wiek" })
      .setFormat("0-120")
  )
  .generateBundle();
```

#### Working with Multiple Languages

```javascript
const oca = new OCABox()
  .addClassification("GICS:35102020")
  .addMeta("name", {
    eng: "Driving Licence",
    pol: "Prawo Jazdy"
  })
  .addMeta("description", {
    eng: "DL desc",
    pol: "PJ desc"
  })
  .generateBundle();
```

#### Parsing Existing OCA Bundles

```javascript
const oca_bundle_json = require('./path/to/oca.json');
const oca_box = new OCABox()
  .load(oca_bundle_json)
  .addClassification("test_classification");

const attributes = oca_box.attributes();
const meta = oca_box.meta();

console.log('Attributes:', attributes);
console.log('Metadata:', meta);
```

#### Generating AST

```javascript
const oca_box = new OCABox().load(oca_bundle_json);
const ast = oca_box.toAST();

console.log('AST Version:', ast.version);
console.log('Commands:', ast.commands);
```

#### Attribute Types Support

```javascript
const textType = create_nested_attr_type_from_js("Text");
const numericType = create_nested_attr_type_from_js("Numeric");
const booleanType = create_nested_attr_type_from_js("Boolean");
const dateTimeType = create_nested_attr_type_from_js("DateTime");
const binaryType = create_nested_attr_type_from_js("Binary");

// Create array types
const arrayType = create_nested_attr_type_from_js(["Text"]);
const arrayTypeWithRef = create_nested_attr_type_from_js(["refs:ABC123"]);

// Reference to another bundle
const refType = create_nested_attr_type_from_js("refs:EF5ERATRBBN_ewEo9buQbznirhBmvrSSC0O2GIR4Gbfs");
```

#### Overlays

The OCA bundle supports various overlay types:

```javascript
const oca = new OCABox()
  .addClassification("GICS:35102020")
  .addMeta("name", { eng: "Name" })
  .addMeta("description", { eng: "Description" })
  .addAttribute(
    new Attribute("attr_name")
      .setAttributeType(numericType)
      .setLabel({ eng: "Name: " })
      .setInformation({ eng: "En info" })
      .setEntries({
        o1: { eng: "Option 1", pol: "Opcja 1" },
        o2: { eng: "Option 2", pol: "Opcja 2" }
      })
      .setLinks({ "target_bundle_said": "name" })
      .setFramings({
        frame_id: "SNOMEDCT",
        frame_label: "Clinical Terms",
        frame_location: "https://bioportal.bioontology.org/ontologies/SNOMEDCT",
        frame_version: "2023AA"
      }, {
        "http://purl.bioontology.org/ontology/snomedct/703503000": {
          predicate_id: "skos:exactMatch",
          framing_justification: "semapv:ManualMappingCuration",
        }
      })
  )
  .generateBundle();
```

### Validation

```javascript
const { Validator } = require('oca.js');
const oca = new OCABox().addClassification("GICS:35102020").generateBundle();
const validator = new Validator();

const result = validator.validate(oca);
console.log('Valid:', result.success);
if (!result.success) {
  console.log('Errors:', result.errors);
}
```

### TypeScript Support

The bindings include TypeScript definitions. You can use them in TypeScript projects:

```typescript
import { OCABox, Attribute, create_nested_attr_type_from_js } from 'oca.js';

const numericType = create_nested_attr_type_from_js("Numeric");
const oca = new OCABox()
  .addClassification("GICS:35102020")
  .addAttribute(
    new Attribute("age")
      .setAttributeType(numericType)
      .setLabel({ eng: "Age" })
  )
  .generateBundle();
```

### Running Tests

```bash
# Install dependencies
cd example
yarn install
# or
npm install

# Run all tests
yarn test
# or
npm test

# Run a specific test
yarn test parsing-oca.test.ts
```

### Build Process

The build process uses `wasm-bindgen` to compile Rust code to JavaScript:

1. **Rust compilation**: `cargo build --target wasm32-unknown-unknown --release`
2. **WASM generation**: `wasm-bindgen` converts .wasm to JS bindings
3. **Package generation**: Creates npm package in `pkg/` directory
4. **TypeScript definitions**: Automatically generated from Rust code

### License

**EUPL-1.2** (European Union Public License)

### Links

- [OCA Specification](https://github.com/the-human-colossus-foundation/oca-spec)
- [OCA SDK](https://github.com/THCLab/oca-sdk-rs)
- [OCA Bindings (Dart)](./dart)
- [OCA Bindings (Flutter)](./dart)
