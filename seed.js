// Native fetch is used (Node 21+)

const BASE_URL = 'http://localhost:8080/api/patients';

const patients = [
    { name: 'Juan Perez', age: 30, medicalHistory: 'Ninguno' },
    { name: 'Maria Gomez', age: 25, medicalHistory: 'Asma' },
    { name: 'Carlos Lopez', age: 45, medicalHistory: 'Diabetes' },
    { name: 'Ana Rodriguez', age: 50, medicalHistory: 'Hipertension' }
];

async function seed() {
    console.log('🌱 Inicio de sembrado de datos...');

    // 1. Check if backend is reachable
    try {
        await fetch(BASE_URL);
    } catch (e) {
        console.error('❌ No se puede conectar al backend en ' + BASE_URL);
        console.error('Asegúrate de que el backend (Spring Boot) esté corriendo.');
        process.exit(1);
    }

    // 2. Insert data
    for (const p of patients) {
        try {
            const res = await fetch(BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p)
            });

            if (res.ok) {
                console.log(`✅ Insertado: ${p.name}`);
            } else {
                console.error(`❌ Error insertando ${p.name}: ${res.status}`);
            }
        } catch (err) {
            console.error(`❌ Fallo de red con ${p.name}:`, err.message);
        }
    }
    console.log('✨ Sembrado terminado.');
}

seed();
