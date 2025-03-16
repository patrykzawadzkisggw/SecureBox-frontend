import { useState, useEffect } from 'react';
import './App.css';

// Typ dla modułu WebAssembly
interface WasmModule {
  add: (a: number, b: number) => number;
}

function App2() {
  const [wasm, setWasm] = useState<WasmModule | null>(null);
  const [num1, setNum1] = useState<number>(0);
  const [num2, setNum2] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  // Ładowanie WebAssembly
  useEffect(() => {
    async function loadWasm() {
      try {
        // Importujemy moduł
        const wasmModule = await import('./wasm/wasm_add.js');
        // Inicjalizujemy WebAssembly, ładując plik .wasm
        await wasmModule.default(); // Wywołanie domyślnej funkcji inicjalizującej
        setWasm(wasmModule);
      } catch (error) {
        console.error('Błąd ładowania WebAssembly:', error);
      }
    }
    loadWasm();
  }, []);

  const handleCalculate = () => {
    if (wasm) {
      const sum = wasm.add(
        parseInt(String(num1)) || 0,
        parseInt(String(num2)) || 0
      );
      setResult(sum);
    }
  };

  return (
    <div className="App">
      <h1>Kalkulator WebAssembly</h1>
      {!wasm && <p>Ładowanie WebAssembly...</p>}
      {wasm && (
        <div>
          <input
            style={{ color: 'red' }}
            type="number"
            value={num1}
            onChange={(e) => setNum1(Number(e.target.value))}
            placeholder="Pierwsza liczba"
          />
          <input
            style={{ color: 'red' }}
            type="number"
            value={num2}
            onChange={(e) => setNum2(Number(e.target.value))}
            placeholder="Druga liczba"
          />
          <button style={{ color: 'red' }} onClick={handleCalculate}>
            Dodaj
          </button>
          {result !== null && <p style={{ color: 'red' }}>Wynik: {result}</p>}
        </div>
      )}
    </div>
  );
}

export default App2;

