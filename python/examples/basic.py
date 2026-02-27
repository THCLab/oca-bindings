import oca_sdk

bundle_json = oca_sdk.build_from_ocafile('ADD ATTRIBUTE name=Text age=Numeric', None)
attrs = oca_sdk.bundle_attributes(bundle_json, None)
print('attributes', attrs)
print('semantics', oca_sdk.validate_bundle_semantics(bundle_json))
print('data', oca_sdk.validate_bundle_data(bundle_json, '{"name":"Alice","age":42}', None))
print('ocafile', oca_sdk.bundle_to_ocafile(bundle_json, None))
