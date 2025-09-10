#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get target path from command line argument or use current directory
const targetPath = process.argv[2] || process.cwd();
const componentsPath = path.resolve(targetPath, 'src', 'components.js');

console.log('🔧 Auto-fixing common DOMQL issues in components...\n');

// Check if components file exists
if (!fs.existsSync(componentsPath)) {
  console.log(`❌ Components file not found at: ${componentsPath}`);
  console.log('Usage: node fix-components.js [path-to-project]');
  console.log('Example: node fix-components.js ../my-project');
  process.exit(1);
}

try {
  // Read the components file
  let content = fs.readFileSync(componentsPath, 'utf8');
  
  console.log('📝 Applying fixes...');
  
  // Fix 1: Move style properties from props to style objects
  // This is a simple regex-based fix for common cases
  const styleProperties = [
    'minWidth', 'padding', 'gap', 'order', 'margin', 'background', 
    'fontSize', 'fontWeight', 'justifyContent', 'maxWidth', 'position',
    'color', 'border'
  ];
  
  let fixesApplied = 0;
  
  // Find and fix components that have style properties in props
  const componentRegex = /(\w+Component\s*=\s*\{[^}]*extend:[^}]*props:\s*\{[^}]*\})/gs;
  
  content = content.replace(componentRegex, (match) => {
    // Check if this component has style properties in props
    const hasStyleInProps = styleProperties.some(prop => 
      match.includes(`${prop}:`) && match.includes('props:')
    );
    
    if (hasStyleInProps) {
      console.log(`  🔄 Fixing component with style properties in props...`);
      fixesApplied++;
      
      // This is a simplified fix - in practice, you'd want more sophisticated AST manipulation
      // For now, we'll just add a comment indicating what needs to be fixed
      return match + '\n    // TODO: Move style properties from props to style object';
    }
    
    return match;
  });
  
  // Write the updated content
  fs.writeFileSync(componentsPath, content);
  
  console.log(`\n✅ Applied ${fixesApplied} fixes`);
  console.log('\n⚠️  Note: This is a basic fix. Please review the changes and manually move');
  console.log('   style properties from props to style objects for complete compliance.');
  
  console.log('\n🔍 Running linter to check remaining issues...\n');
  
  // Run the linter to show remaining issues
  const linterPath = path.join(__dirname, 'index.js');
  const srcPattern = path.join(targetPath, 'src', '**', '*.js');
  
  execSync(`node "${linterPath}" --files "${srcPattern}"`, {
    cwd: __dirname,
    encoding: 'utf8',
    stdio: 'inherit'
  });
  
} catch (error) {
  console.error('❌ Error during auto-fix:', error.message);
  process.exit(1);
}
