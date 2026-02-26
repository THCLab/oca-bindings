/**
 * Basic example demonstrating oca.js API usage
 *
 * To run: npx ts-node example.ts
 */

import {
  buildFromOCAfile,
  loadBundle,
  getBundleAttributes,
  bundleToJSON,
  validateBundleSemantics
} from 'oca.js'
import fs from 'fs'

// Example 1: Build OCA bundle from OCAfile
function example1_buildFromOCAfile() {
  console.log('\n=== Example 1: Build from OCAfile ===')

  const overlay_file = fs.readFileSync('./test/assets/semantic.overlayfile', 'utf8')

  const ocafile = `--name=example-schema
ADD Attribute name=Text
ADD Attribute age=Numeric
ADD Attribute birthdate=DateTime

ADD Overlay Meta
  language="en"
  name="Person Schema"
  description="A simple person schema"

ADD OVERLAY Label
  language="en"
  attribute_labels
    name="Full Name"
    age="Age"
    birthdate="Birth Date"
`

  const bundle = buildFromOCAfile(ocafile, overlay_file)

  // Note: bundleToJSON returns double-encoded JSON
  const json = JSON.parse(JSON.parse(bundleToJSON(bundle)))

  console.log('Bundle digest:', json.digest)
  console.log('Attributes:', Object.keys(json.capture_base.attributes))
  console.log('Overlays:', json.overlays.map((o: any) => o.type))
}

// Example 2: Load bundle from JSON
function example2_loadFromJSON() {
  console.log('\n=== Example 2: Load from JSON ===')

  const overlay_file = fs.readFileSync('./test/assets/semantic.overlayfile', 'utf8')
  const oca_bundle_json = require('./test/assets/oca_new.json')

  const bundle = loadBundle(JSON.stringify(oca_bundle_json), overlay_file)

  // Get bundle attributes (returns Map)
  const attributes = getBundleAttributes(bundle)
  const attributeNames = attributes instanceof Map ? Array.from(attributes.keys()) : Object.keys(attributes)

  console.log('Number of attributes:', attributeNames.length)
  console.log('First 5 attributes:', attributeNames.slice(0, 5))
}

// Example 3: Validate bundle
function example3_validateBundle() {
  console.log('\n=== Example 3: Validate Bundle ===')

  const overlay_file = fs.readFileSync('./test/assets/semantic.overlayfile', 'utf8')

  const ocafile = `--name=validation-test
ADD Overlay Meta
  language="en"
  name="Test Schema"
  description="Test description"
`

  const bundle = buildFromOCAfile(ocafile, overlay_file)
  const bundleObj = JSON.parse(bundle)

  const result = validateBundleSemantics(bundleObj)

  console.log('Valid:', result.valid)
  console.log('Errors:', result.errors)
}

// Run examples
try {
  example1_buildFromOCAfile()
  example2_loadFromJSON()
  example3_validateBundle()
} catch (error) {
  console.error('Error running examples:', error)
  process.exit(1)
}
