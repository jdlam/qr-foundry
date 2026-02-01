use base64::{engine::general_purpose::STANDARD, Engine};
use image::ImageReader;
use rqrr::PreparedImage;
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{Cursor, Write};
use tauri_plugin_dialog::DialogExt;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchItem {
    pub row: usize,
    pub content: String,
    pub qr_type: String,
    pub label: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchParseResult {
    pub success: bool,
    pub items: Vec<BatchItem>,
    pub error: Option<String>,
    pub total_rows: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchGenerateItem {
    pub row: usize,
    pub content: String,
    pub label: Option<String>,
    pub image_data: String, // base64 PNG
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchValidationResult {
    pub row: usize,
    pub success: bool,
    pub decoded_content: Option<String>,
    pub content_match: bool,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchGenerateResult {
    pub success: bool,
    pub zip_path: Option<String>,
    pub validation_results: Vec<BatchValidationResult>,
    pub error: Option<String>,
}

/// Parse a CSV file and return batch items
#[tauri::command]
pub async fn batch_parse_csv(file_path: String) -> Result<BatchParseResult, String> {
    let content =
        fs::read_to_string(&file_path).map_err(|e| format!("Failed to read file: {}", e))?;

    parse_csv_content(&content)
}

/// Parse CSV content from string
#[tauri::command]
pub async fn batch_parse_csv_content(content: String) -> Result<BatchParseResult, String> {
    parse_csv_content(&content)
}

fn parse_csv_content(content: &str) -> Result<BatchParseResult, String> {
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(true)
        .flexible(true)
        .from_reader(content.as_bytes());

    let headers = reader
        .headers()
        .map_err(|e| format!("Failed to read CSV headers: {}", e))?
        .clone();

    // Find column indices
    let content_idx = headers
        .iter()
        .position(|h| h.to_lowercase() == "content")
        .ok_or("CSV must have a 'content' column")?;

    let type_idx = headers.iter().position(|h| h.to_lowercase() == "type");
    let label_idx = headers.iter().position(|h| h.to_lowercase() == "label");

    let mut items = Vec::new();

    for (row_idx, result) in reader.records().enumerate() {
        match result {
            Ok(record) => {
                let content = record.get(content_idx).unwrap_or("").trim().to_string();

                if content.is_empty() {
                    continue;
                }

                let qr_type = type_idx
                    .and_then(|i| record.get(i))
                    .map(|s| s.trim().to_lowercase())
                    .unwrap_or_else(|| detect_qr_type(&content));

                let label = label_idx
                    .and_then(|i| record.get(i))
                    .map(|s| s.trim().to_string())
                    .filter(|s| !s.is_empty());

                items.push(BatchItem {
                    row: row_idx + 1, // 1-indexed for display
                    content,
                    qr_type,
                    label,
                });
            }
            Err(e) => {
                return Ok(BatchParseResult {
                    success: false,
                    items: vec![],
                    error: Some(format!("Error at row {}: {}", row_idx + 2, e)),
                    total_rows: 0,
                });
            }
        }
    }

    Ok(BatchParseResult {
        success: true,
        total_rows: items.len(),
        items,
        error: None,
    })
}

/// Validate a batch of QR code images
#[tauri::command]
pub async fn batch_validate(items: Vec<BatchGenerateItem>) -> Result<Vec<BatchValidationResult>, String> {
    let mut results = Vec::new();

    for item in items {
        let result = validate_single_item(&item);
        results.push(result);
    }

    Ok(results)
}

fn validate_single_item(item: &BatchGenerateItem) -> BatchValidationResult {
    // Strip data URL prefix if present
    let base64_data = if item.image_data.contains(",") {
        item.image_data.split(",").nth(1).unwrap_or(&item.image_data)
    } else {
        &item.image_data
    };

    // Decode base64 to bytes
    let image_bytes = match STANDARD.decode(base64_data) {
        Ok(bytes) => bytes,
        Err(e) => {
            return BatchValidationResult {
                row: item.row,
                success: false,
                decoded_content: None,
                content_match: false,
                error: Some(format!("Failed to decode base64: {}", e)),
            };
        }
    };

    // Load image
    let img = match ImageReader::new(Cursor::new(&image_bytes))
        .with_guessed_format()
        .and_then(|r| r.decode().map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e)))
    {
        Ok(img) => img,
        Err(e) => {
            return BatchValidationResult {
                row: item.row,
                success: false,
                decoded_content: None,
                content_match: false,
                error: Some(format!("Failed to decode image: {}", e)),
            };
        }
    };

    // Convert to grayscale and decode QR
    let gray_img = img.to_luma8();
    let mut prepared = PreparedImage::prepare(gray_img);
    let grids = prepared.detect_grids();

    if grids.is_empty() {
        return BatchValidationResult {
            row: item.row,
            success: false,
            decoded_content: None,
            content_match: false,
            error: Some("No QR code detected".to_string()),
        };
    }

    match grids[0].decode() {
        Ok((_, content)) => {
            let decoded = content.to_string();
            let content_match = decoded.trim() == item.content.trim();

            BatchValidationResult {
                row: item.row,
                success: content_match,
                decoded_content: Some(decoded),
                content_match,
                error: if content_match {
                    None
                } else {
                    Some("Content mismatch".to_string())
                },
            }
        }
        Err(e) => BatchValidationResult {
            row: item.row,
            success: false,
            decoded_content: None,
            content_match: false,
            error: Some(format!("Decode error: {:?}", e)),
        },
    }
}

/// Generate a ZIP file containing all QR codes
#[tauri::command]
pub async fn batch_generate_zip(
    app: tauri::AppHandle,
    items: Vec<BatchGenerateItem>,
    validate: bool,
) -> Result<BatchGenerateResult, String> {
    // Show save dialog
    let file_path = app
        .dialog()
        .file()
        .set_file_name("qr-codes.zip")
        .add_filter("ZIP Archive", &["zip"])
        .blocking_save_file();

    let zip_path = match file_path {
        Some(path) => path.as_path().unwrap().to_path_buf(),
        None => {
            return Ok(BatchGenerateResult {
                success: false,
                zip_path: None,
                validation_results: vec![],
                error: Some("Save cancelled by user".to_string()),
            });
        }
    };

    // Create ZIP file
    let file = File::create(&zip_path).map_err(|e| format!("Failed to create ZIP: {}", e))?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .compression_level(Some(6));

    let mut validation_results = Vec::new();

    for item in &items {
        // Validate if requested
        if validate {
            let validation = validate_single_item(item);
            validation_results.push(validation);
        }

        // Strip data URL prefix
        let base64_data = if item.image_data.contains(",") {
            item.image_data.split(",").nth(1).unwrap_or(&item.image_data)
        } else {
            &item.image_data
        };

        // Decode image data
        let image_bytes = STANDARD
            .decode(base64_data)
            .map_err(|e| format!("Failed to decode image for row {}: {}", item.row, e))?;

        // Generate filename
        let filename = if let Some(label) = &item.label {
            format!("{:03}_{}.png", item.row, sanitize_filename(label))
        } else {
            format!("{:03}_qr.png", item.row)
        };

        // Add to ZIP
        zip.start_file(&filename, options)
            .map_err(|e| format!("Failed to add file to ZIP: {}", e))?;
        zip.write_all(&image_bytes)
            .map_err(|e| format!("Failed to write to ZIP: {}", e))?;
    }

    zip.finish()
        .map_err(|e| format!("Failed to finalize ZIP: {}", e))?;

    Ok(BatchGenerateResult {
        success: true,
        zip_path: Some(zip_path.to_string_lossy().to_string()),
        validation_results,
        error: None,
    })
}

/// Open file picker for CSV
#[tauri::command]
pub async fn pick_csv_file(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let file_path = app
        .dialog()
        .file()
        .add_filter("CSV Files", &["csv", "txt"])
        .blocking_pick_file();

    match file_path {
        Some(path) => Ok(Some(path.as_path().unwrap().to_string_lossy().to_string())),
        None => Ok(None),
    }
}

fn detect_qr_type(content: &str) -> String {
    let lower = content.to_lowercase();

    if lower.starts_with("wifi:") {
        "wifi".to_string()
    } else if lower.starts_with("begin:vcard") {
        "vcard".to_string()
    } else if lower.starts_with("mailto:") {
        "email".to_string()
    } else if lower.starts_with("sms:") || lower.starts_with("smsto:") {
        "sms".to_string()
    } else if lower.starts_with("tel:") {
        "phone".to_string()
    } else if lower.starts_with("geo:") {
        "geo".to_string()
    } else if lower.starts_with("begin:vevent") {
        "calendar".to_string()
    } else if lower.starts_with("http://") || lower.starts_with("https://") {
        "url".to_string()
    } else {
        "text".to_string()
    }
}

fn sanitize_filename(s: &str) -> String {
    s.chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            c if c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == '.' => c,
            _ => '_',
        })
        .take(50)
        .collect()
}
