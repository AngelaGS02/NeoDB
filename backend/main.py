from logic.preprocessor import Preprocessor

def preprocess_data():
    print("preprocessing data...")
    preprocessor = Preprocessor('dataset/Gemini API Competition - muestra.csv')
    preprocessor.preprocess_data()

def run_api():
    pass

if __name__ == "__main__":
    print("Bienvenido a NeoAPy")
    preprocess_data()
    run_api()
    