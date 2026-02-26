import { expect } from 'chai'
import { loadBundle, getBundleAttributes, bundleToJSON } from 'oca.js'
import fs from 'fs'
const oca_bundle_json = require('./assets/oca_new.json')
const overlay_file = fs.readFileSync('./test/assets/semantic.overlayfile', 'utf8')

describe('OCA is loaded', () => {
  // Load bundle from JSON
  const bundle = loadBundle(JSON.stringify(oca_bundle_json), overlay_file)

  it('has list of attributes', () => {
    const attributes = getBundleAttributes(bundle)

    expect(attributes).to.exist
    const attributeKeys = attributes instanceof Map ? Array.from(attributes.keys()) : Object.keys(attributes)
    expect(attributeKeys).to.have.lengthOf(21)
  })

  it('has meta', () => {
    const json = JSON.parse(bundleToJSON(bundle))
    const metaOverlays = json.overlays.filter((o: any) => o.type === 'overlay/meta/2.0.0')

    expect(metaOverlays).to.be.an('array')
    expect(metaOverlays).to.have.lengthOf(4)

    // Check that meta overlays have expected structure
    const metaMap: { [key: string]: { name: string, description: string } } = {}
    metaOverlays.forEach((meta: any) => {
      metaMap[meta.properties?.language] = {
        name: meta.properties?.name,
        description: meta.properties?.description
      }
    })

    expect(metaMap).to.haveOwnProperty('fr')
    expect(metaMap.fr.name).to.equal('VIZ pour passeport numérique')
    expect(metaMap).to.haveOwnProperty('en')
    expect(metaMap.en.name).to.equal('VIZ for Digital Passport')
    expect(metaMap).to.haveOwnProperty('epo')
    expect(metaMap.epo.name).to.equal('Cifereca pasporto')
    expect(metaMap).to.haveOwnProperty('pl')
    expect(metaMap.pl.name).to.equal('Passport cyfrowy')
  })

  it('has label overlay', () => {
    const json = JSON.parse(bundleToJSON(bundle))
    const labelOverlays = json.overlays.filter((o: any) => o.type === 'overlay/label/2.0.0')

    expect(labelOverlays).to.be.an('array')
    expect(labelOverlays).to.have.lengthOf(1)

    const labelOverlay = labelOverlays[0]
    expect(labelOverlay).to.haveOwnProperty('properties')
    expect(labelOverlay.properties).to.haveOwnProperty('language')
    expect(labelOverlay.properties.language).to.equal('fr')
    expect(labelOverlay.properties).to.haveOwnProperty('attribute_labels')
    expect(Object.keys(labelOverlay.properties.attribute_labels)).to.have.lengthOf(21)
  })

  it('has entry_code overlay', () => {
    const json = JSON.parse(bundleToJSON(bundle))
    const entryCodeOverlays = json.overlays.filter((o: any) => o.type === 'overlay/entry_code/2.0.0')

    expect(entryCodeOverlays).to.be.an('array')
    expect(entryCodeOverlays).to.have.lengthOf(1)

    const entryCodeOverlay = entryCodeOverlays[0]
    expect(entryCodeOverlay).to.haveOwnProperty('properties')
    expect(entryCodeOverlay.properties).to.haveOwnProperty('attribute_entry_codes')
    expect(entryCodeOverlay.properties.attribute_entry_codes).to.haveOwnProperty('documentType')
    expect(entryCodeOverlay.properties.attribute_entry_codes.documentType).to.deep.equal(['PASSPORT'])
    expect(entryCodeOverlay.properties.attribute_entry_codes).to.haveOwnProperty('sex')
    expect(entryCodeOverlay.properties.attribute_entry_codes.sex).to.deep.equal(['F', 'M', 'X'])
  })

  it('has entry overlay', () => {
    const json = JSON.parse(bundleToJSON(bundle))
    const entryOverlays = json.overlays.filter((o: any) => o.type === 'overlay/entry/2.0.0')

    expect(entryOverlays).to.be.an('array')
    expect(entryOverlays).to.have.lengthOf(1)

    const entryOverlay = entryOverlays[0]
    expect(entryOverlay).to.haveOwnProperty('properties')
    expect(entryOverlay.properties).to.haveOwnProperty('language')
    expect(entryOverlay.properties.language).to.equal('fr')
    expect(entryOverlay.properties).to.haveOwnProperty('attribute_entries')
    expect(entryOverlay.properties.attribute_entries).to.haveOwnProperty('documentType')
    expect(entryOverlay.properties.attribute_entries.documentType).to.haveOwnProperty('PASSPORT')
    expect(entryOverlay.properties.attribute_entries.documentType.PASSPORT).to.equal('Passport')
  })

  it('has format overlay', () => {
    const json = JSON.parse(bundleToJSON(bundle))
    const formatOverlays = json.overlays.filter((o: any) => o.type === 'overlay/format/2.0.0')

    expect(formatOverlays).to.be.an('array')
    expect(formatOverlays).to.have.lengthOf(1)

    const formatOverlay = formatOverlays[0]
    expect(formatOverlay).to.haveOwnProperty('properties')
    expect(formatOverlay.properties).to.haveOwnProperty('attribute_formats')
    expect(formatOverlay.properties.attribute_formats).to.haveOwnProperty('dateOfBirth')
    expect(formatOverlay.properties.attribute_formats.dateOfBirth).to.equal('YYnMMnDD')
    expect(formatOverlay.properties.attribute_formats).to.haveOwnProperty('photoImage')
    expect(formatOverlay.properties.attribute_formats.photoImage).to.equal('image/jpeg')
  })

  it('has character_encoding overlay', () => {
    const json = JSON.parse(bundleToJSON(bundle))
    const charEncodingOverlays = json.overlays.filter((o: any) => o.type === 'overlay/character_encoding/2.0.0')

    expect(charEncodingOverlays).to.be.an('array')
    expect(charEncodingOverlays).to.have.lengthOf(1)

    const charEncodingOverlay = charEncodingOverlays[0]
    expect(charEncodingOverlay).to.haveOwnProperty('properties')
    expect(charEncodingOverlay.properties).to.haveOwnProperty('attribute_character_encodings')
    expect(charEncodingOverlay.properties.attribute_character_encodings).to.haveOwnProperty('dateOfBirth')
    expect(charEncodingOverlay.properties.attribute_character_encodings.dateOfBirth).to.equal('utf-8')
    expect(charEncodingOverlay.properties.attribute_character_encodings).to.haveOwnProperty('photoImage')
    expect(charEncodingOverlay.properties.attribute_character_encodings.photoImage).to.equal('base64')
  })

  it('has unit overlay', () => {
    const json = JSON.parse(bundleToJSON(bundle))
    const unitOverlays = json.overlays.filter((o: any) => o.type === 'overlay/unit/2.0.0')

    expect(unitOverlays).to.be.an('array')
    expect(unitOverlays).to.have.lengthOf(1)

    const unitOverlay = unitOverlays[0]
    expect(unitOverlay).to.haveOwnProperty('properties')
    expect(unitOverlay.properties).to.haveOwnProperty('metric_system')
    expect(unitOverlay.properties.metric_system).to.equal('metric')
    expect(unitOverlay.properties).to.haveOwnProperty('attribute_units')
    expect(unitOverlay.properties.attribute_units).to.haveOwnProperty('optionalPersonalData')
    expect(unitOverlay.properties.attribute_units.optionalPersonalData).to.equal('centimeter')
  })
})
