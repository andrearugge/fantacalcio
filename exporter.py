import os

# Nome del file di output
output_file = 'merged_js_files.txt'

# Imposta la directory di partenza (la root dove risiede lo script)
directory = os.path.dirname(os.path.abspath(__file__))

# Apri il file di output in modalità scrittura
with open(output_file, 'w') as outfile:
    # Cammina attraverso la directory e le sotto-directory
    for foldername, subfolders, filenames in os.walk(directory):
        for filename in filenames:
            # Considera solo i file con estensione .js
            if filename.endswith('.js'):
                # Costruisci il percorso completo del file
                filepath = os.path.join(foldername, filename)
                try:
                    # Leggi il contenuto del file e scrivilo nel file di output
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as infile:
                        # Scrivi l'intestazione con il percorso del file relativo alla directory di partenza
                        relative_path = os.path.relpath(filepath, directory)
                        outfile.write(f'----- Contenuto di: {relative_path} -----\n')
                        outfile.write(infile.read() + '\n\n')
                except Exception as e:
                    print(f"Errore nella lettura di {filename}: {e}")

print(f"Contenuto dei file .js unito in {output_file}")
