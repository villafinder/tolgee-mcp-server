# @villafinder/tolgee-mcp

MCP server for [Tolgee](https://tolgee.io) translation management.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TOLGEE_TOKEN` | Yes | — | API key or Personal Access Token |
| `PROJECT_ID` | Yes | — | Tolgee project ID |
| `TOLGEE_URL` | No | `https://app.tolgee.io` | Custom/self-hosted Tolgee URL |

## Usage

Add to your `.mcp.json`:

```json
{
  "tolgee": {
    "command": "npx",
    "args": ["-y", "@villafinder/tolgee-mcp"],
    "env": {
      "TOLGEE_URL": "https://tikus.villa-finder.com",
      "TOLGEE_TOKEN": "your-token",
      "PROJECT_ID": "1"
    }
  }
}
```

## Tools

### `tolgee_get_keys`

Search for existing translation keys.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `filter_keys` | Yes | Key names to search for |
| `namespace` | No | Filter by namespace |
| `languages` | No | Language ISO codes to include translations for (e.g. `["en", "fr"]`) |

### `tolgee_create_keys`

Create keys with initial translations. Always use `tolgee_get_keys` first to check for duplicates.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `keys` | Yes | List of keys, each with `key_name`, optional `namespace`, optional `description`, and `translations` (array of `{language_iso, translation}`) |
| `tags` | No | Tags to apply to all keys |
