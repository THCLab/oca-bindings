import { expect } from 'chai'
import { buildFromOCAfile, bundleToJSON } from 'oca.js'
import fs from 'fs'

const overlay_file = fs.readFileSync('./test/assets/semantic.overlayfile', 'utf8')

describe('Parsing attribute types', () => {
  it('should create bundles with different attribute types', () => {
    const ocafile = `--name=test-classification
ADD Attribute attribute1=Numeric
ADD Attribute attribute2=Text
ADD Attribute attribute3=Boolean
ADD Attribute attribute4=Binary
ADD Attribute attribute5=DateTime
`

    const bundle = buildFromOCAfile(ocafile, overlay_file)
    const json = JSON.parse(JSON.parse(bundleToJSON(bundle)))

    expect(json.capture_base.attributes).to.be.an('object')
    expect(json.capture_base.attributes).to.have.property('attribute1', 'Numeric')
    expect(json.capture_base.attributes).to.have.property('attribute2', 'Text')
    expect(json.capture_base.attributes).to.have.property('attribute3', 'Boolean')
    expect(json.capture_base.attributes).to.have.property('attribute4', 'Binary')
    expect(json.capture_base.attributes).to.have.property('attribute5', 'DateTime')
  })
})
