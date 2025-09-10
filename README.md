# DOMQL Linter

A fast static analysis tool for DOMQL components that validates property placement and structure using Babel's AST parser.

## Features

- ✅ **Style Property Validation** - Ensures CSS properties are in `style` object, not `props`
- ✅ **HTML Attribute Validation** - Ensures HTML attributes are in `props` object, not `style`
- ✅ **Event Handler Validation** - Ensures event handlers are in `on` object, not `props`
- ✅ **Data Attribute Support** - Validates `data-*` and `aria-*` attributes are in `props`
- ✅ **Fast AST Analysis** - Uses Babel parser for quick static analysis
- ✅ **Detailed Reporting** - Shows exact line/column with helpful suggestions
- ✅ **CLI Interface** - Easy to integrate into build processes

## Installation

```bash
npm install domql-linter
```

Or use globally:

```bash
npm install -g domql-linter
```

## Usage

### CLI Usage

```bash
# Lint all JS files in current directory
domql-lint

# Lint specific files
domql-lint src/components.js src/pages.js

# Lint with custom file patterns
domql-lint --files "src/**/*.js,lib/**/*.js"

# Ignore specific patterns
domql-lint --ignore "node_modules/**,dist/**"
```

### Programmatic Usage

```javascript
const DOMQLLinter = require('domql-linter');

const linter = new DOMQLLinter({
  files: ['src/**/*.js'],
  ignore: ['node_modules/**', 'dist/**']
});

linter.lint().then(success => {
  console.log(success ? 'No issues found!' : 'Issues found');
});
```

## Rules

### Style Properties (should be in `style` object)

```javascript
// ❌ Wrong - style properties in props
const BadComponent = {
  props: {
    width: '100px',
    height: '50px',
    backgroundColor: 'red',
    margin: '10px'
  }
};

// ✅ Correct - style properties in style
const GoodComponent = {
  props: {
    id: 'my-component',
    className: 'my-class'
  },
  style: {
    width: '100px',
    height: '50px',
    backgroundColor: 'red',
    margin: '10px'
  }
};
```

### HTML Attributes (should be in `props` object)

```javascript
// ❌ Wrong - HTML attributes in style
const BadComponent = {
  style: {
    id: 'my-component',
    className: 'my-class',
    'data-testid': 'test'
  }
};

// ✅ Correct - HTML attributes in props
const GoodComponent = {
  props: {
    id: 'my-component',
    className: 'my-class',
    'data-testid': 'test',
    'aria-label': 'My component'
  }
};
```

### Event Handlers (should be in `on` object)

```javascript
// ❌ Wrong - event handlers in props
const BadComponent = {
  props: {
    onClick: () => console.log('clicked'),
    onMouseEnter: () => console.log('hovered')
  }
};

// ✅ Correct - event handlers in on
const GoodComponent = {
  props: {
    id: 'my-component'
  },
  on: {
    click: () => console.log('clicked'),
    mouseenter: () => console.log('hovered')
  }
};
```

## Example Output

```
🔍 DOMQL Linter starting...

Found 5 files to analyze

📊 Linting Results:

⚠️  Warning in src/components.js:45:4
   Style property 'minWidth' should be in 'style' object, not 'props'
   💡 Move 'minWidth' to the 'style' object

⚠️  Warning in src/components.js:46:4
   Style property 'padding' should be in 'style' object, not 'props'
   💡 Move 'padding' to the 'style' object

⚠️  Warning in src/components.js:13:4
   Event handler 'onClick' should be in 'on' object, not 'props'
   💡 Move 'onClick' to the 'on' object

📈 Summary: 0 errors, 3 warnings
```

## Integration

### With npm scripts

```json
{
  "scripts": {
    "lint": "domql-lint src/**/*.js",
    "lint:fix": "domql-lint src/**/*.js && echo 'Fix the warnings above'"
  }
}
```

### With pre-commit hooks

```bash
npm install --save-dev husky
npx husky add .husky/pre-commit "domql-lint src/**/*.js"
```

### With CI/CD

```yaml
# GitHub Actions example
- name: Lint DOMQL components
  run: domql-lint src/**/*.js
```

## Configuration

The linter accepts the following options:

```javascript
const linter = new DOMQLLinter({
  files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'], // File patterns to lint
  ignore: ['node_modules/**', 'dist/**'] // Patterns to ignore
});
```

## Supported Properties

### Style Properties
- Layout: `width`, `height`, `margin`, `padding`, `border`, `display`, `position`
- Typography: `fontSize`, `fontFamily`, `fontWeight`, `color`, `textAlign`
- Flexbox: `flex`, `flexDirection`, `justifyContent`, `alignItems`, `gap`
- Grid: `grid`, `gridTemplateColumns`, `gridTemplateRows`
- Visual: `background`, `opacity`, `visibility`, `cursor`, `transition`
- And many more...

### HTML Attributes
- Standard: `id`, `className`, `title`, `alt`, `src`, `href`
- Data: `data-*` attributes
- ARIA: `aria-*` attributes
- Form: `value`, `placeholder`, `disabled`, `required`

### Event Handlers
- Mouse: `onClick`, `onMouseEnter`, `onMouseLeave`, `onMouseOver`
- Keyboard: `onKeyDown`, `onKeyUp`, `onKeyPress`
- Form: `onChange`, `onInput`, `onSubmit`
- Focus: `onFocus`, `onBlur`
- And more...

## Performance

The linter uses Babel's fast AST parser and only analyzes files that match the specified patterns. Typical performance:

- Small project (< 50 files): < 1 second
- Medium project (50-200 files): 1-3 seconds  
- Large project (200+ files): 3-10 seconds

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new rules
4. Submit a pull request

## License

MIT
