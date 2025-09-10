#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Get target path from command line argument or use current directory
const targetPath = process.argv[2] || process.cwd();

console.log('🔧 Running DOMQL Linter...\n');

try {
  // Run the linter on the target project
  console.log(`Running DOMQL linter on: ${targetPath}\n`);
  
  const linterPath = path.join(__dirname, 'index.js');
  const srcPattern = path.join(targetPath, 'src', '**', '*.js');
  
  const result = execSync(`node "${linterPath}" --files "${srcPattern}"`, {
    cwd: __dirname,
    encoding: 'utf8',
    stdio: 'inherit'
  });
  
  console.log('\n✅ Linter run complete!');
  console.log('\nTo add this to your build process:');
  console.log('1. Add to package.json scripts:');
  console.log('   "lint:domql": "node ../domql-linter/run-linter.js"');
  console.log('\n2. Run before builds:');
  console.log('   npm run lint:domql && npm run build');
  console.log('\n3. Or run directly:');
  console.log('   node ../domql-linter/run-linter.js [path-to-project]');
  
} catch (error) {
  console.error('❌ Linter found issues that need to be fixed');
  console.log('\n💡 Tip: Run "node fix-components.js [path-to-project]" to auto-fix common issues');
  process.exit(1);
}
