import pandas as pd
import re

class Preprocessor():

    def __init__(self, file_path):
        self.df = pd.read_csv(file_path)

    def preprocess_data(self):
        self.clean_data()
        self.normalize_data()
        self.create_nodes_and_relations()
        self.generate_relations()
        self.export_preproccessed_data()

    def clean_data(self):
        """
            1. Limpieza básica
            Eliminar espacios adicionales al inicio y al final de las celdas
        """
        self.df = self.df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)

        # Convertir a minúsculas los campos relevantes para evitar duplicados por formato
        self.df['Built With'] = self.df['Built With'].str.lower()
        self.df['By'] = self.df['By'].str.lower()

    def normalize_data(self):
        """
            2. Normalización del campo 'By' (creadores)
            Los creadores pueden estar separados por "," o "&", unificamos los delimitadores

            3. Normalización del campo 'Built With' (tecnologías)
            Separar tecnologías por coma
        """
        self.df['By'] = self.df['By'].apply(lambda x: re.split(r',|&', str(x)))
        self.df['Built With'] = self.df['Built With'].apply(lambda x: str(x).split(','))

    def create_nodes_and_relations(self):
        """
            4. Crear nodos y relaciones
            Generar una lista de nodos de aplicaciones, creadores y tecnologías
        """
        self.applications = self.df[['Title', 'Location', 'Project Link']].drop_duplicates()
        self.creators = set()
        for creator_list in self.df['By']:
            self.creators.update([creator.strip() for creator in creator_list])
        self.creators = list(self.creators)

        # Crear una lista de nodos de tecnologías
        self.technologies = set()
        for tech_list in self.df['Built With']:
            self.technologies.update([tech.strip() for tech in tech_list])
        self.technologies = list(self.technologies)

    def generate_relations(self):
        # 5. Generar relaciones entre aplicaciones, creadores y tecnologías
        self.relations_app_creator = []
        for i, row in self.df.iterrows():
            app_title = row['Title']
            for creator in row['By']:
                self.relations_app_creator.append((app_title, creator.strip()))

        self.relations_app_tech = []
        for i, row in self.df.iterrows():
            app_title = row['Title']
            for tech in row['Built With']:
                self.relations_app_tech.append((app_title, tech.strip()))

    def export_preproccessed_data(self):
        """
            6. Exportar datos para Neo4j
            Exportar los nodos y relaciones a archivos CSV o directamente preparar para cargar en Neo4j
        """
        applications_df = pd.DataFrame(self.applications, columns=['Title', 'Location', 'Project Link'])
        applications_df.to_csv('preprocessed_files/applications.csv', index=False)

        creators_df = pd.DataFrame(self.creators, columns=['Creator'])
        creators_df.to_csv('preprocessed_files/creators.csv', index=False)

        technologies_df = pd.DataFrame(self.technologies, columns=['Technology'])
        technologies_df.to_csv('preprocessed_files/technologies.csv', index=False)

        relations_app_creator_df = pd.DataFrame(self.relations_app_creator, columns=['Application', 'Creator'])
        relations_app_creator_df.to_csv('preprocessed_files/relations_app_creator.csv', index=False)

        relations_app_tech_df = pd.DataFrame(self.relations_app_tech, columns=['Application', 'Technology'])
        relations_app_tech_df.to_csv('preprocessed_files/relations_app_tech.csv', index=False)

        print("Preprocesamiento completado y datos exportados.")
