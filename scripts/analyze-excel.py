import pandas as pd
import sys

try:
    # Leer archivo Excel
    xl = pd.ExcelFile('c:/react/PRODUCCION RISKMEDIA MEXICO .xlsx')
    
    print('=' * 80)
    print('ANÁLISIS DE ARCHIVO EXCEL - PRODUCCION RISKMEDIA MEXICO')
    print('=' * 80)
    print(f'\nHOJAS ENCONTRADAS: {len(xl.sheet_names)}')
    print(f'Nombres: {xl.sheet_names}\n')
    
    # Analizar cada hoja
    for sheet in xl.sheet_names:
        print('\n' + '=' * 80)
        print(f'HOJA: {sheet}')
        print('=' * 80)
        
        # Leer primeras filas
        df = pd.read_excel(xl, sheet_name=sheet, nrows=10)
        
        print(f'\nTotal de columnas: {len(df.columns)}')
        print(f'\nHEADERS (Nombres de columnas):')
        print('-' * 80)
        
        for i, col in enumerate(df.columns, 1):
            # Determinar tipo de dato
            dtype = str(df[col].dtype)
            
            # Obtener ejemplos no nulos
            ejemplos = df[col].dropna().head(2).tolist()
            ejemplo_str = ', '.join([str(e)[:50] for e in ejemplos]) if ejemplos else 'Sin datos'
            
            # Mapear tipos de pandas a tipos legibles
            tipo_legible = dtype
            if 'int' in dtype:
                tipo_legible = 'NÚMERO ENTERO'
            elif 'float' in dtype:
                tipo_legible = 'NÚMERO DECIMAL'
            elif 'object' in dtype:
                tipo_legible = 'TEXTO'
            elif 'datetime' in dtype:
                tipo_legible = 'FECHA/HORA'
            elif 'bool' in dtype:
                tipo_legible = 'BOOLEANO'
            
            print(f'{i}. {col}')
            print(f'   Tipo: {tipo_legible}')
            print(f'   Ejemplo: {ejemplo_str}')
            print()
        
        # Mostrar primeras 3 filas como muestra
        print(f'\nMUESTRA DE DATOS (primeras 3 filas):')
        print('-' * 80)
        print(df.head(3).to_string())
        print('\n')
    
    print('\n' + '=' * 80)
    print('FIN DEL ANÁLISIS')
    print('=' * 80)
    
except FileNotFoundError:
    print('ERROR: Archivo no encontrado en c:/react/PRODUCCION RISKMEDIA MEXICO .xlsx')
except Exception as e:
    print(f'ERROR: {str(e)}')
    import traceback
    traceback.print_exc()
