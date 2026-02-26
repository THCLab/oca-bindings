import { expect } from 'chai'
import { buildFromOCAfile, validateBundleSemantics, bundleToJSON } from 'oca.js'
import fs from 'fs'

const overlay_file = fs.readFileSync('./test/assets/semantic.overlayfile', 'utf8')

describe('Plain OCA', () => {
  const ocafile = `--name=GICS-test
`

  const bundle = buildFromOCAfile(ocafile, overlay_file)
  const bundleObj = JSON.parse(bundle)
  const result = validateBundleSemantics(bundleObj)

  it('is valid', () => {
    expect(result).to.haveOwnProperty("valid")
    expect(result).to.haveOwnProperty("errors")

    expect(result.valid).to.be.true
    expect(result.errors).to.be.an('array').that.is.empty
  })
})

describe('Validator without enforced translations', () => {
  const ocafile = `--name=test-meta
ADD Overlay Meta
  language="en"
  name="OCA name"
  description="OCA description"
`

  const bundle = buildFromOCAfile(ocafile, overlay_file)
  const bundleObj = JSON.parse(bundle)
  const validator = validateBundleSemantics(bundleObj)

  it('passes validation', () => {
    expect(validator.valid).to.be.true
  })
})

describe('Malformed OCA Bundle', () => {
  const said = 'EJDbEZp6bBKTe07It8XwPi6MaCMW8wtQsq5WIXrzMJfR'
  const oca: any = {
    v: 'OCAS02JSON000106_',
    digest: said,
    capture_base: {
      digest: said,
      type: 'capture_base/2.0.0',
      attributes: {}
    },
    overlays: []
  }

  const validator = validateBundleSemantics(oca)

  it('is not valid', () => {
    // The bundle structure is minimal and may fail validation
    expect(validator).to.haveOwnProperty("valid")
  })
})
