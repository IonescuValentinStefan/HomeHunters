import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Încărcarea datelor cu verificări suplimentare
def load_data(file_path):
    print(f"Încărcarea datelor din {file_path}...")
    
    # Verificăm dacă fișierul există
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Fișierul {file_path} nu a fost găsit.")
    
    # Încercăm să detectăm automat separatorul
    with open(file_path, 'r', encoding='utf-8') as f:
        first_line = f.readline().strip()
        if '\t' in first_line:
            separator = '\t'
        elif ',' in first_line:
            separator = ','
        elif ';' in first_line:
            separator = ';'
        else:
            separator = None  # pandas va încerca să detecteze automat
    
    print(f"Separator detectat: '{separator}'")
    
    # Încărcăm datele cu separatorul detectat
    try:
        df = pd.read_csv(file_path, sep=separator)
    except Exception as e:
        print(f"Eroare la încărcarea cu separatorul detectat: {e}")
        print("Încercăm cu diferite separatoare...")
        
        # Încercăm cu diferiți separatori dacă primul eșuează
        for sep in ['\t', ',', ';', '|']:
            try:
                df = pd.read_csv(file_path, sep=sep)
                print(f"Încărcare reușită cu separatorul: '{sep}'")
                break
            except Exception:
                continue
        else:
            # Dacă nu funcționează niciun separator, încercăm cu pandas excel reader
            try:
                df = pd.read_excel(file_path)
                print("Fișierul a fost încărcat ca Excel.")
            except Exception as e:
                raise Exception(f"Nu s-a putut încărca fișierul: {e}")
    
    # Afișăm primele rânduri și coloanele pentru verificare
    print("\nPrimele 5 rânduri din date:")
    print(df.head())
    
    print("\nColoanele disponibile în date:")
    print(df.columns.tolist())
    
    print(f"\nDimensiunea datelor: {df.shape[0]} rânduri x {df.shape[1]} coloane")
    
    # Verificăm dacă avem o singură coloană care ar putea indica că separatorul nu a fost corect detectat
    if df.shape[1] == 1:
        first_col_name = df.columns[0]
        print(f"\nAtenție: S-a găsit o singură coloană ({first_col_name}), ceea ce poate indica o problemă cu separatorul.")
        
        # Verificăm dacă este posibil ca datele să fie într-o singură coloană
        sample_value = df.iloc[0, 0]
        if isinstance(sample_value, str) and any(sep in sample_value for sep in ['\t', ',', ';', '|']):
            common_seps = ['\t', ',', ';', '|']
            for sep in common_seps:
                if sep in sample_value:
                    print(f"Detectat posibil separator '{sep}' în valorile coloanei.")
                    # Încercăm să separăm manual datele
                    try:
                        # Creăm un fișier temporar cu date separate corect
                        temp_file = "temp_fixed_data.csv"
                        with open(file_path, 'r', encoding='utf-8') as original, open(temp_file, 'w', encoding='utf-8') as fixed:
                            for line in original:
                                fixed.write(line)
                        
                        # Încărcăm din nou datele
                        df = pd.read_csv(temp_file, sep=sep)
                        print(f"Date re-încărcate cu succes folosind separatorul '{sep}'")
                        print("\nColoanele după re-încărcare:")
                        print(df.columns.tolist())
                        
                        # Ștergem fișierul temporar
                        os.remove(temp_file)
                        break
                    except Exception as e:
                        print(f"Nu s-a putut repara fișierul: {e}")
    
    # Verificăm dacă coloana 'price' există
    if 'price' not in df.columns:
        print("\nAtenție: Coloana 'price' nu a fost găsită în date!")
        # Verificăm dacă există o coloană care ar putea conține prețuri
        price_candidates = [col for col in df.columns if any(price_term in col.lower() for price_term in ['price', 'pret', 'cost', 'value', 'valoare'])]
        if price_candidates:
            print(f"Posibile coloane de preț: {price_candidates}")
            # Folosim prima coloană candidat ca preț
            df['price'] = df[price_candidates[0]]
            print(f"Am folosit coloana '{price_candidates[0]}' ca 'price'")
        else:
            # Dacă DataFrame are o singură coloană, probabil că datele nu au fost parse corect
            if df.shape[1] == 1:
                print("Datele nu au fost parse corect. Verificați formatul fișierului și separatorul.")
                raise ValueError("Format de date nevalid - imposibil de procesat")
    
    return df

# Preprocesarea datelor
def preprocess_data(df):
    print("\nPreprocesarea datelor...")
    
    # Verificăm coloanele disponibile
    available_columns = df.columns.tolist()
    print("Coloane disponibile pentru prelucrare:", available_columns)
    
    # Lista de caracteristici dorite
    desired_features = ['propertyType', 'transactionType', 'furnished', 'rooms', 
                       'bathrooms', 'surfaceArea', 'amenities', 'customAmenities']
    
    # Verificăm care caracteristici sunt disponibile
    features = [col for col in desired_features if col in available_columns]
    
    if not features:
        print("Nu s-au găsit caracteristicile necesare în date.")
        # Încercăm să folosim toate coloanele exceptând prețul și coloanele de identificare
        exclude_cols = ['price', 'id', 'index', 'email', 'phone', 'firstName', 'lastName']
        features = [col for col in available_columns if col not in exclude_cols]
        print(f"Vom folosi următoarele caracteristici: {features}")
    
    # Pregătirea datelor pentru antrenare
    X = df[features].copy()
    y = df['price']
    
    # Procesarea caracteristicilor text
    for col in X.columns:
        if col in ['amenities', 'customAmenities'] and col in X.columns:
            # Transformăm în număr de caracteristici
            X[f'{col}_count'] = X[col].apply(lambda x: 0 if pd.isna(x) else (str(x).count(',') + 1 if str(x).strip() else 0))
            
    # Eliminăm coloanele text complexe care nu pot fi folosite direct
    text_cols_to_drop = ['amenities', 'customAmenities', 'description', 'address', 'title', 'virtualTourUrl']
    columns_to_drop = [col for col in text_cols_to_drop if col in X.columns]
    if columns_to_drop:
        X = X.drop(columns_to_drop, axis=1)
    
    # Tratarea valorilor lipsă
    for col in X.columns:
        if X[col].dtype == 'object':
            X[col] = X[col].fillna('necunoscut')
        else:
            X[col] = X[col].fillna(X[col].median())
    
    print("\nCaracteristici după preprocesare:")
    print(X.columns.tolist())
    
    return X, y

# Crearea unui pipeline de machine learning
def create_pipeline(X):
    print("\nCrearea pipeline-ului de machine learning...")
    
    # Identificarea caracteristicilor categoriale și numerice
    categorical_features = X.select_dtypes(include=['object']).columns.tolist()
    numeric_features = X.select_dtypes(exclude=['object']).columns.tolist()
    
    print(f"Caracteristici categoriale: {categorical_features}")
    print(f"Caracteristici numerice: {numeric_features}")
    
    # Crearea transformatoarelor pentru caracteristicile categoriale și numerice
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')
    numeric_transformer = StandardScaler()
    
    # Combinarea transformatoarelor
    transformers = []
    
    if numeric_features:
        transformers.append(('num', numeric_transformer, numeric_features))
    
    if categorical_features:
        transformers.append(('cat', categorical_transformer, categorical_features))
    
    preprocessor = ColumnTransformer(transformers=transformers)
    
    # Crearea pipeline-ului cu preprocesare și model
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    return pipeline

# Evaluarea modelului
def evaluate_model(model, X_test, y_test):
    print("\nEvaluarea modelului...")
    
    # Realizarea predicțiilor
    y_pred = model.predict(X_test)
    
    # Calcularea metricilor
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Mean Squared Error: {mse:.2f}")
    print(f"Root Mean Squared Error: {rmse:.2f}")
    print(f"R^2 Score: {r2:.2f}")
    
    return y_pred, mse, rmse, r2

# Vizualizarea rezultatelor
def visualize_results(y_test, y_pred, model=None):
    print("\nVizualizarea rezultatelor...")
    
    plt.figure(figsize=(10, 6))
    plt.scatter(y_test, y_pred, alpha=0.5)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--')
    plt.xlabel('Prețuri reale')
    plt.ylabel('Prețuri prezise')
    plt.title('Comparație între prețurile reale și prezise')
    plt.savefig('price_prediction.png')
    print("Graficul a fost salvat ca 'price_prediction.png'")
    
    # Vizualizarea importanței caracteristicilor dacă avem acces la ele
    if model and hasattr(model, 'named_steps') and 'regressor' in model.named_steps:
        try:
            # Încercăm să obținem importanța caracteristicilor
            feature_names = get_feature_names(model)
            feature_importances = pd.Series(
                model.named_steps['regressor'].feature_importances_,
                index=feature_names
            ).sort_values(ascending=False)
            
            plt.figure(figsize=(10, 8))
            top_n = min(10, len(feature_importances))
            sns.barplot(x=feature_importances.values[:top_n], y=feature_importances.index[:top_n])
            plt.title(f'Top {top_n} caracteristici importante')
            plt.tight_layout()
            plt.savefig('feature_importance.png')
            print("Graficul importanței caracteristicilor a fost salvat ca 'feature_importance.png'")
        except Exception as e:
            print(f"Nu s-a putut genera graficul de importanță a caracteristicilor: {e}")

# Funcție ajutătoare pentru a obține numele caracteristicilor transformate
def get_feature_names(model):
    preprocessor = model.named_steps['preprocessor']
    
    feature_names = []
    # Verificăm dacă avem transformatori definiți
    if not preprocessor.transformers_:
        return ["feature_1"]  # Returnăm un nume generic dacă nu avem transformatori
    
    for transformer_name, transformer, column_names in preprocessor.transformers_:
        if transformer_name == 'num':
            feature_names.extend(column_names)
        elif transformer_name == 'cat':
            for i, column_name in enumerate(column_names):
                # Verificăm dacă transformatorul are categorii disponibile
                if hasattr(transformer, 'categories_'):
                    categories = transformer.categories_[i]
                    one_hot_features = [f"{column_name}_{val}" for val in categories]
                    feature_names.extend(one_hot_features)
                else:
                    # Dacă nu avem categorii, adăugăm doar numele coloanei
                    feature_names.append(column_name)
    
    return feature_names

# Funcția principală
def main(file_path):
    try:
        # Încărcarea datelor
        df = load_data(file_path)
        
        # Afișarea statisticilor de bază pentru preț
        if 'price' in df.columns:
            print("\nStatistici de bază pentru prețuri:")
            print(df['price'].describe())
        
        # Preprocesarea datelor
        X, y = preprocess_data(df)
        
        # Împărțirea datelor în seturi de antrenare și testare
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        print(f"\nDate de antrenare: {X_train.shape[0]} înregistrări")
        print(f"Date de testare: {X_test.shape[0]} înregistrări")
        
        # Crearea și antrenarea modelului
        pipeline = create_pipeline(X)
        print("\nAntrenarea modelului... (poate dura câteva momente)")
        model = pipeline.fit(X_train, y_train)
        
        # Evaluarea modelului
        y_pred, mse, rmse, r2 = evaluate_model(model, X_test, y_test)
        
        # Vizualizarea rezultatelor
        visualize_results(y_test, y_pred, model)
        
        # Salvarea modelului
        import joblib
        joblib.dump(model, 'property_price_model2.pkl')
        print("\nModelul a fost salvat ca 'property_price_model2.pkl'")
        
        # Exemplu de prezicere pentru o nouă proprietate
        print("\nExemplu de prezicere pentru o nouă proprietate:")
        
        # Construim un exemplu bazat pe coloanele din X
        new_property = pd.DataFrame(columns=X.columns)
        
        # Populăm cu date de exemplu bazate pe coloanele disponibile
        for col in X.columns:
            if col == 'rooms' or col == 'bathrooms':
                new_property[col] = [2]
            elif col == 'surfaceArea':
                new_property[col] = [75.0]
            elif col == 'propertyType':
                new_property[col] = ['apartament']
            elif col == 'transactionType':
                new_property[col] = ['vanzare']
            elif col == 'furnished':
                new_property[col] = ['partial mobilat']
            elif '_count' in col:
                new_property[col] = [2]
            else:
                # Pentru alte coloane, folosim valori mediane sau cele mai frecvente
                if X[col].dtype == 'object':
                    new_property[col] = [X[col].mode()[0]]
                else:
                    new_property[col] = [X[col].median()]
        
        print(new_property)
        
        predicted_price = model.predict(new_property)[0]
        print(f"Prețul prezis pentru proprietatea nouă: {predicted_price:.2f}")
        
    except Exception as e:
        print(f"\nA apărut o eroare: {e}")
        import traceback
        traceback.print_exc()

# Executarea scriptului
if __name__ == "__main__":
    # Specificați calea către fișierul CSV
    file_path = "dataset.csv"
    
    # Verifică dacă fișierul există, dacă nu există, căutăm fișiere .csv, .txt sau .tsv în directorul curent
    if not os.path.exists(file_path):
        print(f"Fișierul {file_path} nu a fost găsit. Căutăm alternative...")
        for ext in ['.csv', '.txt', '.tsv']:
            files = [f for f in os.listdir('.') if f.endswith(ext)]
            if files:
                file_path = files[0]
                print(f"Am găsit fișierul {file_path}. Vom folosi acest fișier.")
                break
        else:
            print("Nu s-a găsit niciun fișier de date în directorul curent.")
            file_path = input("Introduceți calea către fișierul de date: ")
    
    main(file_path)