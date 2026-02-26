use oca_sdk_rs::oca;
use oca_sdk_rs::ToJSON;
use serde_json::json;
use wasm_bindgen::prelude::*;

#[derive(serde::Serialize)]
struct ValidationResult {
    valid: bool,
    errors: Vec<String>,
}

#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen(typescript_custom_section)]
const OCABUNDLE_TYPE: &'static str = r#"
interface OCABundle {
  v: string;
  d: string;
  capture_base: {
    type: string;
    d: string;
    attributes: { [attribute_name: string]: string };
  };
  overlays: {
    [key: string]: {
      type: string;
      [property: string]: any;
    };
  };
}
"#;

#[wasm_bindgen(js_name = "parseOCAfile")]
pub fn parse_ocafile(ocafile_str: String, overlay_file: String) -> Result<JsValue, JsValue> {
    let registry = oca::overlay_file::OverlayLocalRegistry::from_string(overlay_file)
            .map_err(|e| JsValue::from_str(&format!("Failed to load overlay registry: {}", e)))?;

    let oca_ast = oca::file::parse_from_string(ocafile_str, &registry)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse OCAfile: {}", e)))?;

    let ast_json = json!({
        "meta": oca_ast.meta,
        "commands": oca_ast.commands
    });

    Ok(serde_wasm_bindgen::to_value(&ast_json).unwrap())
}

#[wasm_bindgen(js_name = "buildFromOCAfile")]
pub fn build_from_ocafile(ocafile_str: String, overlay_file: String) -> Result<JsValue, JsValue> {
    let registry = oca::overlay_file::OverlayLocalRegistry::from_string(overlay_file)
            .map_err(|e| JsValue::from_str(&format!("Failed to load overlay registry: {}", e)))?;

    let oca_ast = oca::file::parse_from_string(ocafile_str, &registry)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse OCAfile: {}", e)))?;

    let build = oca::bundle::from_ast(None, &oca_ast)
        .map_err(|e| JsValue::from_str(&format!("Failed to build bundle from OCAfile: {:?}", e)))?;

    let bundle_json = build.oca_bundle.get_json_bundle();

    Ok(serde_wasm_bindgen::to_value(&bundle_json).unwrap())
}

#[wasm_bindgen(js_name = "loadBundle")]
pub fn load_bundle(json_str: String, overlay_file: String) -> Result<JsValue, JsValue> {
    let registry = oca::overlay_file::OverlayLocalRegistry::from_string(overlay_file)
            .map_err(|e| JsValue::from_str(&format!("Failed to load overlay registry: {}", e)))?;

    let mut bytes = json_str.as_bytes();
    let oca_bundle_model = oca::bundle::load(&mut bytes, &registry)
        .map_err(|e| JsValue::from_str(&format!("Failed to load bundle: {}", e)))?;

    Ok(serde_wasm_bindgen::to_value(&oca_bundle_model).unwrap())
}

#[wasm_bindgen(js_name = "validateBundleSemantics")]
pub fn validate_bundle_semantics(bundle: JsValue) -> Result<JsValue, JsValue> {
    let result = match serde_wasm_bindgen::from_value::<serde_json::Value>(bundle) {
        Ok(bundle) => {
            let oca_bundle_model: oca::bundle::OCABundleModel = serde_json::from_value(bundle)
                .map_err(|e| JsValue::from_str(&format!("Failed to parse bundle: {}", e)))?;

            match oca::bundle::validate_semantics(&oca_bundle_model) {
                Ok(_) => ValidationResult {
                    valid: true,
                    errors: vec![],
                },
                Err(e) => ValidationResult {
                    valid: false,
                    errors: vec![e.to_string()],
                },
            }
        }
        Err(e) => ValidationResult {
            valid: false,
            errors: vec![format!("Invalid bundle format: {}", e)],
        },
    };

    Ok(serde_wasm_bindgen::to_value(&result).unwrap())
}

#[wasm_bindgen(js_name = "generateOCAfile")]
pub fn generate_ocafile(bundle: String, overlay_file: String) -> Result<String, JsValue> {
    let registry = oca::overlay_file::OverlayLocalRegistry::from_string(overlay_file)
            .map_err(|e| JsValue::from_str(&format!("Failed to load overlay registry: {}", e)))?;

    let mut bytes = bundle.as_bytes();
    let oca_bundle_model = oca::bundle::load(&mut bytes, &registry)
        .map_err(|e| JsValue::from_str(&format!("Failed to load bundle: {}", e)))?;
    let oca_ast = oca_bundle_model.to_ast();
    let ocafile = oca::file::generate_from_ast(&oca_ast);

    Ok(ocafile)
}

#[wasm_bindgen(js_name = "bundleToJSON")]
pub fn bundle_to_json(oca_bundle: JsValue) -> Result<String, JsValue> {
    let oca_bundle: serde_json::Value = match serde_wasm_bindgen::from_value(oca_bundle) {
        Ok(bundle) => bundle,
        Err(e) => {
            return Err(JsValue::from_str(&format!(
                "Failed to convert bundle: {}",
                e
            )));
        }
    };

    let json_str = serde_json::to_string_pretty(&oca_bundle)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize bundle: {}", e)))?;

    Ok(json_str)
}

#[wasm_bindgen(js_name = "getBundleDigest")]
pub fn get_bundle_digest(oca_bundle: JsValue) -> Result<String, JsValue> {
    let oca_bundle: serde_json::Value = match serde_wasm_bindgen::from_value(oca_bundle) {
        Ok(bundle) => bundle,
        Err(e) => {
            return Err(JsValue::from_str(&format!(
                "Failed to get bundle digest: {}",
                e
            )));
        }
    };

    Ok(oca_bundle
        .get("d")
        .and_then(|v| v.as_str())
        .unwrap_or_default()
        .to_string())
}

#[wasm_bindgen(js_name = "getBundleVersion")]
pub fn get_bundle_version(oca_bundle: JsValue) -> Result<String, JsValue> {
    let oca_bundle: serde_json::Value = match serde_wasm_bindgen::from_value(oca_bundle) {
        Ok(bundle) => bundle,
        Err(e) => {
            return Err(JsValue::from_str(&format!(
                "Failed to get bundle version: {}",
                e
            )));
        }
    };

    Ok(oca_bundle
        .get("v")
        .and_then(|v| v.as_str())
        .unwrap_or_default()
        .to_string())
}

#[wasm_bindgen(js_name = "getBundleType")]
pub fn get_bundle_type(oca_bundle: JsValue) -> Result<String, JsValue> {
    let oca_bundle: serde_json::Value = match serde_wasm_bindgen::from_value(oca_bundle) {
        Ok(bundle) => bundle,
        Err(e) => {
            return Err(JsValue::from_str(&format!(
                "Failed to get bundle type: {}",
                e
            )));
        }
    };

    Ok(oca_bundle
        .get("capture_base")
        .and_then(|v| v.get("type"))
        .and_then(|v| v.as_str())
        .unwrap_or_default()
        .to_string())
}

#[wasm_bindgen(js_name = "getBundleAttributes")]
pub fn get_bundle_attributes(oca_bundle: JsValue) -> Result<JsValue, JsValue> {
    let oca_bundle: serde_json::Value = match serde_wasm_bindgen::from_value(oca_bundle) {
        Ok(bundle) => bundle,
        Err(e) => {
            return Err(JsValue::from_str(&format!(
                "Failed to get bundle attributes: {}",
                e
            )));
        }
    };

    Ok(serde_wasm_bindgen::to_value(
        &oca_bundle
            .get("capture_base")
            .and_then(|v| v.get("attributes"))
            .unwrap_or(&json!({})),
    )
    .unwrap())
}

#[wasm_bindgen(js_name = "getOverlayCount")]
pub fn get_overlay_count(oca_bundle: JsValue) -> Result<u32, JsValue> {
    let oca_bundle: serde_json::Value = match serde_wasm_bindgen::from_value(oca_bundle) {
        Ok(bundle) => bundle,
        Err(e) => {
            return Err(JsValue::from_str(&format!(
                "Failed to get overlay count: {}",
                e
            )));
        }
    };

    Ok(oca_bundle
        .get("overlays")
        .and_then(|v| v.as_object())
        .map(|obj| obj.len() as u32)
        .unwrap_or(0))
}

#[wasm_bindgen(js_name = "getOverlayNames")]
pub fn get_overlay_names(oca_bundle: JsValue) -> Result<JsValue, JsValue> {
    let oca_bundle: serde_json::Value = match serde_wasm_bindgen::from_value(oca_bundle) {
        Ok(bundle) => bundle,
        Err(e) => {
            return Err(JsValue::from_str(&format!(
                "Failed to get overlay names: {}",
                e
            )));
        }
    };

    let overlay_names: Vec<String> = oca_bundle
        .get("overlays")
        .and_then(|v| v.as_object())
        .map(|obj| obj.keys().cloned().collect())
        .unwrap_or_default();

    Ok(serde_wasm_bindgen::to_value(&overlay_names).unwrap())
}
