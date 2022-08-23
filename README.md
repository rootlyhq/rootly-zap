# rootly-zap

## Development

### Environment

Set `ROOTLY_API_URL` and `ROOTLY_API_TOKEN` environment variables for testing or development.

### Create actions

Instead of manually writing each create action, `./creates/reflected.js` exports a function which generates the create action using `./swagger.json`.

For example, `require('./creates/reflected.js')('incident')` returns a create incident action by reflecting `.components.schemas.new_incident` in `./swagger.json`.

To update the create actions just update `./swagger.json`.

### See Also

- [Zapier app tutorial](https://zapier.com/developer/start/introduction).
- [Zapier CLI documentation](https://github.com/zapier/zapier-platform-cli).
