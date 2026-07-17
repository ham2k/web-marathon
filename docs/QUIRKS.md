# Quirks, Gotchas, and Workarounds

This document captures build issues, dependency compatibility quirks, and other gotchas encountered during development.

## `xmlbuilder2` Browser Compatibility (Vite vs. Jest)

### Context
`xmlbuilder2` is primarily designed as an XML builder for Node.js environments. By default, it relies on `@oozcitak/dom` to polyfill the DOM. While these Node.js-only imports work seamlessly under testing environments like Jest (which simulates DOM using `jsdom`), they fail in a real browser context with the following runtime error:
```
Uncaught TypeError: Class extends value undefined is not a constructor or null
```

This occurs because Vite compiles `@oozcitak/dom` for the browser, where standard Node APIs are unavailable, causing some classes to evaluate to `undefined` during class inheritance initialization.

### Solution
To resolve this without writing custom environment-detecting wrapper code, we use a combination of bundler-aliasing and standard imports:

1. **Vite Resolution**: In [vite.config.js](file:///Users/sd/Work/ham2k/web-marathon/vite.config.js), we configure an alias to redirect the `xmlbuilder2` module import to its pre-bundled browser version (`xmlbuilder2/lib/xmlbuilder2.min.js`), which has all Node.js-only dependencies stripped out:
   ```javascript
   resolve: {
     alias: {
       xmlbuilder2: 'xmlbuilder2/lib/xmlbuilder2.min.js'
     }
   }
   ```
2. **Jest Resolution**: Jest ignores Vite's config by default and runs natively under Node.js, resolving `xmlbuilder2` to its default Node-compatible entry point, which works perfectly for test suites.
3. **Clean Imports**: This lets us keep clean import statements in our source code (e.g. in [generateDXM.js](file:///Users/sd/Work/ham2k/web-marathon/src/app/store/log/actions/generateDXM.js)):
   ```javascript
   import { create } from 'xmlbuilder2'
   ```
