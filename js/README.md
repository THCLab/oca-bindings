## JavaScript WASM Bindings

This directory contains JavaScript/TypeScript bindings for OCA (Overlays Capture Architecture) using WebAssembly.

## Structure

- **`wasm/`** - Rust source code and build scripts for the WebAssembly package
- **`example/`** - Example applications and test suite
- **`pkg/`** - Generated npm package (not committed to git)

## Quick Links

- **For npm package documentation**: See the [README published with the package](https://www.npmjs.com/package/oca.js) or check `wasm/pkg_templates/README.md`
- **For working examples**: See `example/` directory

## Installation

### For Consumers (From npm)

```bash
npm install oca.js
# or
yarn add oca.js
```

### For Developers

To work on the JavaScript bindings:

```bash
cd example
yarn install
```

The package is installed from the local `../wasm/pkg` directory using the `file:` protocol.

## Building

To build the WebAssembly package from Rust source:

```bash
cd wasm
cargo install -f wasm-bindgen-cli
./build-pkg.sh
```

This builds the Rust code to WebAssembly and generates JavaScript bindings in the `pkg/` directory.

## Running Examples

```bash
cd example

# Run the example script
yarn example

# Run tests
yarn test
```

## Build Process

The build process uses `wasm-bindgen` to compile Rust code to JavaScript:

1. **Rust compilation**: `cargo build --target wasm32-unknown-unknown --release`
2. **WASM generation**: `wasm-bindgen` converts .wasm to JS bindings
3. **Package generation**: Creates npm package in `pkg/` directory
4. **TypeScript definitions**: Automatically generated from Rust code

## Features

- ✅ **Build OCA bundles** from OCAfile format
- ✅ **Load and validate OCA bundles** from JSON
- ✅ **Attribute validation** with overlay definitions
- ✅ **Multiple attribute types**: Text, Numeric, Boolean, DateTime, Binary
- ✅ **Full OCA 2.0 support** with all overlay types

## License

**EUPL-1.2** (European Union Public License)

## Related Links

- [OCA Specification](https://github.com/the-human-colossus-foundation/oca-spec)
- [OCA SDK](https://github.com/THCLab/oca-sdk-rs)
- [OCA Bindings (Dart)](../dart)
