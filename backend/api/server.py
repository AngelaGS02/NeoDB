from http.client import SERVICE_UNAVAILABLE
import os
from aiohttp import BasicAuth
from flask import Flask, request, jsonify
from neo4j import GraphDatabase
from logic.preprocessor import Preprocessor

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "test_password"
UPLOAD_FOLDER = 'uploads'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


try:
    driver = GraphDatabase.driver(NEO4J_URI, auth=BasicAuth(NEO4J_USER, NEO4J_PASSWORD))
    print("Conexión exitosa a Neo4j")
except SERVICE_UNAVAILABLE as e:
    print(f"Error de conexión a Neo4j: {e}")


def preprocess_data():
    print("Preprocesando Datos")
    preprocessor = Preprocessor('dataset/Gemini API Competition - muestra.csv')
    preprocessor.preprocess_data()

def execute_query(query, parameters=None):
    with driver.session() as session:
        result = session.run(query, parameters)
        return result.data()

@app.route('/', methods=['GET'])
def test():
    return jsonify({"Test": "Done"})

@app.route('/upload-csv', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({"error": "No se ha enviado ningún archivo"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "El nombre del archivo está vacío"}), 400

    if file and file.filename.endswith('.csv'):
        # Guardar el archivo en la carpeta uploads
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        # Procesar el archivo CSV
        try:
            preprocessor = Preprocessor(file_path)
            preprocessor.validate_columns()  # Validar columnas
            preprocessor.preprocess_data()  # Preprocesar los datos
            preprocessor.save_to_neo4j(driver)  # Guardar en Neo4j

            return jsonify({"message": "Archivo CSV procesado y guardado exitosamente"}), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": "Error procesando el archivo CSV", "details": str(e)}), 500

    return jsonify({"error": "Formato de archivo no válido, se requiere un archivo .csv"}), 400

@app.route('/nodes/<node_type>', methods=['POST'])
def create_node(node_type):
    print("Node type: ", node_type)
    print("data: ", request.json)

    data = request.json
    if node_type == "application":
        query = """
        CREATE (a:Application {title: $title, projectLink: $projectLink})
        RETURN a
        """
        params = {"title": data.get('title'), "projectLink": data.get('projectLink')}
    elif node_type == "creator":
        query = """
        CREATE (c:Creator {creator: $creator, location: $location})
        RETURN c
        """
        params = {"creator": data.get('creator'), "location": data.get('location')}
    elif node_type == "technology":
        query = """
        CREATE (t:Technology {technology: $technology})
        RETURN t
        """
        params = {"technology": data.get('technology')}
    else:
        return jsonify({"error": "Tipo de nodo inválido"}), 400

    result = execute_query(query, params)
    return jsonify(result), 201

@app.route('/nodes/<node_type>', methods=['GET'])
def get_nodes(node_type):
    if node_type == "application":
        query = "MATCH (a:Application) RETURN a"
    elif node_type == "creator":
        query = "MATCH (c:Creator) RETURN c"
    elif node_type == "technology":
        query = "MATCH (t:Technology) RETURN t"
    else:
        return jsonify({"error": "Tipo de nodo inválido"}), 400

    result = execute_query(query)
    return jsonify(result), 200

@app.route('/nodes/<node_type>/<node_id>', methods=['PUT'])
def update_node(node_type, node_id):
    data = request.json
    if node_type == "application":
        query = """
        MATCH (a:Application {title: $title})
        SET a.projectLink = $projectLink
        RETURN a
        """
        params = {"title": node_id, "projectLink": data.get('projectLink')}
    elif node_type == "creator":
        query = """
        MATCH (c:Creator {creator: $creator})
        SET c.location = $location
        RETURN c
        """
        params = {"creator": node_id, "location": data.get('location')}
    elif node_type == "technology":
        query = """
        MATCH (t:Technology {technology: $technology})
        SET t.technology = $newTechnology
        RETURN t
        """
        params = {"technology": node_id, "newTechnology": data.get('technology')}
    else:
        return jsonify({"error": "Tipo de nodo inválido"}), 400

    result = execute_query(query, params)
    return jsonify(result), 200

@app.route('/nodes/<node_type>/<node_id>', methods=['DELETE'])
def delete_node(node_type, node_id):
    if node_type == "application":
        query = "MATCH (a:Application {title: $title}) DELETE a"
        params = {"title": node_id}
    elif node_type == "creator":
        query = "MATCH (c:Creator {creator: $creator}) DELETE c"
        params = {"creator": node_id}
    elif node_type == "technology":
        query = "MATCH (t:Technology {technology: $technology}) DELETE t"
        params = {"technology": node_id}
    else:
        return jsonify({"error": "Tipo de nodo inválido"}), 400

    execute_query(query, params)
    return jsonify({"message": f"{node_type.capitalize()} '{node_id}' eliminado"}), 200

@app.route('/relations', methods=['POST'])
def create_relation():
    data = request.json
    relation_type = data.get('type')
    node1 = data.get('node1')
    node2 = data.get('node2')

    if relation_type == "CREATED_BY":
        query = """
        MATCH (a:Application {title: $node1}), (c:Creator {creator: $node2})
        CREATE (a)-[:CREATED_BY]->(c)
        RETURN a, c
        """
        params = {"node1": node1, "node2": node2}
    elif relation_type == "USES":
        query = """
        MATCH (a:Application {title: $node1}), (t:Technology {technology: $node2})
        CREATE (a)-[:USES]->(t)
        RETURN a, t
        """
        params = {"node1": node1, "node2": node2}
    else:
        return jsonify({"error": "Tipo de relación inválido"}), 400

    result = execute_query(query, params)
    return jsonify(result), 201


@app.route('/applications-by-technology', methods=['GET'])
def applications_by_technology():
    # Obtener el parámetro de la tecnología de la solicitud
    technology = request.args.get('technology')

    if not technology:
        return jsonify({"error": "El parámetro 'technology' es requerido"}), 400

    # Consulta para contar aplicaciones que usan una tecnología
    query = """
    MATCH (a:Application)-[:USES]->(t:Technology {technology: $technology})
    RETURN count(a) AS applicationCount
    """
    
    try:
        result = execute_query(query, {"technology": technology})
        if result:
            application_count = result[0].get('applicationCount', 0)
            return jsonify({"technology": technology, "applicationCount": application_count}), 200
        else:
            return jsonify({"technology": technology, "applicationCount": 0}), 200
    except Exception as e:
        return jsonify({"error": "Error ejecutando la consulta", "details": str(e)}), 500


@app.route('/similar-applications', methods=['GET'])
def find_similar_applications():
    # Obtener el título de la aplicación de los parámetros de consulta
    app_title = request.args.get('appTitle')

    if not app_title:
        return jsonify({"error": "El parámetro 'appTitle' es requerido"}), 400

    # Consulta para encontrar aplicaciones similares en función de tecnologías compartidas
    query = """
    MATCH (a:Application {title: $appTitle})-[:USES]->(t:Technology)<-[:USES]-(other:Application)
    WHERE a <> other
    RETURN other.title AS similarApplication, count(t) AS sharedTechnologies
    ORDER BY sharedTechnologies DESC
    """
    
    try:
        result = execute_query(query, {"appTitle": app_title})
        if result:
            return jsonify(result), 200
        else:
            return jsonify({"message": "No se encontraron aplicaciones similares"}), 200
    except Exception as e:
        return jsonify({"error": "Error ejecutando la consulta", "details": str(e)}), 500


@app.route('/applications-by-creator', methods=['GET'])
def applications_by_creator():
    # Obtener el nombre del creador de los parámetros de consulta
    creator_name = request.args.get('creatorName')
    creator_name.lower()

    if not creator_name:
        return jsonify({"error": "El parámetro 'creatorName' es requerido"}), 400

    # Consulta para obtener las aplicaciones creadas por un creador
    query = """
    MATCH (c:Creator {creator: $creatorName})<-[:CREATED_BY]-(a:Application)
    RETURN a.title AS applicationTitle
    """
    
    try:
        result = execute_query(query, {"creatorName": creator_name})
        if result:
            return jsonify(result), 200
        else:
            return jsonify({"message": "No se encontraron aplicaciones para este creador"}), 200
    except Exception as e:
        return jsonify({"error": "Error ejecutando la consulta", "details": str(e)}), 500

@app.route('/top-technologies', methods=['GET'])
def top_technologies():
    # Consulta para obtener las tecnologías utilizadas en más de 10 aplicaciones
    query = """
    MATCH (t:Technology)<-[:USES]-(a:Application)
    WITH t, count(a) AS appCount
    WHERE appCount > 10
    RETURN t.technology AS technology, appCount
    ORDER BY appCount DESC
    LIMIT 5
    """
    
    try:
        result = execute_query(query)
        if result:
            return jsonify(result), 200
        else:
            return jsonify({"message": "No se encontraron tecnologías emergentes"}), 200
    except Exception as e:
        return jsonify({"error": "Error ejecutando la consulta", "details": str(e)}), 500

@app.route('/creators-not-worked-together', methods=['POST'])
def creators_not_worked_together():

    data = request.json
    technologies = data.get('technologies')

    if not technologies or len(technologies) < 2:
        return jsonify({"error": "Debe proporcionar al menos 2 tecnologías"}), 400

    query = """
    MATCH (t:Technology)<-[:USES]-(a:Application)-[:CREATED_BY]->(c:Creator)
    WHERE t.technology IN $technologies
    WITH c, collect(t.technology) AS techs, count(DISTINCT a) AS appsWorkedOn
    WHERE size(techs) >= $techCount
    WITH c
    OPTIONAL MATCH (c1:Creator)-[:CREATED_BY]->(a1:Application)<-[:CREATED_BY]-(c2:Creator)
    WHERE c1 <> c2
    RETURN DISTINCT c1.creator AS creator1, c2.creator AS creator2
    """
    # Revisar el Distinct y el OPTIONAL MATCH, los c1 y c2 se encuentran pero llegan nulos 
    try:
        result = execute_query(query, {"technologies": technologies, "techCount": len(technologies)})
        if result:
            return jsonify(result), 200
        else:
            return jsonify({"message": "No se encontraron creadores que cumplan las condiciones"}), 200
    except Exception as e:
        return jsonify({"error": "Error ejecutando la consulta", "details": str(e)}), 500


@app.route('/applications-by-region', methods=['GET'])
def applications_by_region():
    region = request.args.get('region')
    print("region: ", region)

    if not region:
        return jsonify({"error": "El parámetro 'region' es requerido"}), 400

    query = """
    MATCH (c:Creator {location: $region})<-[:CREATED_BY]-(a:Application)
    RETURN a.title AS applicationTitle
    """
    
    try:
        result = execute_query(query, {"region": region})
        if result:
            return jsonify(result), 200
        else:
            return jsonify({"message": "No se encontraron aplicaciones para esta región"}), 200
    except Exception as e:
        return jsonify({"error": "Error ejecutando la consulta", "details": str(e)}), 500



if __name__ == '__main__':#
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)