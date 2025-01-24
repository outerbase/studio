This is working in progress about how to extend our studio functionality

## Extensions

We have transitioned our architecture to an extension-based approach, where most features will be implemented as extensions. This shift allows new contributors to easily contribute to the codebase without requiring in-depth knowledge of the entire system.

This is the minimalist example of extension

```typescript
export default class SampleExtension extends StudioExtension {
  extensionName = "sample-extension";

  init(studio: StudioExtensionContext): void {
    // this is where we extend studio functionality
  }
}
```

- All of the extension is located at `/src/extensions`.
- Once you finish implement your extension, you can attach it to studio at `/src/core/standard-extension.tsx`

Below is a list of areas where extensions can build upon our core Outerbase Studio.

- [Sidebar](sidebar.md)
- [Window Tab](window-tab.md)
- Resource Creation Menu
- Resource Context Menu
- Query Hook
