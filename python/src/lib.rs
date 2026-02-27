use oca_sdk_rs::data_validator::{self, DataValidationStatus};
use oca_sdk_rs::ocafile;
use oca_sdk_rs::overlay_registry::OverlayLocalRegistry;
use oca_sdk_rs::{validate_semantics, AttributeType, NestedAttrType, NestedAttrTypeFrame, OCABundle, OCABundleModel, RefValue};
use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};
use recursion::CollapsibleExt;

fn overlay_registry(overlay_dir: Option<String>) -> Result<OverlayLocalRegistry, String> {
    match overlay_dir {
        Some(dir) if !dir.trim().is_empty() => {
            OverlayLocalRegistry::from_dir(&dir).map_err(|e| e.to_string())
        }
        _ => Ok(OverlayLocalRegistry::default()),
    }
}

fn bundle_model_from_json(bundle_json: &str, _overlay_dir: Option<String>) -> Result<OCABundleModel, String> {
    let bundle: OCABundle = serde_json::from_str(bundle_json)
        .map_err(|e| format!("Invalid bundle JSON: {e}"))?;
    Ok(oca_sdk_rs::bundle_model_from_bundle(bundle))
}

fn nested_attr_type_to_string(nested: &NestedAttrType) -> String {
    nested.clone().collapse_frames(|frame| match frame {
        NestedAttrTypeFrame::Reference(ref_value) => match ref_value {
            RefValue::Said(said) => format!("refs:{said}"),
            RefValue::Name(name) => format!("refn:{name}"),
        },
        NestedAttrTypeFrame::Value(value) => match value {
            AttributeType::Text => "Text".to_string(),
            AttributeType::Numeric => "Numeric".to_string(),
            AttributeType::DateTime => "DateTime".to_string(),
            AttributeType::Boolean => "Boolean".to_string(),
            AttributeType::Binary => "Binary".to_string(),
        },
        NestedAttrTypeFrame::Array(array) => format!("[{array}]"),
        NestedAttrTypeFrame::Null => "".to_string(),
    })
}

#[pyfunction]
fn build_from_ocafile(ocafile_text: String, overlay_dir: Option<String>) -> PyResult<String> {
    let registry = overlay_registry(overlay_dir).map_err(pyo3::exceptions::PyValueError::new_err)?;
    let ast = ocafile::parse_from_string(ocafile_text, &registry)
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(format!("Failed to parse OCAfile: {e}")))?;
    let bundle = oca_sdk_rs::from_ast(None, &ast)
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(format!("Failed to build bundle: {e:?}")))?
        .oca_bundle;
    let bundle = OCABundle::from(bundle);
    serde_json::to_string_pretty(&bundle)
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(format!("Failed to serialize bundle: {e}")))
}

#[pyfunction]
fn bundle_to_ocafile(bundle_json: String, overlay_dir: Option<String>) -> PyResult<String> {
    let bundle_model = bundle_model_from_json(&bundle_json, overlay_dir)
        .map_err(pyo3::exceptions::PyValueError::new_err)?;
    let ast = bundle_model.to_ast();
    Ok(ocafile::generate_from_ast(&ast))
}

#[pyfunction]
fn validate_bundle_semantics(py: Python<'_>, bundle_json: String) -> PyResult<PyObject> {
    let bundle_model = bundle_model_from_json(&bundle_json, None)
        .map_err(pyo3::exceptions::PyValueError::new_err)?;

    let (valid, errors) = match validate_semantics(&bundle_model)
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(format!("Failed to validate semantics: {e}")))? {
        oca_sdk_rs::SemanticValidationStatus::Valid => (true, vec![]),
        oca_sdk_rs::SemanticValidationStatus::Invalid(errors) => {
            let errors = errors.into_iter().map(|e| e.to_string()).collect();
            (false, errors)
        }
    };

    let dict = PyDict::new(py);
    dict.set_item("valid", valid)?;
    dict.set_item("errors", errors)?;
    Ok(dict.into())
}

#[pyfunction]
fn validate_bundle_data(
    py: Python<'_>,
    bundle_json: String,
    data_json: String,
    overlay_dir: Option<String>,
) -> PyResult<PyObject> {
    let mut bundle_model = bundle_model_from_json(&bundle_json, overlay_dir)
        .map_err(pyo3::exceptions::PyValueError::new_err)?;
    let data: serde_json::Value = serde_json::from_str(&data_json)
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(format!("Invalid data JSON: {e}")))?;

    let (valid, errors) = match data_validator::validate_data(&mut bundle_model, &data)
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(format!("Failed to validate data: {e}")))? {
        DataValidationStatus::Valid => (true, vec![]),
        DataValidationStatus::Invalid(errors) => (false, errors),
    };

    let dict = PyDict::new(py);
    dict.set_item("valid", valid)?;
    dict.set_item("errors", errors)?;
    Ok(dict.into())
}

#[pyfunction]
fn bundle_attributes(
    py: Python<'_>,
    bundle_json: String,
    overlay_dir: Option<String>,
) -> PyResult<PyObject> {
    let mut bundle_model = bundle_model_from_json(&bundle_json, overlay_dir)
        .map_err(pyo3::exceptions::PyValueError::new_err)?;
    bundle_model.fill_attributes();

    let list = PyList::empty(py);
    if let Some(attr_map) = bundle_model.attributes.as_ref() {
        for attr in attr_map.values() {
            let attr_type = attr
                .attribute_type
                .as_ref()
                .map(nested_attr_type_to_string)
                .unwrap_or_default();
            let dict = PyDict::new(py);
            dict.set_item("name", attr.name.clone())?;
            dict.set_item("type", attr_type)?;
            list.append(dict)?;
        }
    }

    Ok(list.into())
}

#[pymodule]
fn oca_sdk(_py: Python<'_>, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(build_from_ocafile, m)?)?;
    m.add_function(wrap_pyfunction!(bundle_to_ocafile, m)?)?;
    m.add_function(wrap_pyfunction!(validate_bundle_semantics, m)?)?;
    m.add_function(wrap_pyfunction!(validate_bundle_data, m)?)?;
    m.add_function(wrap_pyfunction!(bundle_attributes, m)?)?;
    Ok(())
}
