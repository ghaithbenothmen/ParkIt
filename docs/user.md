## User Model Validation

### `firstname` and `lastname`

- **Type**: String
- **Required**: Yes
- **Length**: Minimum 2 characters, Maximum 50 characters

### `phone`

- **Type**: String
- **Required**: Yes
- **Unique**: Yes
- **Pattern**: Must be a valid Tunisian mobile phone number, following the format:* Starts with `2`, `5`, or `9`, followed by exactly 7 digits.

  - Example: `22123456`, `95123456`, `95234567`

### `email`

- **Type**: String
- **Required**: Yes
- **Unique**: Yes
- **Pattern**: Must be a valid email address.
  - Example: `user@example.com`

### `password`

* **Type**: String
* **Required**: Yes
* **Minimum Length**: 8 characters
* **Maximum Length**: 20 characters
* **Pattern**:
  * Must include at least one uppercase letter (`A-Z`).
  * Must include at least one lowercase letter (`a-z`).
  * Must include at least one digit (`0-9`).
  * Must include at least one special character (e.g., `!@#$%^&*`).
* **Example**: `SecurePassword123!`

### `role`

- **Type**: String
- **Possible Values**: `user`, `admin`
- **Default**: `user`
