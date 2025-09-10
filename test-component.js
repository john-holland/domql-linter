// Test file with intentional DOMQL linting issues

export const BadComponent = {
  extend: 'div',
  props: {
    // ❌ Style properties in props (should be in style)
    width: '100px',
    height: '50px',
    backgroundColor: 'red',
    margin: '10px',
    
    // ❌ Event handler in props (should be in on)
    onClick: () => console.log('clicked'),
    onMouseEnter: () => console.log('hovered'),
    
    // ✅ Correct HTML attributes in props
    id: 'test-component',
    'data-testid': 'bad-component',
    'aria-label': 'Test component',
    className: 'test-class'
  },
  style: {
    // ❌ HTML attributes in style (should be in props)
    id: 'wrong-id',
    className: 'wrong-class',
    'data-wrong': 'value',
    
    // ✅ Correct style properties
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  on: {
    // ❌ Non-event properties in on (should be in props)
    id: 'wrong-id',
    className: 'wrong-class',
    
    // ✅ Correct event handlers
    click: () => console.log('clicked'),
    mouseenter: () => console.log('hovered')
  }
};

export const GoodComponent = {
  extend: 'div',
  props: {
    id: 'good-component',
    className: 'good-class',
    'data-testid': 'good-component',
    'aria-label': 'Good component'
  },
  style: {
    width: '100px',
    height: '50px',
    backgroundColor: 'blue',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  on: {
    click: () => console.log('clicked'),
    mouseenter: () => console.log('hovered')
  }
};
