# List files in a directory

List all files and folders at a given path in cloud storage.

## Endpoint

```
POST http://localhost:20131/files/list
```

**Authorization:** `Bearer <token>`

## Request Body

```json
{
  "path": "CloudflareR2/my-account/my-bucket/images"
}
```

## Response

```json
{
  "items": [
    {
      "name": "photo.jpg",
      "absolutePath": "CloudflareR2/my-account/my-bucket/images/photo.jpg",
      "type": "file",
      "sizeBytes": 204800,
      "cdnUrl": "https://<account-id>.r2.cloudflarestorage.com/my-bucket/images/photo.jpg"
    },
    {
      "name": "thumbs",
      "absolutePath": "CloudflareR2/my-account/my-bucket/images/thumbs",
      "type": "folder",
      "cdnUrl": "https://<account-id>.r2.cloudflarestorage.com/my-bucket/images/thumbs"
    }
  ]
}
```

## Example (curl)

```bash
curl -X POST "http://localhost:20131/files/list" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "CloudflareR2/my-account/my-bucket/images"
  }'
```

## Notes

- path format: <Provider>/<account>/<bucket>[/<folder>...]
- Supported providers: CloudflareR2, GoogleDrive.
- Token must have read permission for the path.
- cdnUrl is included for each item when the provider supports it (CloudflareR2 only).

---

# Get file details and content

Retrieve metadata and base64-encoded content of a specific file.

## Endpoint

```
POST http://localhost:20131/files/get
```

**Authorization:** `Bearer <token>`

## Request Body

```json
{
  "absolutePath": "CloudflareR2/my-account/my-bucket/images/photo.jpg"
}
```

## Response

```json
{
  "file": {
    "name": "photo.jpg",
    "absolutePath": "CloudflareR2/my-account/my-bucket/images/photo.jpg",
    "type": "file",
    "sizeBytes": 204800,
    "contentBase64": "<base64-encoded content>",
    "contentType": "image/jpeg"
  }
}
```

## Example (curl)

```bash
curl -X POST "http://localhost:20131/files/get" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "absolutePath": "CloudflareR2/my-account/my-bucket/images/photo.jpg"
  }'
```

## Notes

- absolutePath format: <Provider>/<account>/<bucket>/<path>/<filename>
- Token must have read permission for the path.

---

# Upload a file to an absolute path

Upload any file to a specific location in cloud storage by providing its absolute path and base64-encoded content.

## Endpoint

```
POST http://localhost:20131/files/upload
```

**Authorization:** `Bearer <token>`

## Request Body

```json
{
  "absolutePath": "CloudflareR2/my-account/my-bucket/images/photo.jpg",
  "contentBase64": "<base64-encoded file content>",
  "contentType": "image/jpeg"
}
```

## Example (curl)

```bash
curl -X POST "http://localhost:20131/files/upload" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "absolutePath": "CloudflareR2/my-account/my-bucket/images/photo.jpg",
    "contentBase64": "<base64-encoded file content>",
    "contentType": "image/jpeg"
  }'
```

## Notes

- absolutePath format: <Provider>/<account>/<bucket>/<path>/<filename>
- contentType is optional — omit to let the provider infer it.
- Supported providers: CloudflareR2, GoogleDrive.
- Returns 204 No Content on success.
- Token must have write permission for the path.
