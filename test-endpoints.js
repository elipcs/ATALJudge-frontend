// Script para testar os endpoints do backend
// Execute no console do navegador na página de convites

async function testEndpoints() {
  console.log('=== TESTANDO ENDPOINTS ===');
  
  // Pegar token do localStorage
  const token = localStorage.getItem('token');
  console.log('Token encontrado:', token ? 'Sim' : 'Não');
  
  if (!token) {
    console.error('❌ Nenhum token encontrado. Faça login primeiro.');
    return;
  }
  
  // Testar endpoint de classes
  console.log('\n--- Testando /classes ---');
  try {
    const classesResponse = await fetch('http://localhost:5000/classes/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token // Sem Bearer
      }
    });
    
    console.log('Status:', classesResponse.status);
    console.log('Headers:', Object.fromEntries(classesResponse.headers.entries()));
    
    const classesData = await classesResponse.text();
    console.log('Response:', classesData);
    
    if (classesResponse.ok) {
      console.log('✅ Classes endpoint funcionando');
    } else {
      console.log('❌ Classes endpoint com erro:', classesResponse.status);
    }
  } catch (error) {
    console.error('❌ Erro ao testar classes:', error);
  }
  
  // Testar endpoint de convites
  console.log('\n--- Testando /invite/ ---');
  try {
    const invitesResponse = await fetch('http://localhost:5000/invite/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token // Sem Bearer
      }
    });
    
    console.log('Status:', invitesResponse.status);
    console.log('Headers:', Object.fromEntries(invitesResponse.headers.entries()));
    
    const invitesData = await invitesResponse.text();
    console.log('Response:', invitesData);
    
    if (invitesResponse.ok) {
      console.log('✅ Invites endpoint funcionando');
    } else {
      console.log('❌ Invites endpoint com erro:', invitesResponse.status);
    }
  } catch (error) {
    console.error('❌ Erro ao testar invites:', error);
  }
  
  // Testar com Bearer prefix
  console.log('\n--- Testando com Bearer prefix ---');
  try {
    const bearerResponse = await fetch('http://localhost:5000/classes/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Status com Bearer:', bearerResponse.status);
    const bearerData = await bearerResponse.text();
    console.log('Response com Bearer:', bearerData);
    
  } catch (error) {
    console.error('❌ Erro ao testar com Bearer:', error);
  }
}

// Executar teste
testEndpoints();
