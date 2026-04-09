# Sample Project Adapter Module

This is a starter skeleton for a new project-specific builder adapter.

Use it like this:

1. Copy this module into the new project repository.
2. Replace `com.example.project` with the real project package.
3. Add the dependency block from `templates/screenbuilder-project-bootstrap/pom-screenbuilder-dependencies.xml`.
4. Copy `templates/screenbuilder-project-bootstrap/application-screenbuilder.properties`.
5. Replace the `UnsupportedOperationException` sections with real project bindings.

The policy adapter is already wired to property-based defaults.

The TODO adapters are:

- menu catalog
- command page lookup
- component registry
- authority contract
- runtime compare
