## Extending Sidebar

To create extension that add new sidebar with content.

```tsx
function SampleSidebar() {
  return <div>Sidebar Content</div>;
}

export default class SampleExtension extends StudioExtension {
  extensionName = "sample-extension";

  init(studio: StudioExtensionContext): void {
    studio.registerSidebar({
      key: "sample-extension-sidebar",
      name: "Sample",
      icon: <LucideArrow />,
      content: <SampleSidebar />,
    });
  }
}
```

You can also create sidebar without content. You need just need to provide `onClick` instead of `content`

```tsx
export default class SampleExtension extends StudioExtension {
  extensionName = "sample-extension";

  init(studio: StudioExtensionContext): void {
    studio.registerSidebar({
      key: "sample-extension-sidebar",
      name: "Sample",
      icon: <LucideArrow />,
      onClick: () => {
        // do something
      },
    });
  }
}
```
