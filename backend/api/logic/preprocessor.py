import pandas as pd
import re

class Preprocessor():

    REQUIRED_COLUMNS = ['Title', 'Sub-Title', 'YouTube Link', 'What it Does', 'Built With', 'By', 'Location', 'Project Link']

    def __init__(self, file_path):
        self.file_path = file_path
        self.df = pd.read_csv(file_path)

    def validate_columns(self):
        """
        Validar si las columnas del CSV son las requeridas
        """
        missing_columns = [col for col in self.REQUIRED_COLUMNS if col not in self.df.columns]
        if missing_columns:
            raise ValueError(f"Columnas faltantes en el CSV: {', '.join(missing_columns)}")
    
    def preprocess_data(self):
        self.clean_data()
        self.normalize_data()
        self.create_nodes_and_relations()
        self.generate_relations()
        self.export_preproccessed_data()

    def clean_data(self):
        self.df = self.df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)
        self.df['Built With'] = self.df['Built With'].str.lower()
        self.df['By'] = self.df['By'].str.lower()

    def normalize_data(self):
        self.df['By'] = self.df['By'].apply(lambda x: re.split(r',|&', str(x)))
        self.df['Built With'] = self.df['Built With'].apply(lambda x: str(x).split(','))

    def create_nodes_and_relations(self):
        self.applications = self.df[['Title', 'Project Link']].drop_duplicates()
        creator_set = set()
        self.creators = []
        for i, row in self.df.iterrows():
            location = row['Location']
            for creator in row['By']:
                creator_cleaned = creator.strip()
                if creator_cleaned not in creator_set:
                    self.creators.append({'Creator': creator_cleaned, 'Location': location})
                    creator_set.add(creator_cleaned)
        self.technologies = set()
        for tech_list in self.df['Built With']:
            self.technologies.update([tech.strip() for tech in tech_list])
        self.technologies = list(self.technologies)

    def generate_relations(self):
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
        # Exportar los archivos procesados a CSV
        applications_df = pd.DataFrame(self.applications, columns=['Title', 'Project Link'])
        applications_df.to_csv('preprocessed_files/applications.csv', index=False)

        creators_df = pd.DataFrame(self.creators, columns=['Creator', 'Location'])
        creators_df.to_csv('preprocessed_files/creators.csv', index=False)

        technologies_df = pd.DataFrame(self.technologies, columns=['Technology'])
        technologies_df.to_csv('preprocessed_files/technologies.csv', index=False)

        relations_app_creator_df = pd.DataFrame(self.relations_app_creator, columns=['Application', 'Creator'])
        relations_app_creator_df.to_csv('preprocessed_files/relations_app_creator.csv', index=False)

        relations_app_tech_df = pd.DataFrame(self.relations_app_tech, columns=['Application', 'Technology'])
        relations_app_tech_df.to_csv('preprocessed_files/relations_app_tech.csv', index=False)

        print("Preprocesamiento completado y datos exportados.")

    def save_to_neo4j(self, neo4j_driver):
        """
        Guardar nodos y relaciones en la base de datos de Neo4j
        """
        with neo4j_driver.session() as session:
            # Insertar nodos de aplicaciones
            for app in self.applications.itertuples(index=False, name=None):
                print("app:")
                print(app)
                print("self.applications")
                print(self.applications)
                print("self.applications.itertuples(index=False)")
                print(self.applications.itertuples(index=False, name=None))
                session.run("CREATE (a:Application {title: $title, projectLink: $projectLink})", 
                            {"title": app[0], "projectLink": app[1]})

            # Insertar nodos de creadores
            for creator in self.creators:
                session.run("CREATE (c:Creator {creator: $creator, location: $location})", 
                            {"creator": creator['Creator'], "location": creator['Location']})

            # Insertar nodos de tecnologías
            for tech in self.technologies:
                session.run("CREATE (t:Technology {technology: $technology})", {"technology": tech})

            # Insertar relaciones entre aplicaciones y creadores
            for app_title, creator_name in self.relations_app_creator:
                session.run("""
                MATCH (a:Application {title: $app_title}), (c:Creator {creator: $creator_name})
                CREATE (a)-[:CREATED_BY]->(c)
                """, {"app_title": app_title, "creator_name": creator_name})

            # Insertar relaciones entre aplicaciones y tecnologías
            for app_title, tech_name in self.relations_app_tech:
                session.run("""
                MATCH (a:Application {title: $app_title}), (t:Technology {technology: $tech_name})
                CREATE (a)-[:USES]->(t)
                """, {"app_title": app_title, "tech_name": tech_name})

        print("Datos guardados en Neo4j correctamente")
