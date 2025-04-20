import { useState, useEffect } from 'react';
import { validateClientSchema } from '../schema/client-validation';

// Worker instance
let worker: Worker | null = null;

// Create worker lazily
function getWorker() {
  if (!worker && typeof Worker !== 'undefined') {
    worker = new Worker(new URL('../workers/schema-validator.worker.ts', import.meta.url));
  }
  return worker;
}

export function useSchemaValidation(schema: unknown) {
  const [validationState, setValidationState] = useState({
    isValidating: true,
    isValid: false,
    errors: null as null | Array<{ path: string; message: string }>,
  });

  useEffect(() => {
    // First, do quick client-side validation
    if (!validateClientSchema(schema)) {
      setValidationState({
        isValidating: false,
        isValid: false,
        errors: [{ path: 'root', message: 'Invalid schema structure' }],
      });
      return;
    }

    // If basic validation passes and we're in development, do thorough validation
    if (process.env.NODE_ENV === 'development') {
      const worker = getWorker();
      
      if (worker) {
        const validationId = Date.now().toString();
        
        const handleMessage = (event: MessageEvent) => {
          if (event.data.id === validationId) {
            const { result } = event.data;
            setValidationState({
              isValidating: false,
              isValid: result.valid,
              errors: result.errors,
            });
            worker.removeEventListener('message', handleMessage);
          }
        };

        worker.addEventListener('message', handleMessage);
        worker.postMessage({ id: validationId, schema });

        return () => {
          worker.removeEventListener('message', handleMessage);
        };
      }
    } else {
      // In production, trust the basic validation
      setValidationState({
        isValidating: false,
        isValid: true,
        errors: null,
      });
    }
  }, [schema]);

  return validationState;
}

// Usage example:
export function LogViewer({ schema }: { schema: unknown }) {
  const { isValidating, isValid, errors } = useSchemaValidation(schema);

  if (isValidating) {
    return <div>Validating schema...</div>;
  }

  if (!isValid) {
    return (
      <div>
        Invalid schema:
        <ul>
          {errors?.map((error, index) => (
            <li key={index}>
              {error.path}: {error.message}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Render log viewer with validated schema...
}
