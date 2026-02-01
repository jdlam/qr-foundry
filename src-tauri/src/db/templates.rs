use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Template {
    pub id: i64,
    pub name: String,
    pub style_json: String,
    pub preview: Option<String>,
    pub is_default: bool,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewTemplate {
    pub name: String,
    pub style_json: String,
    pub preview: Option<String>,
    pub is_default: Option<bool>,
}

/// List all templates
pub fn list_templates(conn: &Connection) -> Result<Vec<Template>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, name, style_json, preview, is_default, created_at
        FROM templates
        ORDER BY is_default DESC, created_at DESC
        "#,
    )?;

    let items = stmt
        .query_map([], |row| {
            Ok(Template {
                id: row.get(0)?,
                name: row.get(1)?,
                style_json: row.get(2)?,
                preview: row.get(3)?,
                is_default: row.get::<_, i64>(4)? != 0,
                created_at: row.get(5)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(items)
}

/// Get a template by ID
pub fn get_template(conn: &Connection, id: i64) -> Result<Option<Template>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, name, style_json, preview, is_default, created_at
        FROM templates
        WHERE id = ?1
        "#,
    )?;

    let result = stmt.query_row(params![id], |row| {
        Ok(Template {
            id: row.get(0)?,
            name: row.get(1)?,
            style_json: row.get(2)?,
            preview: row.get(3)?,
            is_default: row.get::<_, i64>(4)? != 0,
            created_at: row.get(5)?,
        })
    });

    match result {
        Ok(template) => Ok(Some(template)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}

/// Save a new template
pub fn save_template(conn: &Connection, template: &NewTemplate) -> Result<i64, rusqlite::Error> {
    conn.execute(
        r#"
        INSERT INTO templates (name, style_json, preview, is_default)
        VALUES (?1, ?2, ?3, ?4)
        "#,
        params![
            template.name,
            template.style_json,
            template.preview,
            template.is_default.unwrap_or(false) as i64
        ],
    )?;

    Ok(conn.last_insert_rowid())
}

/// Update a template
pub fn update_template(
    conn: &Connection,
    id: i64,
    template: &NewTemplate,
) -> Result<bool, rusqlite::Error> {
    let affected = conn.execute(
        r#"
        UPDATE templates
        SET name = ?1, style_json = ?2, preview = ?3, is_default = ?4
        WHERE id = ?5
        "#,
        params![
            template.name,
            template.style_json,
            template.preview,
            template.is_default.unwrap_or(false) as i64,
            id
        ],
    )?;

    Ok(affected > 0)
}

/// Delete a template
pub fn delete_template(conn: &Connection, id: i64) -> Result<bool, rusqlite::Error> {
    let affected = conn.execute("DELETE FROM templates WHERE id = ?1", params![id])?;
    Ok(affected > 0)
}

/// Set a template as default (unsets others)
pub fn set_default_template(conn: &Connection, id: i64) -> Result<bool, rusqlite::Error> {
    // Unset all defaults
    conn.execute("UPDATE templates SET is_default = 0", [])?;

    // Set the new default
    let affected = conn.execute(
        "UPDATE templates SET is_default = 1 WHERE id = ?1",
        params![id],
    )?;

    Ok(affected > 0)
}
