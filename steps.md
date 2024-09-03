# Set di Prompt per lo Sviluppo dell'App Asta Fantacalcio

## 1. Setup e Configurazione

1.1. "Crea la struttura di base per il progetto Node.js/Express, inclusa la configurazione di MongoDB e Socket.io."

1.2. "Implementa la struttura di base per il frontend React, includendo React Router per la navigazione."

1.3. "Configura Tailwind CSS per lo styling dell'applicazione frontend."

## 2. Autenticazione e Autorizzazione

2.1. "Implementa un sistema di autenticazione JWT per l'admin, includendo login e logout."

2.2. "Crea un meccanismo per generare link univoci per i partecipanti all'asta."

2.3. "Implementa la logica per verificare e gestire le autorizzazioni dell'admin e dei partecipanti."

## 3. Gestione delle Squadre

3.1. "Crea un modello MongoDB e le relative API per la gestione delle squadre."

3.2. "Implementa un'interfaccia React per l'inserimento dei nomi delle 8 squadre partecipanti."

3.3. "Sviluppa una vista per visualizzare e modificare le squadre esistenti."

## 4. Gestione dei Calciatori

4.1. "Crea un modello MongoDB e le relative API per la gestione dei calciatori, includendo nome, ruolo e squadra di appartenenza."

4.2. "Implementa un'interfaccia per l'admin per aggiungere, modificare ed eliminare i calciatori dal database."

4.3. "Sviluppa una vista per visualizzare tutti i calciatori, con possibilità di filtraggio per ruolo."

## 5. Gestione dell'Asta

5.1. "Implementa la logica backend per avviare un'asta, incluso il timer di 20 secondi."

5.2. "Crea un'interfaccia admin per selezionare un calciatore e avviare l'asta."

5.3. "Sviluppa la logica real-time con Socket.io per sincronizzare il timer e le offerte tra tutti i partecipanti."

5.4. "Implementa l'interfaccia per i partecipanti per fare le loro offerte durante l'asta."

5.5. "Crea la logica per determinare il vincitore dell'asta e assegnare il calciatore alla squadra vincente."

## 6. Visualizzazione dei Risultati

6.1. "Implementa una vista per lo storico delle aste completate, mostrando calciatore, prezzo e squadra vincente."

6.2. "Crea una vista per visualizzare i calciatori acquistati da ciascuna squadra, suddivisi per ruolo."

6.3. "Sviluppa un sistema di filtri e ordinamento per le viste dei risultati."

## 7. Persistenza dei Dati e Recupero dello Stato

7.1. "Implementa un sistema per salvare continuamente lo stato dell'asta nel database."

7.2. "Crea la logica per recuperare lo stato corrente dell'asta in caso di ricaricamento della pagina o disconnessione."

## 8. Testing e Debugging

8.1. "Implementa unit test per le funzioni critiche del backend, come la logica dell'asta e la gestione delle offerte."

8.2. "Crea test d'integrazione per verificare il corretto funzionamento del flusso dell'asta dall'inizio alla fine."

8.3. "Implementa un sistema di logging per facilitare il debugging e il monitoraggio dell'applicazione."

## 9. Ottimizzazione e Sicurezza

9.1. "Implementa la validazione degli input sia lato client che lato server per prevenire input malformati o malevoli."

9.2. "Aggiungi rate limiting alle API per prevenire abusi."

9.3. "Ottimizza le query del database per migliorare le performance dell'applicazione."

## 10. Deployment

10.1. "Prepara l'applicazione per il deployment, includendo la configurazione per variabili d'ambiente."

10.2. "Crea script per il build e il deployment automatico dell'applicazione."

10.3. "Implementa un sistema di monitoraggio per tracciare le performance e gli errori in produzione."
