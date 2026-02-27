# OCA Python Bindings

High-level Python bindings for the OCA SDK.

## Install (dev)


Keep in mind that maturin works on python 3.12

```sh
pyenv local python 3.12
python -m venv .venv
source .venv/bin/activate
pip install maturin
maturin develop
```

## Usage

```python
import oca_sdk

bundle_json = oca_sdk.build_from_ocafile('ADD ATTRIBUTE name=Text age=Numeric', None)
print(oca_sdk.bundle_attributes(bundle_json, None))
print(oca_sdk.validate_bundle_semantics(bundle_json))
print(oca_sdk.validate_bundle_data(bundle_json, '{"name":"Alice","age":42}', None))
print(oca_sdk.bundle_to_ocafile(bundle_json, None))
```

## Tests

```sh
pytest -q
```
