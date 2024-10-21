from flask import Flask, request, jsonify
from neo4j import GraphDatabase
from logic.preprocessor import Preprocessor

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "test_password"

app = Flask(__name__)

# Driver para conectar con Neo4j
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


def preprocess_data():
    print("Preprocesando Datos")
    preprocessor = Preprocessor('dataset/Gemini API Competition - muestra.csv')
    preprocessor.preprocess_data()

def execute_query(query, parameters=None):
    with driver.session() as session:
        result = session.run(query, parameters)
        return result.data()

# Endpoint para crear un nodo Persona
@app.route('/persona', methods=['POST'])
def create_person():
    data = request.json
    nombre = data.get('nombre')
    edad = data.get('edad')
    
    query = """
    CREATE (p:Persona {nombre: $nombre, edad: $edad})
    RETURN p
    """
    params = {"nombre": nombre, "edad": edad}
    result = execute_query(query, params)
    return jsonify(result), 201

# Endpoint para leer un nodo Persona por nombre
@app.route('/persona/<nombre>', methods=['GET'])
def get_person(nombre):
    query = """
    MATCH (p:Persona {nombre: $nombre})
    RETURN p
    """
    params = {"nombre": nombre}
    result = execute_query(query, params)
    
    if not result:
        return jsonify({"error": "Persona no encontrada"}), 404
    
    return jsonify(result), 200

# Endpoint para actualizar un nodo Persona
@app.route('/persona/<nombre>', methods=['PUT'])
def update_person(nombre):
    data = request.json
    nueva_edad = data.get('edad')
    
    query = """
    MATCH (p:Persona {nombre: $nombre})
    SET p.edad = $edad
    RETURN p
    """
    params = {"nombre": nombre, "edad": nueva_edad}
    result = execute_query(query, params)
    
    if not result:
        return jsonify({"error": "Persona no encontrada o no actualizada"}), 404
    
    return jsonify(result), 200

# Endpoint para eliminar un nodo Persona
@app.route('/persona/<nombre>', methods=['DELETE'])
def delete_person(nombre):
    query = """
    MATCH (p:Persona {nombre: $nombre})
    DELETE p
    """
    params = {"nombre": nombre}
    result = execute_query(query, params)
    
    return jsonify({"message": f"Persona '{nombre}' eliminada"}), 200

if __name__ == '__main__':
    preprocess_data()
    app.run(debug=True)
