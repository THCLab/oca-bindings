#!/usr/bin/env python3
"""
Comprehensive example demonstrating full OCA creation with all overlay types
using the semantic.overlayfile registry.

This example showcases:
- Building OCA bundles with multiple overlays
- Using all overlay types from the registry
- Multi-language support
- Data validation
"""

import oca_sdk
import json
from pathlib import Path

# Path to the overlay registry directory
OVERLAY_REGISTRY_DIR = str(Path(__file__).parent / "registry")

# Comprehensive OCAfile using all overlay types
comprehensive_ocafile = """
--name=passport-schema
ADD Attribute passport_number=Text \
            issue_date=DateTime \
            expiry_date=DateTime \
            issuing_country=Text \
            gender=Text \
            height=Numeric \
            weight=Numeric

ADD Overlay Meta
  language="en"
  name="Passport Schema"
  description="International passport credential schema"
  classification="public"

ADD Overlay Meta
  language="es"
  name="Esquema de Pasaporte"
  description="Esquema de credencial de pasaporte internacional"

ADD OVERLAY Label
  language="en"
  attribute_labels
    passport_number="Passport Number"
    issue_date="Issue Date"
    expiry_date="Expiry Date"
    issuing_country="Issuing Country"
    gender="Gender"
    height="Height (cm)"
    weight="Weight (kg)"

ADD OVERLAY Label
  language="es"
  attribute_labels
    passport_number="Número de Pasaporte"
    issue_date="Fecha de Emisión"
    expiry_date="Fecha de Expiración"
    issuing_country="País Emisor"
    gender="Género"
    height="Altura (cm)"
    weight="Peso (kg)"

ADD OVERLAY CHARACTER_ENCODING
  attribute_character_encodings
    issuing_country="iso-8859-1"
    gender="utf-8"

ADD OVERLAY FORMAT
  attribute_formats
    issue_date="YYYY-MM-DD"
    expiry_date="YYYY-MM-DD"

ADD OVERLAY UNIT
  metric_system="metric"
  attribute_units
    height="cm"
    weight="kg"

ADD OVERLAY CARDINALITY
  attribute_cardinalities
    passport_number="1..1"
    issue_date="1..1"
    expiry_date="1..1"
    issuing_country="1..1"
    gender="1..1"
    height="0..1"
    weight="0..1"

ADD OVERLAY ENTRY_CODE
  attribute_entry_codes
    gender=["M", "F", "X"]

ADD OVERLAY ENTRY
  language="en"
  attribute_entries
    gender
      "M"="Male"
      "F"="Female"
      "X"="Other/Unspecified"

ADD OVERLAY ENTRY
  language="es"
  attribute_entries
    gender
      "M"="Masculino"
      "F"="Femenino"
      "X"="Otro/No especificado"

ADD OVERLAY SENSITIVE
  attributes
    passport_number
    height

ADD OVERLAY STANDARD
  attribute_standards
    issuing_country="ISO 3166-1 alpha-3"

ADD OVERLAY MAPPING
  attribute_mappings
    passport_number="doc_id"
    issuing_country="country_code"

ADD OVERLAY CONFORMANCE
  attribute_conformances
    passport_number="ICAO 9303"
    gender="ISO 5218"
"""

print("=" * 80)
print("COMPREHENSIVE OCA CREATION EXAMPLE")
print("=" * 80)

# Build the bundle
print("\n1. Building OCA bundle from comprehensive OCAfile...")
bundle_json = oca_sdk.build_from_ocafile(comprehensive_ocafile, OVERLAY_REGISTRY_DIR)

# Parse the bundle for inspection
bundle = json.loads(bundle_json)

print(f"   ✓ Bundle digest: {bundle.get('digest', 'N/A')[:20]}...")
print(f"   ✓ Capture base type: {bundle['capture_base'].get('type', 'N/A')}")
print(f"   ✓ Number of attributes: {len(bundle['capture_base'].get('attributes', {}))}")
print(f"   ✓ Number of overlays: {len(bundle.get('overlays', []))}")

# Show some overlay details
print(f"\n   Sample overlays (first 3):")
for i, overlay in enumerate(list(bundle.get('overlays', []))[:3]):
    print(f"   {i+1}. Type: {overlay.get('type', 'unknown')}")
    if 'language' in overlay:
        print(f"      Language: {overlay['language']}")
    if 'attribute_labels' in overlay:
        labels = list(overlay['attribute_labels'].keys())
        print(f"      Labels: {labels[:3]}{'...' if len(labels) > 3 else ''}")
    if 'name' in overlay:
        print(f"      Name: {overlay['name']}")

# Display attributes
print("\n2. Capture Base Attributes:")
attrs = oca_sdk.bundle_attributes(bundle_json, OVERLAY_REGISTRY_DIR)
for attr in attrs:
    print(f"   - {attr['name']}: {attr['type']}")

# Display overlays by type
print("\n3. Overlays Summary:")
overlay_types = {}
for overlay in bundle.get('overlays', []):
    overlay_type = overlay.get('type', 'unknown')
    overlay_types[overlay_type] = overlay_types.get(overlay_type, 0) + 1

for otype, count in sorted(overlay_types.items()):
    print(f"   - {otype}: {count}")

# Validate semantics
print("\n4. Validating Bundle Semantics...")
semantics = oca_sdk.validate_bundle_semantics(bundle_json)
if semantics['valid']:
    print("   ✓ Bundle is semantically valid")
else:
    print("   ✗ Bundle has semantic errors:")
    for error in semantics['errors']:
        print(f"     - {error}")

# Sample data for validation
sample_data = {
    "passport_number": "P123456789",
    "issue_date": "2020-01-15",
    "expiry_date": "2030-01-15",
    "issuing_country": "USA",
    "gender": "M",
    "height": 175,
    "weight": 70
}

print("\n5. Validating Sample Data:")
print(f"   Sample data: {json.dumps(sample_data, indent=2)}")
data_validation = oca_sdk.validate_bundle_data(
    bundle_json,
    json.dumps(sample_data),
    OVERLAY_REGISTRY_DIR
)

if data_validation['valid']:
    print("   ✓ Data is valid")
else:
    print("   ✗ Data validation errors:")
    for error in data_validation['errors']:
        print(f"     - {error}")

# Validate with invalid data
print("\n6. Testing with Invalid Data:")
invalid_data = sample_data.copy()
invalid_data['gender'] = 'INVALID'  # Not in entry codes
invalid_data['issue_date'] = '2020/01/15'  # Wrong format

print(f"   Invalid data: {json.dumps(invalid_data, indent=2)}")
invalid_validation = oca_sdk.validate_bundle_data(
    bundle_json,
    json.dumps(invalid_data),
    OVERLAY_REGISTRY_DIR
)

if invalid_validation['valid']:
    print("   ✓ Data is valid")
else:
    print("   ✗ Data validation errors (expected):")
    for error in invalid_validation['errors']:
        print(f"     - {error}")

# Generate OCAfile from bundle
print("\n7. Converting Bundle back to OCAfile...")
ocafile_out = oca_sdk.bundle_to_ocafile(bundle_json, OVERLAY_REGISTRY_DIR)
print("   ✓ Bundle converted to OCAfile format")
print(f"\n   Full generated OCAfile:")
print("   " + "=" * 76)
for line in ocafile_out.split('\n'):
    print(f"   {line}")
print("   " + "=" * 76)

print("\n" + "=" * 80)
print("EXAMPLE COMPLETE")
print("=" * 80)
