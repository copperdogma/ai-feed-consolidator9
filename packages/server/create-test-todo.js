// Script to test creating todo items
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
  try {
    console.log('Creating test user first to get authentication...');
    
    // Create a mock token (this would normally come from Firebase)
    const mockToken = 'mock-token';
    
    // First authenticate through the debug-auth endpoint
    const authResponse = await fetch('http://localhost:3001/debug-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify({
        email: 'mock@example.com',
        name: 'Mock User',
        uid: 'mock-user-uid'
      })
    });
    
    console.log(`Auth response status: ${authResponse.status}`);
    const authData = await authResponse.json();
    
    if (authResponse.status !== 200) {
      console.log('❌ Authentication failed');
      console.log(`Error: ${JSON.stringify(authData, null, 2)}`);
      return;
    }
    
    console.log('✅ Authentication successful!');
    
    // Now create a todo item
    console.log('\nCreating a todo item...');
    const todoTitle = `Test Todo Item ${new Date().toISOString()}`;
    const createTodoResponse = await fetch('http://localhost:3001/trpc/todo.create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify({
        json: {
          title: todoTitle
        }
      })
    });
    
    console.log(`Create todo response status: ${createTodoResponse.status}`);
    if (createTodoResponse.ok) {
      const todoData = await createTodoResponse.json();
      console.log(`Todo created: ${JSON.stringify(todoData, null, 2)}`);
      console.log('✅ Todo created successfully!');
      
      // List all todos
      console.log('\nListing all todos...');
      const listTodosResponse = await fetch('http://localhost:3001/trpc/todo.list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });
      
      console.log(`List todos response status: ${listTodosResponse.status}`);
      if (listTodosResponse.ok) {
        const todosData = await listTodosResponse.json();
        console.log(`Todos: ${JSON.stringify(todosData, null, 2)}`);
        console.log('✅ Todos listed successfully!');
      } else {
        console.log('❌ Failed to list todos');
        try {
          const errorData = await listTodosResponse.json();
          console.log(`Error: ${JSON.stringify(errorData, null, 2)}`);
        } catch (e) {
          console.log(`Error: ${listTodosResponse.statusText}`);
        }
      }
    } else {
      console.log('❌ Failed to create todo');
      try {
        const errorData = await createTodoResponse.json();
        console.log(`Error: ${JSON.stringify(errorData, null, 2)}`);
      } catch (e) {
        console.log(`Error: ${createTodoResponse.statusText}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 