import oca_sdk


def test_sdk_roundtrip():
    bundle_json = oca_sdk.build_from_ocafile('ADD ATTRIBUTE name=Text age=Numeric', None)
    attrs = oca_sdk.bundle_attributes(bundle_json, None)
    assert len(attrs) == 2

    semantics = oca_sdk.validate_bundle_semantics(bundle_json)
    assert semantics['valid'] is True

    data_ok = oca_sdk.validate_bundle_data(
        bundle_json, '{"name":"Alice","age":42}', None
    )
    assert data_ok['valid'] is True

    ocafile_out = oca_sdk.bundle_to_ocafile(bundle_json, None)
    assert 'ADD ATTRIBUTE' in ocafile_out
