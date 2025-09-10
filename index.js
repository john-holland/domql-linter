#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const chalk = require('chalk');

class DOMQLLinter {
  constructor(options = {}) {
    this.options = {
      files: options.files || ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
      ignore: options.ignore || ['node_modules/**', 'dist/**'],
      ...options
    };
    this.errors = [];
    this.warnings = [];
  }

  // CSS properties that should be in style, not props
  getStyleProperties() {
    return new Set([
      'width', 'height', 'margin', 'padding', 'border', 'background', 'color',
      'fontSize', 'fontFamily', 'fontWeight', 'textAlign', 'display', 'position',
      'top', 'left', 'right', 'bottom', 'zIndex', 'opacity', 'visibility',
      'overflow', 'cursor', 'transition', 'transform', 'boxSizing', 'flex',
      'flexDirection', 'justifyContent', 'alignItems', 'gap', 'grid',
      'gridTemplateColumns', 'gridTemplateRows', 'aspectRatio', 'backdropFilter',
      'borderRadius', 'boxShadow', 'textDecoration', 'lineHeight', 'letterSpacing',
      'whiteSpace', 'wordWrap', 'textOverflow', 'verticalAlign', 'float',
      'clear', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'flexBasis',
      'flexGrow', 'flexShrink', 'order', 'alignSelf', 'justifySelf'
    ]);
  }

  // HTML attributes that should be in props, not style
  getHTMLAttributes() {
    return new Set([
      'id', 'class', 'className', 'data-*', 'aria-*', 'role', 'tabindex',
      'disabled', 'readonly', 'required', 'checked', 'selected', 'value',
      'placeholder', 'title', 'alt', 'src', 'href', 'target', 'rel',
      'type', 'name', 'form', 'for', 'maxlength', 'minlength', 'pattern',
      'autocomplete', 'autofocus', 'multiple', 'size', 'rows', 'cols'
    ]);
  }

  // Event handlers that should be in on, not props
  getEventHandlers() {
    return new Set([
      'onClick', 'onMouseEnter', 'onMouseLeave', 'onMouseOver', 'onMouseOut',
      'onMouseDown', 'onMouseUp', 'onKeyDown', 'onKeyUp', 'onKeyPress',
      'onFocus', 'onBlur', 'onChange', 'onInput', 'onSubmit', 'onLoad',
      'onError', 'onResize', 'onScroll', 'onTouchStart', 'onTouchEnd',
      'onTouchMove', 'onTouchCancel'
    ]);
  }

  lintFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties']
      });

      traverse(ast, {
        ObjectExpression: (path) => {
          this.checkObjectExpression(path, filePath);
        }
      });
    } catch (error) {
      this.errors.push({
        file: filePath,
        line: 1,
        column: 1,
        message: `Parse error: ${error.message}`,
        severity: 'error'
      });
    }
  }

  checkObjectExpression(path, filePath) {
    const { node } = path;
    const location = path.node.loc;
    
    // Look for DOMQL component patterns
    if (this.isDOMQLComponent(node)) {
      this.validateComponentStructure(node, filePath, location);
    }
  }

  isDOMQLComponent(node) {
    // Check if this looks like a DOMQL component definition
    const hasExtend = node.properties.some(prop => 
      prop.key && prop.key.name === 'extend'
    );
    const hasProps = node.properties.some(prop => 
      prop.key && prop.key.name === 'props'
    );
    const hasStyle = node.properties.some(prop => 
      prop.key && prop.key.name === 'style'
    );
    const hasOn = node.properties.some(prop => 
      prop.key && prop.key.name === 'on'
    );

    return hasExtend || hasProps || hasStyle || hasOn;
  }

  validateComponentStructure(node, filePath, location) {
    const styleProps = this.getStyleProperties();
    const htmlAttrs = this.getHTMLAttributes();
    const eventHandlers = this.getEventHandlers();

    // Check props object
    const propsNode = node.properties.find(prop => 
      prop.key && prop.key.name === 'props'
    );

    if (propsNode && propsNode.value && propsNode.value.type === 'ObjectExpression') {
      this.validatePropsObject(propsNode.value, filePath, location, styleProps, htmlAttrs, eventHandlers);
    }

    // Check style object
    const styleNode = node.properties.find(prop => 
      prop.key && prop.key.name === 'style'
    );

    if (styleNode && styleNode.value && styleNode.value.type === 'ObjectExpression') {
      this.validateStyleObject(styleNode.value, filePath, location, htmlAttrs);
    }

    // Check on object
    const onNode = node.properties.find(prop => 
      prop.key && prop.key.name === 'on'
    );

    if (onNode && onNode.value && onNode.value.type === 'ObjectExpression') {
      this.validateOnObject(onNode.value, filePath, location);
    }
  }

  validatePropsObject(propsNode, filePath, location, styleProps, htmlAttrs, eventHandlers) {
    propsNode.properties.forEach(prop => {
      if (prop.key && prop.key.type === 'Identifier') {
        const propName = prop.key.name;
        
        // Check for style properties in props
        if (styleProps.has(propName)) {
          this.warnings.push({
            file: filePath,
            line: prop.loc?.start?.line || location?.start?.line || 1,
            column: prop.loc?.start?.column || location?.start?.column || 1,
            message: `Style property '${propName}' should be in 'style' object, not 'props'`,
            severity: 'warning',
            suggestion: `Move '${propName}' to the 'style' object`
          });
        }

        // Check for event handlers in props
        if (eventHandlers.has(propName)) {
          this.warnings.push({
            file: filePath,
            line: prop.loc?.start?.line || location?.start?.line || 1,
            column: prop.loc?.start?.column || location?.start?.column || 1,
            message: `Event handler '${propName}' should be in 'on' object, not 'props'`,
            severity: 'warning',
            suggestion: `Move '${propName}' to the 'on' object`
          });
        }

        // Check for data attributes
        if (propName.startsWith('data-')) {
          // This is correct - data attributes should be in props
        } else if (propName.startsWith('aria-')) {
          // This is correct - aria attributes should be in props
        }
      }
    });
  }

  validateStyleObject(styleNode, filePath, location, htmlAttrs) {
    styleNode.properties.forEach(prop => {
      if (prop.key && prop.key.type === 'Identifier') {
        const propName = prop.key.name;
        
        // Check for HTML attributes in style
        if (htmlAttrs.has(propName) || propName.startsWith('data-') || propName.startsWith('aria-')) {
          this.warnings.push({
            file: filePath,
            line: prop.loc?.start?.line || location?.start?.line || 1,
            column: prop.loc?.start?.column || location?.start?.column || 1,
            message: `HTML attribute '${propName}' should be in 'props' object, not 'style'`,
            severity: 'warning',
            suggestion: `Move '${propName}' to the 'props' object`
          });
        }
      }
    });
  }

  validateOnObject(onNode, filePath, location) {
    onNode.properties.forEach(prop => {
      if (prop.key && prop.key.type === 'Identifier') {
        const propName = prop.key.name;
        
        // Check for non-event handlers in on object
        if (!propName.startsWith('on') && !['mouseenter', 'mouseleave', 'click', 'keydown', 'keyup'].includes(propName)) {
          this.warnings.push({
            file: filePath,
            line: prop.loc?.start?.line || location?.start?.line || 1,
            column: prop.loc?.start?.column || location?.start?.column || 1,
            message: `'${propName}' doesn't look like an event handler and should probably be in 'props'`,
            severity: 'warning',
            suggestion: `Consider moving '${propName}' to the 'props' object`
          });
        }
      }
    });
  }

  async lint() {
    console.log(chalk.blue('🔍 DOMQL Linter starting...\n'));

    const files = await glob(this.options.files, {
      ignore: this.options.ignore,
      cwd: process.cwd()
    });

    console.log(chalk.gray(`Found ${files.length} files to analyze\n`));

    for (const file of files) {
      this.lintFile(file);
    }

    this.reportResults();
    return this.errors.length === 0;
  }

  reportResults() {
    console.log(chalk.blue('📊 Linting Results:\n'));

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(chalk.green('✅ No issues found!'));
      return;
    }

    // Report errors
    this.errors.forEach(error => {
      console.log(chalk.red(`❌ Error in ${error.file}:${error.line}:${error.column}`));
      console.log(chalk.red(`   ${error.message}\n`));
    });

    // Report warnings
    this.warnings.forEach(warning => {
      console.log(chalk.yellow(`⚠️  Warning in ${warning.file}:${warning.line}:${warning.column}`));
      console.log(chalk.yellow(`   ${warning.message}`));
      if (warning.suggestion) {
        console.log(chalk.gray(`   💡 ${warning.suggestion}\n`));
      } else {
        console.log();
      }
    });

    console.log(chalk.blue(`\n📈 Summary: ${this.errors.length} errors, ${this.warnings.length} warnings`));
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--files' && args[i + 1]) {
      options.files = args[i + 1].split(',');
      i++;
    } else if (args[i] === '--ignore' && args[i + 1]) {
      options.ignore = args[i + 1].split(',');
      i++;
    }
  }

  const linter = new DOMQLLinter(options);
  linter.lint().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = DOMQLLinter;
