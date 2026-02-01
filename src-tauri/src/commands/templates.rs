use crate::db::{self, DbState, NewTemplate, Template};
use tauri::State;

/// List all templates
#[tauri::command]
pub async fn template_list(state: State<'_, DbState>) -> Result<Vec<Template>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    db::list_templates(&conn).map_err(|e| format!("Failed to list templates: {}", e))
}

/// Get a template by ID
#[tauri::command]
pub async fn template_get(state: State<'_, DbState>, id: i64) -> Result<Option<Template>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    db::get_template(&conn, id).map_err(|e| format!("Failed to get template: {}", e))
}

/// Save a new template
#[tauri::command]
pub async fn template_save(
    state: State<'_, DbState>,
    template: NewTemplate,
) -> Result<i64, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    db::save_template(&conn, &template).map_err(|e| format!("Failed to save template: {}", e))
}

/// Update a template
#[tauri::command]
pub async fn template_update(
    state: State<'_, DbState>,
    id: i64,
    template: NewTemplate,
) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    db::update_template(&conn, id, &template)
        .map_err(|e| format!("Failed to update template: {}", e))
}

/// Delete a template
#[tauri::command]
pub async fn template_delete(state: State<'_, DbState>, id: i64) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    db::delete_template(&conn, id).map_err(|e| format!("Failed to delete template: {}", e))
}

/// Set a template as default
#[tauri::command]
pub async fn template_set_default(state: State<'_, DbState>, id: i64) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    db::set_default_template(&conn, id)
        .map_err(|e| format!("Failed to set default template: {}", e))
}
