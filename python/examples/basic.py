"""
Basic example demonstrating oca_sdk Python bindings

This example shows:
- Building an OCA bundle from an OCAfile
- Getting bundle attributes
- Validating bundle semantics
- Validating data against the bundle
- Converting bundle back to OCAfile format
"""

import oca_sdk
from pathlib import Path

# Path to the overlay registry directory
OVERLAY_REGISTRY_DIR = str(Path(__file__).parent / "registry")

# Simple OCAfile with basic attributes
ocafile_text = '--name=simple-schema\nADD ATTRIBUTE name=Text age=Numeric'

print("Basic OCA SDK Example")
print("=" * 40)

# Build bundle from OCAfile
print("\n1. Building bundle from OCAfile...")
bundle_json = oca_sdk.build_from_ocafile(ocafile_text, OVERLAY_REGISTRY_DIR)
print("   ✓ Bundle created")

# Get bundle attributes
print("\n2. Getting bundle attributes...")
attrs = oca_sdk.bundle_attributes(bundle_json, OVERLAY_REGISTRY_DIR)
print(f"   Attributes: {len(attrs)}")
for attr in attrs:
    print(f"   - {attr['name']}: {attr['type']}")

# Validate semantics
print("\n3. Validating bundle semantics...")
semantics = oca_sdk.validate_bundle_semantics(bundle_json)
print(f"   Valid: {semantics['valid']}")
if semantics['errors']:
    print(f"   Errors: {semantics['errors']}")

# Validate data
print("\n4. Validating data against bundle...")
test_data = '{"name":"Alice","age":42}'
data_validation = oca_sdk.validate_bundle_data(
    bundle_json, test_data, OVERLAY_REGISTRY_DIR
)
print(f"   Data: {test_data}")
print(f"   Valid: {data_validation['valid']}")
if data_validation['errors']:
    print(f"   Errors: {data_validation['errors']}")

# Convert back to OCAfile
print("\n5. Converting bundle to OCAfile...")
ocafile_out = oca_sdk.bundle_to_ocafile(bundle_json, OVERLAY_REGISTRY_DIR)
print("   Output:")
for line in ocafile_out.split('\n'):
    print(f"   {line}")

print("\n" + "=" * 40)
print("Example complete!")
